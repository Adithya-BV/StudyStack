import { Router } from "express"
import { pool } from "../db/database"
import { authenticateToken } from "./auth"
import { sendReportResolvedEmail } from "../services/emailService"

export const profileRouter = Router()

// GET profile summary and user uploads
profileRouter.get("/", authenticateToken, async (req: any, res) => {
  try {
    const userEmail = req.user.email

    const user = (
      await pool.query(
        "SELECT id, name, email, department, year, created_at FROM users WHERE LOWER(TRIM(email)) = LOWER(TRIM($1))",
        [userEmail],
      )
    ).rows[0] as any

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    const uploads = (
      await pool.query(
        "SELECT id, title, course_code, type, by, uploader_email, file_path, file_size, date, created_at, COALESCE(downloads, 0) as downloads, COALESCE(is_anonymous, false) as is_anonymous FROM resources WHERE LOWER(TRIM(uploader_email)) = LOWER(TRIM($1)) ORDER BY id DESC",
        [userEmail],
      )
    ).rows as any[]

    const pinCount = (
      await pool.query(
        "SELECT COUNT(*) as count FROM pins WHERE LOWER(TRIM(user_email)) = LOWER(TRIM($1))",
        [userEmail],
      )
    ).rows[0] as any

    const reports = (
      await pool.query(
        `SELECT rr.id, rr.resource_id, rr.reason, rr.details, rr.status, rr.created_at, r.title as resource_title
         FROM resource_reports rr
         JOIN resources r ON rr.resource_id = r.id
         WHERE LOWER(TRIM(r.uploader_email)) = LOWER(TRIM($1))
         ORDER BY rr.id DESC`,
        [userEmail],
      )
    ).rows as any[]

    const myReports = (
      await pool.query(
        `SELECT rr.id, rr.resource_id, rr.reason, rr.details, rr.status, rr.created_at, r.title as resource_title
         FROM resource_reports rr
         JOIN resources r ON rr.resource_id = r.id
         WHERE LOWER(TRIM(rr.reporter_email)) = LOWER(TRIM($1))
         ORDER BY rr.id DESC`,
        [userEmail],
      )
    ).rows as any[]

    res.json({
      success: true,
      profile: {
        ...user,
        uploadsCount: uploads.length,
        pinsCount: pinCount ? parseInt(pinCount.count, 10) : 0,
        uploads: uploads.map((u) => ({ ...u, course: u.course_code })),
        reports,
        myReports,
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
      "UPDATE users SET name = COALESCE($1, name), department = COALESCE($2, department), year = COALESCE($3, year) WHERE LOWER(TRIM(email)) = LOWER(TRIM($4))",
      [
        name !== undefined ? name.trim() : null,
        department !== undefined ? department.trim() : null,
        year !== undefined ? year.trim() : null,
        userEmail,
      ],
    )

    const updated = (
      await pool.query(
        "SELECT id, name, email, department, year FROM users WHERE LOWER(TRIM(email)) = LOWER(TRIM($1))",
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
    await pool.query("DELETE FROM pins WHERE LOWER(TRIM(user_email)) = LOWER(TRIM($1))", [userEmail])

    // Remove user's enrolled courses
    await pool.query("DELETE FROM user_courses WHERE LOWER(TRIM(user_email)) = LOWER(TRIM($1))", [userEmail])

    // Remove user's OTPs
    await pool.query("DELETE FROM otps WHERE LOWER(TRIM(email)) = LOWER(TRIM($1))", [userEmail])

    // Remove user account
    await pool.query("DELETE FROM users WHERE LOWER(TRIM(email)) = LOWER(TRIM($1))", [userEmail])

    res.json({ success: true, message: "Account deleted successfully" })
  } catch (error: any) {
    console.error("Delete account error:", error)
    res.status(500).json({ error: error.message || "Failed to delete account" })
  }
})

// PATCH mark report as resolved
profileRouter.patch("/reports/:reportId/resolve", authenticateToken, async (req: any, res) => {
  try {
    const reportId = parseInt(req.params.reportId, 10)
    const userEmail = req.user.email

    const checkRes = await pool.query(
      `SELECT rr.id, rr.reporter_email, rr.reason, r.title as resource_title
       FROM resource_reports rr
       JOIN resources r ON rr.resource_id = r.id
       WHERE rr.id = $1 AND LOWER(TRIM(r.uploader_email)) = LOWER(TRIM($2))`,
      [reportId, userEmail],
    )

    if (checkRes.rows.length === 0) {
      return res.status(403).json({ error: "Unauthorized or report not found" })
    }

    const report = checkRes.rows[0]
    await pool.query("UPDATE resource_reports SET status = 'resolved' WHERE id = $1", [reportId])

    if (report.reporter_email) {
      sendReportResolvedEmail(
        report.reporter_email,
        report.resource_title,
        report.reason,
      ).catch((err) => console.error("Report resolution email failed:", err))
    }

    res.json({ success: true, message: "Report marked as resolved" })
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to resolve report" })
  }
})
