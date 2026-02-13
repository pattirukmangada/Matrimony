/**
 * VivahBandhan - API Service Layer
 * Clean & Production Ready
 */

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  "https://matrimony.rukmantech.com/backend/api";

// ───────────────────────────────────────────────────────────────
// Error Class
// ───────────────────────────────────────────────────────────────
export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status = 500, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

// ───────────────────────────────────────────────────────────────
// Token Management
// ───────────────────────────────────────────────────────────────
const TOKEN_KEY = "vb_token";
const USER_KEY = "vb_user";

export interface StoredUser {
  id: number;
  full_name: string;
  email: string;
  admin_approved: boolean;
  role?: "user" | "admin";
}

export const TokenService = {
  getToken: (): string | null => localStorage.getItem(TOKEN_KEY),

  setToken: (token: string) =>
    localStorage.setItem(TOKEN_KEY, token),

  removeToken: () =>
    localStorage.removeItem(TOKEN_KEY),

  getUser: (): StoredUser | null => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  setUser: (user: StoredUser) =>
    localStorage.setItem(USER_KEY, JSON.stringify(user)),

  removeUser: () =>
    localStorage.removeItem(USER_KEY),

  isLoggedIn: (): boolean =>
    !!localStorage.getItem(TOKEN_KEY),

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

// ───────────────────────────────────────────────────────────────
// HTTP Request Helper
// ───────────────────────────────────────────────────────────────
async function request<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const token = TokenService.getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      data?.error ||
      data?.errors?.join?.(", ") ||
      `Request failed (${response.status})`;
    throw new ApiError(message, response.status, data);
  }

  return data as T;
}

// ───────────────────────────────────────────────────────────────
// Auth API
// ───────────────────────────────────────────────────────────────
export interface RegisterPayload {
  full_name: string;
  email: string;
  mobile: string;
  password: string;
  gender: string;
  dob: string;
  religion: string;
  location: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const AuthAPI = {
  register: (payload: RegisterPayload) =>
    request("/auth/register.php", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  login: async (payload: LoginPayload) => {
    const res = await request<{
      token: string;
      user: StoredUser;
    }>("/auth/login.php", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (res.token) {
      TokenService.setToken(res.token);
      TokenService.setUser({ ...res.user, role: "user" });
    }

    return res;
  },

  adminLogin: async (payload: {
    username: string;
    password: string;
  }) => {
    const res = await request<{
      token: string;
      admin: { id: number; username: string; full_name: string };
    }>("/auth/admin-login.php", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (res.token) {
      TokenService.setToken(res.token);
      TokenService.setUser({
        id: res.admin.id,
        full_name: res.admin.full_name,
        email: res.admin.username,
        admin_approved: true,
        role: "admin",
      });
    }

    return res;
  },

  logout: () => {
    TokenService.logout();
    window.location.href = "/";
  },
};

// ───────────────────────────────────────────────────────────────
// Profile API
// ───────────────────────────────────────────────────────────────
export const ProfileAPI = {
  get: (userId: number) =>
    request(`/profile/get.php?user_id=${userId}`),

  getOwn: () => {
    const user = TokenService.getUser();
    if (!user) throw new ApiError("Not logged in", 401);
    return request(`/profile/get.php?user_id=${user.id}`);
  },

  update: (payload: unknown) =>
    request("/profile/update.php", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

// ───────────────────────────────────────────────────────────────
// Search API
// ───────────────────────────────────────────────────────────────
export const SearchAPI = {
  search: (filters: Record<string, unknown> = {}) => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        params.append(key, String(value));
      }
    });

    return request(`/search/index.php?${params.toString()}`);
  },
};
