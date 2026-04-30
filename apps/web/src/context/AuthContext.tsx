"use client";

import {
  createContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { useTranslation } from "react-i18next";
import type { User, LoginCredentials, AuthTokens } from "@/types";
import {
  login as apiLogin,
  logout as apiLogout,
  getMe,
  refreshToken as apiRefreshToken,
  updateProfile as apiUpdateProfile,
} from "@/services/apiClient";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  refreshToken: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEYS = {
  tokens: "acadivo-tokens",
  user: "acadivo-user",
};

function getStoredTokens(): AuthTokens | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.tokens);
    return raw ? (JSON.parse(raw) as AuthTokens) : null;
  } catch {
    return null;
  }
}

function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.user);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function setStoredAuth(user: User, tokens: AuthTokens) {
  localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
  localStorage.setItem(STORAGE_KEYS.tokens, JSON.stringify(tokens));
}

function clearStoredAuth() {
  localStorage.removeItem(STORAGE_KEYS.user);
  localStorage.removeItem(STORAGE_KEYS.tokens);
}

/**
 * Check if a token expiry timestamp is expired.
 * Handles both seconds and milliseconds formats safely.
 */
function isTokenExpired(expiresAt: number): boolean {
  const nowMs = Date.now();
  // If expiresAt > 1_000_000_000_000 it's in ms (year 33658 in seconds, but 2001 in ms)
  if (expiresAt > 1_000_000_000_000) {
    return expiresAt <= nowMs;
  }
  // Otherwise assume seconds
  return expiresAt <= nowMs / 1000;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Derived auth state: user must exist AND token must not be expired
  const isAuthenticated = useMemo(() => {
    if (!user) return false;
    const tokens = getStoredTokens();
    if (!tokens) return false;
    return !isTokenExpired(tokens.expiresAt);
  }, [user]);

  // Restore session on mount
  useEffect(() => {
    const init = async () => {
      const tokens = getStoredTokens();
      const storedUser = getStoredUser();

      if (tokens && storedUser && !isTokenExpired(tokens.expiresAt)) {
        try {
          const res = await getMe();
          if (res.success && res.data) {
            setUser(res.data);
            localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(res.data));
            if (res.data.preferredLanguage) {
              i18n.changeLanguage(res.data.preferredLanguage);
            }
          } else {
            clearStoredAuth();
            setUser(null);
          }
        } catch {
          clearStoredAuth();
          setUser(null);
        }
      } else {
        // No valid token or expired
        clearStoredAuth();
        setUser(null);
      }
      setIsLoading(false);
    };
    init();
  }, [i18n]);

  // Listen for session expired events
  useEffect(() => {
    const handleSessionExpired = () => {
      clearStoredAuth();
      setUser(null);
    };
    window.addEventListener("acadivo:sessionExpired", handleSessionExpired);
    return () =>
      window.removeEventListener("acadivo:sessionExpired", handleSessionExpired);
  }, []);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      setIsLoading(true);
      try {
        const res = await apiLogin(credentials);
        if (!res.success || !res.data) {
          throw new Error(res.error || "Login failed");
        }
        const { user, tokens } = res.data;
        setUser(user);
        setStoredAuth(user, tokens);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = useCallback(() => {
    clearStoredAuth();
    setUser(null);
    // Best-effort server-side logout
    apiLogout().catch(() => {
      /* ignore network errors on logout */
    });
  }, []);

  const updateProfile = useCallback(
    async (data: Partial<User>) => {
      setIsLoading(true);
      try {
        const res = await apiUpdateProfile(data);
        if (res.success && res.data) {
          setUser(res.data);
          localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(res.data));
        } else {
          throw new Error(res.error || "Profile update failed");
        }
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const refreshToken = useCallback(async () => {
    const tokens = getStoredTokens();
    if (!tokens) return;
    try {
      const res = await apiRefreshToken(tokens.refreshToken);
      if (res.success && res.data) {
        localStorage.setItem(STORAGE_KEYS.tokens, JSON.stringify(res.data));
      } else {
        logout();
      }
    } catch {
      logout();
    }
  }, [logout]);

  // Auto refresh token before expiry
  useEffect(() => {
    if (!user) return;
    const tokens = getStoredTokens();
    if (!tokens) return;

    const expiresAt = tokens.expiresAt;
    const nowMs = Date.now();
    const expiryMs =
      expiresAt > 1_000_000_000_000 ? expiresAt : expiresAt * 1000;
    const refreshIn = expiryMs - nowMs - 60000; // refresh 1 min before expiry

    if (refreshIn <= 0) {
      refreshToken();
      return;
    }

    const timer = setTimeout(() => {
      refreshToken();
    }, refreshIn);

    return () => clearTimeout(timer);
  }, [user, refreshToken]);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated,
      login,
      logout,
      updateProfile,
      refreshToken,
    }),
    [user, isLoading, isAuthenticated, login, logout, updateProfile, refreshToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
