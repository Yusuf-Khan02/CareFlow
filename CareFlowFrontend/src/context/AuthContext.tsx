import React, { createContext, useContext, useState, useEffect } from "react";
import type { User, UserRole } from "../types";
import { authService } from "../services/authService";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (...roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => authService.getStoredUser());
  const [token, setToken] = useState<string | null>(() => authService.getStoredToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Validate active session on initial application load
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = authService.getStoredToken();
      if (storedToken) {
        try {
          const freshUser = await authService.getMe();
          setUser(freshUser);
        } catch (error) {
          console.warn("Session expired or invalid. Resetting authentication state.", error);
          authService.clearAuthSession();
          setUser(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    const result = await authService.login(email, password);
    setUser(result.user);
    setToken(result.token);
  };

  const logout = async (): Promise<void> => {
    await authService.logout();
    setUser(null);
    setToken(null);
  };

  const hasRole = (...roles: UserRole[]): boolean => {
    if (!user) return false;
    // Admins have clearance across all clinical and administrative modules
    if (user.role === "Admin" || user.role === "Hospital Admin") return true;
    return roles.includes(user.role);
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    logout,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
