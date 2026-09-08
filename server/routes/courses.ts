import { Router } from "express";
import { db } from "../db/database";
import { authenticateToken } from "./auth";

export const coursesRouter = Router();

// GET all courses
coursesRouter.get("/", (req, res) => {
  try {
    const courses = db.prepare(`
      SELECT 
        c.id, 
        c.code, 
        c.name, 
        c.dept, 
        COALESCE(r.cnt, c.resources) as resources
      FROM courses c
      LEFT JOIN (
        SELECT course_code, COUNT(*) as cnt 
        FROM resources 
        GROUP BY course_code
      ) r ON UPPER(r.course_code) = UPPER(c.code)
      ORDER BY c.code ASC
    `).all();

    res.json({ success: true, courses });
  } catch (error: any) {
    console.error("Get courses error:", error);
    res.status(500).json({ error: error.message || "Failed to fetch courses" });
  }
});

// GET course by ID or code
coursesRouter.get("/:idOrCode", (req, res) => {
  try {
    const { idOrCode } = req.params;
    let course;
    if (isNaN(Number(idOrCode))) {
      course = db.prepare("SELECT * FROM courses WHERE UPPER(code) = UPPER(?)").get(idOrCode);
    } else {
      course = db.prepare("SELECT * FROM courses WHERE id = ?").get(Number(idOrCode));
    }

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    res.json({ success: true, course });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch course" });
  }
});

// POST add new course
coursesRouter.post("/", authenticateToken, (req, res) => {
  try {
    const { code, name, dept } = req.body;
    if (!code || !name || !dept) {
      return res.status(400).json({ error: "Course code, name, and department are required" });
    }

    const cleanCode = code.trim().toUpperCase();
    const existing = db.prepare("SELECT * FROM courses WHERE UPPER(code) = ?").get(cleanCode);
    if (existing) {
      return res.status(400).json({ error: "A course with this code already exists" });
    }

    const info = db.prepare("INSERT INTO courses (code, name, dept, resources) VALUES (?, ?, ?, 0)").run(
      cleanCode,
      name.trim(),
      dept.trim()
    );

    const newCourse = db.prepare("SELECT * FROM courses WHERE id = ?").get(info.lastInsertRowid);
    res.status(201).json({ success: true, course: newCourse });
  } catch (error: any) {
    console.error("Add course error:", error);
    res.status(500).json({ error: error.message || "Failed to add course" });
  }
});

// DELETE course
coursesRouter.delete("/:id", authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    db.prepare("DELETE FROM courses WHERE id = ?").run(Number(id));
    res.json({ success: true, message: "Course removed" });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to delete course" });
  }
});
