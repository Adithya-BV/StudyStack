import { Router } from "express";
import { db } from "../db/database";
import { authenticateToken } from "./auth";

export const profileRouter = Router();

// GET profile summary and user uploads
profileRouter.get("/", authenticateToken, (req: any, res) => {
  try {
    const userEmail = req.user.email;
    const user = db
      .prepare("SELECT id, name, email, department, year, created_at FROM users WHERE email = ?")
      .get(userEmail) as any;

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const uploads = db
      .prepare("SELECT * FROM resources WHERE uploader_email = ? ORDER BY id DESC")
      .all(userEmail) as any[];

    const pinCount = db
      .prepare("SELECT COUNT(*) as count FROM pins WHERE user_email = ?")
      .get(userEmail) as any;

    res.json({
      success: true,
      profile: {
        ...user,
        uploadsCount: uploads.length,
        pinsCount: pinCount ? pinCount.count : 0,
        uploads: uploads.map((u) => ({ ...u, course: u.course_code })),
      },
    });
  } catch (error: any) {
    console.error("Profile error:", error);
    res.status(500).json({ error: error.message || "Failed to fetch profile" });
  }
});

// PUT update profile
profileRouter.put("/", authenticateToken, (req: any, res) => {
  try {
    const userEmail = req.user.email;
    const { name, department, year } = req.body;

    db.prepare("UPDATE users SET name = COALESCE(?, name), department = COALESCE(?, department), year = COALESCE(?, year) WHERE email = ?").run(
      name,
      department,
      year,
      userEmail
    );

    const updated = db.prepare("SELECT id, name, email, department, year FROM users WHERE email = ?").get(userEmail);
    res.json({ success: true, user: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to update profile" });
  }
});
