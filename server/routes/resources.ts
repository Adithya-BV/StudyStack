import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import jwt from "jsonwebtoken";
import { db } from "../db/database";
import { authenticateToken } from "./auth";

export const resourcesRouter = Router();
const JWT_SECRET = process.env.JWT_SECRET || "studystack_secret_jwt_key_2026";

// File storage setup
const uploadDir = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

// Optional auth helper to check if user has pinned a resource
function getOptionalUser(req: any) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch {
    return null;
  }
}

// ── GET Resources (with search, course, and type filters) ──────────────────────
resourcesRouter.get("/", (req, res) => {
  try {
    const { q, course, type } = req.query;
    const user = getOptionalUser(req);

    let query = "SELECT * FROM resources WHERE 1=1";
    const params: any[] = [];

    if (q) {
      query += " AND (LOWER(title) LIKE ? OR LOWER(course_code) LIKE ? OR LOWER(by) LIKE ?)";
      const term = `%${String(q).toLowerCase()}%`;
      params.push(term, term, term);
    }

    if (course && course !== "ALL") {
      query += " AND UPPER(course_code) = UPPER(?)";
      params.push(String(course));
    }

    if (type && type !== "ALL") {
      query += " AND LOWER(type) = LOWER(?)";
      params.push(String(type));
    }

    query += " ORDER BY id DESC";

    const resources = db.prepare(query).all(...params) as any[];

    // Check pinned status for current user
    let userPinnedIds = new Set<number>();
    if (user?.email) {
      const pins = db.prepare("SELECT resource_id FROM pins WHERE user_email = ?").all(user.email) as any[];
      userPinnedIds = new Set(pins.map((p) => p.resource_id));
    }

    const result = resources.map((r) => ({
      ...r,
      course: r.course_code,
      pinned: userPinnedIds.has(r.id),
    }));

    res.json({ success: true, resources: result });
  } catch (error: any) {
    console.error("Get resources error:", error);
    res.status(500).json({ error: error.message || "Failed to fetch resources" });
  }
});

// ── POST Upload Resource ─────────────────────────────────────────────────────
resourcesRouter.post("/upload", authenticateToken, upload.single("file"), (req: any, res) => {
  try {
    const { title, course, type } = req.body;
    if (!title || !course || !type) {
      return res.status(400).json({ error: "Title, course, and type are required" });
    }

    let filePath: string | null = null;
    let fileSize = "1.0 MB";

    if (req.file) {
      filePath = req.file.filename;
      const bytes = req.file.size;
      fileSize = bytes > 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
    }

    const today = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    const info = db
      .prepare(`
        INSERT INTO resources (title, course_code, type, by, uploader_email, file_path, file_size, date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        title.trim(),
        course.trim().toUpperCase(),
        type.trim(),
        req.user.name || "IITR Student",
        req.user.email,
        filePath,
        fileSize,
        today
      );

    // Increment course resource count
    db.prepare("UPDATE courses SET resources = resources + 1 WHERE UPPER(code) = UPPER(?)").run(
      course.trim().toUpperCase()
    );

    const newResource = db.prepare("SELECT * FROM resources WHERE id = ?").get(info.lastInsertRowid) as any;

    res.status(201).json({
      success: true,
      resource: {
        ...newResource,
        course: newResource.course_code,
        pinned: false,
      },
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    res.status(500).json({ error: error.message || "Upload failed" });
  }
});

// ── GET Download Resource ────────────────────────────────────────────────────
resourcesRouter.get("/:id/download", (req, res) => {
  try {
    const { id } = req.params;
    const resource = db.prepare("SELECT * FROM resources WHERE id = ?").get(Number(id)) as any;

    if (!resource) {
      return res.status(404).json({ error: "Resource not found" });
    }

    if (resource.file_path) {
      const fullPath = path.join(uploadDir, resource.file_path);
      if (fs.existsSync(fullPath)) {
        return res.download(fullPath, `${resource.title}.pdf`);
      }
    }

    // If pre-seeded resource with no disk file, generate a clean placeholder PDF / text document
    const content = `StudyStack IIT Roorkee Resource\n\nTitle: ${resource.title}\nCourse: ${resource.course_code}\nType: ${resource.type}\nUploaded by: ${resource.by}\nDate: ${resource.date}\n\nThis is a certified academic resource provided by StudyStack.`;
    res.setHeader("Content-Disposition", `attachment; filename="${resource.title.replace(/\s+/g, "_")}.txt"`);
    res.setHeader("Content-Type", "text/plain");
    res.send(content);
  } catch (error: any) {
    console.error("Download error:", error);
    res.status(500).json({ error: error.message || "Download failed" });
  }
});

// ── POST Toggle Pin/Bookmark ─────────────────────────────────────────────────
resourcesRouter.post("/:id/pin", authenticateToken, (req: any, res) => {
  try {
    const resourceId = Number(req.params.id);
    const userEmail = req.user.email;

    const existing = db
      .prepare("SELECT * FROM pins WHERE user_email = ? AND resource_id = ?")
      .get(userEmail, resourceId);

    if (existing) {
      db.prepare("DELETE FROM pins WHERE user_email = ? AND resource_id = ?").run(userEmail, resourceId);
      return res.json({ success: true, pinned: false, message: "Resource removed from pins" });
    } else {
      db.prepare("INSERT INTO pins (user_email, resource_id) VALUES (?, ?)").run(userEmail, resourceId);
      return res.json({ success: true, pinned: true, message: "Resource added to pins" });
    }
  } catch (error: any) {
    console.error("Pin toggle error:", error);
    res.status(500).json({ error: error.message || "Failed to toggle pin" });
  }
});

// ── GET Pinned Resources ─────────────────────────────────────────────────────
resourcesRouter.get("/pinned", authenticateToken, (req: any, res) => {
  try {
    const userEmail = req.user.email;
    const pinned = db
      .prepare(`
        SELECT r.*, 1 as pinned
        FROM resources r
        JOIN pins p ON p.resource_id = r.id
        WHERE p.user_email = ?
        ORDER BY p.id DESC
      `)
      .all(userEmail) as any[];

    const result = pinned.map((r) => ({
      ...r,
      course: r.course_code,
    }));

    res.json({ success: true, resources: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch pinned resources" });
  }
});
