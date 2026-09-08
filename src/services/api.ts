// StudyStack API Client

const API_BASE = "/api";

function getHeaders(isMultipart = false): HeadersInit {
  const headers: Record<string, string> = {};
  if (!isMultipart) {
    headers["Content-Type"] = "application/json";
  }
  const token = localStorage.getItem("studystack_token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Auth
  auth: {
    getToken: () => localStorage.getItem("studystack_token"),
    setToken: (token: string) => localStorage.setItem("studystack_token", token),
    clearAuth: () => {
      localStorage.removeItem("studystack_token");
      localStorage.removeItem("studystack_user");
    },
    getUser: () => {
      try {
        const u = localStorage.getItem("studystack_user");
        return u ? JSON.parse(u) : null;
      } catch {
        return null;
      }
    },
    setUser: (user: any) => localStorage.setItem("studystack_user", JSON.stringify(user)),

    signup: async (name: string, email: string, password: string) => {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Signup failed");
      return data;
    },

    verifyOtp: async (email: string, otp: string) => {
      const res = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "OTP verification failed");
      if (data.token) api.auth.setToken(data.token);
      if (data.user) api.auth.setUser(data.user);
      return data;
    },

    resendOtp: async (email: string, type = "signup") => {
      const res = await fetch(`${API_BASE}/auth/resend-otp`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ email, type }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to resend OTP");
      return data;
    },

    login: async (email: string, password: string) => {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        const err: any = new Error(data.error || "Login failed");
        err.needsVerification = data.needsVerification;
        err.email = data.email;
        throw err;
      }
      if (data.token) api.auth.setToken(data.token);
      if (data.user) api.auth.setUser(data.user);
      return data;
    },

    forgotPassword: async (email: string) => {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Password reset request failed");
      return data;
    },

    resetPassword: async (email: string, otp: string, newPassword: string) => {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reset password failed");
      return data;
    },

    getMe: async () => {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: getHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch user");
      return data.user;
    },
  },

  // Courses
  courses: {
    getAll: async () => {
      const res = await fetch(`${API_BASE}/courses`, {
        headers: getHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch courses");
      return data.courses;
    },

    getById: async (idOrCode: string | number) => {
      const res = await fetch(`${API_BASE}/courses/${idOrCode}`, {
        headers: getHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch course");
      return data.course;
    },

    create: async (code: string, name: string, dept: string) => {
      const res = await fetch(`${API_BASE}/courses`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ code, name, dept }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create course");
      return data.course;
    },

    delete: async (id: number) => {
      const res = await fetch(`${API_BASE}/courses/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete course");
      return data;
    },
  },

  // Resources
  resources: {
    getAll: async (params?: { q?: string; course?: string; type?: string }) => {
      const query = new URLSearchParams();
      if (params?.q) query.append("q", params.q);
      if (params?.course) query.append("course", params.course);
      if (params?.type) query.append("type", params.type);

      const res = await fetch(`${API_BASE}/resources?${query.toString()}`, {
        headers: getHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch resources");
      return data.resources;
    },

    upload: async (formData: FormData) => {
      const res = await fetch(`${API_BASE}/resources/upload`, {
        method: "POST",
        headers: getHeaders(true),
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload resource");
      return data.resource;
    },

    getDownloadUrl: (id: number) => `${API_BASE}/resources/${id}/download`,

    togglePin: async (id: number) => {
      const res = await fetch(`${API_BASE}/resources/${id}/pin`, {
        method: "POST",
        headers: getHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to toggle pin");
      return data;
    },

    getPinned: async () => {
      const res = await fetch(`${API_BASE}/resources/pinned`, {
        headers: getHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch pinned resources");
      return data.resources;
    },
  },

  // Profile
  profile: {
    get: async () => {
      const res = await fetch(`${API_BASE}/profile`, {
        headers: getHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch profile");
      return data.profile;
    },

    update: async (body: { name?: string; department?: string; year?: string }) => {
      const res = await fetch(`${API_BASE}/profile`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");
      return data.user;
    },
  },
};
