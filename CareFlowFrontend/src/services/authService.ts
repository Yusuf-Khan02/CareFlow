import { apiRequest, ApiError } from "./apiClient";
import type { User, AuthResponse, UserRole } from "../types";

const TOKEN_KEY = "careflow_token";
const REFRESH_TOKEN_KEY = "careflow_refresh_token";
const USER_KEY = "careflow_user";

// Synthetic demo users for resilient offline fallback
const FALLBACK_USERS: Record<string, User> = {
  "admin@careflow.demo": {
    id: "demo-admin",
    email: "admin@careflow.demo",
    name: "Dr. Alexander Davis",
    role: "Admin",
    status: "Active",
  },
  "dr.sharma@careflow.demo": {
    id: "demo-doctor",
    email: "dr.sharma@careflow.demo",
    name: "Dr. Rahul Sharma",
    role: "Doctor",
    status: "Active",
  },
  "nurse.patel@careflow.demo": {
    id: "demo-nurse",
    email: "nurse.patel@careflow.demo",
    name: "Sister Priya Patel",
    role: "Nurse",
    status: "Active",
  },
  "reception@careflow.demo": {
    id: "demo-reception",
    email: "reception@careflow.demo",
    name: "Ananya Roy",
    role: "Receptionist",
    status: "Active",
  },
  "lab@careflow.demo": {
    id: "demo-lab",
    email: "lab@careflow.demo",
    name: "Vikram Sen",
    role: "LabTech",
    status: "Active",
  },
  "pharmacy@careflow.demo": {
    id: "demo-pharmacy",
    email: "pharmacy@careflow.demo",
    name: "Sunil Joshi",
    role: "Pharmacist",
    status: "Active",
  },
  "patient@careflow.demo": {
    id: "demo-patient",
    email: "patient@careflow.demo",
    name: "Rahul Sharma",
    role: "Patient",
    status: "Active",
  },
};

export const authService = {
  getStoredToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  getStoredUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  setAuthSession(token: string, user: User, refreshToken?: string) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  },

  clearAuthSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  /**
   * Authenticate user with credentials.
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await apiRequest<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      this.setAuthSession(
        response.data.token,
        response.data.user,
        response.data.refreshToken
      );

      return response.data;
    } catch (err: any) {
      // Offline fallback handling
      if (err instanceof ApiError && err.code === "NETWORK_ERROR") {
        console.warn("API offline; verifying against synthetic demo credentials.");
        const fallback = FALLBACK_USERS[email.toLowerCase()];
        if (fallback && password === "CareFlow@2026") {
          const fakeToken = `demo_offline_token_${Date.now()}`;
          this.setAuthSession(fakeToken, fallback);
          return {
            user: fallback,
            token: fakeToken,
          };
        }
      }
      throw err;
    }
  },

  /**
   * Provision new user account (Admin only).
   */
  async register(data: {
    email: string;
    password: string;
    name: string;
    role: UserRole;
  }): Promise<User> {
    const response = await apiRequest<User>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.data;
  },

  /**
   * Terminate active session and clear token.
   */
  async logout(): Promise<void> {
    try {
      await apiRequest<{ success: boolean }>("/auth/logout", {
        method: "POST",
      });
    } catch {
      // Ignore network errors on logout
    } finally {
      this.clearAuthSession();
    }
  },

  /**
   * Fetch current authenticated user profile from backend.
   */
  async getMe(): Promise<User> {
    try {
      const response = await apiRequest<User>("/auth/me");
      localStorage.setItem(USER_KEY, JSON.stringify(response.data));
      return response.data;
    } catch (err) {
      const cached = this.getStoredUser();
      if (cached) return cached;
      throw err;
    }
  },
};

export default authService;
