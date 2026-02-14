/**
 * Auth hook — provides current user state and auth helpers.
 * Wraps TokenService for React components.
 */
import { useState, useEffect, useCallback } from "react";
import { TokenService, AuthAPI, type StoredUser } from "@/lib/api";

interface AuthState {
  user: StoredUser | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  logout: () => void;
  refreshUser: () => void;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<StoredUser | null>(
    TokenService.getUser()
  );

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(
    TokenService.isLoggedIn()
  );

  useEffect(() => {
    const sync = () => {
      setUser(TokenService.getUser());
      setIsLoggedIn(TokenService.isLoggedIn());
    };

    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const logout = useCallback(() => {
    AuthAPI.logout();
    setUser(null);
    setIsLoggedIn(false);
  }, []);

  const refreshUser = useCallback(() => {
    setUser(TokenService.getUser());
    setIsLoggedIn(TokenService.isLoggedIn());
  }, []);

  return {
    user,
    isLoggedIn,
    isAdmin: Boolean(user && user.role === "admin"), // ✅ forced boolean
    logout,
    refreshUser,
  };
}
