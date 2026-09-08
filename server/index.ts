import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { initDatabase } from "./db/database";
import { authRouter } from "./routes/auth";
import { coursesRouter } from "./routes/courses";
import { resourcesRouter } from "./routes/resources";
import { profileRouter } from "./routes/profile";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize SQLite database & seed data
initDatabase();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    app: "StudyStack API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/courses", coursesRouter);
app.use("/api/resources", resourcesRouter);
app.use("/api/profile", profileRouter);

// Serve built frontend in production
const distDir = path.resolve(process.cwd(), "dist");
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.use((req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) {
      return next();
    }
    res.sendFile(path.join(distDir, "index.html"));
  });
}

// Start server
app.listen(PORT, () => {
  console.log("==================================================");
  console.log(`🚀 StudyStack API Server is running on port ${PORT}`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`📂 Database: SQLite initialized at ./data/studystack.db`);
  console.log("==================================================");
});
