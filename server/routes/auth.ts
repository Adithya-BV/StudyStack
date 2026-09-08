import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../db/database";
import { generateOTP, sendOTPEmail } from "../services/emailService";

export const authRouter = Router();
const JWT_SECRET = process.env.JWT_SECRET || "studystack_secret_jwt_key_2026";

// Middleware to protect routes
export function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
}

// ── Signup ───────────────────────────────────────────────────────────────────
authRouter.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // IITR email check (allow bypass for testing if explicitly desired, but enforce format)
    if (!normalizedEmail.endsWith("@iitr.ac.in")) {
      return res.status(400).json({ error: "Only IIT Roorkee (@iitr.ac.in) email addresses are allowed" });
    }

    // Check if user already exists
    const existing = db.prepare("SELECT * FROM users WHERE email = ?").get(normalizedEmail) as any;
    if (existing && existing.is_verified) {
      return res.status(400).json({ error: "An account with this email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    if (existing) {
      db.prepare("UPDATE users SET name = ?, password_hash = ? WHERE email = ?").run(name, password_hash, normalizedEmail);
    } else {
      db.prepare("INSERT INTO users (name, email, password_hash, is_verified) VALUES (?, ?, ?, 0)").run(
        name,
        normalizedEmail,
        password_hash
      );
    }

    // Generate & send OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    db.prepare("INSERT INTO otps (email, otp_code, type, expires_at) VALUES (?, ?, 'signup', ?)").run(
      normalizedEmail,
      otp,
      expiresAt
    );

    await sendOTPEmail(normalizedEmail, otp, "signup");

    res.json({ success: true, message: "OTP sent to your IITR email", email: normalizedEmail });
  } catch (error: any) {
    console.error("Signup error:", error);
    res.status(500).json({ error: error.message || "Signup failed" });
  }
});

// ── Verify OTP ───────────────────────────────────────────────────────────────
authRouter.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const record = db
      .prepare(
        "SELECT * FROM otps WHERE email = ? AND otp_code = ? AND type = 'signup' AND expires_at > datetime('now') ORDER BY id DESC LIMIT 1"
      )
      .get(normalizedEmail, otp.trim()) as any;

    if (!record) {
      return res.status(400).json({ error: "Invalid or expired OTP code" });
    }

    // Mark user verified
    db.prepare("UPDATE users SET is_verified = 1 WHERE email = ?").run(normalizedEmail);
    db.prepare("DELETE FROM otps WHERE email = ? AND type = 'signup'").run(normalizedEmail);

    const user = db.prepare("SELECT id, name, email, department, year FROM users WHERE email = ?").get(normalizedEmail) as any;

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ success: true, token, user });
  } catch (error: any) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ error: error.message || "OTP verification failed" });
  }
});

// ── Resend OTP ───────────────────────────────────────────────────────────────
authRouter.post("/resend-otp", async (req, res) => {
  try {
    const { email, type = "signup" } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    db.prepare("INSERT INTO otps (email, otp_code, type, expires_at) VALUES (?, ?, ?, ?)").run(
      normalizedEmail,
      otp,
      type,
      expiresAt
    );

    await sendOTPEmail(normalizedEmail, otp, type as any);

    res.json({ success: true, message: "A new OTP has been sent" });
  } catch (error: any) {
    console.error("Resend OTP error:", error);
    res.status(500).json({ error: error.message || "Failed to resend OTP" });
  }
});

// ── Login ────────────────────────────────────────────────────────────────────
authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail.endsWith("@iitr.ac.in")) {
      return res.status(400).json({ error: "Only IIT Roorkee (@iitr.ac.in) email addresses are allowed" });
    }

    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(normalizedEmail) as any;

    if (!user) {
      return res.status(401).json({ error: "No account found with this email" });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    if (!user.is_verified) {
      // Send OTP to complete verification
      const otp = generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
      db.prepare("INSERT INTO otps (email, otp_code, type, expires_at) VALUES (?, ?, 'signup', ?)").run(
        normalizedEmail,
        otp,
        expiresAt
      );
      await sendOTPEmail(normalizedEmail, otp, "signup");

      return res.status(403).json({
        error: "Account not verified yet. We have sent an OTP to your email.",
        needsVerification: true,
        email: normalizedEmail,
      });
    }

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        department: user.department,
        year: user.year,
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({ error: error.message || "Login failed" });
  }
});

// ── Forgot Password ──────────────────────────────────────────────────────────
authRouter.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail.endsWith("@iitr.ac.in")) {
      return res.status(400).json({ error: "Only IIT Roorkee (@iitr.ac.in) email addresses are allowed" });
    }

    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(normalizedEmail) as any;

    if (!user) {
      return res.status(404).json({ error: "No account found with this email" });
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    db.prepare("INSERT INTO otps (email, otp_code, type, expires_at) VALUES (?, ?, 'forgot_password', ?)").run(
      normalizedEmail,
      otp,
      expiresAt
    );

    await sendOTPEmail(normalizedEmail, otp, "forgot_password");

    res.json({ success: true, message: "Reset OTP sent to your email", email: normalizedEmail });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    res.status(500).json({ error: error.message || "Failed to process request" });
  }
});

// ── Reset Password ───────────────────────────────────────────────────────────
authRouter.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: "Email, OTP, and new password are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const record = db
      .prepare(
        "SELECT * FROM otps WHERE email = ? AND otp_code = ? AND type = 'forgot_password' AND expires_at > datetime('now') ORDER BY id DESC LIMIT 1"
      )
      .get(normalizedEmail, otp.trim()) as any;

    if (!record) {
      return res.status(400).json({ error: "Invalid or expired OTP code" });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(newPassword, salt);

    db.prepare("UPDATE users SET password_hash = ? WHERE email = ?").run(password_hash, normalizedEmail);
    db.prepare("DELETE FROM otps WHERE email = ? AND type = 'forgot_password'").run(normalizedEmail);

    res.json({ success: true, message: "Password updated successfully! You can now log in." });
  } catch (error: any) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: error.message || "Failed to reset password" });
  }
});

// ── Current User Profile ─────────────────────────────────────────────────────
authRouter.get("/me", authenticateToken, (req: any, res) => {
  const user = db.prepare("SELECT id, name, email, department, year, created_at FROM users WHERE email = ?").get(req.user.email);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  res.json({ success: true, user });
});
