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
import { mockApi } from "@/services/mockApi";

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation();
  const [user, setUser] = useState<User | null>(getStoredUser);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Restore session on mount
  useEffect(() => {
    const init = async () => {
      const tokens = getStoredTokens();
      if (tokens && tokens.expiresAt > Date.now()) {
        try {
          const res = await mockApi.getMe();
          if (res.success && res.data) {
            setUser(res.data);
            if (res.data.preferredLanguage) {
              i18n.changeLanguage(res.data.preferredLanguage);
            }
          } else {
            clearStoredAuth();
          }
        } catch {
          clearStoredAuth();
        }
      } else if (tokens) {
        // Token expired
        clearStoredAuth();
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
        const res = await mockApi.login(credentials);
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
    mockApi.logout();
  }, []);

  const updateProfile = useCallback(
    async (data: Partial<User>) => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));
        const updated = { ...user!, ...data, updatedAt: new Date().toISOString() };
        setUser(updated);
        localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(updated));
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );

  const refreshToken = useCallback(async () => {
    const tokens = getStoredTokens();
    if (!tokens) return;
    try {
      const res = await mockApi.refreshToken(tokens.refreshToken);
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

    const refreshIn = tokens.expiresAt - Date.now() - 60000; // refresh 1 min before expiry
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
