import React, { useState, useRef, useEffect } from "react";
import logoImg from "@/imports/ChatGPT_Image_Sep_8__2026__10_02_08_PM.png";
import sidebarIcon from "@/imports/ChatGPT_Image_Sep_8__2026__10_12_04_PM.png";
import { api } from "./services/api";

// ── Colors ──────────────────────────────────────────────────────────────────
const C = {
  navy: "#061B49",
  blue: "#146EF5",
  cyan: "#55C7FF",
  bg: "#F5F8FC",
  card: "#FFFFFF",
  text: "#0F172A",
  muted: "#64748B",
  border: "#E2E8F0",
};

// ── Types ────────────────────────────────────────────────────────────────────
type Course = { id: number; code: string; name: string; dept: string; resources: number };
type Resource = {
  id: number;
  title: string;
  course: string;
  type: string;
  by: string;
  date: string;
  size: string;
  pinned?: boolean;
};

type Page = "login" | "signup" | "otp" | "forgot" | "home" | "courses" | "course-detail" | "upload" | "pins" | "profile";

// Helper to validate any IITR email domain (e.g. @iitr.ac.in, @ece.iitr.ac.in, @cse.iitr.ac.in)
const isValidIITREmail = (email: string) => /^[^\s@]+@([a-zA-Z0-9-]+\.)*iitr\.ac\.in$/.test(email.trim().toLowerCase());

const IITR_BRANCHES = [
  "Computer Science & Engineering",
  "Electronics & Communication Engineering",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Chemical Engineering",
  "Applied Mathematics & Scientific Computing",
  "Biotechnology",
  "Metallurgical & Materials Engineering",
  "Architecture & Planning",
  "Engineering Physics",
  "Data Science & Artificial Intelligence",
  "Design",
  "Earth Sciences",
  "Production & Industrial Engineering",
  "Other",
];

// ── Icons ────────────────────────────────────────────────────────────────────
const Icon = {
  Home: () => (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  Book: () => (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  Bookmark: () => (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
    </svg>
  ),
  Upload: () => (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  ),
  User: () => (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  Logout: () => (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
  Search: () => (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  Download: () => (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  ),
  Pin: ({ filled }: { filled?: boolean }) => (
    <svg width="16" height="16" fill={filled ? C.blue : "none"} viewBox="0 0 24 24" stroke={filled ? C.blue : "currentColor"} strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
    </svg>
  ),
  File: () => (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  ChevronRight: () => (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  ),
  Eye: () => (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  EyeOff: () => (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  ),
  Check: () => (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
};

// ── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, type }: { msg: string; type: "success" | "error" }) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 28,
        right: 28,
        background: type === "success" ? C.navy : "#ef4444",
        color: "#fff",
        padding: "12px 20px",
        borderRadius: 10,
        fontSize: 14,
        fontWeight: 500,
        boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      {type === "success" && <Icon.Check />}
      {msg}
    </div>
  );
}

function useToast() {
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const show = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };
  return { toast, show };
}

// ── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ page, setPage, onLogout }: { page: Page; setPage: (p: Page) => void; onLogout: () => void }) {
  const navItems: { label: string; icon: keyof typeof Icon; target: Page }[] = [
    { label: "Home", icon: "Home", target: "home" },
    { label: "My Courses", icon: "Book", target: "courses" },
    { label: "My Pins", icon: "Bookmark", target: "pins" },
    { label: "Upload", icon: "Upload", target: "upload" },
    { label: "Profile", icon: "User", target: "profile" },
  ];

  return (
    <aside
      style={{
        width: 248,
        minWidth: 248,
        background: C.navy,
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {/* Logo */}
      <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src={sidebarIcon} alt="StudyStack logo" style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover", mixBlendMode: "lighten" }} />
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 18, letterSpacing: "-0.3px" }}>StudyStack</div>
            <div style={{ color: C.cyan, fontSize: 11, fontWeight: 500, letterSpacing: "0.2px" }}>Your Stack. Your Track.</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: "16px 12px", flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
        {navItems.map(({ label, icon, target }) => {
          const active = page === target || (target === "courses" && page === "course-detail");
          const IconComp = Icon[icon] as () => React.ReactElement;
          return (
            <button
              key={label}
              onClick={() => setPage(target)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                background: active ? "rgba(20, 110, 245, 0.18)" : "transparent",
                color: active ? C.cyan : "rgba(255,255,255,0.65)",
                fontWeight: active ? 600 : 400,
                fontSize: 14,
                width: "100%",
                textAlign: "left",
                transition: "all 0.15s",
                borderLeft: active ? `3px solid ${C.cyan}` : "3px solid transparent",
              }}
            >
              <IconComp />
              {label}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: "12px 12px 24px" }}>
        <button
          onClick={onLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 12px",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            background: "transparent",
            color: "rgba(255,255,255,0.45)",
            fontSize: 14,
            width: "100%",
            textAlign: "left",
            transition: "all 0.15s",
          }}
        >
          <Icon.Logout />
          Logout
        </button>
      </div>
    </aside>
  );
}

// ── Input ────────────────────────────────────────────────────────────────────
function Input({ label, type = "text", placeholder, value, onChange }: {
  label: string; type?: string; placeholder?: string; value: string; onChange: (v: string) => void;
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{label}</label>
      <div style={{ position: "relative" }}>
        <input
          type={isPassword && !show ? "password" : "text"}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: "100%",
            padding: isPassword ? "11px 40px 11px 14px" : "11px 14px",
            border: `1.5px solid ${C.border}`,
            borderRadius: 10,
            fontSize: 14,
            color: C.text,
            background: "#fff",
            outline: "none",
            boxSizing: "border-box",
            fontFamily: "Inter, sans-serif",
          }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: C.muted, padding: 0 }}
          >
            {show ? <Icon.EyeOff /> : <Icon.Eye />}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Btn ──────────────────────────────────────────────────────────────────────
function Btn({ children, onClick, variant = "primary", fullWidth, disabled }: {
  children: React.ReactNode; onClick?: () => void; variant?: "primary" | "secondary" | "ghost"; fullWidth?: boolean; disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "11px 20px",
        borderRadius: 10,
        fontSize: 14,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.65 : 1,
        width: fullWidth ? "100%" : undefined,
        fontFamily: "Inter, sans-serif",
        transition: "all 0.15s",
        ...(variant === "primary" && { background: C.blue, color: "#fff", border: "none" }),
        ...(variant === "secondary" && { background: "#fff", color: C.blue, border: `1.5px solid ${C.blue}` }),
        ...(variant === "ghost" && { background: "transparent", color: C.muted, border: "none" }),
      }}
    >
      {children}
    </button>
  );
}

// ── Card ─────────────────────────────────────────────────────────────────────
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        background: C.card,
        borderRadius: 14,
        border: `1px solid ${C.border}`,
        boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
        padding: 20,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ── Badge ─────────────────────────────────────────────────────────────────────
const typeColors: Record<string, { bg: string; text: string }> = {
  Notes: { bg: "#EFF6FF", text: "#1D4ED8" },
  PYQ: { bg: "#FFF7ED", text: "#C2410C" },
  Assignments: { bg: "#F0FDF4", text: "#15803D" },
  Labs: { bg: "#FDF4FF", text: "#7E22CE" },
  Other: { bg: "#F8FAFC", text: "#475569" },
};

function TypeBadge({ type }: { type: string }) {
  const colors = typeColors[type] || typeColors.Other;
  return (
    <span style={{ background: colors.bg, color: colors.text, fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 6 }}>
      {type}
    </span>
  );
}

// ── Resource Card ─────────────────────────────────────────────────────────────
function ResourceCard({ r, onPin, onToast }: {
  r: Resource; onPin: (id: number) => void; onToast: (msg: string, type?: "success" | "error") => void;
}) {
  const handleDownload = () => {
    window.open(api.resources.getDownloadUrl(r.id), "_blank");
    onToast(`Downloading ${r.title}...`);
  };

  return (
    <Card style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "16px 20px" }}>
      <div style={{ background: "#EFF6FF", borderRadius: 10, padding: 10, flexShrink: 0 }}>
        <Icon.File />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: C.text, marginBottom: 4 }}>{r.title}</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <TypeBadge type={r.type} />
          <span style={{ fontSize: 12, color: C.muted }}>{r.course}</span>
          <span style={{ fontSize: 12, color: C.muted }}>·</span>
          <span style={{ fontSize: 12, color: C.muted }}>{r.by}</span>
          <span style={{ fontSize: 12, color: C.muted }}>·</span>
          <span style={{ fontSize: 12, color: C.muted }}>{r.date}</span>
          <span style={{ fontSize: 12, color: C.muted }}>·</span>
          <span style={{ fontSize: 12, color: C.muted }}>{r.size}</span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        <button
          onClick={handleDownload}
          style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 12px", background: C.blue, color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
        >
          <Icon.Download /> Download
        </button>
        <button
          onClick={() => onPin(r.id)}
          style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 12px", background: r.pinned ? "#EFF6FF" : "#F8FAFC", color: r.pinned ? C.blue : C.muted, border: `1px solid ${r.pinned ? "#BFDBFE" : C.border}`, borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
        >
          <Icon.Pin filled={r.pinned} />
          {r.pinned ? "Pinned" : "Pin"}
        </button>
      </div>
    </Card>
  );
}

