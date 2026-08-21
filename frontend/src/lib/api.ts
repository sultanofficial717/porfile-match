const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    if (!res.ok) {
      let errMessage = `HTTP ${res.status}: ${res.statusText}`;
      try {
        const errJson = await res.json();
        if (errJson.error) errMessage = errJson.error;
      } catch {}
      throw new Error(errMessage);
    }

    return await res.json();
  } catch (err: any) {
    console.error(`API request failed: ${url}`, err);
    throw err;
  }
}

export const api = {
  // Auth & Session
  auth: {
    signup: (data: {
      email: string;
      fullName?: string;
      role: "student" | "recruiter" | "admin";
      organizationName?: string;
      organizationWebsite?: string;
      jobTitle?: string;
    }) => request<{ user: any }>("/auth/signup", { method: "POST", body: JSON.stringify(data) }),

    login: (email: string) =>
      request<{ user: any }>("/auth/login", { method: "POST", body: JSON.stringify({ email }) }),

    getSession: (userId?: string) =>
      request<{ currentUser: any; availableUsers: any[] }>(
        `/auth/session${userId ? `?userId=${userId}` : ""}`
      ),
  },

  // Student Profile & Preferences
  student: {
    getProfile: (studentId: string) =>
      request<{ student: any }>(`/students/${studentId}`),

    updateProfile: (studentId: string, data: any) =>
      request<{ success: boolean; student: any }>(`/students/${studentId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),

    updatePreferences: (studentId: string, preferences: any) =>
      request<{ preferences: any }>(`/students/${studentId}/preferences`, {
        method: "PUT",
        body: JSON.stringify(preferences),
      }),

    getFileExportUrl: (studentId: string) =>
      `${API_BASE}/students/${studentId}/file`,

    getProfileFile: (studentId: string) =>
      request<any>(`/students/${studentId}/file`),
  },

  // Recruiter Dashboard & Opportunities
  recruiter: {
    getProfile: (recruiterId: string) =>
      request<{ recruiter: any }>(`/recruiters/${recruiterId}`),

    onboard: (recruiterId: string, data: any) =>
      request<{ recruiter: any }>(`/recruiters/${recruiterId}/onboarding`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),

    createOpportunity: (recruiterId: string, data: any) =>
      request<{ opportunity: any }>(`/recruiters/${recruiterId}/opportunities`, {
        method: "POST",
        body: JSON.stringify(data),
      }),

    listOpportunities: (recruiterId: string) =>
      request<{ opportunities: any[] }>(`/recruiters/${recruiterId}/opportunities`),

    getMetrics: (recruiterId: string) =>
      request<{ metrics: any }>(`/recruiters/${recruiterId}/metrics`),
  },

  // Admin Oversight & Approval Queues
  admin: {
    getPendingRecruiters: () =>
      request<{ recruiters: any[] }>("/admin/recruiters/pending"),

    updateRecruiterStatus: (id: string, status: string, adminId?: string) =>
      request<{ recruiter: any }>(`/admin/recruiters/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status, adminId }),
      }),

    getPendingOpportunities: () =>
      request<{ opportunities: any[] }>("/admin/opportunities/pending"),

    reviewOpportunity: (id: string, status: string, adminId?: string) =>
      request<{ opportunity: any; matchStats: any }>(`/admin/opportunities/${id}/review`, {
        method: "PUT",
        body: JSON.stringify({ status, adminId }),
      }),

    listUsers: () =>
      request<{ students: any[]; recruiters: any[] }>("/admin/users"),

    getMetrics: () =>
      request<{ metrics: any; ollamaHealth: any }>("/admin/metrics"),
  },

  // Opportunities
  opportunities: {
    list: (params?: { type?: string; location?: string; remote?: boolean; search?: string; status?: string }) => {
      const q = new URLSearchParams();
      if (params?.type) q.append("type", params.type);
      if (params?.location) q.append("location", params.location);
      if (params?.remote !== undefined) q.append("remote", String(params.remote));
      if (params?.search) q.append("search", params.search);
      if (params?.status) q.append("status", params.status);
      const queryStr = q.toString();
      return request<{ opportunities: any[] }>(`/opportunities${queryStr ? `?${queryStr}` : ""}`);
    },

    getById: (id: string) =>
      request<{ opportunity: any }>(`/opportunities/${id}`),
  },

  // Matches
  matches: {
    getStudentMatches: (studentId: string) =>
      request<{ matches: any[] }>(`/matches/student/${studentId}`),

    getExplanation: (studentId: string, opportunityId: string) =>
      request<{ match: any }>(`/matches/explanation/${studentId}/${opportunityId}`),
  },

  // Notifications & Emails
  notifications: {
    getStudentNotifications: (studentId: string) =>
      request<{ emailLogs: any[]; notifications: any[] }>(`/notifications/student/${studentId}`),

    listEmailLogs: () =>
      request<{ emailLogs: any[] }>("/notifications/emails"),
  },

  // System & Health
  system: {
    getHealth: () =>
      request<{ status: string; timestamp: string; ollama: any }>("/system/health"),
  },
};
