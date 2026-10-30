import { Router } from "express"

import multer from "multer"

import path from "path"

import fs from "fs"

import jwt from "jsonwebtoken"

import { PDFDocument, rgb, StandardFonts } from "pdf-lib"

import { pool } from "../db/database"

import { authenticateToken } from "./auth"
import { sendReportNotificationEmail } from "../services/emailService"

export const resourcesRouter = Router()

const JWT_SECRET = process.env.JWT_SECRET || "studystack_secret_jwt_key_2026"

// File storage setup

const storage = multer.memoryStorage()

const upload = multer({
  storage,

  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
})

// Optional auth helper to check if user has pinned a resource

function getOptionalUser(req: any) {
  const authHeader = req.headers["authorization"]

  const token = authHeader && authHeader.split(" ")[1]

  if (!token) return null

  try {
    return jwt.verify(token, JWT_SECRET) as any
  } catch {
    return null
  }
}

// ── GET Resources (with search, course, and type filters) ──────────────────────

resourcesRouter.get("/", async (req, res) => {
  try {
    const { q, course, type } = req.query

    const user = getOptionalUser(req)

    let query = "SELECT id, title, course_code, type, by, uploader_email, file_path, file_size, date, created_at, COALESCE(downloads, 0) as downloads FROM resources WHERE 1=1"

    const params: any[] = []

    if (q) {
      query +=
        " AND (LOWER(title) LIKE ? OR LOWER(course_code) LIKE ? OR LOWER(by) LIKE ?)"

      const term = `%${String(q).toLowerCase()}%`

      params.push(term, term, term)
    }

    if (course && course !== "ALL") {
      query += " AND UPPER(course_code) = UPPER(?)"

      params.push(String(course))
    }

    if (type && type !== "ALL") {
      query += " AND LOWER(type) = LOWER(?)"

      params.push(String(type))
    }

    query += " ORDER BY id DESC"

    const resources = (await pool.query(query, [...params])).rows as any[]

    // Check pinned status for current user

    let userPinnedIds = new Set<number>()

    if (user?.email) {
      const pins = (
        await pool.query("SELECT resource_id FROM pins WHERE user_email = $1", [
          user.email,
        ])
      ).rows as any[]

      userPinnedIds = new Set(pins.map((p) => p.resource_id))
    }

    const result = resources.map((r) => ({
      ...r,

      course: r.course_code,

      pinned: userPinnedIds.has(r.id),
    }))

    res.json({ success: true, resources: result })
  } catch (error: any) {
    console.error("Get resources error:", error)

    res

      .status(500)

      .json({ error: error.message || "Failed to fetch resources" })
  }
})

// ── POST Upload Resource ─────────────────────────────────────────────────────

