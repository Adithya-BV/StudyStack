import { Router } from "express"

import { pool } from "../db/database"

import { authenticateToken } from "./auth"

export const profileRouter = Router()

// GET profile summary and user uploads

profileRouter.get("/", authenticateToken, async (req: any, res) => {
  try {
    const userEmail = req.user.email

    const user = db

      .prepare(
        "SELECT id, name, email, department, year, created_at FROM users WHERE email = ?",
      )

      .get(userEmail) as any

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    const uploads = db

      .prepare(
        "SELECT * FROM resources WHERE uploader_email = ? ORDER BY id DESC",
      )

      .all(userEmail) as any[]

    const pinCount = db

      .prepare("SELECT COUNT(*) as count FROM pins WHERE user_email = ?")

      .get(userEmail) as any

    res.json({
      success: true,

      profile: {
        ...user,

        uploadsCount: uploads.length,

        pinsCount: pinCount ? pinCount.count : 0,

        uploads: uploads.map((u) => ({ ...u, course: u.course_code })),
      },
    })
  } catch (error: any) {
    console.error("Profile error:", error)

    res.status(500).json({ error: error.message || "Failed to fetch profile" })
  }
})

// PUT update profile

profileRouter.put("/", authenticateToken, async (req: any, res) => {
  try {
    const userEmail = req.user.email

    const { name, department, year } = req.body

    // Validate that student name cannot be empty

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({ error: "Student name cannot be empty" })
      }
    }

    await pool.query(
      "UPDATE users SET name = COALESCE($1, name), department = COALESCE($2, department), year = COALESCE($3, year) WHERE email = $4",
      [
        name !== undefined ? name.trim() : null,

        department !== undefined ? department.trim() : null,

        year !== undefined ? year.trim() : null,

        userEmail,
      ],
    )

    const updated = (
      await pool.query(
        "SELECT id, name, email, department, year FROM users WHERE email = $1",

        [userEmail],
      )
    ).rows[0]

    res.json({ success: true, user: updated })
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to update profile" })
  }
})

// DELETE account

profileRouter.delete("/", authenticateToken, async (req: any, res) => {
  try {
    const userEmail = req.user.email

    // Remove user's pins

    await pool.query("DELETE FROM pins WHERE user_email = $1", [userEmail])

    // Remove user's OTPs

    await pool.query("DELETE FROM otps WHERE email = $1", [userEmail])

    // Remove user account

    await pool.query("DELETE FROM users WHERE email = $1", [userEmail])

    res.json({ success: true, message: "Account deleted successfully" })
  } catch (error: any) {
    console.error("Delete account error:", error)

    res.status(500).json({ error: error.message || "Failed to delete account" })
  }
})
