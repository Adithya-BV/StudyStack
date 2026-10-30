import React, { useState, useRef, useEffect } from "react"

import logoImg from "@/imports/ChatGPT_Image_Sep_8__2026__10_02_08_PM.png"

import sidebarIcon from "@/imports/ChatGPT_Image_Sep_8__2026__10_12_04_PM.png"

import { api } from "./services/api"

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
}

// ── Types ────────────────────────────────────────────────────────────────────

type Course = {
  id: number

  code: string

  name: string

  dept: string

  resources: number
}

type Resource = {
  id: number

  title: string

  course: string

  type: string

  by: string

  date: string

  size: string

  pinned?: boolean

  uploader_email?: string

  downloads?: number

  is_anonymous?: boolean
}

type Page = "login" | "signup" | "otp" | "forgot" | "home" | "courses" | "course-detail" | "upload" | "pins" | "profile"

// Helper to validate any IITR email domain (e.g. @iitr.ac.in, @ece.iitr.ac.in, @cse.iitr.ac.in)

const isValidIITREmail = (email: string) =>
  /^[^\s@]+@([a-zA-Z0-9-]+\.)*iitr\.ac\.in$/.test(email.trim().toLowerCase())

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
]

// ── Icons ────────────────────────────────────────────────────────────────────

const Icon = {
  Flag: () => (
    <svg
      width="14"
      height="14"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
      />
    </svg>
  ),

  CheckCircle: () => (
    <svg
      width="14"
      height="14"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),

  Trash2: () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
      <line x1="10" y1="11" x2="10" y2="17"></line>
      <line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
  ),

  Home: () => (
    <svg
      width="18"
      height="18"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      />
    </svg>
  ),

  Book: () => (
    <svg
      width="18"
      height="18"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
      />
    </svg>
  ),

  Bookmark: () => (
    <svg
      width="18"
      height="18"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
      />
    </svg>
  ),

  Upload: () => (
    <svg
      width="18"
      height="18"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
      />
    </svg>
  ),

  User: () => (
    <svg
      width="18"
      height="18"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  ),

  Logout: () => (
    <svg
      width="18"
      height="18"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
      />
    </svg>
  ),

  Search: () => (
    <svg
      width="18"
      height="18"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  ),

  Download: () => (
    <svg
      width="16"
      height="16"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
      />
    </svg>
  ),

  Pin: ({ filled }: { filled?: boolean }) => (
    <svg
      width="16"
      height="16"
      fill={filled ? C.blue : "none"}
      viewBox="0 0 24 24"
      stroke={filled ? C.blue : "currentColor"}
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
      />
    </svg>
  ),

  File: () => (
    <svg
      width="16"
      height="16"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  ),

  ChevronRight: () => (
    <svg
      width="16"
      height="16"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  ),

  Eye: () => (
    <svg
      width="16"
      height="16"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  ),

  EyeOff: () => (
    <svg
      width="16"
      height="16"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
      />
    </svg>
  ),

  Check: () => (
    <svg
      width="20"
      height="20"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
}

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
  )
}

function useToast() {
  const [toast, setToast] = useState<{
    msg: string

    type: "success" | "error"
  } | null>(null)

  const show = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type })

    setTimeout(() => setToast(null), 3500)
  }

  return { toast, show }
}

// ── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({
  page,

  setPage,

  onLogout,

  pendingFeedbackCount = 0,
}: {
  page: Page

  setPage: (p: Page) => void

  onLogout: () => void

  onDeleteResource?: (id: number) => Promise<boolean> | void

  pendingFeedbackCount?: number
}) {
  const navItems: { label: string; icon: keyof typeof Icon; target: Page }[] = [
    { label: "Home", icon: "Home", target: "home" },

    { label: "My Courses", icon: "Book", target: "courses" },

    { label: "My Pins", icon: "Bookmark", target: "pins" },

    { label: "Upload", icon: "Upload", target: "upload" },

    { label: "Profile", icon: "User", target: "profile" },
  ]

  return (
    <aside
      className="desktop-sidebar"
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
      <div
        style={{
          padding: "24px 20px 20px",

          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img
            src={sidebarIcon}
            alt="StudyStack logo"
            style={{
              width: 40,

              height: 40,

              borderRadius: 8,

              objectFit: "cover",

              mixBlendMode: "lighten",
            }}
          />
          <div>
            <div
              style={{
                color: "#fff",

                fontWeight: 700,

                fontSize: 18,

                letterSpacing: "-0.3px",
              }}
            >
              StudyStack
            </div>
            <div
              style={{
                color: C.cyan,

                fontSize: 11,

                fontWeight: 500,

                letterSpacing: "0.2px",
              }}
            >
              Your Stack. Your Track.
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav
        style={{
          padding: "16px 12px",

          flex: 1,

          display: "flex",

          flexDirection: "column",

          gap: 2,
        }}
      >
        {navItems.map(({ label, icon, target }) => {
          const active =
            page === target ||
            (page === "course-detail" && target === previousCoursePage)

          const IconComp = Icon[icon] as () => React.ReactElement

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

                borderLeft: active
                  ? `3px solid ${C.cyan}`
                  : "3px solid transparent",
              }}
            >
              <IconComp />
              <span style={{ flex: 1 }}>{label}</span>
              {target === "profile" && pendingFeedbackCount > 0 && (
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    background: "#EF4444",
                    color: "#fff",
                    borderRadius: 10,
                    padding: "1px 6px",
                    lineHeight: "14px",
                  }}
                >
                  {pendingFeedbackCount}
                </span>
              )}
            </button>
          )
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
  )
}

// ── Input ────────────────────────────────────────────────────────────────────

function Input({
  label,

  type = "text",

  placeholder,

  value,

  onChange,
}: {
  label: string

  type?: string

  placeholder?: string

  value: string

  onChange: (v: string) => void
}) {
  const [show, setShow] = useState(false)

  const isPassword = type === "password"

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: C.text }}>
        {label}
      </label>
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
            style={{
              position: "absolute",

              right: 12,

              top: "50%",

              transform: "translateY(-50%)",

              background: "none",

              border: "none",

              cursor: "pointer",

              color: C.muted,

              padding: 0,
            }}
          >
            {show ? <Icon.EyeOff /> : <Icon.Eye />}
          </button>
        )}
      </div>
    </div>
  )
}

// ── Btn ──────────────────────────────────────────────────────────────────────

function Btn({
  children,

  onClick,

  variant = "primary",

  fullWidth,

  disabled,
}: {
  children: React.ReactNode

  onClick?: () => void

  variant?: "primary" | "secondary" | "ghost"

  fullWidth?: boolean

  disabled?: boolean
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

        ...(variant === "primary" && {
          background: C.blue,

          color: "#fff",

          border: "none",
        }),

        ...(variant === "secondary" && {
          background: "#fff",

          color: C.blue,

          border: `1.5px solid ${C.blue}`,
        }),

        ...(variant === "ghost" && {
          background: "transparent",

          color: C.muted,

          border: "none",
        }),
      }}
    >
      {children}
    </button>
  )
}

// ── Card ─────────────────────────────────────────────────────────────────────

function Card({
  children,

  style,

  className,
}: {
  children: React.ReactNode

  style?: React.CSSProperties

  className?: string
}) {
  return (
    <div
      className={className}
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
  )
}

// ── Badge ─────────────────────────────────────────────────────────────────────

const typeColors: Record<string, { bg: string; text: string }> = {
  Notes: { bg: "#EFF6FF", text: "#1D4ED8" },

  PYQ: { bg: "#FFF7ED", text: "#C2410C" },

  Assignments: { bg: "#F0FDF4", text: "#15803D" },

  Labs: { bg: "#FDF4FF", text: "#7E22CE" },

  Other: { bg: "#F8FAFC", text: "#475569" },
}

function TypeBadge({ type }: { type: string }) {
  const colors = typeColors[type] || typeColors.Other

  return (
    <span
      style={{
        background: colors.bg,

        color: colors.text,

        fontSize: 11,

        fontWeight: 600,

        padding: "3px 8px",

        borderRadius: 6,
      }}
    >
      {type}
    </span>
  )
}

// ── Report Modal ──

