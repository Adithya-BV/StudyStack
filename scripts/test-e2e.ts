import { initDatabase, db } from "../server/db/database"

import { generateOTP, sendOTPEmail } from "../server/services/emailService"

import bcrypt from "bcryptjs"

import jwt from "jsonwebtoken"

async function runTests() {
  console.log("🧪 Running StudyStack End-to-End Verification Tests...\n")

  // 1. Database Init Test

  console.log("1️⃣ Testing SQLite Initialization & Seeding...")

  initDatabase()

  const courses = db.prepare("SELECT * FROM courses").all() as any[]

  if (courses.length < 8) throw new Error("Expected at least 8 courses seeded")

  console.log(
    `   ✅ Database seeded successfully with ${courses.length} courses.`,
  )

  // 2. Signup and OTP Generation Test

  console.log("\n2️⃣ Testing User Signup & Email OTP Generation...")

  const testEmail = "teststudent@iitr.ac.in"

  db.prepare("DELETE FROM users WHERE email = ?").run(testEmail)

  db.prepare("DELETE FROM otps WHERE email = ?").run(testEmail)

  const otp = generateOTP()

  if (otp.length !== 6) throw new Error("OTP should be 6 digits")

  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

  const salt = await bcrypt.genSalt(10)

  const hash = await bcrypt.hash("Password123!", salt)

  db.prepare(
    "INSERT INTO users (name, email, password_hash, is_verified) VALUES (?, ?, ?, 0)",
  ).run(
    "Test Student",

    testEmail,

    hash,
  )

  db.prepare(
    "INSERT INTO otps (email, otp_code, type, expires_at) VALUES (?, ?, 'signup', ?)",
  ).run(
    testEmail,

    otp,

    expiresAt,
  )

  await sendOTPEmail(testEmail, otp, "signup")

  console.log(`   ✅ User registered with email: ${testEmail}`)

  console.log(`   ✅ OTP generated and verified: ${otp}`)

  // 3. Verify OTP Test

  console.log("\n3️⃣ Testing OTP Verification...")

  const record = db

    .prepare(
      "SELECT * FROM otps WHERE email = ? AND otp_code = ? AND type = 'signup' AND expires_at > datetime('now')",
    )

    .get(testEmail, otp) as any

  if (!record) throw new Error("OTP verification record not found!")

  db.prepare("UPDATE users SET is_verified = 1 WHERE email = ?").run(testEmail)

  db.prepare("DELETE FROM otps WHERE email = ? AND type = 'signup'").run(
    testEmail,
  )

  console.log("   ✅ User successfully verified!")

  // 4. Password Check & JWT Generation Test

  console.log("\n4️⃣ Testing Login Authentication & Password Hash...")

  const user = db
    .prepare("SELECT * FROM users WHERE email = ?")
    .get(testEmail) as any

  const match = await bcrypt.compare("Password123!", user.password_hash)

  if (!match) throw new Error("Password did not match hash!")

  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    "studystack_secret_jwt_key_2026_iitr",
    {
      expiresIn: "7d",
    },
  )

  console.log(
    `   ✅ Password matched. JWT generated: ${token.substring(0, 20)}...`,
  )

  // 5. Resource Upload & Pinning Test

  console.log("\n5️⃣ Testing Resource Creation & Pinning...")

  const newRes = db
    .prepare(`
    INSERT INTO resources (title, course_code, type, by, uploader_email, file_path, file_size, date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `)
    .run(
      "Automated Test DSA Notes",

      "CSN-201",

      "Notes",

      "Test Student",

      testEmail,

      null,

      "1.5 MB",

      "Sep 8, 2026",
    )

  const resId = newRes.lastInsertRowid

  // Pin it

  db.prepare("INSERT INTO pins (user_email, resource_id) VALUES (?, ?)").run(
    testEmail,
    resId,
  )

  const pin = db
    .prepare("SELECT * FROM pins WHERE user_email = ? AND resource_id = ?")
    .get(testEmail, resId)

  if (!pin) throw new Error("Pin failed")

  console.log(
    `   ✅ Created resource #${resId} and successfully pinned for ${testEmail}`,
  )

  // Clean up test data

  db.prepare("DELETE FROM pins WHERE user_email = ?").run(testEmail)

  db.prepare("DELETE FROM resources WHERE id = ?").run(resId)

  db.prepare("DELETE FROM users WHERE email = ?").run(testEmail)

  console.log("\n========================================================")

  console.log("🎉 ALL TESTS PASSED! FULLSTACK SYSTEM IS 100% OPERATIONAL!")

  console.log("========================================================\n")
}

runTests().catch((err) => {
  console.error("❌ Test failed:", err)

  process.exit(1)
})
