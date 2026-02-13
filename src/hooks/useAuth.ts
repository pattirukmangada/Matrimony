/**
 * Auth hook — provides current user state and auth helpers.
 * Wraps TokenService for React components.
 */
import { useState, useEffect, useCallback } from 'react';
import { TokenService, AuthAPI, type StoredUser } from '@/lib/api';
export function useAuth() {
  const [user, setUser] = useState<StoredUser | null>(TokenService.getUser());
  const [isLoggedIn, setIsLoggedIn] = useState(TokenService.isLoggedIn());
  useEffect(() => {
    // Sync state when storage changes (multi-tab support)
    const sync = () => {
      setUser(TokenService.getUser());
      setIsLoggedIn(TokenService.isLoggedIn());
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
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
    isAdmin: user?.role === 'admin',
    logout,
    refreshUser,
  };
}