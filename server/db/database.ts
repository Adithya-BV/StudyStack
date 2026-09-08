import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const dbDir = path.resolve(process.cwd(), "data");
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, "studystack.db");
export const db = new Database(dbPath);

// Enable WAL mode for high concurrency
db.pragma("journal_mode = WAL");

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      department TEXT DEFAULT 'Computer Science',
      year TEXT DEFAULT '2nd Year',
      is_verified INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS otps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      otp_code TEXT NOT NULL,
      type TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      dept TEXT NOT NULL,
      resources INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS resources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      course_code TEXT NOT NULL,
      type TEXT NOT NULL,
      by TEXT NOT NULL,
      uploader_email TEXT NOT NULL,
      file_path TEXT,
      file_size TEXT,
      date TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS pins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_email TEXT NOT NULL,
      resource_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_email, resource_id)
    );
  `);

  // Seed default courses if empty
  const courseCount = db.prepare("SELECT COUNT(*) as count FROM courses").get() as { count: number };
  if (courseCount.count === 0) {
    const insertCourse = db.prepare(
      "INSERT INTO courses (code, name, dept, resources) VALUES (@code, @name, @dept, @resources)"
    );

    const initialCourses = [
      { code: "CSN-201", name: "Data Structures and Algorithms", dept: "Computer Science", resources: 24 },
      { code: "MA-201", name: "Mathematics III", dept: "Mathematics", resources: 18 },
      { code: "EE-301", name: "Signals and Systems", dept: "Electrical Engineering", resources: 31 },
      { code: "CSN-301", name: "Operating Systems", dept: "Computer Science", resources: 27 },
      { code: "ME-201", name: "Engineering Mechanics", dept: "Mechanical Engineering", resources: 15 },
      { code: "CH-101", name: "Engineering Chemistry", dept: "Chemistry", resources: 22 },
      { code: "CSN-401", name: "Computer Networks", dept: "Computer Science", resources: 19 },
      { code: "EE-201", name: "Basic Electronics", dept: "Electrical Engineering", resources: 33 },
    ];

    for (const c of initialCourses) {
      insertCourse.run(c);
    }
  }

  // Seed default resources if empty
  const resCount = db.prepare("SELECT COUNT(*) as count FROM resources").get() as { count: number };
  if (resCount.count === 0) {
    const insertRes = db.prepare(`
      INSERT INTO resources (title, course_code, type, by, uploader_email, file_path, file_size, date)
      VALUES (@title, @course_code, @type, @by, @uploader_email, @file_path, @file_size, @date)
    `);

    const initialResources = [
      { title: "DSA Mid-Sem Notes 2024", course_code: "CSN-201", type: "Notes", by: "Arjun Sharma", uploader_email: "arjun@iitr.ac.in", file_path: null, file_size: "2.4 MB", date: "Aug 28, 2026" },
      { title: "OS Previous Year Paper 2023", course_code: "CSN-301", type: "PYQ", by: "Priya Verma", uploader_email: "priya@iitr.ac.in", file_path: null, file_size: "1.1 MB", date: "Aug 25, 2026" },
      { title: "Signals Lab Manual", course_code: "EE-301", type: "Labs", by: "Rahul Gupta", uploader_email: "rahul@iitr.ac.in", file_path: null, file_size: "3.8 MB", date: "Aug 20, 2026" },
      { title: "Maths III Assignment 2", course_code: "MA-201", type: "Assignments", by: "Neha Singh", uploader_email: "neha@iitr.ac.in", file_path: null, file_size: "0.6 MB", date: "Aug 18, 2026" },
      { title: "Computer Networks Cheatsheet", course_code: "CSN-401", type: "Notes", by: "Arjun Sharma", uploader_email: "arjun@iitr.ac.in", file_path: null, file_size: "0.9 MB", date: "Sep 1, 2026" },
    ];

    for (const r of initialResources) {
      insertRes.run(r);
    }
  }
}