function ReportModal({
  resource,
  onClose,
  onToast,
  onSuccess,
}: {
  resource: Resource | null
  onClose: () => void
  onToast: (msg: string, type?: "success" | "error") => void
  onSuccess?: () => void
}) {
  const [reason, setReason] = useState("Missing or blurry pages")
  const [details, setDetails] = useState("")
  const [submitting, setSubmitting] = useState(false)

  if (!resource) return null

  const reasons = [
    "Missing or blurry pages",
    "Wrong course or title",
    "Incorrect solutions / formulas",
    "Duplicate or outdated resource",
    "Other discrepancy",
  ]

  const handleSubmit = async () => {
    if (!reason) {
      onToast("Please select a reason", "error")
      return
    }
    setSubmitting(true)
    try {
      await api.resources.report(resource.id, reason, details)
      onToast(
        "Feedback sent to the uploader! Thank you for helping keep StudyStack accurate.",
        "success",
      )
      onClose()
      onSuccess?.()
    } catch (err: any) {
      onToast(err.message || "Failed to submit feedback", "error")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.45)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: 20,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: 28,
          maxWidth: 480,
          width: "100%",
          boxShadow:
            "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          border: `1px solid ${C.border}`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 12,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: "#FFFBEB",
              color: "#D97706",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Icon.Flag />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.text }}>
              Report an Issue / Discrepancy
            </div>
            <div style={{ fontSize: 13, color: C.muted }}>
              Constructive feedback will be sent directly to the uploader.
            </div>
          </div>
        </div>

        <div
          style={{
            background: "#F8FAFC",
            border: `1px solid ${C.border}`,
            borderRadius: 10,
            padding: "10px 14px",
            fontSize: 13,
            color: C.text,
            margin: "16px 0",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ fontWeight: 600, color: C.blue }}>Resource:</span>
          <span
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {resource.title}
          </span>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: C.text,
              display: "block",
              marginBottom: 8,
            }}
          >
            What issue did you spot? *
          </label>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {reasons.map((r) => (
              <label
                key={r}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  fontSize: 13,
                  color: C.text,
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: `1.5px solid ${reason === r ? C.blue : C.border}`,
                  background: reason === r ? "#EFF6FF" : "#fff",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                <input
                  type="radio"
                  name="reportReason"
                  checked={reason === r}
                  onChange={() => setReason(r)}
                  style={{ accentColor: C.blue }}
                />
                <span style={{ fontWeight: reason === r ? 600 : 400 }}>{r}</span>
              </label>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: C.text,
              display: "block",
              marginBottom: 6,
            }}
          >
            Additional details (optional)
          </label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="e.g. Question 3 formula on page 8 has a typo, or pages 14-16 are cut off..."
            rows={3}
            style={{
              width: "100%",
              padding: "10px 12px",
              border: `1.5px solid ${C.border}`,
              borderRadius: 8,
              fontSize: 13,
              color: C.text,
              fontFamily: "Inter, sans-serif",
              outline: "none",
              boxSizing: "border-box",
              resize: "none",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            disabled={submitting}
            style={{
              padding: "9px 16px",
              borderRadius: 8,
              border: `1px solid ${C.border}`,
              background: "#fff",
              color: C.text,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              padding: "9px 18px",
              borderRadius: 8,
              border: "none",
              background: "#D97706",
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              cursor: submitting ? "not-allowed" : "pointer",
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? "Sending..." : "Send Feedback"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Resource Card ─────────────────────────────────────────────────────────────

function ResourceCard({
  r,

  onPin,

  onToast,

  user,

  onDelete,

  onReport,
}: {
  r: Resource

  onPin: (id: number) => void

  onToast: (msg: string, type?: "success" | "error") => void

  user?: any

  onDelete?: (id: number) => void

  onReport?: (r: Resource) => void
}) {
  const [downloading, setDownloading] = useState(false)
  const [localDownloads, setLocalDownloads] = useState(r.downloads ?? 0)

  useEffect(() => {
    setLocalDownloads(r.downloads ?? 0)
  }, [r.downloads])

  const handleDownload = async () => {
    if (downloading) return
    setDownloading(true)
    onToast(`Downloading ${r.title}...`)
    setLocalDownloads((prev) => prev + 1)
    try {
      await api.resources.download(r.id, r.title)
    } catch (err: any) {
      onToast(err.message || "Failed to download", "error")
    } finally {
      setDownloading(false)
    }
  }

  return (
    <Card
      className="resource-card"
      style={{
        display: "flex",

        alignItems: "flex-start",

        gap: 14,

        padding: "16px 20px",
      }}
    >
      <div
        className="resource-header-info"
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 14,
          flex: 1,
          minWidth: 0,
        }}
      >
        <div
          style={{
            background: "#EFF6FF",

            borderRadius: 10,

            padding: 10,

            flexShrink: 0,
          }}
        >
          <Icon.File />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontWeight: 600,

              fontSize: 14,

              color: C.text,

              marginBottom: 4,

              wordBreak: "break-word",
            }}
          >
            {r.title}
          </div>
          <div
            style={{
              display: "flex",

              gap: 8,

              alignItems: "center",

              flexWrap: "wrap",
            }}
          >
            <TypeBadge type={r.type} />
            <span style={{ fontSize: 12, color: C.muted }}>{r.course}</span>
            {r.by && r.by.trim() !== "" && (
              <>
                <span style={{ fontSize: 12, color: C.muted }}>·</span>
                <span style={{ fontSize: 12, color: C.muted }}>{r.by}</span>
              </>
            )}
            <span style={{ fontSize: 12, color: C.muted }}>·</span>
            <span style={{ fontSize: 12, color: C.muted }}>{r.date}</span>
            <span style={{ fontSize: 12, color: C.muted }}>·</span>
            <span style={{ fontSize: 12, color: C.muted }}>{r.size}</span>
            {localDownloads > 0 && (
              <>
                <span style={{ fontSize: 12, color: C.muted }}>·</span>
                <span style={{ fontSize: 12, color: C.muted }}>
                  📥 {localDownloads} {localDownloads === 1 ? "download" : "downloads"}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="resource-actions" style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        <button
          onClick={() => window.open(api.resources.getViewUrl(r.id), "_blank")}
          style={{
            display: "flex",

            alignItems: "center",

            gap: 5,

            padding: "7px 12px",

            background: "#EFF6FF",

            color: C.blue,

            border: "none",

            borderRadius: 8,

            fontSize: 12,

            fontWeight: 600,

            cursor: "pointer",
          }}
        >
          <Icon.Eye /> View
        </button>
        <button
          onClick={handleDownload}
          disabled={downloading}
          style={{
            display: "flex",

            alignItems: "center",

            gap: 5,

            padding: "7px 12px",

            background: C.blue,

            color: "#fff",

            border: "none",

            borderRadius: 8,

            fontSize: 12,

            fontWeight: 600,

            cursor: downloading ? "wait" : "pointer",

            opacity: downloading ? 0.7 : 1,

            transition: "all 0.15s",
          }}
        >
          <Icon.Download /> {downloading ? "Downloading..." : "Download"}
        </button>
        {user && user.email === r.uploader_email && onDelete && (
          <button
            onClick={() => onDelete(r.id)}
            style={{
              display: "flex",

              alignItems: "center",

              gap: 5,

              padding: "7px 12px",

              background: "#FEE2E2",

              color: "#DC2626",

              border: "none",

              borderRadius: 8,

              fontSize: 12,

              fontWeight: 600,

              cursor: "pointer",
            }}
          >
            Delete
          </button>
        )}
        {onReport && (!user || !r.uploader_email || user.email !== r.uploader_email) && (
          <button
            onClick={() => onReport(r)}
            title="Report an issue or discrepancy"
            style={{
              display: "flex",

              alignItems: "center",

              gap: 4,

              padding: "7px 10px",

              background: "#FFFBEB",

              color: "#D97706",

              border: "1px solid #FDE68A",

              borderRadius: 8,

              fontSize: 12,

              fontWeight: 600,

              cursor: "pointer",
            }}
          >
            <Icon.Flag /> Report
          </button>
        )}
        <button
          onClick={() => onPin(r.id)}
          style={{
            display: "flex",

            alignItems: "center",

            gap: 5,

            padding: "7px 12px",

            background: r.pinned ? "#EFF6FF" : "#F8FAFC",

            color: r.pinned ? C.blue : C.muted,

            border: `1px solid ${r.pinned ? "#BFDBFE" : C.border}`,

            borderRadius: 8,

            fontSize: 12,

            fontWeight: 600,

            cursor: "pointer",
          }}
        >
          <Icon.Pin filled={r.pinned} />
          {r.pinned ? "Pinned" : "Pin"}
        </button>
      </div>
    </Card>
  )
}

// ── Login Page ────────────────────────────────────────────────────────────────

function LoginPage({
  onLogin,

  onSignup,

  onForgot,

  onToast,

  setEmailForOtp,
}: {
  onLogin: () => void

  onSignup: () => void

  onForgot: () => void

  onToast: (msg: string, type?: "success" | "error") => void

  setEmailForOtp: (email: string) => void
}) {
  const [email, setEmail] = useState("")

  const [password, setPassword] = useState("")

  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!email || !password) {
      onToast("Please enter email and password", "error")

      return
    }

    if (!isValidIITREmail(email)) {
      onToast(
        "Only IIT Roorkee (*.iitr.ac.in) email addresses are allowed",

        "error",
      )

      return
    }

    setLoading(true)

    try {
      await api.auth.login(email, password)

      onToast("Welcome back!")

      onLogin()
    } catch (err: any) {
      if (err.needsVerification) {
        setEmailForOtp(err.email)

        onToast("Please verify your email with the OTP sent", "error")
      } else {
        onToast(err.message || "Invalid credentials", "error")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      const target = e.target as HTMLElement
      if (target.tagName !== "BUTTON") {
        e.preventDefault()
        handleLogin()
      }
    }
  }

  return (
    <div style={{ minHeight: "100%", display: "flex", background: C.bg }}>
      {/* Left panel */}
      <div
        className="desktop-only"
        style={{
          width: 420,

          minWidth: 420,

          background: "#0d2356",

          display: "flex",

          flexDirection: "column",

          alignItems: "center",

          justifyContent: "center",

          padding: 48,

          position: "relative",

          overflow: "hidden",
        }}
      >
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
      <div
        className="auth-right-panel"
        style={{
          flex: 1,

          display: "flex",

          alignItems: "center",

          justifyContent: "center",

          padding: 48,
        }}
      >
        <div style={{ width: "100%", maxWidth: 400 }} onKeyDown={handleKeyDown}>
          {/* Mobile-only logo */}
          <div
            className="mobile-only"
            style={{
              justifyContent: "center",
              marginBottom: 20,
            }}
          >
            <img
              src={logoImg}
              alt="StudyStack"
              style={{
                width: 72,
                height: 72,
                borderRadius: 14,
                objectFit: "cover",
              }}
            />
          </div>
          <div
            style={{
              fontSize: 28,

              fontWeight: 800,

              color: C.text,

              marginBottom: 6,

              letterSpacing: "-0.5px",
            }}
          >
            Welcome back!
          </div>
          <div style={{ color: C.muted, fontSize: 14, marginBottom: 32 }}>
            Continue your learning journey with StudyStack.
          </div>

          <div
            style={{
              display: "flex",

              flexDirection: "column",

              gap: 16,

              marginBottom: 24,
            }}
          >
            <Input
              label="IITR Email"
              placeholder="yourname@iitr.ac.in"
              value={email}
              onChange={setEmail}
            />
            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={setPassword}
            />
          </div>

          <div style={{ textAlign: "right", marginBottom: 24 }}>
            <button
              onClick={onForgot}
              style={{
                background: "none",

                border: "none",

                color: C.blue,

                fontSize: 13,

                fontWeight: 500,

                cursor: "pointer",
              }}
            >
              Forgot Password?
            </button>
          </div>

          <Btn onClick={handleLogin} fullWidth disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Btn>

          <div
            style={{
              marginTop: 24,

              textAlign: "center",

              fontSize: 13,

              color: C.muted,
            }}
          >
            Don't have an account?{" "}
            <button
              onClick={onSignup}
              style={{
                background: "none",

                border: "none",

                color: C.blue,

                fontWeight: 600,

                cursor: "pointer",
              }}
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Signup Page ───────────────────────────────────────────────────────────────

function SignupPage({
  onNext,

  onBack,

  onToast,

  setEmailForOtp,
}: {
  onNext: () => void

  onBack: () => void

  onToast: (msg: string, type?: "success" | "error") => void

  setEmailForOtp: (email: string) => void
}) {
  const [name, setName] = useState("")

  const [branch, setBranch] = useState("")

  const [email, setEmail] = useState("")

  const [pw, setPw] = useState("")

  const [pw2, setPw2] = useState("")

  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!name.trim()) {
      onToast("Student name cannot be empty", "error")

      return
    }

    if (!branch) {
      onToast("Please select your branch / department", "error")

      return
    }

    if (!email || !pw) {
      onToast("Please fill all fields", "error")

      return
    }

    if (!isValidIITREmail(email)) {
      onToast(
        "Only IIT Roorkee (*.iitr.ac.in) email addresses are allowed",

        "error",
      )

      return
    }

    if (pw !== pw2) {
      onToast("Passwords do not match", "error")

      return
    }

    // Optimistic UI Progression

    setEmailForOtp(email)

    onNext()

    api.auth

      .signup(name.trim(), email, pw, branch)

      .then(() => {
        onToast("OTP sent to your email")
      })

      .catch((err: any) => {
        onBack() // Revert on failure

        onToast(err.message || "Failed to create account", "error")
      })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      const target = e.target as HTMLElement
      if (target.tagName !== "BUTTON" && target.tagName !== "SELECT") {
        e.preventDefault()
        handleSubmit()
      }
    }
  }

  return (
    <div
      style={{
        minHeight: "100%",

        display: "flex",

        alignItems: "center",

        justifyContent: "center",

        background: C.bg,

        padding: 24,
      }}
    >
      <div
        onKeyDown={handleKeyDown}
        style={{
          width: "100%",

          maxWidth: 420,

          background: "#fff",

          borderRadius: 20,

          padding: 40,

          border: `1px solid ${C.border}`,

          boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
        }}
      >
        <div
          style={{
            display: "flex",

            justifyContent: "center",

            marginBottom: 24,
          }}
        >
          <img
            src={logoImg}
            alt="StudyStack"
            style={{
              width: 60,

              height: 60,

              borderRadius: 12,

              objectFit: "cover",
            }}
          />
        </div>
        <div
          style={{
            fontSize: 24,

            fontWeight: 800,

            color: C.text,

            marginBottom: 4,

            textAlign: "center",
          }}
        >
          Create Account
        </div>
        <div
          style={{
            color: C.muted,

            fontSize: 13,

            marginBottom: 28,

            textAlign: "center",
          }}
        >
          Join thousands of IITR students
        </div>

        <div
          style={{
            display: "flex",

            flexDirection: "column",

            gap: 16,

            marginBottom: 24,
          }}
        >
          <Input
            label="Full Name *"
            placeholder="Your full name"
            value={name}
            onChange={setName}
          />
          <div>
            <label
              style={{
                fontSize: 13,

                fontWeight: 600,

                color: C.text,

                display: "block",

                marginBottom: 6,
              }}
            >
              Branch / Department *
            </label>
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              style={{
                width: "100%",

                padding: "11px 14px",

                border: `1.5px solid ${C.border}`,

                borderRadius: 10,

                fontSize: 14,

                color: branch ? C.text : C.muted,

                background: "#fff",

                outline: "none",

                fontFamily: "Inter, sans-serif",

                cursor: "pointer",

                boxSizing: "border-box",
              }}
            >
              <option value="" disabled>
                Select Branch / Department
              </option>
              {IITR_BRANCHES.map((b) => (
                <option key={b} value={b} style={{ color: C.text }}>
                  {b}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="IITR Email *"
            placeholder="yourname@iitr.ac.in"
            value={email}
            onChange={setEmail}
          />
          <Input
            label="Password *"
            type="password"
            placeholder="Create a password"
            value={pw}
            onChange={setPw}
          />
          <Input
            label="Confirm Password *"
            type="password"
            placeholder="Repeat your password"
            value={pw2}
            onChange={setPw2}
          />
        </div>

        <Btn onClick={handleSubmit} fullWidth disabled={loading}>
          {loading ? "Sending OTP..." : "Create Account"}
        </Btn>

        <div
          style={{
            marginTop: 20,

            textAlign: "center",

            fontSize: 13,

            color: C.muted,
          }}
        >
          Already have an account?{" "}
          <button
            onClick={onBack}
            style={{
              background: "none",

              border: "none",

              color: C.blue,

              fontWeight: 600,

              cursor: "pointer",
            }}
          >
            Login
          </button>
        </div>
      </div>
    </div>
  )
}

// ── OTP Page ──────────────────────────────────────────────────────────────────

function OtpPage({
  onVerify,

  email,

  onToast,
}: {
  onVerify: () => void

  email: string

  onToast: (msg: string, type?: "success" | "error") => void
}) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""])

  const [loading, setLoading] = useState(false)

  const refs = Array.from({ length: 6 }, () => useRef<HTMLInputElement>(null))

  const handleChange = (i: number, v: string) => {
    if (!/^\d?$/.test(v)) return

    const next = [...otp]

    next[i] = v

    setOtp(next)

    if (v && i < 5) refs[i + 1].current?.focus()
  }

  const handleVerify = async () => {
    const code = otp.join("")

    if (code.length !== 6) {
      onToast("Please enter the 6-digit OTP", "error")

      return
    }

    setLoading(true)

    try {
      await api.auth.verifyOtp(email, code)

      onToast("Account verified successfully! 🎉")

      onVerify()
    } catch (err: any) {
      onToast(err.message || "Invalid OTP", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    try {
      await api.auth.resendOtp(email)

      onToast("New OTP sent! (Check console if SMTP unconfigured)")
    } catch (err: any) {
      onToast(err.message || "Failed to resend OTP", "error")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      const target = e.target as HTMLElement
      if (target.tagName !== "BUTTON") {
        e.preventDefault()
        handleVerify()
      }
    }
  }

  return (
    <div
      style={{
        minHeight: "100%",

        display: "flex",

        alignItems: "center",

        justifyContent: "center",

        background: C.bg,

        padding: 24,
      }}
    >
      <div
        className="animate-step"
        onKeyDown={handleKeyDown}
        style={{
          width: "100%",

          maxWidth: 400,

          background: "#fff",

          borderRadius: 20,

          padding: 40,

          border: `1px solid ${C.border}`,

          boxShadow: "0 4px 24px rgba(0,0,0,0.07)",

          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 40, marginBottom: 12 }}>📬</div>
        <div
          style={{
            fontSize: 22,

            fontWeight: 800,

            color: C.text,

            marginBottom: 6,
          }}
        >
          Verify Your IITR Email
        </div>
        <div style={{ color: C.muted, fontSize: 13, marginBottom: 32 }}>
          Enter the OTP sent to <b>{email || "your IITR email"}</b>.
        </div>

        <div
          style={{
            display: "flex",

            gap: 10,

            justifyContent: "center",

            marginBottom: 32,
          }}
        >
          {otp.map((d, i) => (
            <input
              key={i}
              ref={refs[i]}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              maxLength={1}
              style={{
                width: 44,

                height: 52,

                textAlign: "center",

                fontSize: 22,

                fontWeight: 700,

                border: `2px solid ${d ? C.blue : C.border}`,

                borderRadius: 10,

                outline: "none",

                color: C.text,

                fontFamily: "Inter, sans-serif",
              }}
            />
          ))}
        </div>

        <Btn onClick={handleVerify} fullWidth disabled={loading}>
          {loading ? "Verifying..." : "Verify"}
        </Btn>
        <div style={{ marginTop: 16 }}>
          <button
            onClick={handleResend}
            style={{
              background: "none",

              border: "none",

              color: C.blue,

              fontSize: 13,

              fontWeight: 500,

              cursor: "pointer",
            }}
          >
            Resend OTP
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Forgot Password Page ─────────────────────────────────────────────────────

function ForgotPasswordPage({
  onDone,

  onBack,

  onToast,
}: {
  onDone: () => void

  onBack: () => void

  onToast: (msg: string, type?: "success" | "error") => void
}) {
  const [step, setStep] = useState<"email" | "otp" | "password">("email")

  const [email, setEmail] = useState("")

  const [otp, setOtp] = useState("")

  const [newPw, setNewPw] = useState("")

  const [loading, setLoading] = useState(false)

  const handleSendOtp = async () => {
    if (!email) {
      onToast("Enter your email", "error")

      return
    }

    if (!isValidIITREmail(email)) {
      onToast(
        "Only IIT Roorkee (*.iitr.ac.in) email addresses are allowed",

        "error",
      )

      return
    }

    // Optimistic UI Progression

    setStep("otp")

    api.auth

      .forgotPassword(email)

      .then(() => {
        onToast("Reset OTP sent! (Check your email)")
      })

      .catch((err: any) => {
        setStep("email") // Revert on failure

        onToast(err.message || "Failed to send reset OTP", "error")
      })
  }

  const handleVerifyOtp = async () => {
    if (!otp) {
      onToast("Please enter the OTP", "error")

      return
    }

    setLoading(true)

    try {
      await api.auth.verifyResetOtp(email, otp)

      setStep("password")
    } catch (err: any) {
      onToast(err.message || "Invalid OTP", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async () => {
    if (!newPw) {
      onToast("Please enter a new password", "error")

      return
    }

    setLoading(true)

    try {
      await api.auth.resetPassword(email, otp, newPw)

      onToast("Password updated! Please log in.")

      onDone()
    } catch (err: any) {
      onToast(err.message || "Failed to reset password", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      const target = e.target as HTMLElement
      if (target.tagName !== "BUTTON") {
        e.preventDefault()
        if (step === "email") handleSendOtp()
        else if (step === "otp") handleVerifyOtp()
        else if (step === "password") handleReset()
      }
    }
  }

  let title = "Forgot password?"

  let desc = "Enter your IITR email to receive an OTP."

  if (step === "otp") {
    title = "Enter OTP"

    desc = "Enter the 6-digit OTP sent to your email."
  } else if (step === "password") {
    title = "New Password"

    desc = "Choose a strong new password."
  }

  return (
    <div
      style={{
        minHeight: "100%",

        display: "flex",

        alignItems: "center",

        justifyContent: "center",

        background: C.bg,

        padding: 24,
      }}
    >
      <div
        className="animate-step"
        onKeyDown={handleKeyDown}
        style={{
          width: "100%",

          maxWidth: 400,

          background: "#fff",

          borderRadius: 20,

          padding: 40,

          border: `1px solid ${C.border}`,

          boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
        }}
      >
        <div
          style={{
            fontSize: 24,

            fontWeight: 800,

            color: C.text,

            marginBottom: 6,
          }}
        >
          {title}
        </div>
        <div style={{ color: C.muted, fontSize: 13, marginBottom: 24 }}>
          {desc}
        </div>

        {step === "email" && (
          <div
            style={{
              display: "flex",

              flexDirection: "column",

              gap: 16,

              marginBottom: 24,
            }}
          >
            <Input
              label="IITR Email"
              placeholder="yourname@iitr.ac.in"
              value={email}
              onChange={setEmail}
            />
            <Btn onClick={handleSendOtp} fullWidth disabled={loading}>
              {loading ? "Sending..." : "Send OTP"}
            </Btn>
          </div>
        )}

        {step === "otp" && (
          <div
            style={{
              display: "flex",

              flexDirection: "column",

              gap: 16,

              marginBottom: 24,
            }}
          >
            <Input
              label="6-Digit OTP"
              placeholder="123456"
              value={otp}
              onChange={setOtp}
            />
            <Btn onClick={handleVerifyOtp} fullWidth disabled={loading}>
              {loading ? "Verifying..." : "Verify OTP"}
            </Btn>
          </div>
        )}

        {step === "password" && (
          <div
            style={{
              display: "flex",

              flexDirection: "column",

              gap: 16,

              marginBottom: 24,
            }}
          >
            <Input
              label="New Password"
              type="password"
              placeholder="Enter new password"
              value={newPw}
              onChange={setNewPw}
            />
            <Btn onClick={handleReset} fullWidth disabled={loading}>
              {loading ? "Resetting..." : "Save New Password"}
            </Btn>
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: 12 }}>
          <button
            onClick={onBack}
            style={{
              background: "none",

              border: "none",

              color: C.blue,

              fontSize: 13,

              cursor: "pointer",
            }}
          >
            ← Back to Login
          </button>
        </div>
      </div>
    </div>
  )
}

function HomePage({
  setPage,

  resources,

  onPin,

  onToast,

  courses,

  user,

  setSelectedCourse,

  enrolledCourseIds,

  onEnroll,

  onUnenroll,

  onDeleteResource,

  onReport,
}: {
  setPage: (p: Page) => void

  resources: Resource[]

  onPin: (id: number) => void

  onToast: (msg: string, type?: "success" | "error") => void

  courses: Course[]

  user: any

  setSelectedCourse: (c: Course) => void

  enrolledCourseIds: number[]

  onEnroll: (id: number) => void

  onUnenroll: (id: number) => void

  onDeleteResource?: (id: number) => Promise<boolean> | void

  onReport?: (r: Resource) => void
}) {
  const [search, setSearch] = useState("")

  const [recentCourseIds, setRecentCourseIds] = useState<number[]>([])

  useEffect(() => {
    try {
      const saved = localStorage.getItem("studyStack_recentCourses")

      if (saved) setRecentCourseIds(JSON.parse(saved))
    } catch (e) {}
  }, [])

  const recentlyViewed = recentCourseIds

    .map((id) => courses.find((c) => c.id === id))

    .filter(Boolean) as Course[]

  const [selectedType, setSelectedType] = useState<string>("All")

  const isFiltering = Boolean(search || selectedType !== "All")

  const filteredCourses = search
    ? courses.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.code.toLowerCase().includes(search.toLowerCase()),
      )
    : courses

  const filteredResources = resources.filter((r) => {
    const matchesSearch =
      !search ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.course.toLowerCase().includes(search.toLowerCase())
    const matchesType =
      selectedType === "All" ||
      r.type.toLowerCase() === selectedType.toLowerCase()
    return matchesSearch && matchesType
  })

  const renderCourseGrid = (courseList: Course[]) => (
    <div
      style={{
        display: "grid",

        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",

        gap: 14,
      }}
    >
      {courseList.map((c) => (
        <Card key={c.id}>
          <div
            style={{
              display: "flex",

              justifyContent: "space-between",

              marginBottom: 10,
            }}
          >
            <span
              style={{
                background: "#EFF6FF",

                color: C.blue,

                fontSize: 12,

                fontWeight: 700,

                padding: "3px 8px",

                borderRadius: 6,
              }}
            >
              {c.code}
            </span>
          </div>
          <div
            style={{
              fontWeight: 700,

              fontSize: 15,

              color: C.text,

              marginBottom: 4,
            }}
          >
            {c.name}
          </div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>
            {c.dept}
          </div>
          <div
            style={{
              display: "flex",

              justifyContent: "space-between",

              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 600, color: C.muted }}>
              {c.resources} Resources
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={(e) => {
                  e.stopPropagation()

                  setSelectedCourse(c)

                  previousCoursePage = "home"

                  setPage("course-detail")
                }}
                style={{
                  background: C.blue,

                  color: "#fff",

                  border: "none",

                  borderRadius: 8,

                  padding: "6px 14px",

                  fontSize: 12,

                  fontWeight: 600,

                  cursor: "pointer",
                }}
              >
                View
              </button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )

  return (
    <div className="page-container" style={{ padding: "32px 36px", maxWidth: 1400, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1
          style={{
            fontSize: 28,

            fontWeight: 800,

            color: C.text,

            marginBottom: 4,

            letterSpacing: "-0.5px",
          }}
        >
          Hey {user?.name ? user.name.split(" ")[0] : "Student"} 👋
        </h1>
        <p style={{ color: C.muted, fontSize: 15 }}>
          Ready to find something useful?
        </p>
      </div>

      {/* Search & Category Quick Filters */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ position: "relative" }}>
          <div
            style={{
              position: "absolute",

              left: 16,

              top: "50%",

              transform: "translateY(-50%)",

              color: C.muted,
            }}
          >
            <Icon.Search />
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses, notes, PYQs, assignments..."
            style={{
              width: "100%",

              padding: "14px 14px 14px 48px",

              border: `1.5px solid ${C.border}`,

              borderRadius: 12,

              fontSize: 15,

              color: C.text,

              background: "#fff",

              outline: "none",

              boxSizing: "border-box",

              fontFamily: "Inter, sans-serif",

              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
          />
        </div>

        {/* Quick Filter Category Pills */}
        <div
          style={{
            display: "flex",
            gap: 8,
            marginTop: 12,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 600, color: C.muted, marginRight: 2 }}>
            Filter:
          </span>
          {["All", "Notes", "PYQ", "Assignments", "Labs"].map((t) => {
            const active = selectedType === t
            return (
              <button
                key={t}
                type="button"
                onClick={() => setSelectedType(t)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 20,
                  border: active ? `1.5px solid ${C.blue}` : `1px solid ${C.border}`,
                  background: active ? "#EFF6FF" : "#fff",
                  color: active ? C.blue : C.muted,
                  fontWeight: active ? 700 : 500,
                  fontSize: 13,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  boxShadow: active ? "0 1px 4px rgba(20,110,245,0.15)" : "none",
                }}
              >
                {t}
              </button>
            )
          })}
        </div>
      </div>

      {isFiltering ? (
        <>
          {search && filteredCourses.length > 0 && (
            <div style={{ marginBottom: 36 }}>
              <h2
                style={{
                  fontSize: 18,

                  fontWeight: 700,

                  color: C.text,

                  marginBottom: 16,
                }}
              >
                Courses ({filteredCourses.length})
              </h2>
              {renderCourseGrid(filteredCourses)}
            </div>
          )}

          {filteredResources.length > 0 && (
            <div>
              <h2
                style={{
                  fontSize: 18,

                  fontWeight: 700,

                  color: C.text,

                  marginBottom: 16,
                }}
              >
                {selectedType !== "All" ? `${selectedType} Resources` : "Resources"} ({filteredResources.length})
              </h2>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {filteredResources.map((r) => (
                  <ResourceCard
                    user={user}
                    onDelete={onDeleteResource}
                    onReport={onReport}
                    key={r.id}
                    r={r}
                    onPin={onPin}
                    onToast={onToast}
                  />
                ))}
              </div>
            </div>
          )}

          {(!search || filteredCourses.length === 0) && filteredResources.length === 0 && (
            <div
              style={{ textAlign: "center", padding: "40px 0", color: C.muted }}
            >
              {search
                ? "No courses or resources match your search."
                : `No ${selectedType.toLowerCase()} resources found.`}
            </div>
          )}
        </>
      ) : (
        <>
          {recentlyViewed.length > 0 && (
            <div style={{ marginBottom: 36 }}>
              <h2
                style={{
                  fontSize: 18,

                  fontWeight: 700,

                  color: C.text,

                  marginBottom: 16,
                }}
              >
                Recently Viewed
              </h2>
              {renderCourseGrid(recentlyViewed)}
            </div>
          )}

          <div style={{ marginBottom: 36 }}>
            <h2
              style={{
                fontSize: 18,

                fontWeight: 700,

                color: C.text,

                marginBottom: 16,
              }}
            >
              All Courses
            </h2>
            {courses.length === 0 ? (
              <div
                style={{
                  textAlign: "center",

                  padding: "40px 0",

                  color: C.muted,

                  fontSize: 14,
                }}
              >
                No courses added yet.{" "}
                <button
                  onClick={() => setPage(previousCoursePage)}
                  style={{
                    background: "none",

                    border: "none",

                    color: C.blue,

                    fontWeight: 600,

                    cursor: "pointer",
                  }}
                >
                  Add your first course →
                </button>
              </div>
            ) : (
              renderCourseGrid(courses)
            )}
          </div>
        </>
      )}
    </div>
  )
}

// -------------------------------------

function CoursesPage({
  setPage,

  enrolledCourses,

  availableCourses,

  onEnroll,

  onUnenroll,

  setSelectedCourse,
}: {
  setPage: (p: Page) => void

  enrolledCourses: Course[]

  availableCourses: Course[]

  onEnroll: (id: number) => void

  onUnenroll: (id: number) => void

  setSelectedCourse: (c: Course) => void
}) {
  const [search, setSearch] = useState("")

  const [showForm, setShowForm] = useState(false)

  const [selectedCourseId, setSelectedCourseId] = useState<number | "">("")

  const filtered = enrolledCourses.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()),
  )

  const handleEnroll = () => {
    if (!selectedCourseId) return

    onEnroll(Number(selectedCourseId))

    setSelectedCourseId("")

    setShowForm(false)
  }

  return (
    <div className="page-container" style={{ padding: "32px 36px", maxWidth: 1400, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",

          justifyContent: "space-between",

          alignItems: "flex-start",

          marginBottom: 4,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 28,

              fontWeight: 800,

              color: C.text,

              letterSpacing: "-0.5px",
            }}
          >
            My Courses
          </h1>
          <p
            style={{
              color: C.muted,

              fontSize: 14,

              marginTop: 4,

              marginBottom: 0,
            }}
          >
            Your academic courses and resources.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            display: "flex",

            alignItems: "center",

            gap: 7,

            background: C.blue,

            color: "#fff",

            border: "none",

            borderRadius: 10,

            padding: "10px 18px",

            fontSize: 14,

            fontWeight: 600,

            cursor: "pointer",

            marginTop: 4,
          }}
        >
          <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Add Course
        </button>
      </div>

      {showForm && (
        <Card style={{ marginTop: 20, marginBottom: 8 }}>
          <div
            style={{
              fontSize: 15,

              fontWeight: 700,

              color: C.text,

              marginBottom: 16,
            }}
          >
            Enroll in a Course
          </div>
          <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
            <div style={{ flex: 1 }}>
              <label
                style={{
                  fontSize: 12,

                  fontWeight: 600,

                  color: C.muted,

                  display: "block",

                  marginBottom: 5,
                }}
              >
                Select Course *
              </label>
              <select
                value={selectedCourseId}
                onChange={(e) =>
                  setSelectedCourseId(
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
                style={{
                  width: "100%",

                  padding: "9px 12px",

                  border: `1.5px solid ${C.border}`,

                  borderRadius: 8,

                  fontSize: 14,

                  color: C.text,

                  backgroundColor: "#fff",

                  fontFamily: "Inter, sans-serif",
                }}
              >
                <option value="">-- Choose a course --</option>
                {availableCourses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} - {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button
              onClick={() => setShowForm(false)}
              style={{
                background: "#f1f5f9",

                color: C.muted,

                border: "none",

                borderRadius: 8,

                padding: "9px 20px",

                fontSize: 13,

                fontWeight: 600,

                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleEnroll}
              disabled={!selectedCourseId}
              style={{
                background: selectedCourseId ? C.blue : "#cbd5e1",

                color: "#fff",

                border: "none",

                borderRadius: 8,

                padding: "9px 20px",

                fontSize: 13,

                fontWeight: 600,

                cursor: selectedCourseId ? "pointer" : "not-allowed",
              }}
            >
              Enroll
            </button>
          </div>
        </Card>
      )}

      <div style={{ marginTop: 24, position: "relative", marginBottom: 30 }}>
        <div
          style={{
            position: "absolute",

            left: 16,

            top: 14,

            color: C.muted,

            display: "flex",
          }}
        >
          <Icon.Search />
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search my courses..."
          style={{
            width: "100%",

            padding: "13px 16px 13px 44px",

            background: "#fff",

            border: "1px solid #E2E8F0",

            borderRadius: 14,

            fontSize: 15,

            color: C.text,

            outline: "none",

            boxShadow: "0 2px 8px rgba(0,0,0,0.02)",

            fontFamily: "Inter, sans-serif",

            transition: "all 0.2s ease",
          }}
        />
      </div>

      <div
        style={{
          display: "grid",

          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",

          gap: 16,
        }}
      >
        {filtered.map((c) => (
          <Card key={c.id}>
            <div
              style={{
                display: "flex",

                justifyContent: "space-between",

                alignItems: "flex-start",

                marginBottom: 12,
              }}
            >
              <span
                style={{
                  background: "#F1F5F9",

                  color: C.text,

                  fontSize: 13,

                  fontWeight: 700,

                  padding: "4px 10px",

                  borderRadius: 6,
                }}
              >
                {c.code}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation()

                  onUnenroll(c.id)
                }}
                style={{
                  background: "transparent",

                  border: "none",

                  color: "#ef4444",

                  fontSize: 13,

                  fontWeight: 600,

                  cursor: "pointer",

                  display: "flex",

                  alignItems: "center",

                  gap: 4,
                }}
              >
                Remove
              </button>
            </div>
            <div
              style={{
                fontWeight: 700,

                fontSize: 17,

                color: C.text,

                marginBottom: 6,
              }}
            >
              {c.name}
            </div>
            <div style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>
              {c.dept}
            </div>
            <div
              style={{
                display: "flex",

                justifyContent: "space-between",

                alignItems: "center",
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 600, color: C.muted }}>
                {c.resources} Resources
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation()

                  setSelectedCourse(c)

                  previousCoursePage = "courses"

                  setPage("course-detail")
                }}
                style={{
                  background: C.blue,

                  color: "#fff",

                  padding: "6px 14px",

                  border: "none",

                  borderRadius: 8,

                  fontSize: 12,

                  fontWeight: 600,

                  cursor: "pointer",
                }}
              >
                View
              </button>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div
            style={{
              gridColumn: "1 / -1",

              textAlign: "center",

              padding: "60px 0",
            }}
          >
            <div
              style={{
                background: "#F8FAFC",

                width: 64,

                height: 64,

                borderRadius: "50%",

                display: "flex",

                alignItems: "center",

                justifyContent: "center",

                margin: "0 auto 16px",
              }}
            >
              <Icon.Book />
            </div>
            <h3
              style={{
                color: C.text,

                fontSize: 18,

                fontWeight: 700,

                marginBottom: 8,
              }}
            >
              No courses found
            </h3>
            <p style={{ color: C.muted, fontSize: 14 }}>
              Click "Add Course" to add your first course.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function CourseDetailPage({
  setPage,

  resources,

  onPin,

  onToast,

  course,

  user,

  onDeleteResource,

  onReport,
}: {
  setPage: (p: Page) => void

  resources: Resource[]

  onPin: (id: number) => void

  onToast: (msg: string, type?: "success" | "error") => void

  course: Course | null

  user: any

  onDeleteResource?: (id: number) => Promise<boolean> | void

  onReport?: (r: Resource) => void
}) {
  const [activeTab, setActiveTab] = useState<string | null>(null)

  const tabs = [
    {
      label: "Notes",

      emoji: "📚",

      desc: "Lecture notes, study material and summaries.",
    },

    { label: "PYQ", emoji: "📝", desc: "Previous year question papers." },

    {
      label: "Assignments",

      emoji: "📄",

      desc: "Assignments and problem sets.",
    },

    {
      label: "Labs",

      emoji: "🧪",

      desc: "Lab sheets, files and useful lab resources.",
    },
  ]

  const courseCode = course ? course.code : "CSN-201"

  const courseResources = resources.filter(
    (r) => r.course.toUpperCase() === courseCode.toUpperCase(),
  )

  const filtered = activeTab
    ? courseResources.filter(
        (r) => r.type.toLowerCase() === activeTab.toLowerCase(),
      )
    : []

  return (
    <div className="page-container" style={{ padding: "32px 36px", maxWidth: 1400, margin: "0 auto" }}>
      <button
        onClick={() => setPage(previousCoursePage)}
        style={{
          background: "none",

          border: "none",

          color: C.blue,

          fontSize: 13,

          fontWeight: 600,

          cursor: "pointer",

          marginBottom: 20,

          display: "flex",

          alignItems: "center",

          gap: 4,
        }}
      >
        ← Back to {previousCoursePage === "home" ? "Home" : "Courses"}
      </button>

      <Card style={{ marginBottom: 28 }}>
        <div
          style={{
            display: "flex",

            justifyContent: "space-between",

            alignItems: "flex-start",
          }}
        >
          <div>
            <span
              style={{
                background: "#EFF6FF",

                color: C.blue,

                fontSize: 13,

                fontWeight: 700,

                padding: "4px 10px",

                borderRadius: 6,

                display: "inline-block",

                marginBottom: 10,
              }}
            >
              {course?.code || "CSN-201"}
            </span>
            <h1
              style={{
                fontSize: 26,

                fontWeight: 800,

                color: C.text,

                marginBottom: 6,

                letterSpacing: "-0.3px",
              }}
            >
              {course?.name || "Data Structures and Algorithms"}
            </h1>
            <p style={{ color: C.muted, fontSize: 14, marginBottom: 12 }}>
              {course?.dept || "Computer Science"} · IIT Roorkee
            </p>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: C.blue }}>
              {courseResources.length}
            </div>
            <div style={{ fontSize: 12, color: C.muted }}>Resources</div>
          </div>
        </div>
      </Card>

      {!activeTab ? (
        <div
          style={{
            display: "grid",

            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",

            gap: 14,
          }}
        >
          {tabs.map((t) => {
            const count = courseResources.filter(
              (r) => r.type.toLowerCase() === t.label.toLowerCase(),
            ).length

            return (
              <button
                key={t.label}
                onClick={() => setActiveTab(t.label)}
                style={{
                  background: "#fff",

                  border: `1.5px solid ${C.border}`,

                  borderRadius: 14,

                  padding: "24px 20px",

                  cursor: "pointer",

                  textAlign: "left",

                  transition: "all 0.15s",

                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",

                    top: 20,

                    right: 20,

                    fontSize: 11,

                    fontWeight: 700,

                    color: C.blue,

                    background: "#EFF6FF",

                    padding: "4px 8px",

                    borderRadius: 6,
                  }}
                >
                  {count} {count === 1 ? "Resource" : "Resources"}
                </div>
                <div style={{ fontSize: 32, marginBottom: 10 }}>{t.emoji}</div>
                <div
                  style={{
                    fontWeight: 700,

                    fontSize: 16,

                    color: C.text,

                    marginBottom: 4,
                  }}
                >
                  {t.label}
                </div>
                <div style={{ fontSize: 13, color: C.muted }}>{t.desc}</div>
              </button>
            )
          })}
        </div>
      ) : (
        <div>
          <div
            style={{
              display: "flex",

              alignItems: "center",

              gap: 12,

              marginBottom: 20,
            }}
          >
            <button
              onClick={() => setActiveTab(null)}
              style={{
                background: "none",

                border: "none",

                color: C.blue,

                fontSize: 13,

                fontWeight: 600,

                cursor: "pointer",
              }}
            >
              ← Back to Categories
            </button>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text }}>
              {activeTab}
            </h2>
          </div>
          {filtered.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filtered.map((r) => (
                <ResourceCard
                  user={user}
                  onDelete={onDeleteResource}
                  onReport={onReport}
                  key={r.id}
                  r={r}
                  onPin={onPin}
                  onToast={onToast}
                />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📂</div>
              <div
                style={{
                  fontWeight: 700,

                  fontSize: 16,

                  color: C.text,

                  marginBottom: 6,
                }}
              >
                Nothing here yet
              </div>
              <div style={{ color: C.muted, fontSize: 14 }}>
                Be the first to share a resource with your classmates!
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Upload Page ───────────────────────────────────────────────────────────────

function UploadPage({
  onToast,

  courses,

  onUploaded,
}: {
  onToast: (msg: string, type?: "success" | "error") => void

  courses: Course[]

  onUploaded: () => void
}) {
  const [dragging, setDragging] = useState(false)

  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const [course, setCourse] = useState("")

  const [isNewCourse, setIsNewCourse] = useState(false)

  const [newCourseCode, setNewCourseCode] = useState("")

  const [newCourseName, setNewCourseName] = useState("")

  const [newCourseDept, setNewCourseDept] = useState("")

  const [resType, setResType] = useState("Notes")

  const [title, setTitle] = useState("")

  const [desc, setDesc] = useState("")

  const [uploading, setUploading] = useState(false)

  const [isAnonymous, setIsAnonymous] = useState(false)

  const [success, setSuccess] = useState(false)

  const coursesSortedByCode = [...courses].sort((a, b) =>
    a.code.localeCompare(b.code),
  )
  const coursesSortedByName = [...courses].sort((a, b) =>
    a.name.localeCompare(b.name),
  )

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()

    setDragging(false)

    const file = e.dataTransfer.files[0]

    if (file) {
      if (file.size > 25 * 1024 * 1024) {
        onToast("File is larger than the 25 MB limit", "error")
        return
      }
      setSelectedFile(file)

      if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ""))
    }
  }

  const handleSubmit = async () => {
    let finalCourseCode = ""

    let finalCourseName = ""

    let finalCourseDept = ""

    if (isNewCourse) {
      if (!newCourseCode.trim()) {
        onToast("Please enter a Course Code (e.g. CSN-301)", "error")

        return
      }

      if (!newCourseName.trim()) {
        onToast("Please enter the Course Name", "error")

        return
      }

      if (!newCourseDept.trim()) {
        onToast("Please select a Department / Branch", "error")

        return
      }

      finalCourseCode = newCourseCode.trim().toUpperCase()

      finalCourseName = newCourseName.trim()

      finalCourseDept = newCourseDept.trim()
    } else {
      if (!course) {
        onToast("Please select a course code and name", "error")

        return
      }

      finalCourseCode = course.trim().toUpperCase()
      const foundCourse = courses.find(
        (c) => c.code.toUpperCase() === finalCourseCode,
      )
      if (foundCourse) {
        finalCourseName = foundCourse.name
        finalCourseDept = foundCourse.dept
      }
    }

    if (!title.trim() || !resType) {
      onToast("Please provide resource title and type", "error")

      return
    }

    setUploading(true)

    try {
      const formData = new FormData()

      formData.append("title", title.trim())

      formData.append("course", finalCourseCode)

      formData.append("type", resType)

      if (finalCourseName) formData.append("courseName", finalCourseName)

      if (finalCourseDept) formData.append("courseDept", finalCourseDept)

      if (desc.trim()) formData.append("description", desc.trim())

      if (selectedFile) formData.append("file", selectedFile)

      formData.append("isAnonymous", String(isAnonymous))

      const res: any = await api.resources.upload(formData)

      setSuccess(true)

      if (res?.courseCreated) {
        onToast(`Resource uploaded & course ${finalCourseCode} created! 🎉`)
      } else {
        onToast("Resource uploaded successfully! 🎉")
      }

      setTitle("")

      setDesc("")

      setSelectedFile(null)

      setIsAnonymous(false)

      if (isNewCourse) {
        setNewCourseCode("")

        setNewCourseName("")

        setNewCourseDept("")

        setIsNewCourse(false)
      }

      onUploaded()

      setTimeout(() => setSuccess(false), 4000)
    } catch (err: any) {
      onToast(err.message || "Failed to upload resource", "error")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="page-container" style={{ padding: "32px 36px", maxWidth: 800, margin: "0 auto" }}>
      <h1
        style={{
          fontSize: 28,

          fontWeight: 800,

          color: C.text,

          marginBottom: 4,

          letterSpacing: "-0.5px",
        }}
      >
        Share a Resource
      </h1>
      <p style={{ color: C.muted, fontSize: 14, marginBottom: 32 }}>
        Help your fellow IITR students learn better.
      </p>

      {success && (
        <Card
          style={{
            background: "#F0FDF4",

            border: "1.5px solid #BBF7D0",

            marginBottom: 24,
          }}
        >
          <div
            style={{
              display: "flex",

              alignItems: "center",

              gap: 10,

              color: "#15803D",

              fontWeight: 600,
            }}
          >
            <Icon.Check /> Resource uploaded successfully! 🎉
          </div>
        </Card>
      )}

      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault()

          setDragging(true)
        }}
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
            <div style={{ fontWeight: 600, color: C.text }}>
              {selectedFile.name}
            </div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </div>
          </div>
        ) : (
          <>
            <div style={{ fontWeight: 600, color: C.text, marginBottom: 6 }}>
              Drag & drop your file here
            </div>
            <div style={{ color: C.muted, fontSize: 13, marginBottom: 14 }}>
              Supported formats: PDF, PNG, JPG, WebP (up to 25 MB)
            </div>
            <label
              style={{
                background: C.blue,

                color: "#fff",

                padding: "9px 20px",

                borderRadius: 9,

                fontSize: 13,

                fontWeight: 600,

                cursor: "pointer",
              }}
            >
              Browse Files
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.webp"
                style={{ display: "none" }}
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    const f = e.target.files[0]
                    if (f.size > 25 * 1024 * 1024) {
                      onToast("File is larger than the 25 MB limit", "error")
                      return
                    }

                    setSelectedFile(f)

                    if (!title) setTitle(f.name.replace(/\.[^/.]+$/, ""))
                  }
                }}
              />
            </label>
          </>
        )}
      </div>

      {/* Fields */}
      <div
        style={{
          display: "flex",

          flexDirection: "column",

          gap: 16,

          marginBottom: 24,
        }}
      >
        {!isNewCourse ? (
          <>
            <div>
              <div
                style={{
                  display: "flex",

                  justifyContent: "space-between",

                  alignItems: "center",

                  marginBottom: 6,
                }}
              >
                <label style={{ fontSize: 13, fontWeight: 600, color: C.text }}>
                  Course Code *
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsNewCourse(true)

                    setCourse("")
                  }}
                  style={{
                    background: "none",

                    border: "none",

                    color: C.blue,

                    fontSize: 12,

                    fontWeight: 600,

                    cursor: "pointer",

                    padding: "2px 4px",
                  }}
                >
                  + Course not in list?
                </button>
              </div>

              <select
                value={course}
                onChange={(e) => {
                  if (e.target.value === "__NEW__") {
                    setIsNewCourse(true)

                    setCourse("")
                  } else {
                    setCourse(e.target.value)
                  }
                }}
                style={{
                  width: "100%",

                  padding: "11px 14px",

                  border: `1.5px solid ${C.border}`,

                  borderRadius: 10,

                  fontSize: 14,

                  color: course ? C.text : C.muted,

                  background: "#fff",

                  fontFamily: "Inter, sans-serif",

                  cursor: "pointer",

                  boxSizing: "border-box",
                }}
              >
                <option value="">Select course code</option>
                {coursesSortedByCode.map((c) => (
                  <option key={c.id} value={c.code} style={{ color: C.text }}>
                    {c.code}
                  </option>
                ))}
                <option value="__NEW__" style={{ color: C.blue, fontWeight: 600 }}>
                  ✨ + Add New Course (Course not in list)
                </option>
              </select>
            </div>

            <div>
              <label
                style={{
                  fontSize: 13,

                  fontWeight: 600,

                  color: C.text,

                  display: "block",

                  marginBottom: 6,
                }}
              >
                Course Name *
              </label>

              <select
                value={course}
                onChange={(e) => {
                  if (e.target.value === "__NEW__") {
                    setIsNewCourse(true)

                    setCourse("")
                  } else {
                    setCourse(e.target.value)
                  }
                }}
                style={{
                  width: "100%",

                  padding: "11px 14px",

                  border: `1.5px solid ${C.border}`,

                  borderRadius: 10,

                  fontSize: 14,

                  color: course ? C.text : C.muted,

                  background: "#fff",

                  fontFamily: "Inter, sans-serif",

                  cursor: "pointer",

                  boxSizing: "border-box",
                }}
              >
                <option value="">Select course name</option>
                {coursesSortedByName.map((c) => (
                  <option key={c.id} value={c.code} style={{ color: C.text }}>
                    {c.name}
                  </option>
                ))}
                <option value="__NEW__" style={{ color: C.blue, fontWeight: 600 }}>
                  ✨ + Add New Course (Course not in list)
                </option>
              </select>
            </div>
          </>
        ) : (
          <div
            style={{
              background: "#F8FAFC",

              border: `1.5px solid ${C.blue}`,

              borderRadius: 12,

              padding: "16px",

              display: "flex",

              flexDirection: "column",

              gap: 14,
            }}
          >
            <div
              style={{
                display: "flex",

                justifyContent: "space-between",

                alignItems: "center",
              }}
            >
              <div
                style={{
                  display: "flex",

                  alignItems: "center",

                  gap: 6,

                  fontSize: 12,

                  fontWeight: 600,

                  color: C.blue,
                }}
              >
                <span>ℹ️</span> Add New Course
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsNewCourse(false)

                  setNewCourseCode("")

                  setNewCourseName("")

                  setNewCourseDept("")
                }}
                style={{
                  background: "none",

                  border: "none",

                  color: C.blue,

                  fontSize: 12,

                  fontWeight: 600,

                  cursor: "pointer",

                  padding: "2px 4px",
                }}
              >
                ← Choose from existing courses
              </button>
            </div>

            <div>
              <label
                style={{
                  fontSize: 13,

                  fontWeight: 600,

                  color: C.text,

                  display: "block",

                  marginBottom: 6,
                }}
              >
                Course Code *
              </label>
              <input
                value={newCourseCode}
                onChange={(e) =>
                  setNewCourseCode(e.target.value.toUpperCase())
                }
                placeholder="e.g. CSN-301 or ECE-202"
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
              <label
                style={{
                  fontSize: 13,

                  fontWeight: 600,

                  color: C.text,

                  display: "block",

                  marginBottom: 6,
                }}
              >
                Course Name *
              </label>
              <input
                value={newCourseName}
                onChange={(e) => setNewCourseName(e.target.value)}
                placeholder="e.g. Operating Systems or Signals and Systems"
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
              <label
                style={{
                  fontSize: 13,

                  fontWeight: 600,

                  color: C.text,

                  display: "block",

                  marginBottom: 6,
                }}
              >
                Department / Branch *
              </label>
              <select
                value={newCourseDept}
                onChange={(e) => setNewCourseDept(e.target.value)}
                style={{
                  width: "100%",

                  padding: "11px 14px",

                  border: `1.5px solid ${C.border}`,

                  borderRadius: 10,

                  fontSize: 14,

                  color: newCourseDept ? C.text : C.muted,

                  background: "#fff",

                  outline: "none",

                  boxSizing: "border-box",

                  fontFamily: "Inter, sans-serif",

                  cursor: "pointer",
                }}
              >
                <option value="" disabled>
                  Select Department / Branch
                </option>
                {IITR_BRANCHES.map((b) => (
                  <option key={b} value={b} style={{ color: C.text }}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
        <div>
          <label
            style={{
              fontSize: 13,

              fontWeight: 600,

              color: C.text,

              display: "block",

              marginBottom: 6,
            }}
          >
            Resource Type *
          </label>
          <select
            value={resType}
            onChange={(e) => setResType(e.target.value)}
            style={{
              width: "100%",

              padding: "11px 14px",

              border: `1.5px solid ${C.border}`,

              borderRadius: 10,

              fontSize: 14,

              color: C.text,

              background: "#fff",

              fontFamily: "Inter, sans-serif",
            }}
          >
            {["Notes", "PYQ", "Assignments", "Labs", "Other"].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            style={{
              fontSize: 13,

              fontWeight: 600,

              color: C.text,

              display: "block",

              marginBottom: 6,
            }}
          >
            Resource Title *
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. DSA Mid-Sem Notes 2024"
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
          <label
            style={{
              fontSize: 13,

              fontWeight: 600,

              color: C.text,

              display: "block",

              marginBottom: 6,
            }}
          >
            Description{" "}
            <span style={{ color: C.muted, fontWeight: 400 }}>(optional)</span>
          </label>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Brief description of this resource..."
            rows={3}
            style={{
              width: "100%",

              padding: "11px 14px",

              border: `1.5px solid ${C.border}`,

              borderRadius: 10,

              fontSize: 14,

              color: C.text,

              background: "#fff",

              outline: "none",

              resize: "vertical",

              boxSizing: "border-box",

              fontFamily: "Inter, sans-serif",
            }}
          />
        </div>
      </div>

      <div style={{ marginTop: 2, marginBottom: 18 }}>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            cursor: "pointer",
            userSelect: "none",
            fontSize: 14,
            fontWeight: 500,
            color: C.text,
          }}
        >
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            style={{
              width: 17,
              height: 17,
              cursor: "pointer",
              accentColor: C.blue,
            }}
          />
          <span>Upload anonymously (hide my name on this resource)</span>
        </label>
      </div>

      <Btn onClick={handleSubmit} fullWidth disabled={uploading}>
        {uploading ? "Uploading Resource..." : "Upload Resource"}
      </Btn>
    </div>
  )
}

// ── My Pins Page ──────────────────────────────────────────────────────────────

function PinsPage({
  resources,

  onPin,

  onToast,

  setPage,

  user,

  onDeleteResource,

  onReport,
}: {
  resources: Resource[]

  onPin: (id: number) => void

  onToast: (msg: string, type?: "success" | "error") => void

  setPage: (p: Page) => void

  user: any

  onDeleteResource: (id: number) => void

  onReport?: (r: Resource) => void
}) {
  const pinned = resources.filter((r) => r.pinned)

  const [search, setSearch] = useState("")

  const filtered = pinned.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="page-container" style={{ padding: "32px 36px", maxWidth: 1200, margin: "0 auto" }}>
      <h1
        style={{
          fontSize: 28,

          fontWeight: 800,

          color: C.text,

          marginBottom: 4,

          letterSpacing: "-0.5px",
        }}
      >
        Your Stack
      </h1>
      <p style={{ color: C.muted, fontSize: 14, marginBottom: 28 }}>
        Resources you've saved for later.
      </p>

      {pinned.length > 0 && (
        <div style={{ position: "relative", marginBottom: 24 }}>
          <div
            style={{
              position: "absolute",

              left: 12,

              top: "50%",

              transform: "translateY(-50%)",

              color: C.muted,
            }}
          >
            <Icon.Search />
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search pinned resources..."
            style={{
              width: "100%",

              padding: "10px 12px 10px 40px",

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
      )}

      {pinned.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 0" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📌</div>
          <div
            style={{
              fontWeight: 700,

              fontSize: 18,

              color: C.text,

              marginBottom: 8,
            }}
          >
            Your stack is empty.
          </div>
          <div style={{ color: C.muted, fontSize: 14, marginBottom: 24 }}>
            Pin useful resources and they'll appear here.
          </div>
          <Btn onClick={() => setPage(previousCoursePage)}>Explore Courses</Btn>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((r) => (
            <ResourceCard
              user={user}
              onDelete={onDeleteResource}
              onReport={onReport}
              key={r.id}
              r={r}
              onPin={onPin}
              onToast={onToast}
            />
          ))}
          {filtered.length === 0 && (
            <div
              style={{ textAlign: "center", padding: "40px 0", color: C.muted }}
            >
              No pinned resources match your search.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Profile Page ──────────────────────────────────────────────────────────────

function ProfilePage({
  resources,

  user,

  onLogout,

  onToast,

  onUserUpdated,

  onDeleteResource,

  onFeedbackCountChange,
}: {
  resources: Resource[]

  user: any

  onLogout: () => void

  onToast: (msg: string, type?: "success" | "error") => void

  onUserUpdated: (u: any) => void

  onDeleteResource?: (id: number) => Promise<boolean> | void

  onFeedbackCountChange?: (count: number) => void
}) {
  const [tab, setTab] = useState<"uploads" | "pins" | "feedback" | "settings">("uploads")

  const [profileData, setProfileData] = useState<any>(null)

  const [loadingProfile, setLoadingProfile] = useState(false)

  const [editName, setEditName] = useState("")

  const [editBranch, setEditBranch] = useState("Computer Science & Engineering")

  const [saving, setSaving] = useState(false)

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const [deleting, setDeleting] = useState(false)

  const pinned = resources.filter((r) => r.pinned)

  const loadProfile = async (silent = false) => {
    if (!silent) setLoadingProfile(true)
    try {
      const data = await api.profile.get()
      setProfileData(data)
      setEditName(data.name || user?.name || "")
      setEditBranch(
        data.department ||
          user?.department ||
          "Computer Science & Engineering",
      )
      if (data?.reports && onFeedbackCountChange) {
        const pending = data.reports.filter((rp: any) => rp.status === "pending").length
        onFeedbackCountChange(pending)
      }
    } catch (err: any) {
      console.error("Failed to load profile:", err)
      if (!silent) {
        onToast(err.message || "Failed to load profile", "error")
      }
      setEditName(user?.name || "")
      setEditBranch(user?.department || "Computer Science & Engineering")
    } finally {
      if (!silent) setLoadingProfile(false)
    }
  }

  useEffect(() => {
    loadProfile()
  }, [])

  useEffect(() => {
    loadProfile(true)
  }, [tab])

  useEffect(() => {
    const handleFocus = () => {
      if (document.visibilityState === "visible") {
        loadProfile(true)
      }
    }
    window.addEventListener("focus", handleFocus)
    document.addEventListener("visibilitychange", handleFocus)

    const intervalTime = tab === "feedback" ? 8000 : 20000
    const interval = setInterval(() => {
      if (document.visibilityState === "visible" && !document.hidden) {
        loadProfile(true)
      }
    }, intervalTime)

    return () => {
      clearInterval(interval)
      window.removeEventListener("focus", handleFocus)
      document.removeEventListener("visibilitychange", handleFocus)
    }
  }, [tab])

  const displayName = profileData?.name || user?.name || "IITR Student"

  const displayEmail = profileData?.email || user?.email || "student@iitr.ac.in"

  const displayDept =
    profileData?.department ||
    user?.department ||
    "Computer Science & Engineering"

  const displayYear = profileData?.year || "2nd Year"

  const userUploads =
    profileData?.uploads || resources.filter((r) => r.by === displayName)

  const [feedbackSubTab, setFeedbackSubTab] = useState<"received" | "submitted">("received")

  const reports = profileData?.reports || []
  const myReports = profileData?.myReports || []
  const pendingReportsCount = reports.filter((rp: any) => rp.status === "pending").length

  const handleResolveReport = async (reportId: number) => {
    try {
      await api.profile.resolveReport(reportId)
      onToast("Feedback marked as resolved!", "success")
      setProfileData((prev: any) => {
        const updatedReports = (prev?.reports || []).map((rp: any) =>
          rp.id === reportId ? { ...rp, status: "resolved" } : rp,
        )
        if (onFeedbackCountChange) {
          const pending = updatedReports.filter((rp: any) => rp.status === "pending").length
          onFeedbackCountChange(pending)
        }
        return {
          ...prev,
          reports: updatedReports,
        }
      })
      loadProfile(true)
    } catch (err: any) {
      onToast(err.message || "Failed to resolve report", "error")
    }
  }

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      onToast("Student name cannot be empty", "error")

      return
    }

    setSaving(true)

    try {
      const updated = await api.profile.update({
        name: editName.trim(),

        department: editBranch,
      })

      setProfileData((prev: any) => ({
        ...prev,

        ...updated,
      }))

      onUserUpdated(updated)

      onToast("Profile updated successfully!", "success")
    } catch (err: any) {
      onToast(err.message || "Failed to update profile", "error")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    setDeleting(true)

    try {
      await api.profile.deleteAccount()

      onToast("Account deleted successfully", "success")

      onLogout()
    } catch (err: any) {
      onToast(err.message || "Failed to delete account", "error")

      setDeleting(false)
    }
  }

  return (
    <div className="page-container" style={{ padding: "32px 36px", maxWidth: 1400, margin: "0 auto" }}>
      <h1
        style={{
          fontSize: 28,

          fontWeight: 800,

          color: C.text,

          marginBottom: 24,

          letterSpacing: "-0.5px",
        }}
      >
        My Profile
      </h1>

      {/* Profile card */}
      <Card style={{ marginBottom: 24 }}>
        <div className="profile-header-content" style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div className="profile-user-info" style={{ display: "flex", alignItems: "center", gap: 16, flex: 1, minWidth: 0 }}>
            <div
              style={{
                width: 64,

                height: 64,

                borderRadius: "50%",

                background: `linear-gradient(135deg, ${C.blue}, ${C.cyan})`,

                display: "flex",

                alignItems: "center",

                justifyContent: "center",

                fontSize: 26,

                fontWeight: 700,

                color: "#fff",

                flexShrink: 0,
              }}
            >
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 18, color: C.text, overflow: "hidden", textOverflow: "ellipsis" }}>
                {displayName}
              </div>
              <div style={{ color: C.muted, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis" }}>{displayEmail}</div>
              <div style={{ color: C.muted, fontSize: 13, marginTop: 2, wordBreak: "break-word" }}>
                {displayDept} · {displayYear}
              </div>
            </div>
          </div>
          <div className="profile-stats-row" style={{ display: "flex", gap: 24, flexShrink: 0 }}>
            {[
              {
                label: "Uploads",

                val: profileData?.uploadsCount ?? userUploads.length,
              },

              { label: "Pinned", val: profileData?.pinsCount ?? pinned.length },

              { label: "Community", val: "IITR" },
            ].map(({ label, val }) => (
              <div key={label} style={{ textAlign: "center", flex: 1 }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: C.blue }}>
                  {val}
                </div>
                <div style={{ fontSize: 12, color: C.muted }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div
        style={{
          display: "flex",

          gap: 2,

          background: C.bg,

          borderRadius: 10,

          padding: 4,

          marginBottom: 20,

          border: `1px solid ${C.border}`,

          overflowX: "auto",
        }}
      >
        {(["uploads", "pins", "feedback", "settings"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1,

              minWidth: "fit-content",

              whiteSpace: "nowrap",

              padding: "8px 6px",

              borderRadius: 7,

              border: "none",

              cursor: "pointer",

              fontSize: 13,

              fontWeight: 600,

              transition: "all 0.15s",

              background: tab === t ? "#fff" : "transparent",

              color: tab === t ? C.text : C.muted,

              boxShadow: tab === t ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
            }}
          >
            {t === "uploads" ? (
              "My Uploads"
            ) : t === "pins" ? (
              "My Pins"
            ) : t === "feedback" ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                Feedback
                {pendingReportsCount > 0 && (
                  <span
                    style={{
                      background: "#EF4444",
                      color: "#fff",
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "1px 5px",
                      borderRadius: 10,
                      lineHeight: "12px",
                    }}
                  >
                    {pendingReportsCount}
                  </span>
                )}
              </span>
            ) : (
              "Settings"
            )}
          </button>
        ))}
      </div>

      {tab === "uploads" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {userUploads.length > 0 ? (
            userUploads.map((r: any) => (
              <Card key={r.id} style={{ padding: "14px 18px" }}>
                <div
                  style={{
                    display: "flex",

                    justifyContent: "space-between",

                    alignItems: "center",
                  }}
                >
                  <div>
                    <div
                      style={{ fontWeight: 600, fontSize: 14, color: C.text }}
                    >
                      {r.title}
                    </div>
                    <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>
                      {r.course} · {r.type} · {r.date}
                      {(r.is_anonymous || !r.by) && (
                        <span style={{ color: "#7C3AED", fontWeight: 600, marginLeft: 6 }}>
                          · (Anonymous)
                        </span>
                      )}
                    </div>
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <TypeBadge type={r.type} />
                    <button
                      onClick={() =>
                        window.open(api.resources.getViewUrl(r.id), "_blank")
                      }
                      style={{
                        background: "#EFF6FF",

                        color: C.blue,

                        border: "none",

                        borderRadius: 8,

                        padding: "6px 12px",

                        fontSize: 12,

                        fontWeight: 600,

                        cursor: "pointer",

                        display: "flex",

                        alignItems: "center",
                      }}
                    >
                      View
                    </button>
                    <button
                      onClick={async () => {
                        onToast(`Downloading ${r.title}...`)
                        try {
                          await api.resources.download(r.id, r.title)
                        } catch (err: any) {
                          onToast(err.message || "Failed to download", "error")
                        }
                      }}
                      style={{
                        background: C.blue,

                        color: "#fff",

                        border: "none",

                        borderRadius: 8,

                        padding: "6px 12px",

                        fontSize: 12,

                        fontWeight: 600,

                        cursor: "pointer",

                        display: "flex",

                        alignItems: "center",
                      }}
                    >
                      Download
                    </button>
                    {onDeleteResource && (
                      <button
                        onClick={async () => {
                          const success = await onDeleteResource(r.id)

                          if (success) {
                            setProfileData((prev: any) => {
                              if (!prev) return prev

                              return {
                                ...prev,

                                uploads: prev.uploads.filter(
                                  (u: any) => u.id !== r.id,
                                ),
                              }
                            })
                          }
                        }}
                        style={{
                          background: "#FEE2E2",

                          color: "#DC2626",

                          border: "none",

                          borderRadius: 8,

                          padding: "6px 12px",

                          fontSize: 12,

                          fontWeight: 600,

                          cursor: "pointer",

                          display: "flex",

                          alignItems: "center",
                        }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>📤</div>
              <div style={{ fontWeight: 700, color: C.text, marginBottom: 6 }}>
                You haven't uploaded anything yet.
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "pins" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {pinned.length === 0 ? (
            <div
              style={{ textAlign: "center", padding: "60px 0", color: C.muted }}
            >
              No pinned resources yet.
            </div>
          ) : (
            pinned.map((r) => (
              <Card key={r.id} style={{ padding: "14px 18px" }}>
                <div
                  style={{
                    display: "flex",

                    justifyContent: "space-between",

                    alignItems: "center",
                  }}
                >
                  <div>
                    <div
                      style={{ fontWeight: 600, fontSize: 14, color: C.text }}
                    >
                      {r.title}
                    </div>
                    <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>
                      {r.course} · {r.type} · {r.date}
                    </div>
                  </div>
                  <TypeBadge type={r.type} />
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {tab === "feedback" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
              marginBottom: 4,
            }}
          >
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>
                Feedback & Discrepancies
              </div>
              <div style={{ fontSize: 13, color: C.muted }}>
                Review issues on your uploads or track reports you submitted.
              </div>
            </div>
            <button
              onClick={() => loadProfile(false)}
              disabled={loadingProfile}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                background: "#F1F5F9",
                color: C.navy,
                border: `1px solid ${C.border}`,
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                cursor: loadingProfile ? "not-allowed" : "pointer",
                opacity: loadingProfile ? 0.6 : 1,
              }}
            >
              {loadingProfile ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {/* Sub-tab Pill Switcher */}
          <div
            style={{
              display: "inline-flex",
              background: "#F1F5F9",
              padding: 4,
              borderRadius: 8,
              width: "fit-content",
              gap: 4,
            }}
          >
            <button
              onClick={() => setFeedbackSubTab("received")}
              style={{
                padding: "6px 14px",
                borderRadius: 6,
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
                background: feedbackSubTab === "received" ? "#fff" : "transparent",
                color: feedbackSubTab === "received" ? C.navy : C.muted,
                boxShadow: feedbackSubTab === "received" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                transition: "all 0.15s",
              }}
            >
              Feedback on My Uploads
              {pendingReportsCount > 0 && (
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    background: "#EF4444",
                    color: "#fff",
                    borderRadius: 10,
                    padding: "1px 6px",
                    lineHeight: "14px",
                  }}
                >
                  {pendingReportsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setFeedbackSubTab("submitted")}
              style={{
                padding: "6px 14px",
                borderRadius: 6,
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
                background: feedbackSubTab === "submitted" ? "#fff" : "transparent",
                color: feedbackSubTab === "submitted" ? C.navy : C.muted,
                boxShadow: feedbackSubTab === "submitted" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                transition: "all 0.15s",
              }}
            >
              Issues I Reported
              {myReports.length > 0 && (
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    background: "#E2E8F0",
                    color: "#475569",
                    borderRadius: 10,
                    padding: "1px 6px",
                    lineHeight: "14px",
                  }}
                >
                  {myReports.length}
                </span>
              )}
            </button>
          </div>

          {loadingProfile && !profileData ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: C.muted }}>
              Loading feedback reports...
            </div>
          ) : feedbackSubTab === "received" ? (
            reports.length > 0 ? (
              reports.map((rp: any) => (
                <Card key={rp.id} style={{ padding: "16px 20px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 12,
                      marginBottom: 8,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: 14,
                          color: C.text,
                          marginBottom: 6,
                        }}
                      >
                        {rp.resource_title}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          alignItems: "center",
                          flexWrap: "wrap",
                        }}
                      >
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            padding: "2px 8px",
                            borderRadius: 6,
                            background: "#FEF3C7",
                            color: "#92400E",
                          }}
                        >
                          {rp.reason}
                        </span>
                        <span style={{ fontSize: 12, color: C.muted }}>
                          {new Date(rp.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            padding: "2px 8px",
                            borderRadius: 6,
                            background:
                              rp.status === "resolved" ? "#DCFCE7" : "#FEE2E2",
                            color:
                              rp.status === "resolved" ? "#166534" : "#991B1B",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                          }}
                        >
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              background:
                                rp.status === "resolved" ? "#16A34A" : "#DC2626",
                            }}
                          />
                          {rp.status === "resolved" ? "Resolved" : "Needs Review"}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                      <button
                        onClick={() =>
                          window.open(
                            api.resources.getViewUrl(rp.resource_id),
                            "_blank",
                          )
                        }
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          padding: "6px 12px",
                          background: "#EFF6FF",
                          color: C.blue,
                          border: "none",
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        <Icon.Eye /> View File
                      </button>
                      {rp.status !== "resolved" && (
                        <button
                          onClick={() => handleResolveReport(rp.id)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            padding: "6px 12px",
                            background: "#F0FDF4",
                            color: "#16A34A",
                            border: "1px solid #BBF7D0",
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          <Icon.CheckCircle /> Mark as Resolved
                        </button>
                      )}
                    </div>
                  </div>
                  {rp.details && (
                    <div
                      style={{
                        background: "#F8FAFC",
                        borderRadius: 8,
                        padding: "8px 12px",
                        fontSize: 13,
                        color: "#475569",
                        marginTop: 8,
                        border: `1px solid ${C.border}`,
                      }}
                    >
                      <b>Note:</b> {rp.details}
                    </div>
                  )}
                </Card>
              ))
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 0",
                  color: C.muted,
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    background: "#ECFDF5",
                    color: "#059669",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 12px",
                  }}
                >
                  <Icon.Check />
                </div>
                <div
                  style={{
                    fontWeight: 700,
                    color: C.text,
                    fontSize: 16,
                    marginBottom: 6,
                  }}
                >
                  No reported issues
                </div>
                <div style={{ fontSize: 13 }}>
                  Classmates haven't reported any issues with your uploads. Everything looks great!
                </div>
              </div>
            )
          ) : (
            myReports.length > 0 ? (
              myReports.map((rp: any) => (
                <Card key={rp.id} style={{ padding: "16px 20px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 12,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: 14,
                          color: C.text,
                          marginBottom: 6,
                        }}
                      >
                        {rp.resource_title}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          alignItems: "center",
                          flexWrap: "wrap",
                        }}
                      >
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            padding: "2px 8px",
                            borderRadius: 6,
                            background: "#FEF3C7",
                            color: "#92400E",
                          }}
                        >
                          {rp.reason}
                        </span>
                        <span style={{ fontSize: 12, color: C.muted }}>
                          Reported on{" "}
                          {new Date(rp.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            padding: "2px 8px",
                            borderRadius: 6,
                            background:
                              rp.status === "resolved" ? "#DCFCE7" : "#FEF3C7",
                            color:
                              rp.status === "resolved" ? "#166534" : "#92400E",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                          }}
                        >
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              background:
                                rp.status === "resolved" ? "#16A34A" : "#F59E0B",
                            }}
                          />
                          {rp.status === "resolved"
                            ? "Resolved by Uploader"
                            : "Pending Review"}
                        </span>
                      </div>
                      {rp.details && (
                        <div
                          style={{
                            fontSize: 13,
                            color: "#64748B",
                            marginTop: 8,
                          }}
                        >
                          <b>Your note:</b> {rp.details}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() =>
                        window.open(
                          api.resources.getViewUrl(rp.resource_id),
                          "_blank",
                        )
                      }
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        padding: "6px 12px",
                        background: "#EFF6FF",
                        color: C.blue,
                        border: "none",
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                        flexShrink: 0,
                      }}
                    >
                      <Icon.Eye /> View File
                    </button>
                  </div>
                </Card>
              ))
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 0",
                  color: C.muted,
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    background: "#F1F5F9",
                    color: C.muted,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 12px",
                  }}
                >
                  <Icon.Flag />
                </div>
                <div
                  style={{
                    fontWeight: 700,
                    color: C.text,
                    fontSize: 16,
                    marginBottom: 6,
                  }}
                >
                  No reports submitted
                </div>
                <div style={{ fontSize: 13 }}>
                  You haven't reported any issues on course resources yet.
                </div>
              </div>
            )
          )}
        </div>
      )}

      {tab === "settings" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Edit Profile Form */}
          <Card>
            <div
              style={{
                fontSize: 16,

                fontWeight: 700,

                color: C.text,

                marginBottom: 4,
              }}
            >
              Profile Details
            </div>
            <div style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>
              Update your student name and department branch
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label
                  style={{
                    fontSize: 13,

                    fontWeight: 600,

                    color: C.text,

                    display: "block",

                    marginBottom: 6,
                  }}
                >
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
                <label
                  style={{
                    fontSize: 13,

                    fontWeight: 600,

                    color: C.text,

                    display: "block",

                    marginBottom: 6,
                  }}
                >
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
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  style={{
                    fontSize: 13,

                    fontWeight: 600,

                    color: C.text,

                    display: "block",

                    marginBottom: 6,
                  }}
                >
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

              <div
                style={{
                  display: "flex",

                  justifyContent: "flex-end",

                  marginTop: 8,
                }}
              >
                <Btn onClick={handleSaveProfile} disabled={saving}>
                  {saving ? "Saving Changes..." : "Save Changes"}
                </Btn>
              </div>
            </div>
          </Card>

          {/* Session Card */}
          <Card>
            <div
              style={{
                display: "flex",

                justifyContent: "space-between",

                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontWeight: 600, color: C.text, fontSize: 14 }}>
                  Session Management
                </div>
                <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>
                  Log out from this device
                </div>
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
            <div
              style={{
                display: "flex",

                justifyContent: "space-between",

                alignItems: "flex-start",

                gap: 16,
              }}
            >
              <div>
                <div
                  style={{
                    fontWeight: 700,

                    color: "#DC2626",

                    fontSize: 15,

                    marginBottom: 4,
                  }}
                >
                  Delete Account
                </div>
                <div
                  style={{
                    fontSize: 13,

                    color: "#7F1D1D",

                    lineHeight: 1.5,

                    maxWidth: 520,
                  }}
                >
                  Permanently delete your StudyStack account, bookmarks, and all
                  personal data. This action is irreversible.
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
                <div
                  style={{ fontSize: 13, fontWeight: 600, color: "#991B1B" }}
                >
                  ⚠️ Are you sure you want to delete your account? This cannot be
                  undone.
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
  )
}