// ── Login Page ────────────────────────────────────────────────────────────────
function LoginPage({ onLogin, onSignup, onForgot, onToast, setEmailForOtp }: {
  onLogin: () => void;
  onSignup: () => void;
  onForgot: () => void;
  onToast: (msg: string, type?: "success" | "error") => void;
  setEmailForOtp: (email: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      onToast("Please enter email and password", "error");
      return;
    }
    if (!isValidIITREmail(email)) {
      onToast("Only IIT Roorkee (*.iitr.ac.in) email addresses are allowed", "error");
      return;
    }
    setLoading(true);
    try {
      await api.auth.login(email, password);
      onToast("Welcome back!");
      onLogin();
    } catch (err: any) {
      if (err.needsVerification) {
        setEmailForOtp(err.email);
        onToast("Please verify your email with the OTP sent", "error");
      } else {
        onToast(err.message || "Invalid credentials", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100%", display: "flex", background: C.bg }}>
      {/* Left panel */}
      <div style={{ width: 420, minWidth: 420, background: "#0d2356", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 48, position: "relative", overflow: "hidden" }}>
        <img
          src={logoImg}
          alt="StudyStack"
          style={{
            width: 420,
            height: 420,
            objectFit: "cover",
            mixBlendMode: "lighten",
          }}
        />
      </div>

      {/* Right panel */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 48 }}>
        <div style={{ width: "100%", maxWidth: 400 }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: C.text, marginBottom: 6, letterSpacing: "-0.5px" }}>Welcome back!</div>
          <div style={{ color: C.muted, fontSize: 14, marginBottom: 32 }}>Continue your learning journey with StudyStack.</div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
            <Input label="IITR Email" placeholder="yourname@iitr.ac.in" value={email} onChange={setEmail} />
            <Input label="Password" type="password" placeholder="Enter your password" value={password} onChange={setPassword} />
          </div>

          <div style={{ textAlign: "right", marginBottom: 24 }}>
            <button onClick={onForgot} style={{ background: "none", border: "none", color: C.blue, fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
              Forgot Password?
            </button>
          </div>

          <Btn onClick={handleLogin} fullWidth disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Btn>

          <div style={{ marginTop: 24, textAlign: "center", fontSize: 13, color: C.muted }}>
            Don't have an account?{" "}
            <button onClick={onSignup} style={{ background: "none", border: "none", color: C.blue, fontWeight: 600, cursor: "pointer" }}>
              Create Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Signup Page ───────────────────────────────────────────────────────────────
function SignupPage({ onNext, onBack, onToast, setEmailForOtp }: {
  onNext: () => void;
  onBack: () => void;
  onToast: (msg: string, type?: "success" | "error") => void;
  setEmailForOtp: (email: string) => void;
}) {
  const [name, setName] = useState("");
  const [branch, setBranch] = useState("Computer Science & Engineering");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      onToast("Student name cannot be empty", "error");
      return;
    }
    if (!email || !pw) {
      onToast("Please fill all fields", "error");
      return;
    }
    if (!isValidIITREmail(email)) {
      onToast("Only IIT Roorkee (*.iitr.ac.in) email addresses are allowed", "error");
      return;
    }
    if (pw !== pw2) {
      onToast("Passwords do not match", "error");
      return;
    }

    setLoading(true);
    try {
      await api.auth.signup(name.trim(), email, pw, branch);
      setEmailForOtp(email);
      onToast("OTP generated! (Check terminal console if SMTP not configured)");
      onNext();
    } catch (err: any) {
      onToast(err.message || "Failed to create account", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: C.bg, padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 420, background: "#fff", borderRadius: 20, padding: 40, border: `1px solid ${C.border}`, boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
          <img src={logoImg} alt="StudyStack" style={{ width: 60, height: 60, borderRadius: 12, objectFit: "cover" }} />
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, color: C.text, marginBottom: 4, textAlign: "center" }}>Create Account</div>
        <div style={{ color: C.muted, fontSize: 13, marginBottom: 28, textAlign: "center" }}>Join thousands of IITR students</div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
          <Input label="Full Name *" placeholder="Your full name" value={name} onChange={setName} />
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: C.text, display: "block", marginBottom: 6 }}>Branch / Department *</label>
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              style={{
                width: "100%",
                padding: "11px 14px",
                border: `1.5px solid ${C.border}`,
                borderRadius: 10,
                fontSize: 14,
                color: C.text,
                background: "#fff",
                outline: "none",
                fontFamily: "Inter, sans-serif",
                cursor: "pointer",
                boxSizing: "border-box",
              }}
            >
              {IITR_BRANCHES.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
          <Input label="IITR Email *" placeholder="yourname@iitr.ac.in" value={email} onChange={setEmail} />
          <Input label="Password *" type="password" placeholder="Create a password" value={pw} onChange={setPw} />
          <Input label="Confirm Password *" type="password" placeholder="Repeat your password" value={pw2} onChange={setPw2} />
        </div>

        <Btn onClick={handleSubmit} fullWidth disabled={loading}>
          {loading ? "Sending OTP..." : "Create Account"}
        </Btn>

        <div style={{ marginTop: 20, textAlign: "center", fontSize: 13, color: C.muted }}>
          Already have an account?{" "}
          <button onClick={onBack} style={{ background: "none", border: "none", color: C.blue, fontWeight: 600, cursor: "pointer" }}>
            Login
          </button>
        </div>
      </div>
    </div>
  );
}

// ── OTP Page ──────────────────────────────────────────────────────────────────
function OtpPage({ onVerify, email, onToast }: {
  onVerify: () => void;
  email: string;
  onToast: (msg: string, type?: "success" | "error") => void;
}) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const refs = Array.from({ length: 6 }, () => useRef<HTMLInputElement>(null));

  const handleChange = (i: number, v: string) => {
    if (!/^\d?$/.test(v)) return;
    const next = [...otp];
    next[i] = v;
    setOtp(next);
    if (v && i < 5) refs[i + 1].current?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length !== 6) {
      onToast("Please enter the 6-digit OTP", "error");
      return;
    }
    setLoading(true);
    try {
      await api.auth.verifyOtp(email, code);
      onToast("Account verified successfully! 🎉");
      onVerify();
    } catch (err: any) {
      onToast(err.message || "Invalid OTP", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await api.auth.resendOtp(email);
      onToast("New OTP sent! (Check console if SMTP unconfigured)");
    } catch (err: any) {
      onToast(err.message || "Failed to resend OTP", "error");
    }
  };

  return (
    <div style={{ minHeight: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: C.bg, padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 400, background: "#fff", borderRadius: 20, padding: 40, border: `1px solid ${C.border}`, boxShadow: "0 4px 24px rgba(0,0,0,0.07)", textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>📬</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 6 }}>Verify Your IITR Email</div>
        <div style={{ color: C.muted, fontSize: 13, marginBottom: 32 }}>
          Enter the OTP sent to <b>{email || "your IITR email"}</b>.
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 32 }}>
          {otp.map((d, i) => (
            <input
              key={i}
              ref={refs[i]}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              maxLength={1}
              style={{
                width: 44, height: 52, textAlign: "center", fontSize: 22, fontWeight: 700, border: `2px solid ${d ? C.blue : C.border}`, borderRadius: 10, outline: "none", color: C.text, fontFamily: "Inter, sans-serif",
              }}
            />
          ))}
        </div>

        <Btn onClick={handleVerify} fullWidth disabled={loading}>
          {loading ? "Verifying..." : "Verify"}
        </Btn>
        <div style={{ marginTop: 16 }}>
          <button onClick={handleResend} style={{ background: "none", border: "none", color: C.blue, fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
            Resend OTP
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Forgot Password Page ─────────────────────────────────────────────────────
function ForgotPasswordPage({ onDone, onBack, onToast }: {
  onDone: () => void;
  onBack: () => void;
  onToast: (msg: string, type?: "success" | "error") => void;
}) {
  const [step, setStep] = useState<"email" | "reset">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPw, setNewPw] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!email) {
      onToast("Enter your email", "error");
      return;
    }
    if (!isValidIITREmail(email)) {
      onToast("Only IIT Roorkee (*.iitr.ac.in) email addresses are allowed", "error");
      return;
    }
    setLoading(true);
    try {
      await api.auth.forgotPassword(email);
      onToast("Reset OTP sent! (Check terminal console)");
      setStep("reset");
    } catch (err: any) {
      onToast(err.message || "Failed to send reset OTP", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!otp || !newPw) {
      onToast("Please enter OTP and new password", "error");
      return;
    }
    setLoading(true);
    try {
      await api.auth.resetPassword(email, otp, newPw);
      onToast("Password updated! Please log in.");
      onDone();
    } catch (err: any) {
      onToast(err.message || "Failed to reset password", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: C.bg, padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 400, background: "#fff", borderRadius: 20, padding: 40, border: `1px solid ${C.border}`, boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: C.text, marginBottom: 6 }}>
          {step === "email" ? "Forgot password?" : "Reset password"}
        </div>
        <div style={{ color: C.muted, fontSize: 13, marginBottom: 24 }}>
          {step === "email" ? "Enter your IITR email to receive a recovery code." : "Enter the OTP received and choose a new password."}
        </div>

        {step === "email" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
            <Input label="IITR Email" placeholder="yourname@iitr.ac.in" value={email} onChange={setEmail} />
            <Btn onClick={handleSendOtp} fullWidth disabled={loading}>
              {loading ? "Sending..." : "Send Reset Code"}
            </Btn>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
            <Input label="6-Digit OTP" placeholder="123456" value={otp} onChange={setOtp} />
            <Input label="New Password" type="password" placeholder="Enter new password" value={newPw} onChange={setNewPw} />
            <Btn onClick={handleReset} fullWidth disabled={loading}>
              {loading ? "Resetting..." : "Save New Password"}
            </Btn>
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: 12 }}>
          <button onClick={onBack} style={{ background: "none", border: "none", color: C.blue, fontSize: 13, cursor: "pointer" }}>
            ← Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Home Dashboard ────────────────────────────────────────────────────────────
function HomePage({ setPage, resources, onPin, onToast, courses, user, setSelectedCourse }: {
  setPage: (p: Page) => void;
  resources: Resource[];
  onPin: (id: number) => void;
  onToast: (msg: string, type?: "success" | "error") => void;
  courses: Course[];
  user: any;
  setSelectedCourse: (c: Course) => void;
}) {
  const [search, setSearch] = useState("");
  const recent = courses.slice(0, 3);

  const filteredResources = search
    ? resources.filter((r) => r.title.toLowerCase().includes(search.toLowerCase()) || r.course.toLowerCase().includes(search.toLowerCase()))
    : resources;

  return (
    <div style={{ padding: "32px 36px", maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: C.text, marginBottom: 4, letterSpacing: "-0.5px" }}>
          Hey {user?.name ? user.name.split(" ")[0] : "Student"} 👋
        </h1>
        <p style={{ color: C.muted, fontSize: 15 }}>Ready to find something useful?</p>
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 36 }}>
        <div style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: C.muted }}>
          <Icon.Search />
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search courses, notes, PYQs, assignments..."
          style={{
            width: "100%", padding: "14px 14px 14px 48px", border: `1.5px solid ${C.border}`, borderRadius: 12, fontSize: 15, color: C.text, background: "#fff", outline: "none", boxSizing: "border-box", fontFamily: "Inter, sans-serif", boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}
        />
      </div>

      {/* Recently Accessed Courses */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: C.text }}>Featured Courses</h2>
          <button onClick={() => setPage("courses")} style={{ background: "none", border: "none", color: C.blue, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
            View all <Icon.ChevronRight />
          </button>
        </div>
        {recent.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: C.muted, fontSize: 14 }}>
            No courses added yet. <button onClick={() => setPage("courses")} style={{ background: "none", border: "none", color: C.blue, fontWeight: 600, cursor: "pointer" }}>Add your first course →</button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
            {recent.map((c) => (
              <Card key={c.id} style={{ cursor: "pointer" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <span style={{ background: "#EFF6FF", color: C.blue, fontSize: 12, fontWeight: 700, padding: "3px 8px", borderRadius: 6 }}>{c.code}</span>
                  <span style={{ fontSize: 12, color: C.muted }}>{c.dept.split(" ")[0]}</span>
                </div>
                <div style={{ fontWeight: 700, fontSize: 15, color: C.text, marginBottom: 14 }}>{c.name}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.muted }}>{c.resources} Resources</span>
                  <button
                    onClick={() => { setSelectedCourse(c); setPage("course-detail"); }}
                    style={{ background: C.blue, color: "#fff", border: "none", borderRadius: 7, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                  >
                    View
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Recently Added */}
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 16 }}>
          {search ? `Search Results (${filteredResources.length})` : "Recently Added"}
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filteredResources.slice(0, 5).map((r) => (
            <ResourceCard key={r.id} r={r} onPin={onPin} onToast={onToast} />
          ))}
          {filteredResources.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 0", color: C.muted }}>No resources match your search.</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Courses Page ──────────────────────────────────────────────────────────────
function CoursesPage({ setPage, courses, onAdd, onRemove, setSelectedCourse }: {
  setPage: (p: Page) => void;
  courses: Course[];
  onAdd: (code: string, name: string, dept: string) => void;
  onRemove: (id: number) => void;
  setSelectedCourse: (c: Course) => void;
}) {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: "", name: "", dept: "" });

  const filtered = courses.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    if (!form.code.trim() || !form.name.trim()) return;
    onAdd(form.code.trim(), form.name.trim(), form.dept.trim() || "Engineering");
    setForm({ code: "", name: "", dept: "" });
    setShowForm(false);
  };

  return (
    <div style={{ padding: "32px 36px", maxWidth: 1100 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: C.text, letterSpacing: "-0.5px" }}>My Courses</h1>
          <p style={{ color: C.muted, fontSize: 14, marginTop: 4, marginBottom: 0 }}>Your academic courses and resources.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{ display: "flex", alignItems: "center", gap: 7, background: C.blue, color: "#fff", border: "none", borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 600, cursor: "pointer", marginTop: 4 }}
        >
          <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Add Course
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <Card style={{ marginTop: 20, marginBottom: 8 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 16 }}>Add New Course</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, display: "block", marginBottom: 5 }}>Course Code *</label>
              <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="e.g. CSN-201" style={{ width: "100%", padding: "9px 12px", border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 14, color: C.text, outline: "none", boxSizing: "border-box", fontFamily: "Inter, sans-serif" }} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, display: "block", marginBottom: 5 }}>Department</label>
              <input value={form.dept} onChange={(e) => setForm({ ...form, dept: e.target.value })} placeholder="e.g. Computer Science" style={{ width: "100%", padding: "9px 12px", border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 14, color: C.text, outline: "none", boxSizing: "border-box", fontFamily: "Inter, sans-serif" }} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, display: "block", marginBottom: 5 }}>Course Name *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Data Structures and Algorithms" style={{ width: "100%", padding: "9px 12px", border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 14, color: C.text, outline: "none", boxSizing: "border-box", fontFamily: "Inter, sans-serif" }} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={handleAdd} style={{ background: C.blue, color: "#fff", border: "none", borderRadius: 8, padding: "9px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Add Course</button>
            <button onClick={() => setShowForm(false)} style={{ background: "transparent", color: C.muted, border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
          </div>
        </Card>
      )}

      {/* Search */}
      <div style={{ position: "relative", margin: "20px 0 24px" }}>
        <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.muted }}>
          <Icon.Search />
        </div>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search my courses..." style={{ width: "100%", padding: "10px 12px 10px 40px", border: `1.5px solid ${C.border}`, borderRadius: 10, fontSize: 14, color: C.text, background: "#fff", outline: "none", boxSizing: "border-box", fontFamily: "Inter, sans-serif" }} />
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📚</div>
          <div style={{ fontWeight: 700, fontSize: 16, color: C.text, marginBottom: 6 }}>No courses found</div>
          <div style={{ color: C.muted, fontSize: 14 }}>Click "Add Course" to add your first course.</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {filtered.map((c) => (
            <Card key={c.id}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ background: "#EFF6FF", color: C.blue, fontSize: 12, fontWeight: 700, padding: "3px 8px", borderRadius: 6 }}>{c.code}</span>
              </div>
              <div style={{ fontWeight: 700, fontSize: 15, color: C.text, marginBottom: 4 }}>{c.name}</div>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>{c.dept}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.muted }}>{c.resources} Resources</span>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => { setSelectedCourse(c); setPage("course-detail"); }} style={{ background: C.blue, color: "#fff", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>View</button>
                  <button onClick={() => onRemove(c.id)} style={{ background: "#FEF2F2", color: "#ef4444", border: "1px solid #FECACA", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Remove</button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Course Detail Page ────────────────────────────────────────────────────────
function CourseDetailPage({ setPage, resources, onPin, onToast, course }: {
  setPage: (p: Page) => void;
  resources: Resource[];
  onPin: (id: number) => void;
  onToast: (msg: string, type?: "success" | "error") => void;
  course: Course | null;
}) {
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const tabs = [
    { label: "Notes", emoji: "📚", desc: "Lecture notes, study material and summaries." },
    { label: "PYQ", emoji: "📝", desc: "Previous year question papers." },
    { label: "Assignments", emoji: "📄", desc: "Assignments and problem sets." },
    { label: "Labs", emoji: "🧪", desc: "Lab sheets, files and useful lab resources." },
  ];

  const courseCode = course ? course.code : "CSN-201";
  const courseResources = resources.filter((r) => r.course.toUpperCase() === courseCode.toUpperCase());
  const filtered = activeTab ? courseResources.filter((r) => r.type.toLowerCase() === activeTab.toLowerCase()) : [];

  return (
    <div style={{ padding: "32px 36px", maxWidth: 1000 }}>
      <button onClick={() => setPage("courses")} style={{ background: "none", border: "none", color: C.blue, fontSize: 13, fontWeight: 600, cursor: "pointer", marginBottom: 20, display: "flex", alignItems: "center", gap: 4 }}>
        ← Back to Courses
      </button>

      <Card style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <span style={{ background: "#EFF6FF", color: C.blue, fontSize: 13, fontWeight: 700, padding: "4px 10px", borderRadius: 6, display: "inline-block", marginBottom: 10 }}>
              {course?.code || "CSN-201"}
            </span>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: C.text, marginBottom: 6, letterSpacing: "-0.3px" }}>
              {course?.name || "Data Structures and Algorithms"}
            </h1>
            <p style={{ color: C.muted, fontSize: 14, marginBottom: 12 }}>
              {course?.dept || "Computer Science"} · IIT Roorkee
            </p>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: C.blue }}>{courseResources.length}</div>
            <div style={{ fontSize: 12, color: C.muted }}>Resources</div>
          </div>
        </div>
      </Card>

      {!activeTab ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
          {tabs.map((t) => (
            <button
              key={t.label}
              onClick={() => setActiveTab(t.label)}
              style={{
                background: "#fff", border: `1.5px solid ${C.border}`, borderRadius: 14, padding: "24px 20px", cursor: "pointer", textAlign: "left", transition: "all 0.15s",
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 10 }}>{t.emoji}</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: C.text, marginBottom: 4 }}>{t.label}</div>
              <div style={{ fontSize: 13, color: C.muted }}>{t.desc}</div>
            </button>
          ))}
        </div>
      ) : (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <button onClick={() => setActiveTab(null)} style={{ background: "none", border: "none", color: C.blue, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              ← Back to Categories
            </button>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text }}>{activeTab}</h2>
          </div>
          {filtered.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filtered.map((r) => (
                <ResourceCard key={r.id} r={r} onPin={onPin} onToast={onToast} />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📂</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: C.text, marginBottom: 6 }}>Nothing here yet</div>
              <div style={{ color: C.muted, fontSize: 14 }}>Be the first to share a resource with your classmates!</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Upload Page ───────────────────────────────────────────────────────────────
function UploadPage({ onToast, courses, onUploaded }: {
  onToast: (msg: string, type?: "success" | "error") => void;
  courses: Course[];
  onUploaded: () => void;
}) {
  const [dragging, setDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [course, setCourse] = useState("");
  const [resType, setResType] = useState("Notes");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleSubmit = async () => {
    if (!title || !course || !resType) {
      onToast("Please provide title, course, and type", "error");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("course", course);
      formData.append("type", resType);
      if (desc) formData.append("description", desc);
      if (selectedFile) formData.append("file", selectedFile);

      await api.resources.upload(formData);
      setSuccess(true);
      onToast("Resource uploaded successfully! 🎉");
      setTitle("");
      setDesc("");
      setSelectedFile(null);
      onUploaded();
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) {
      onToast(err.message || "Failed to upload resource", "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ padding: "32px 36px", maxWidth: 680 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: C.text, marginBottom: 4, letterSpacing: "-0.5px" }}>Share a Resource</h1>
      <p style={{ color: C.muted, fontSize: 14, marginBottom: 32 }}>Help your fellow IITR students learn better.</p>

      {success && (
        <Card style={{ background: "#F0FDF4", border: "1.5px solid #BBF7D0", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#15803D", fontWeight: 600 }}>
            <Icon.Check /> Resource uploaded successfully! 🎉
          </div>
        </Card>
      )}

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${dragging ? C.blue : C.border}`,
          borderRadius: 14,
          padding: "40px 24px",
          textAlign: "center",
          marginBottom: 24,
          background: dragging ? "#EFF6FF" : "#FAFBFC",
          transition: "all 0.15s",
          cursor: "pointer",
        }}
      >
        <div style={{ fontSize: 36, marginBottom: 12 }}>☁️</div>
        {selectedFile ? (
          <div>
            <div style={{ fontWeight: 600, color: C.text }}>{selectedFile.name}</div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </div>
          </div>
        ) : (
          <>
            <div style={{ fontWeight: 600, color: C.text, marginBottom: 6 }}>Drag & drop your file here</div>
            <div style={{ color: C.muted, fontSize: 13, marginBottom: 14 }}>PDF, DOCX, Images up to 50MB</div>
            <label style={{ background: C.blue, color: "#fff", padding: "9px 20px", borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              Browse Files
              <input
                type="file"
                style={{ display: "none" }}
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    const f = e.target.files[0];
                    setSelectedFile(f);
                    if (!title) setTitle(f.name.replace(/\.[^/.]+$/, ""));
                  }
                }}
              />
            </label>
          </>
        )}
      </div>

      {/* Fields */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: C.text, display: "block", marginBottom: 6 }}>Course *</label>
          <select
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            style={{ width: "100%", padding: "11px 14px", border: `1.5px solid ${C.border}`, borderRadius: 10, fontSize: 14, color: C.text, background: "#fff", fontFamily: "Inter, sans-serif" }}
          >
            <option value="">Select a course</option>
            {courses.map((c) => <option key={c.id} value={c.code}>{c.code} — {c.name}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: C.text, display: "block", marginBottom: 6 }}>Resource Type *</label>
          <select
            value={resType}
            onChange={(e) => setResType(e.target.value)}
            style={{ width: "100%", padding: "11px 14px", border: `1.5px solid ${C.border}`, borderRadius: 10, fontSize: 14, color: C.text, background: "#fff", fontFamily: "Inter, sans-serif" }}
          >
            {["Notes", "PYQ", "Assignments", "Labs", "Other"].map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: C.text, display: "block", marginBottom: 6 }}>Resource Title *</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. DSA Mid-Sem Notes 2024"
            style={{ width: "100%", padding: "11px 14px", border: `1.5px solid ${C.border}`, borderRadius: 10, fontSize: 14, color: C.text, background: "#fff", outline: "none", boxSizing: "border-box", fontFamily: "Inter, sans-serif" }}
          />
        </div>
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: C.text, display: "block", marginBottom: 6 }}>
            Description <span style={{ color: C.muted, fontWeight: 400 }}>(optional)</span>
          </label>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Brief description of this resource..."
            rows={3}
            style={{ width: "100%", padding: "11px 14px", border: `1.5px solid ${C.border}`, borderRadius: 10, fontSize: 14, color: C.text, background: "#fff", outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "Inter, sans-serif" }}
          />
        </div>
      </div>

      <Btn onClick={handleSubmit} fullWidth disabled={uploading}>
        {uploading ? "Uploading Resource..." : "Upload Resource"}
      </Btn>
    </div>
  );
}

// ── My Pins Page ──────────────────────────────────────────────────────────────
function PinsPage({ resources, onPin, onToast, setPage }: {
  resources: Resource[];
  onPin: (id: number) => void;
  onToast: (msg: string, type?: "success" | "error") => void;
  setPage: (p: Page) => void;
}) {
  const pinned = resources.filter((r) => r.pinned);
  const [search, setSearch] = useState("");
  const filtered = pinned.filter((r) => r.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ padding: "32px 36px", maxWidth: 900 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: C.text, marginBottom: 4, letterSpacing: "-0.5px" }}>Your Stack</h1>
      <p style={{ color: C.muted, fontSize: 14, marginBottom: 28 }}>Resources you've saved for later.</p>

      {pinned.length > 0 && (
        <div style={{ position: "relative", marginBottom: 24 }}>
          <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.muted }}>
            <Icon.Search />
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search pinned resources..."
            style={{ width: "100%", padding: "10px 12px 10px 40px", border: `1.5px solid ${C.border}`, borderRadius: 10, fontSize: 14, color: C.text, background: "#fff", outline: "none", boxSizing: "border-box", fontFamily: "Inter, sans-serif" }}
          />
        </div>
      )}

      {pinned.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 0" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📌</div>
          <div style={{ fontWeight: 700, fontSize: 18, color: C.text, marginBottom: 8 }}>Your stack is empty.</div>
          <div style={{ color: C.muted, fontSize: 14, marginBottom: 24 }}>Pin useful resources and they'll appear here.</div>
          <Btn onClick={() => setPage("courses")}>Explore Courses</Btn>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((r) => (
            <ResourceCard key={r.id} r={r} onPin={onPin} onToast={onToast} />
          ))}
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 0", color: C.muted }}>No pinned resources match your search.</div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Profile Page ──────────────────────────────────────────────────────────────
function ProfilePage({
  resources,
  user,
  onLogout,
  onToast,
  onUserUpdated,
}: {
  resources: Resource[];
  user: any;
  onLogout: () => void;
  onToast: (msg: string, type?: "success" | "error") => void;
  onUserUpdated: (u: any) => void;
}) {
  const [tab, setTab] = useState<"uploads" | "pins" | "settings">("uploads");
  const [profileData, setProfileData] = useState<any>(null);
  const [editName, setEditName] = useState("");
  const [editBranch, setEditBranch] = useState("Computer Science & Engineering");
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const pinned = resources.filter((r) => r.pinned);

  useEffect(() => {
    api.profile
      .get()
      .then((data) => {
        setProfileData(data);
        setEditName(data.name || user?.name || "");
        setEditBranch(data.department || user?.department || "Computer Science & Engineering");
      })
      .catch(() => {
        setEditName(user?.name || "");
        setEditBranch(user?.department || "Computer Science & Engineering");
      });
  }, [user]);

  const displayName = profileData?.name || user?.name || "IITR Student";
  const displayEmail = profileData?.email || user?.email || "student@iitr.ac.in";
  const displayDept = profileData?.department || user?.department || "Computer Science & Engineering";
  const displayYear = profileData?.year || "2nd Year";

  const userUploads = profileData?.uploads || resources.filter((r) => r.by === displayName);

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      onToast("Student name cannot be empty", "error");
      return;
    }
    setSaving(true);
    try {
      const updated = await api.profile.update({
        name: editName.trim(),
        department: editBranch,
      });
      setProfileData((prev: any) => ({
        ...prev,
        ...updated,
      }));
      onUserUpdated(updated);
      onToast("Profile updated successfully!", "success");
    } catch (err: any) {
      onToast(err.message || "Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await api.profile.deleteAccount();
      onToast("Account deleted successfully", "success");
      onLogout();
    } catch (err: any) {
      onToast(err.message || "Failed to delete account", "error");
      setDeleting(false);
    }
  };

  return (
    <div style={{ padding: "32px 36px", maxWidth: 800 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: C.text, marginBottom: 24, letterSpacing: "-0.5px" }}>My Profile</h1>

      {/* Profile card */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: `linear-gradient(135deg, ${C.blue}, ${C.cyan})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 18, color: C.text }}>{displayName}</div>
            <div style={{ color: C.muted, fontSize: 14 }}>{displayEmail}</div>
            <div style={{ color: C.muted, fontSize: 13, marginTop: 2 }}>{displayDept} · {displayYear}</div>
          </div>
          <div style={{ display: "flex", gap: 24 }}>
            {[
              { label: "Uploads", val: profileData?.uploadsCount ?? userUploads.length },
              { label: "Pinned", val: profileData?.pinsCount ?? pinned.length },
              { label: "Community", val: "IITR" },
            ].map(({ label, val }) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: C.blue }}>{val}</div>
                <div style={{ fontSize: 12, color: C.muted }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 2, background: C.bg, borderRadius: 10, padding: 4, marginBottom: 20, border: `1px solid ${C.border}` }}>
        {(["uploads", "pins", "settings"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1, padding: "8px 0", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, transition: "all 0.15s",
              background: tab === t ? "#fff" : "transparent",
              color: tab === t ? C.text : C.muted,
              boxShadow: tab === t ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
            }}
          >
            {t === "uploads" ? "My Uploads" : t === "pins" ? "My Pins" : "Account Settings"}
          </button>
        ))}
      </div>

      {tab === "uploads" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {userUploads.length > 0 ? (
            userUploads.map((r: any) => (
              <Card key={r.id} style={{ padding: "14px 18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: C.text }}>{r.title}</div>
                    <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>{r.course} · {r.type} · {r.date}</div>
                  </div>
                  <TypeBadge type={r.type} />
                </div>
              </Card>
            ))
          ) : (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>📤</div>
              <div style={{ fontWeight: 700, color: C.text, marginBottom: 6 }}>You haven't uploaded anything yet.</div>
            </div>
          )}
        </div>
      )}

      {tab === "pins" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {pinned.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: C.muted }}>No pinned resources yet.</div>
          ) : pinned.map((r) => (
            <Card key={r.id} style={{ padding: "14px 18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: C.text }}>{r.title}</div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>{r.course} · {r.type} · {r.date}</div>
                </div>
                <TypeBadge type={r.type} />
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === "settings" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Edit Profile Form */}
          <Card>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 4 }}>Profile Details</div>
            <div style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>Update your student name and department branch</div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: C.text, display: "block", marginBottom: 6 }}>
                  Student Name *
                </label>
                <input
                  type="text"
                  placeholder="Enter your student name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    border: `1.5px solid ${C.border}`,
                    borderRadius: 10,
                    fontSize: 14,
                    color: C.text,
                    background: "#fff",
                    outline: "none",
                    boxSizing: "border-box",
                    fontFamily: "Inter, sans-serif",
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: C.text, display: "block", marginBottom: 6 }}>
                  Branch / Department *
                </label>
                <select
                  value={editBranch}
                  onChange={(e) => setEditBranch(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    border: `1.5px solid ${C.border}`,
                    borderRadius: 10,
                    fontSize: 14,
                    color: C.text,
                    background: "#fff",
                    outline: "none",
                    boxSizing: "border-box",
                    fontFamily: "Inter, sans-serif",
                    cursor: "pointer",
                  }}
                >
                  {IITR_BRANCHES.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: C.text, display: "block", marginBottom: 6 }}>
                  IITR Email Address
                </label>
                <input
                  type="text"
                  value={displayEmail}
                  disabled
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    border: `1.5px solid ${C.border}`,
                    borderRadius: 10,
                    fontSize: 14,
                    color: C.muted,
                    background: "#F8FAFC",
                    outline: "none",
                    boxSizing: "border-box",
                    cursor: "not-allowed",
                    fontFamily: "Inter, sans-serif",
                  }}
                />
                <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>
                  Email address is verified and tied to your IITR account.
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                <Btn onClick={handleSaveProfile} disabled={saving}>
                  {saving ? "Saving Changes..." : "Save Changes"}
                </Btn>
              </div>
            </div>
          </Card>

          {/* Session Card */}
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 600, color: C.text, fontSize: 14 }}>Session Management</div>
                <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>Log out from this device</div>
              </div>
              <button
                onClick={onLogout}
                style={{
                  color: C.text,
                  background: "#fff",
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                  padding: "8px 16px",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                Logout
              </button>
            </div>
          </Card>

          {/* Danger Zone: Delete Account */}
          <div
            style={{
              background: "#FFF5F5",
              border: "1.5px solid #FCA5A5",
              borderRadius: 14,
              padding: "20px 24px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
              <div>
                <div style={{ fontWeight: 700, color: "#DC2626", fontSize: 15, marginBottom: 4 }}>
                  Delete Account
                </div>
                <div style={{ fontSize: 13, color: "#7F1D1D", lineHeight: 1.5, maxWidth: 520 }}>
                  Permanently delete your StudyStack account, bookmarks, and all personal data. This action is irreversible.
                </div>
              </div>
              {!showDeleteConfirm && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  style={{
                    color: "#DC2626",
                    background: "#fff",
                    border: "1.5px solid #DC2626",
                    borderRadius: 8,
                    padding: "9px 18px",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transition: "all 0.15s",
                  }}
                >
                  Delete Account
                </button>
              )}
            </div>

            {showDeleteConfirm && (
              <div
                style={{
                  marginTop: 18,
                  paddingTop: 16,
                  borderTop: "1px dashed #FCA5A5",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 600, color: "#991B1B" }}>
                  ⚠️ Are you sure you want to delete your account? This cannot be undone.
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                    style={{
                      background: "#DC2626",
                      color: "#fff",
                      border: "none",
                      borderRadius: 8,
                      padding: "9px 20px",
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: deleting ? "not-allowed" : "pointer",
                      opacity: deleting ? 0.7 : 1,
                    }}
                  >
                    {deleting ? "Deleting Account..." : "Yes, Delete Account"}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={deleting}
                    style={{
                      background: "#fff",
                      color: C.text,
                      border: `1px solid ${C.border}`,
                      borderRadius: 8,
                      padding: "9px 18px",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── App Root ──────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState<Page>("login");
  const [resources, setResources] = useState<Resource[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [emailForOtp, setEmailForOtp] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { toast, show } = useToast();

  // Load data from backend
  const loadData = async () => {
    try {
      const [fetchedCourses, fetchedResources] = await Promise.all([
        api.courses.getAll().catch(() => []),
        api.resources.getAll().catch(() => []),
      ]);
      if (fetchedCourses) setCourses(fetchedCourses);
      if (fetchedResources) setResources(fetchedResources);
    } catch {
      // Fallback if offline
    }
  };

  useEffect(() => {
    const user = api.auth.getUser();
    const token = api.auth.getToken();
    if (user && token) {
      setCurrentUser(user);
      setPage("home");
    }
    loadData();
  }, []);

  const handleLogout = () => {
    api.auth.clearAuth();
    setCurrentUser(null);
    setPage("login");
    show("Logged out successfully");
  };

  const togglePin = async (id: number) => {
    try {
      const res = await api.resources.togglePin(id);
      setResources((prev) => prev.map((r) => (r.id === id ? { ...r, pinned: res.pinned } : r)));
      show(res.message || (res.pinned ? "Resource pinned!" : "Resource unpinned"));
    } catch {
      // Optimistic toggle if unauthenticated
      setResources((prev) => prev.map((r) => (r.id === id ? { ...r, pinned: !r.pinned } : r)));
    }
  };

  const addCourse = async (code: string, name: string, dept: string) => {
    try {
      const newCourse = await api.courses.create(code, name, dept);
      setCourses((prev) => [newCourse, ...prev]);
      show("Course added successfully!");
    } catch (err: any) {
      show(err.message || "Failed to add course", "error");
    }
  };

  const removeCourse = async (id: number) => {
    try {
      await api.courses.delete(id);
      setCourses((prev) => prev.filter((c) => c.id !== id));
      show("Course removed.");
    } catch (err: any) {
      show(err.message || "Failed to remove course", "error");
    }
  };

  if (page === "login") return (
    <>
      <LoginPage
        onLogin={() => {
          const user = api.auth.getUser();
          setCurrentUser(user);
          loadData();
          setPage("home");
        }}
        onSignup={() => setPage("signup")}
        onForgot={() => setPage("forgot")}
        onToast={show}
        setEmailForOtp={(em) => {
          setEmailForOtp(em);
          setPage("otp");
        }}
      />
      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </>
  );

  if (page === "signup") return (
    <>
      <SignupPage
        onNext={() => setPage("otp")}
        onBack={() => setPage("login")}
        onToast={show}
        setEmailForOtp={setEmailForOtp}
      />
      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </>
  );

  if (page === "otp") return (
    <>
      <OtpPage
        onVerify={() => {
          const user = api.auth.getUser();
          setCurrentUser(user);
          loadData();
          setPage("home");
        }}
        email={emailForOtp}
        onToast={show}
      />
      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </>
  );

  if (page === "forgot") return (
    <>
      <ForgotPasswordPage
        onDone={() => setPage("login")}
        onBack={() => setPage("login")}
        onToast={show}
      />
      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </>
  );

  return (
    <div style={{ display: "flex", height: "100%", background: C.bg, fontFamily: "Inter, sans-serif" }}>
      <Sidebar page={page} setPage={setPage} onLogout={handleLogout} />
      <main style={{ flex: 1, overflow: "auto", height: "100%" }}>
        {page === "home" && (
          <HomePage
            setPage={setPage}
            resources={resources}
            onPin={togglePin}
            onToast={show}
            courses={courses}
            user={currentUser}
            setSelectedCourse={setSelectedCourse}
          />
        )}
        {page === "courses" && (
          <CoursesPage
            setPage={setPage}
            courses={courses}
            onAdd={addCourse}
            onRemove={removeCourse}
            setSelectedCourse={setSelectedCourse}
          />
        )}
        {page === "course-detail" && (
          <CourseDetailPage
            setPage={setPage}
            resources={resources}
            onPin={togglePin}
            onToast={show}
            course={selectedCourse}
          />
        )}
        {page === "upload" && (
          <UploadPage
            onToast={show}
            courses={courses}
            onUploaded={loadData}
          />
        )}
        {page === "pins" && (
          <PinsPage
            resources={resources}
            onPin={togglePin}
            onToast={show}
            setPage={setPage}
          />
        )}
        {page === "profile" && (
          <ProfilePage
            resources={resources}
            user={currentUser}
            onLogout={handleLogout}
            onToast={show}
            onUserUpdated={(u) => {
              setCurrentUser(u);
              api.auth.setUser(u);
            }}
          />
        )}
      </main>
      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  );
}