resourcesRouter.post(
  "/upload",

  authenticateToken,

  upload.single("file"),

  async (req: any, res) => {
    try {
      const { title, course, type } = req.body

      if (!title || !course || !type) {
        return res

          .status(400)

          .json({ error: "Title, course, and type are required" })
      }

      let filePath: string | null = null

      let fileData: Buffer | null = null

      let fileSize = "1.0 MB"

      if (req.file) {
        filePath = req.file.originalname

        fileData = req.file.buffer

        const bytes = req.file.size

        fileSize =
          bytes > 1024 * 1024
            ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
            : `${(bytes / 1024).toFixed(0)} KB`
      }

      const today = new Date().toLocaleDateString("en-US", {
        month: "short",

        day: "numeric",

        year: "numeric",
      })

      const cleanCourseCode = course.trim().toUpperCase()

      const info = (
        await pool.query(
          `INSERT INTO resources (title, course_code, type, by, uploader_email, file_path, file_size, date, file_data)


        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,

          [
            title.trim(),

            cleanCourseCode,

            type.trim(),

            req.user.name || "IITR Student",

            req.user.email,

            filePath,

            fileSize,

            today,

            fileData,
          ],
        )
      ).rows[0]

      // Check if course already exists in `courses` table

      const existingCourse = (
        await pool.query("SELECT * FROM courses WHERE UPPER(code) = $1", [
          cleanCourseCode,
        ])
      ).rows[0] as any

      let courseCreated = false

      if (!existingCourse) {
        // Course does not exist: automatically create it so it appears in course lists and resources

        const courseName =
          (req.body.courseName && req.body.courseName.trim()) || cleanCourseCode

        const courseDept =
          (req.body.courseDept && req.body.courseDept.trim()) ||
          req.user?.department ||
          "General Engineering"

        await pool.query(
          "INSERT INTO courses (code, name, dept, resources) VALUES ($1, $2, $3, 1)",
          [
            cleanCourseCode,
            courseName,
            courseDept,
          ],
        )

        courseCreated = true
      } else {
        // Course exists: increment its resource count

        await pool.query(
          "UPDATE courses SET resources = resources + 1 WHERE UPPER(code) = $1",

          [cleanCourseCode],
        )
      }

      const newResource = (
        await pool.query("SELECT id, title, course_code, type, by, uploader_email, file_path, file_size, date, created_at FROM resources WHERE id = $1", [info.id])
      ).rows[0] as any

      res.status(201).json({
        success: true,

        courseCreated,

        courseCode: cleanCourseCode,

        resource: {
          ...newResource,

          course: newResource.course_code,

          pinned: false,
        },
      })
    } catch (error: any) {
      console.error("Upload error:", error)

      res.status(500).json({ error: error.message || "Upload failed" })
    }
  },
)

// ── GET Download Resource ────────────────────────────────────────────────────

resourcesRouter.get("/:id/download", async (req, res) => {
  try {
    const { id } = req.params

    const resource = (
      await pool.query("SELECT * FROM resources WHERE id = $1", [Number(id)])
    ).rows[0] as any

    if (!resource) {
      return res.status(404).json({ error: "Resource not found" })
    }

    if (resource.file_data) {
      const ext = resource.file_path ? path.extname(resource.file_path) : ".pdf"

      const cleanTitle = resource.title.replace(/[/\\?%*:|"<>]/g, "_").trim()

      const downloadFilename = cleanTitle

        .toLowerCase()

        .endsWith(ext.toLowerCase())
        ? cleanTitle
        : `${cleanTitle}${ext}`

      await pool.query(
        "UPDATE resources SET downloads = COALESCE(downloads, 0) + 1 WHERE id = $1",
        [Number(id)],
      ).catch((err) => console.error("Error updating download count:", err))

      res.setHeader(
        "Content-Disposition",

        `attachment; filename="${downloadFilename}"`,
      )

      res.setHeader(
        "Content-Type",

        ext.toLowerCase() === ".pdf"
          ? "application/pdf"
          : "application/octet-stream",
      )

      return res.send(resource.file_data)
    }

    const pdfDoc = await PDFDocument.create()

    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica)

    const page = pdfDoc.addPage([595.28, 841.89])

    const { width, height } = page.getSize()

    page.drawRectangle({
      x: 0,

      y: height - 90,

      width: width,

      height: 90,

      color: rgb(6 / 255, 27 / 255, 73 / 255),
    })

    page.drawText("StudyStack — IIT Roorkee", {
      x: 40,

      y: height - 45,

      size: 20,

      font: fontBold,

      color: rgb(1, 1, 1),
    })

    page.drawText("Your Stack. Your Track. · Academic Resource Document", {
      x: 40,

      y: height - 68,

      size: 11,

      font: fontRegular,

      color: rgb(85 / 255, 199 / 255, 255 / 255),
    })

    page.drawText(resource.title, {
      x: 40,

      y: height - 130,

      size: 16,

      font: fontBold,

      color: rgb(15 / 255, 23 / 255, 42 / 255),
    })

    page.drawText(
      `Course: ${resource.course_code}  |  Type: ${resource.type}  |  By: ${resource.by}  |  Date: ${resource.date}`,

      {
        x: 40,

        y: height - 155,

        size: 11,

        font: fontRegular,

        color: rgb(100 / 255, 116 / 255, 139 / 255),
      },
    )

    page.drawText(
      "This verified academic resource document was certified by StudyStack for IIT Roorkee students.",

      {
        x: 40,

        y: height - 200,

        size: 11,

        font: fontRegular,

        color: rgb(51 / 255, 65 / 255, 85 / 255),
      },
    )

    const pdfBytes = await pdfDoc.save()

    res.setHeader(
      "Content-Disposition",

      `attachment; filename="${resource.title.replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf"`,
    )

    res.setHeader("Content-Type", "application/pdf")

    res.send(Buffer.from(pdfBytes))
  } catch (error: any) {
    console.error("Download error:", error)

    res.status(500).json({ error: error.message || "Download failed" })
  }
})

// ── POST Toggle Pin/Bookmark ─────────────────────────────────────────────────

resourcesRouter.post("/:id/pin", authenticateToken, async (req: any, res) => {
  try {
    const resourceId = Number(req.params.id)

    const userEmail = req.user.email

    const existing = (
      await pool.query(
        "SELECT * FROM pins WHERE user_email = $1 AND resource_id = $2",

        [userEmail, resourceId],
      )
    ).rows[0]

    if (existing) {
      await pool.query(
        "DELETE FROM pins WHERE user_email = $1 AND resource_id = $2",

        [userEmail, resourceId],
      )

      return res.json({
        success: true,

        pinned: false,

        message: "Resource removed from pins",
      })
    } else {
      await pool.query(
        "INSERT INTO pins (user_email, resource_id) VALUES ($1, $2)",

        [userEmail, resourceId],
      )

      return res.json({
        success: true,

        pinned: true,

        message: "Resource added to pins",
      })
    }
  } catch (error: any) {
    console.error("Pin toggle error:", error)

    res.status(500).json({ error: error.message || "Failed to toggle pin" })
  }
})

// ── GET Pinned Resources ─────────────────────────────────────────────────────

resourcesRouter.get("/pinned", authenticateToken, async (req: any, res) => {
  try {
    const userEmail = req.user.email

    const pinned = (
      await pool.query(
        `


        SELECT r.id, r.title, r.course_code, r.type, r.by, r.uploader_email, r.file_path, r.file_size, r.date, r.created_at, COALESCE(r.downloads, 0) as downloads, 1 as pinned
        FROM resources r
        JOIN pins p ON p.resource_id = r.id
        WHERE LOWER(TRIM(p.user_email)) = LOWER(TRIM($1))


        ORDER BY p.id DESC


      `,

        [userEmail],
      )
    ).rows as any[]

    const result = pinned.map((r) => ({
      ...r,

      course: r.course_code,
    }))

    res.json({ success: true, resources: result })
  } catch (error: any) {
    res

      .status(500)

      .json({ error: error.message || "Failed to fetch pinned resources" })
  }
})

resourcesRouter.get("/:id/view", async (req, res) => {
  try {
    const { id } = req.params

    const resource = (
      await pool.query("SELECT * FROM resources WHERE id = $1", [Number(id)])
    ).rows[0] as any

    if (!resource) return res.status(404).json({ error: "Resource not found" })

    if (resource.file_data) {
      const ext = resource.file_path ? path.extname(resource.file_path) : ".pdf"

      const cleanTitle = resource.title.replace(/[/\\?%*:|"<>]/g, "_").trim()

      const filename = cleanTitle.toLowerCase().endsWith(ext.toLowerCase())
        ? cleanTitle
        : `${cleanTitle}${ext}`

      res.setHeader("Content-Disposition", `inline; filename="${filename}"`)

      let contentType = "application/octet-stream"
      const lowerExt = ext.toLowerCase()
      if (lowerExt === ".pdf") contentType = "application/pdf"
      else if (lowerExt === ".png") contentType = "image/png"
      else if (lowerExt === ".jpg" || lowerExt === ".jpeg") contentType = "image/jpeg"
      else if (lowerExt === ".webp") contentType = "image/webp"
      else if (lowerExt === ".txt") contentType = "text/plain; charset=utf-8"

      res.setHeader("Content-Type", contentType)

      return res.send(resource.file_data)
    }

    // Dynamic PDF generator fallback

    const pdfDoc = await PDFDocument.create()

    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    const page = pdfDoc.addPage([595.28, 841.89])

    const { width, height } = page.getSize()

    page.drawText(`No file attached to ${resource.title}`, {
      x: 50,

      y: height - 100,

      size: 24,

      font: fontBold,

      color: rgb(0, 0.53, 0.71),
    })

    const pdfBytes = await pdfDoc.save()

    res.setHeader(
      "Content-Disposition",

      `inline; filename="${resource.title}.pdf"`,
    )

    res.setHeader("Content-Type", "application/pdf")

    res.send(Buffer.from(pdfBytes))
  } catch (error: any) {
    console.error("View error:", error)

    res.status(500).json({ error: error.message || "View failed" })
  }
})

resourcesRouter.delete("/:id", authenticateToken, async (req: any, res) => {
  try {
    const resourceId = Number(req.params.id)

    const userEmail = req.user.email

    const resource = (
      await pool.query("SELECT * FROM resources WHERE id = $1", [resourceId])
    ).rows[0] as any

    if (!resource) {
      return res.status(404).json({ error: "Resource not found" })
    }

    if (resource.uploader_email.trim().toLowerCase() !== userEmail.trim().toLowerCase()) {
      return res
        .status(403)
        .json({ error: "Unauthorized to delete this resource" })
    }

    await pool.query("DELETE FROM resource_reports WHERE resource_id = $1", [resourceId])
    await pool.query("DELETE FROM pins WHERE resource_id = $1", [resourceId])
    await pool.query("DELETE FROM resources WHERE id = $1", [resourceId])

    await pool.query(
      "UPDATE courses SET resources = GREATEST(0, resources - 1) WHERE code = $1",

      [resource.course_code],
    )

    res.json({ success: true })
  } catch (error: any) {
    res

      .status(500)

      .json({ error: error.message || "Failed to delete resource" })
  }
})

// POST Report an issue with a resource
resourcesRouter.post("/:id/report", authenticateToken, async (req: any, res) => {
  try {
    const resourceId = parseInt(req.params.id)
    const { reason, details } = req.body
    const reporterEmail = req.user.email

    if (!reason || !reason.trim()) {
      return res.status(400).json({ error: "Please select a reason for reporting" })
    }

    const resourceRes = await pool.query("SELECT * FROM resources WHERE id = $1", [resourceId])
    const resource = resourceRes.rows[0] as any
    if (!resource) {
      return res.status(404).json({ error: "Resource not found" })
    }

    if (resource.uploader_email === reporterEmail) {
      return res.status(400).json({ error: "You cannot report your own upload" })
    }

    const insertRes = await pool.query(
      `INSERT INTO resource_reports (resource_id, reporter_email, reason, details)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [resourceId, reporterEmail, reason.trim(), (details || "").trim()]
    )

    // Notify uploader asynchronously (without blocking response)
    if (resource.uploader_email) {
      sendReportNotificationEmail(
        resource.uploader_email,
        resource.title,
        reason.trim(),
        (details || "").trim()
      ).catch((err) => console.error("Email notify error:", err))
    }

    res.json({
      success: true,
      message: "Feedback reported successfully. The uploader has been notified.",
      reportId: insertRes.rows[0].id,
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to submit report" })
  }
})