// ── App Root ──────────────────────────────────────────────────────────────────

export let previousCoursePage: Page = "courses"

export default function App() {
  const [page, setPage] = useState<Page>("login")

  const [resources, setResources] = useState<Resource[]>([])

  const [courses, setCourses] = useState<Course[]>([])

  const [enrolledCourseIds, setEnrolledCourseIds] = useState<number[]>([])

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)

  const [emailForOtp, setEmailForOtp] = useState("")

  const [currentUser, setCurrentUser] = useState<any>(null)

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const [showSessionExpired, setShowSessionExpired] = useState(false)

  const [deleteConfirmPromise, setDeleteConfirmPromise] = useState<{
    resolve: (val: boolean) => void
  } | null>(null)

  const [reportingResource, setReportingResource] = useState<Resource | null>(null)

  const [pendingFeedbackCount, setPendingFeedbackCount] = useState(0)

  const { toast, show } = useToast()

  const [appLoading, setAppLoading] = useState(true)

  const loadFeedbackCount = async () => {
    if (!api.auth.getToken()) return
    try {
      const profile = await api.profile.get()
      if (profile?.reports) {
        const pending = profile.reports.filter((rp: any) => rp.status === "pending").length
        setPendingFeedbackCount(pending)
      }
    } catch {
      // ignore
    }
  }

  // Load data from backend
  const loadData = async (showLoading = false) => {
    try {
      if (showLoading) setAppLoading(true)

      const [fetchedCourses, fetchedResources, fetchedEnrolled] =
        await Promise.all([
          api.courses.getAll().catch(() => []),

          api.resources.getAll().catch(() => []),

          api.courses.getEnrolled().catch(() => []),
        ])

      if (fetchedCourses) setCourses(fetchedCourses)

      if (fetchedResources) setResources(fetchedResources)

      if (fetchedEnrolled) setEnrolledCourseIds(fetchedEnrolled)

      if (api.auth.getToken()) {
        loadFeedbackCount()
      }
    } catch {
      // Fallback if offline
    } finally {
      if (showLoading) setAppLoading(false)
    }
  }

  useEffect(() => {
    const user = api.auth.getUser()

    const token = api.auth.getToken()

    if (user && token) {
      setCurrentUser(user)

      setPage("home")

      loadData(true)
    } else {
      setAppLoading(false)

      loadData(false)
    }
  }, [])

  // Auto-sync whenever page changes
  useEffect(() => {
    if (currentUser) {
      loadData(false)
    }
  }, [page])

  // Auto-sync on window focus / tab visibility change (e.g. returning from email or another tab)
  useEffect(() => {
    const handleSync = () => {
      if (document.visibilityState === "visible") {
        loadData(false)
      }
    }
    window.addEventListener("focus", handleSync)
    document.addEventListener("visibilitychange", handleSync)
    return () => {
      window.removeEventListener("focus", handleSync)
      document.removeEventListener("visibilitychange", handleSync)
    }
  }, [])

  // Live background polling every 12 seconds while tab is active
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === "visible" && !document.hidden) {
        loadData(false)
      }
    }, 12000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handler = () => setShowSessionExpired(true)

    window.addEventListener("session-expired", handler)

    return () => window.removeEventListener("session-expired", handler)
  }, [])

  const handleLogout = () => {
    setShowLogoutConfirm(true)
  }

  const confirmLogout = () => {
    setShowLogoutConfirm(false)

    api.auth.clearAuth()

    setCurrentUser(null)

    setPage("login")
  }

  const cancelLogout = () => {
    setShowLogoutConfirm(false)
  }

  const handleViewCourse = (c: Course) => {
    setSelectedCourse(c)
    loadData(false)

    try {
      const saved = localStorage.getItem("studyStack_recentCourses")

      let arr = saved ? JSON.parse(saved) : []

      arr = [c.id, ...arr.filter((id: number) => id !== c.id)].slice(0, 3)

      localStorage.setItem("studyStack_recentCourses", JSON.stringify(arr))
    } catch (e) {}
  }

  const handleDeleteResource = async (id: number) => {
    const confirmed = await new Promise<boolean>((resolve) => {
      setDeleteConfirmPromise({ resolve })
    })

    setDeleteConfirmPromise(null)

    if (!confirmed) return false

    const resourceToDelete = resources.find((r) => r.id === id)

    // Optimistic UI update

    setResources((prev) => prev.filter((r) => r.id !== id))

    if (resourceToDelete) {
      setCourses((prev) =>
        prev.map((c) =>
          c.code.toUpperCase() === resourceToDelete.course.toUpperCase()
            ? { ...c, resources: Math.max(0, c.resources - 1) }
            : c,
        ),
      )
    }

    show("Resource deleted successfully")

    try {
      await api.resources.delete(id)

      return true
    } catch (err: any) {
      // Revert

      if (resourceToDelete) {
        setResources((prev) => [resourceToDelete, ...prev])

        setCourses((prev) =>
          prev.map((c) =>
            c.code.toUpperCase() === resourceToDelete.course.toUpperCase()
              ? { ...c, resources: c.resources + 1 }
              : c,
          ),
        )
      }

      show(err.message || "Failed to delete resource", "error")

      return false
    }
  }

  const togglePin = async (id: number) => {
    const resource = resources.find((r) => r.id === id)

    const currentlyPinned = resource ? resource.pinned : false

    // Optimistically update the UI and show toast to eliminate lag completely

    setResources((prev) =>
      prev.map((r) => (r.id === id ? { ...r, pinned: !r.pinned } : r)),
    )

    show(
      !currentlyPinned
        ? "Resource added to pins"
        : "Resource removed from pins",
    )

    try {
      const res = await api.resources.togglePin(id)

      // Sync with server state

      setResources((prev) =>
        prev.map((r) => (r.id === id ? { ...r, pinned: res.pinned } : r)),
      )
    } catch (err: any) {
      // Revert optimistic update on failure

      setResources((prev) =>
        prev.map((r) => (r.id === id ? { ...r, pinned: !r.pinned } : r)),
      )

      show(err.message || "Failed to update pin", "error")
    }
  }

  const addCourse = async (code: string, name: string, dept: string) => {
    try {
      const newCourse = await api.courses.create(code, name, dept)

      setCourses((prev) => [newCourse, ...prev])

      setEnrolledCourseIds((prev) => [...prev, newCourse.id])

      show("Course added successfully!")
    } catch (err: any) {
      show(err.message || "Failed to add course", "error")
    }
  }

  const enrollCourse = async (id: number) => {
    // Optimistic UI update to eliminate click latency completely

    setEnrolledCourseIds((prev) => [...prev, id])

    show("Added to My Courses")

    try {
      await api.courses.enroll(id)
    } catch (err: any) {
      // Revert if failed

      setEnrolledCourseIds((prev) => prev.filter((eid) => eid !== id))

      show(err.message, "error")
    }
  }

  const removeCourse = async (id: number) => {
    // Optimistic UI update

    setEnrolledCourseIds((prev) => prev.filter((eid) => eid !== id))

    show("Removed from My Courses")

    try {
      await api.courses.unenroll(id)
    } catch (err: any) {
      // Revert if failed

      setEnrolledCourseIds((prev) => [...prev, id])

      show(err.message || "Failed to remove course", "error")
    }
  }

  if (page === "login")
    return (
      <>
        <LoginPage
          onLogin={() => {
            const user = api.auth.getUser()

            setCurrentUser(user)

            loadData()

            setPage("home")
          }}
          onSignup={() => setPage("signup")}
          onForgot={() => setPage("forgot")}
          onToast={show}
          setEmailForOtp={(em) => {
            setEmailForOtp(em)

            setPage("otp")
          }}
        />

        {toast && <Toast msg={toast.msg} type={toast.type} />}
      </>
    )

  if (page === "signup")
    return (
      <>
        <SignupPage
          onNext={() => setPage("otp")}
          onBack={() => setPage("login")}
          onToast={show}
          setEmailForOtp={setEmailForOtp}
        />

        {toast && <Toast msg={toast.msg} type={toast.type} />}
      </>
    )

  if (page === "otp")
    return (
      <>
        <OtpPage
          onVerify={() => {
            const user = api.auth.getUser()

            setCurrentUser(user)

            loadData()

            setPage("home")
          }}
          email={emailForOtp}
          onToast={show}
        />

        {toast && <Toast msg={toast.msg} type={toast.type} />}
      </>
    )

  if (page === "forgot")
    return (
      <>
        <ForgotPasswordPage
          onDone={() => setPage("login")}
          onBack={() => setPage("login")}
          onToast={show}
        />

        {toast && <Toast msg={toast.msg} type={toast.type} />}
      </>
    )

  return (
    <div
      style={{
        display: "flex",

        height: "100%",

        background: C.bg,

        fontFamily: "Inter, sans-serif",
      }}
    >
      <Sidebar
        page={page}
        setPage={setPage}
        onLogout={handleLogout}
        pendingFeedbackCount={pendingFeedbackCount}
      />
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          overflow: "hidden",
          minWidth: 0,
        }}
      >
        {/* Mobile Header (Hidden on Desktop) */}
        <header
          className="mobile-only"
          style={{
            height: 56,
            background: C.navy,
            padding: "0 16px",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            flexShrink: 0,
            zIndex: 30,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img
              src={sidebarIcon}
              alt="StudyStack logo"
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                objectFit: "cover",
                mixBlendMode: "lighten",
              }}
            />
            <div>
              <div
                style={{
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 16,
                  letterSpacing: "-0.3px",
                  lineHeight: "18px",
                }}
              >
                StudyStack
              </div>
              <div
                style={{
                  color: C.cyan,
                  fontSize: 10,
                  fontWeight: 500,
                  lineHeight: "12px",
                }}
              >
                Your Stack. Your Track.
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Log Out"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "none",
              borderRadius: 8,
              padding: "6px 10px",
              color: "rgba(255,255,255,0.8)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            <Icon.Logout />
            <span>Logout</span>
          </button>
        </header>

        {/* Scrollable Main Content */}
        <main
          className="main-content-scroll"
          style={{ flex: 1, overflow: "auto", height: "100%" }}
        >
        {appLoading ? (
          <div
            style={{
              display: "flex",

              flexDirection: "column",

              justifyContent: "center",

              alignItems: "center",

              height: "100%",

              color: C.muted,

              gap: 16,
            }}
          >
            <div style={{ transform: "scale(1.5)", display: "flex" }}>
              <Icon.Book />
            </div>
            <div style={{ fontWeight: 600, fontSize: 16 }}>
              Loading StudyStack...
            </div>
          </div>
        ) : (
          <>
            {page === "home" && (
              <HomePage
                setPage={setPage}
                resources={resources}
                onPin={togglePin}
                onToast={show}
                courses={courses}
                user={currentUser}
                setSelectedCourse={handleViewCourse}
                enrolledCourseIds={enrolledCourseIds}
                onEnroll={enrollCourse}
                onUnenroll={removeCourse}
                onDeleteResource={handleDeleteResource}
                onReport={setReportingResource}
              />
            )}
            {page === "courses" && (
              <CoursesPage
                setPage={setPage}
                enrolledCourses={courses.filter((c) =>
                  enrolledCourseIds.includes(c.id),
                )}
                availableCourses={courses.filter(
                  (c) => !enrolledCourseIds.includes(c.id),
                )}
                onEnroll={enrollCourse}
                onUnenroll={removeCourse}
                setSelectedCourse={handleViewCourse}
              />
            )}
            {page === "course-detail" && (
              <CourseDetailPage
                setPage={setPage}
                resources={resources}
                onPin={togglePin}
                onToast={show}
                course={selectedCourse}
                user={currentUser}
                onDeleteResource={handleDeleteResource}
                onReport={setReportingResource}
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
                user={currentUser}
                onDeleteResource={handleDeleteResource}
                setPage={setPage}
                onReport={setReportingResource}
              />
            )}
            {page === "profile" && (
              <ProfilePage
                resources={resources}
                user={currentUser}
                onLogout={handleLogout}
                onToast={show}
                onUserUpdated={(u) => {
                  setCurrentUser(u)

                  api.auth.setUser(u)
                }}
                onDeleteResource={handleDeleteResource}
                onFeedbackCountChange={setPendingFeedbackCount}
              />
            )}
          </>
        )}
      </main>
      </div>

      {/* Mobile Bottom Navigation (Hidden on Desktop) */}
      <nav
        className="mobile-only"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: 60,
          background: C.navy,
          borderTop: "1px solid rgba(255,255,255,0.1)",
          zIndex: 999,
          justifyContent: "space-around",
          alignItems: "center",
          padding: "0 6px",
          boxShadow: "0 -2px 10px rgba(0,0,0,0.15)",
        }}
      >
        {[
          { label: "Home", icon: "Home", target: "home" as Page },
          { label: "My Courses", icon: "Book", target: "courses" as Page },
          { label: "Pins", icon: "Bookmark", target: "pins" as Page },
          { label: "Upload", icon: "Upload", target: "upload" as Page },
          { label: "Profile", icon: "User", target: "profile" as Page },
        ].map(({ label, icon, target }) => {
          const active =
            page === target ||
            (page === "course-detail" && target === previousCoursePage)
          const IconComp = Icon[icon as keyof typeof Icon] as () => React.ReactElement
          return (
            <button
              key={label}
              onClick={() => setPage(target)}
              style={{
                background: "transparent",
                border: "none",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "6px 4px",
                cursor: "pointer",
                color: active ? C.cyan : "rgba(255,255,255,0.6)",
                position: "relative",
                flex: 1,
                transition: "all 0.15s ease",
              }}
            >
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  transform: active ? "scale(1.1)" : "scale(1)",
                  transition: "transform 0.15s",
                }}
              >
                <IconComp />
                {target === "profile" && pendingFeedbackCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: -4,
                      right: -7,
                      fontSize: 9,
                      fontWeight: 700,
                      background: "#EF4444",
                      color: "#fff",
                      borderRadius: 10,
                      padding: "1px 5px",
                      lineHeight: "11px",
                      minWidth: 12,
                      textAlign: "center",
                    }}
                  >
                    {pendingFeedbackCount}
                  </span>
                )}
              </div>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: active ? 700 : 500,
                  marginTop: 3,
                }}
              >
                {label}
              </span>
            </button>
          )
        })}
      </nav>
      {reportingResource && (
        <ReportModal
          resource={reportingResource}
          onClose={() => setReportingResource(null)}
          onToast={show}
          onSuccess={() => loadData(false)}
        />
      )}

      {showLogoutConfirm && (
        <div
          style={{
            position: "fixed",

            top: 0,

            left: 0,

            right: 0,

            bottom: 0,

            background: "rgba(15, 23, 42, 0.4)",

            backdropFilter: "blur(4px)",

            display: "flex",

            alignItems: "center",

            justifyContent: "center",

            zIndex: 9999,
          }}
        >
          <div
            style={{
              width: 400,

              textAlign: "center",

              padding: "32px 24px",

              animation: "popIn 0.2s ease-out",

              background: "#fff",

              borderRadius: 12,

              boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
            }}
          >
            <div
              style={{
                width: 48,

                height: 48,

                borderRadius: "50%",

                background: "#FEE2E2",

                display: "flex",

                alignItems: "center",

                justifyContent: "center",

                margin: "0 auto 16px",
              }}
            >
              <Icon.Logout />
            </div>
            <h3 style={{ marginTop: 0, fontSize: 20, color: "#0F172A" }}>
              Log out of StudyStack?
            </h3>
            <p
              style={{
                color: "#64748B",

                fontSize: 14,

                marginBottom: 28,

                lineHeight: 1.5,
              }}
            >
              Are you sure you want to log out of your account? You will need
              your password to log back in.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button
                onClick={cancelLogout}
                style={{
                  flex: 1,

                  padding: "12px",

                  background: "#F1F5F9",

                  color: "#475569",

                  border: "none",

                  borderRadius: 8,

                  fontWeight: 600,

                  cursor: "pointer",

                  transition: "all 0.15s",
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                style={{
                  flex: 1,

                  padding: "12px",

                  background: "#EF4444",

                  color: "#fff",

                  border: "none",

                  borderRadius: 8,

                  fontWeight: 600,

                  cursor: "pointer",

                  transition: "all 0.15s",
                }}
              >
                Yes, log out
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirmPromise && (
        <div
          style={{
            position: "fixed",

            top: 0,

            left: 0,

            right: 0,

            bottom: 0,

            background: "rgba(15, 23, 42, 0.4)",

            backdropFilter: "blur(4px)",

            display: "flex",

            alignItems: "center",

            justifyContent: "center",

            zIndex: 9999,
          }}
        >
          <div
            style={{
              width: 400,

              textAlign: "center",

              padding: "32px 24px",

              animation: "popIn 0.2s ease-out",

              background: "#fff",

              borderRadius: 12,

              boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
            }}
          >
            <div
              style={{
                width: 48,

                height: 48,

                borderRadius: "50%",

                background: "#FEE2E2",

                color: "#DC2626",

                display: "flex",

                alignItems: "center",

                justifyContent: "center",

                margin: "0 auto 16px",
              }}
            >
              <Icon.Trash2 />
            </div>
            <h3 style={{ marginTop: 0, fontSize: 20, color: "#0F172A" }}>
              Delete Resource?
            </h3>
            <p
              style={{
                color: "#64748B",

                fontSize: 14,

                marginBottom: 28,

                lineHeight: 1.5,
              }}
            >
              Are you sure you want to delete this resource? This action cannot
              be undone.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => deleteConfirmPromise.resolve(false)}
                style={{
                  flex: 1,

                  padding: "10px 16px",

                  background: "#F1F5F9",

                  color: "#475569",

                  border: "none",

                  borderRadius: 8,

                  fontWeight: 600,

                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => deleteConfirmPromise.resolve(true)}
                style={{
                  flex: 1,

                  padding: "10px 16px",

                  background: "#EF4444",

                  color: "#fff",

                  border: "none",

                  borderRadius: 8,

                  fontWeight: 600,

                  cursor: "pointer",
                }}
              >
                Yes, delete
              </button>
            </div>
          </div>
        </div>
      )}
      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  )
}
