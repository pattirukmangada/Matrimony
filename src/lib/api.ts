/**
 * VivahBandhan - API Service Layer
 * 
 * Connects React frontend to PHP REST API backend.
 * Handles JWT token management, request/response formatting,
 * and all API endpoint calls.
 * 
 * Configuration:
 *   Set VITE_API_BASE_URL in your .env file:
 *   VITE_API_BASE_URL=http://localhost/vivahbandhan/backend/api
 */
// ─── Config ───────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost/vivahbandhan/backend/api';
// ─── Token Management ─────────────────────────────────────────
const TOKEN_KEY = 'vb_token';
const USER_KEY = 'vb_user';
export const TokenService = {
  getToken: (): string | null => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  removeToken: () => localStorage.removeItem(TOKEN_KEY),
  getUser: (): StoredUser | null => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  setUser: (user: StoredUser) => localStorage.setItem(USER_KEY, JSON.stringify(user)),
  removeUser: () => localStorage.removeItem(USER_KEY),
  isLoggedIn: (): boolean => !!localStorage.getItem(TOKEN_KEY),
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};
// ─── Types ────────────────────────────────────────────────────
export interface StoredUser {
  id: number;
  full_name: string;
  email: string;
  admin_approved: boolean;
  role?: 'user' | 'admin';
}
export interface ApiResponse<T = unknown> {
  success?: boolean;
  error?: string;
  errors?: string[];
  data?: T;
  [key: string]: unknown;
}
export interface RegisterPayload {
  full_name: string;
  email: string;
  mobile: string;
  password: string;
}
export interface LoginPayload {
  email: string;
  password: string;
}
export interface OTPPayload {
  identifier: string;
  type: 'email' | 'sms';
  otp: string;
}
export interface ProfileUpdatePayload {
  gender?: string;
  date_of_birth?: string;
  height_cm?: number;
  religion?: string;
  caste?: string;
  mother_tongue?: string;
  marital_status?: string;
  city?: string;
  state?: string;
  education?: string;
  profession?: string;
  company?: string;
  annual_income?: string;
  about_me?: string;
  partner_preferences?: {
    preferred_age_min?: number;
    preferred_age_max?: number;
    preferred_religion?: string;
    preferred_caste?: string;
    preferred_education?: string;
    preferred_location?: string;
    preferred_income?: string;
    expectations?: string;
  };
}
export interface SearchFilters {
  age_min?: number;
  age_max?: number;
  religion?: string;
  caste?: string;
  city?: string;
  education?: string;
  income?: string;
  marital_status?: string;
  page?: number;
  limit?: number;
}
export interface InterestRespondPayload {
  interest_id: number;
  action: 'accept' | 'reject';
}
export interface MessagePayload {
  receiver_id: number;
  message: string;
}
export interface PaymentOrderPayload {
  plan: 'gold' | 'platinum';
}
export interface PaymentVerifyPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  plan: string;
}
export interface AdminActionPayload {
  user_id?: number;
  interest_id?: number;
  photo_id?: number;
  verification_id?: number;
  action: 'approve' | 'reject';
  reason?: string;
}
// ─── HTTP Helper ──────────────────────────────────────────────
async function request<T = ApiResponse>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const token = TokenService.getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const response = await fetch(url, {
    ...options,
    headers,
  });
  const data = await response.json();
  if (!response.ok) {
    const errorMsg = data.error || data.errors?.join(', ') || `Request failed (${response.status})`;
    throw new ApiError(errorMsg, response.status, data);
  }
  return data as T;
}
export class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}
// ─── Auth API ─────────────────────────────────────────────────
export const AuthAPI = {
  /**
   * Register new user → sends OTP to email + mobile
   */
  register: async (payload: RegisterPayload) => {
    const res = await request<ApiResponse & { user_id: number }>('/auth/register.php', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res;
  },
  /**
   * Verify email or mobile OTP
   */
  verifyOTP: async (payload: OTPPayload) => {
    const res = await request<ApiResponse & { both_verified: boolean }>('/auth/verify-otp.php', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res;
  },
  /**
   * Login → returns JWT token + user info
   */
  login: async (payload: LoginPayload) => {
    const res = await request<ApiResponse & { token: string; user: StoredUser }>('/auth/login.php', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (res.token) {
      TokenService.setToken(res.token);
      TokenService.setUser({ ...res.user, role: 'user' });
    }
    return res;
  },
  /**
   * Admin login → returns JWT token
   */
  adminLogin: async (payload: { username: string; password: string }) => {
    const res = await request<ApiResponse & { token: string; admin: { id: number; username: string; full_name: string } }>('/auth/admin-login.php', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (res.token) {
      TokenService.setToken(res.token);
      TokenService.setUser({
        id: res.admin.id,
        full_name: res.admin.full_name,
        email: res.admin.username,
        admin_approved: true,
        role: 'admin',
      });
    }
    return res;
  },
  /** Logout — clear local storage */
  logout: () => {
    TokenService.logout();
    window.location.href = '/login';
  },
};
// ─── Profile API ──────────────────────────────────────────────
export const ProfileAPI = {
  /**
   * Get profile by user ID (access-controlled by backend)
   */
  get: (userId: number) =>
    request(`/profile/get.php?user_id=${userId}`),
  /**
   * Get own profile
   */
  getOwn: () => {
    const user = TokenService.getUser();
    if (!user) throw new ApiError('Not logged in', 401);
    return request(`/profile/get.php?user_id=${user.id}`);
  },
  /**
   * Update own profile + partner preferences
   */
  update: (payload: ProfileUpdatePayload) =>
    request('/profile/update.php', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
// ─── Search API ───────────────────────────────────────────────
export const SearchAPI = {
  /**
   * Search admin-approved profiles with filters
   */
  search: (filters: SearchFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, String(value));
      }
    });
    return request(`/search/index.php?${params.toString()}`);
  },
};
// ─── Interest API ─────────────────────────────────────────────
export const InterestAPI = {
  /**
   * Send interest to another user (admin notified)
   */
  send: (receiverId: number) =>
    request('/interest/send.php', {
      method: 'POST',
      body: JSON.stringify({ receiver_id: receiverId }),
    }),
  /**
   * Accept or reject an interest
   */
  respond: (payload: InterestRespondPayload) =>
    request('/interest/respond.php', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  /**
   * List interests (sent or received)
   */
  list: (type: 'sent' | 'received') =>
    request(`/interest/list.php?type=${type}`),
};
// ─── Messages API ─────────────────────────────────────────────
export const MessagesAPI = {
  /**
   * Send a message (Gold/Platinum only)
   */
  send: (payload: MessagePayload) =>
    request('/messages/send.php', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  /**
   * Get conversation with a user (polling-based)
   */
  getConversation: (userId: number, page = 1) =>
    request(`/messages/conversation.php?user_id=${userId}&page=${page}`),
};
// ─── Payment API ──────────────────────────────────────────────
export const PaymentAPI = {
  /**
   * Create Razorpay order for subscription
   */
  createOrder: (payload: PaymentOrderPayload) =>
    request('/payment/create-order.php', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  /**
   * Verify payment after Razorpay checkout
   */
  verify: (payload: PaymentVerifyPayload) =>
    request('/payment/verify.php', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
// ─── Admin API ────────────────────────────────────────────────
export const AdminAPI = {
  /** Dashboard analytics + pending counts */
  getDashboard: () => request('/admin/dashboard.php'),
  /** List / manage users */
  getUsers: (page = 1, status?: string) => {
    const params = new URLSearchParams({ page: String(page) });
    if (status) params.append('status', status);
    return request(`/admin/users.php?${params.toString()}`);
  },
  /** Ban or suspend a user */
  manageUser: (userId: number, action: 'ban' | 'suspend' | 'activate') =>
    request('/admin/users.php', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, action }),
    }),
  /** Approve / reject user registration */
  approveUser: (payload: AdminActionPayload) =>
    request('/admin/approve-user.php', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  /** Approve / reject interest */
  approveInterest: (payload: AdminActionPayload) =>
    request('/admin/approve-interest.php', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  /** Approve / reject photo */
  approvePhoto: (payload: AdminActionPayload) =>
    request('/admin/approve-photo.php', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  /** Approve / reject ID verification */
  verifyId: (payload: AdminActionPayload) =>
    request('/admin/verify-id.php', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  /** Get admin notifications */
  getNotifications: (page = 1) =>
    request(`/admin/notifications.php?page=${page}`),
};