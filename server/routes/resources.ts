import { Router } from "express"

import multer from "multer"

import path from "path"

import fs from "fs"

import jwt from "jsonwebtoken"

import { PDFDocument, rgb, StandardFonts } from "pdf-lib"

import { pool } from "../db/database"

import { authenticateToken } from "./auth"

export const resourcesRouter = Router()

const JWT_SECRET = process.env.JWT_SECRET || "studystack_secret_jwt_key_2026"

// File storage setup

const uploadDir = path.resolve(process.cwd(), "uploads")

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },

  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)

    const ext = path.extname(file.originalname)

    cb(null, `${uniqueSuffix}${ext}`)
  },
})

const upload = multer({
  storage,

  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
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

    let query = "SELECT * FROM resources WHERE 1=1"

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

      let fileSize = "1.0 MB"

      if (req.file) {
        filePath = req.file.filename

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

      const info = db

        .prepare(`
        INSERT INTO resources (title, course_code, type, by, uploader_email, file_path, file_size, date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `)

        .run(
          title.trim(),

          cleanCourseCode,

          type.trim(),

          req.user.name || "IITR Student",

          req.user.email,

          filePath,

          fileSize,

          today,
        )

      // Check if course already exists in `courses` table

      const existingCourse = db

        .prepare("SELECT * FROM courses WHERE UPPER(code) = ?")

        .get(cleanCourseCode) as any

      let courseCreated = false

      if (!existingCourse) {
        // Course does not exist: automatically create it so it appears in course lists and resources

        const courseName =
          (req.body.courseName && req.body.courseName.trim()) || cleanCourseCode

        const courseDept =
          (req.body.courseDept && req.body.courseDept.trim()) ||
          req.user?.department ||
          "General Engineering"

        db.prepare(
          "INSERT INTO courses (code, name, dept, resources) VALUES (?, ?, ?, 1)",
        ).run(
          cleanCourseCode,

          courseName,

          courseDept,
        )

        courseCreated = true
      } else {
        // Course exists: increment its resource count

        db.prepare(
          "UPDATE courses SET resources = resources + 1 WHERE UPPER(code) = ?",
        ).run(cleanCourseCode)
      }

      const newResource = (
        await pool.query("SELECT * FROM resources WHERE id = $1", [
          info.lastInsertRowid,
        ])
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

    if (resource.file_path) {
      const fullPath = path.join(uploadDir, resource.file_path)

      if (fs.existsSync(fullPath)) {
        const ext = path.extname(resource.file_path) || ""

        const cleanTitle = resource.title.replace(/[/\\?%*:|"<>]/g, "_").trim()

        const downloadFilename = cleanTitle
          .toLowerCase()
          .endsWith(ext.toLowerCase())
          ? cleanTitle
          : `${cleanTitle}${ext}`

        return res.download(fullPath, downloadFilename)
      }
    }

    // Dynamic PDF generator fallback for any resources without a disk file

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

    const existing = db

      .prepare("SELECT * FROM pins WHERE user_email = ? AND resource_id = ?")

      .get(userEmail, resourceId)

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

    const pinned = db

      .prepare(`
        SELECT r.*, 1 as pinned
        FROM resources r
        JOIN pins p ON p.resource_id = r.id
        WHERE p.user_email = ?
        ORDER BY p.id DESC
      `)

      .all(userEmail) as any[]

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
