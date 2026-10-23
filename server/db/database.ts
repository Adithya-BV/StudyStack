import { Pool } from "pg"

import dotenv from "dotenv"

dotenv.config()

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,

  ssl: { rejectUnauthorized: false },
})

export async function initDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      department TEXT DEFAULT 'Computer Science',
      year TEXT DEFAULT '2nd Year',
      is_verified INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS otps (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL,
      otp_code TEXT NOT NULL,
      type TEXT NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS courses (
      id SERIAL PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      dept TEXT NOT NULL,
      resources INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS resources (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      course_code TEXT NOT NULL,
      type TEXT NOT NULL,
      by TEXT NOT NULL,
      uploader_email TEXT NOT NULL,
      file_path TEXT,
      file_size TEXT,
      date TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS pins (
      id SERIAL PRIMARY KEY,
      user_email TEXT NOT NULL,
      resource_id INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_email, resource_id)
    );
    CREATE TABLE IF NOT EXISTS user_courses (
      id SERIAL PRIMARY KEY,
      user_email TEXT NOT NULL,
      course_id INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_email, course_id)
    );
  `)

  // Seed default courses if empty

  const courseCountRes = await pool.query(
    "SELECT COUNT(*) as count FROM courses",
  )

  if (parseInt(courseCountRes.rows[0].count) === 0) {
    const insertCourse =
      "INSERT INTO courses (code, name, dept, resources) VALUES ($1, $2, $3, $4)"

    const initialCourses = [
      ["ECT-102", "Design of Passive Microwave Components", "Electronics & Communication Engineering", 0],
      ["ECC-351", "Fundamentals of AI/ML", "Electronics & Communication Engineering", 0],
      ["ECC-301", "Digital Signal Processing", "Electronics & Communication Engineering", 1],
      ["ECC-305", "Digital Electronics and Linear IC Lab", "Electronics & Communication Engineering", 0],
      ["ECC-303", "Microwave Engineering", "Electronics & Communication Engineering", 0],
    ]

    for (const c of initialCourses) {
      await pool.query(insertCourse, c)
    }
  }

  // Seed default resources if empty

  const resCountRes = await pool.query(
    "SELECT COUNT(*) as count FROM resources",
  )

  if (parseInt(resCountRes.rows[0].count) === 0) {
    const insertRes = `
      INSERT INTO resources (title, course_code, type, by, uploader_email, file_path, file_size, date)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `

    const initialResources = [
      [
        "DSA Mid-Sem Notes 2024",

        "CSN-201",

        "Notes",

        "Arjun Sharma",

        "arjun@iitr.ac.in",

        null,

        "2.4 MB",

        "Aug 28, 2026",
      ],

      [
        "OS Previous Year Paper 2023",

        "CSN-301",

        "PYQ",

        "Priya Verma",

        "priya@iitr.ac.in",

        null,

        "1.1 MB",

        "Aug 25, 2026",
      ],

      [
        "Signals Lab Manual",

        "EE-301",

        "Labs",

        "Rahul Gupta",

        "rahul@iitr.ac.in",

        null,

        "3.8 MB",

        "Aug 20, 2026",
      ],

      [
        "Maths III Assignment 2",

        "MA-201",

        "Assignments",

        "Neha Singh",

        "neha@iitr.ac.in",

        null,

        "0.6 MB",

        "Aug 18, 2026",
      ],

      [
        "Computer Networks Cheatsheet",

        "CSN-401",

        "Notes",

        "Arjun Sharma",

        "arjun@iitr.ac.in",

        null,

        "0.9 MB",

        "Sep 1, 2026",
      ],
    ]

    for (const r of initialResources) {
      await pool.query(insertRes, r)
    }
  }
}
