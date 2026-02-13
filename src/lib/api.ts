// ─────────────────────────────────────────────
// VivahBandhan API Service Layer (STRICT SAFE)
// ─────────────────────────────────────────────

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ??
  "https://matrimony.rukmantech.com/backend/api";

const TOKEN_KEY = "vb_token";
const USER_KEY = "vb_user";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface StoredUser {
  id: number;
  full_name: string;
  email: string;
  admin_approved: boolean;
  role?: "user" | "admin";
}

export interface ApiResponse<T = unknown> {
  success?: boolean;
  error?: string;
  errors?: string[];
  data?: T;
  [key: string]: unknown;
}

// ─────────────────────────────────────────────
// Token Service
// ─────────────────────────────────────────────

export const TokenService = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },

  removeToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  },

  getUser(): StoredUser | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as StoredUser;
    } catch {
      return null;
    }
  },

  setUser(user: StoredUser): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  removeUser(): void {
    localStorage.removeItem(USER_KEY);
  },

  isLoggedIn(): boolean {
    return Boolean(localStorage.getItem(TOKEN_KEY));
  },

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

// ─────────────────────────────────────────────
// API Error
// ─────────────────────────────────────────────

export class ApiError extends Error {
  readonly status: number;
  readonly data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

// ─────────────────────────────────────────────
// HTTP Helper
// ─────────────────────────────────────────────

async function request<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const token = TokenService.getToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers ?? {}),
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  let data: unknown;

  try {
    data = await response.json();
  } catch {
    throw new ApiError("Invalid server response", response.status);
  }

  if (!response.ok) {
    let message = `Request failed (${response.status})`;

    if (typeof data === "object" && data !== null) {
      const obj = data as { error?: string; errors?: string[] };

      if (typeof obj.error === "string") {
        message = obj.error;
      } else if (Array.isArray(obj.errors)) {
        message = obj.errors.join(", ");
      }
    }

    throw new ApiError(message, response.status, data);
  }

  return data as T;
}

// ─────────────────────────────────────────────
// AUTH API
// ─────────────────────────────────────────────

export const AuthAPI = {
  register(payload: unknown) {
    return request("/auth/register.php", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  verifyOTP(payload: unknown) {
    return request("/auth/verify-otp.php", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async login(payload: { email: string; password: string }) {
    const res = await request<{
      token: string;
      user: StoredUser;
    }>("/auth/login.php", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (typeof res.token === "string") {
      TokenService.setToken(res.token);
      TokenService.setUser({ ...res.user, role: "user" });
    }

    return res;
  },

  async adminLogin(payload: { username: string; password: string }) {
    const res = await request<{
      token: string;
      admin: { id: number; username: string; full_name: string };
    }>("/auth/admin-login.php", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (typeof res.token === "string") {
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

  logout(): void {
    TokenService.logout();
    window.location.href = "/";
  },
};

// ─────────────────────────────────────────────
// PROFILE API
// ─────────────────────────────────────────────

export const ProfileAPI = {
  getOwn() {
    return request("/profile/get.php");
  },

  get(userId: number) {
    return request(`/profile/get.php?user_id=${userId}`);
  },

  update(payload: unknown) {
    return request("/profile/update.php", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};

// ─────────────────────────────────────────────
// SEARCH API
// ─────────────────────────────────────────────

export const SearchAPI = {
  search(
    filters: Record<string, string | number | undefined> = {}
  ) {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        params.append(key, String(value));
      }
    });

    const query = params.toString();

    return request(
      `/search/index.php${query ? `?${query}` : ""}`
    );
  },
};

// ─────────────────────────────────────────────
// INTEREST API
// ─────────────────────────────────────────────

export const InterestAPI = {
  send(receiverId: number) {
    return request("/interest/send.php", {
      method: "POST",
      body: JSON.stringify({ receiver_id: receiverId }),
    });
  },

  respond(payload: unknown) {
    return request("/interest/respond.php", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  list(type: "sent" | "received") {
    return request(`/interest/list.php?type=${type}`);
  },
};

// ─────────────────────────────────────────────
// MESSAGES API
// ─────────────────────────────────────────────

export const MessagesAPI = {
  send(payload: unknown) {
    return request("/messages/send.php", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  getConversation(userId: number, page = 1) {
    return request(
      `/messages/conversation.php?user_id=${userId}&page=${page}`
    );
  },
};

// ─────────────────────────────────────────────
// PAYMENT API
// ─────────────────────────────────────────────

export const PaymentAPI = {
  createOrder(payload: unknown) {
    return request("/payment/create-order.php", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  verify(payload: unknown) {
    return request("/payment/verify.php", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};

// ─────────────────────────────────────────────
// ADMIN API
// ─────────────────────────────────────────────

export const AdminAPI = {
  getDashboard() {
    return request("/admin/dashboard.php");
  },

  getUsers(page = 1, status?: string) {
    const params = new URLSearchParams({ page: String(page) });
    if (status) params.append("status", status);

    return request(`/admin/users.php?${params.toString()}`);
  },

  manageUser(
    userId: number,
    action: "ban" | "suspend" | "activate"
  ) {
    return request("/admin/users.php", {
      method: "POST",
      body: JSON.stringify({ user_id: userId, action }),
    });
  },

  approveUser(payload: unknown) {
    return request("/admin/approve-user.php", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  approveInterest(payload: unknown) {
    return request("/admin/approve-interest.php", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  approvePhoto(payload: unknown) {
    return request("/admin/approve-photo.php", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  verifyId(payload: unknown) {
    return request("/admin/verify-id.php", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  getNotifications(page = 1) {
    return request(`/admin/notifications.php?page=${page}`);
  },
};
