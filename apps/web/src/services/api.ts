import axios, { AxiosInstance, AxiosError } from "axios";
import type { ApiResponse, AuthTokens } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Request interceptor: add auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const tokensRaw = localStorage.getItem("acadivo-tokens");
      if (tokensRaw) {
        try {
          const tokens: AuthTokens = JSON.parse(tokensRaw);
          if (tokens.accessToken) {
            config.headers.Authorization = `Bearer ${tokens.accessToken}`;
          }
        } catch {
          // ignore invalid token
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle errors
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse<unknown>>) => {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      if (status === 401) {
        // Token expired - try refresh or logout
        if (typeof window !== "undefined") {
          const tokensRaw = localStorage.getItem("acadivo-tokens");
          if (tokensRaw) {
            try {
              const tokens: AuthTokens = JSON.parse(tokensRaw);
              if (tokens.refreshToken) {
                try {
                  const refreshResponse = await axios.post<ApiResponse<AuthTokens>>(
                    `${API_BASE_URL}/auth/refresh`,
                    { refreshToken: tokens.refreshToken }
                  );
                  if (refreshResponse.data.success && refreshResponse.data.data) {
                    localStorage.setItem(
                      "acadivo-tokens",
                      JSON.stringify(refreshResponse.data.data)
                    );
                    // Retry original request
                    if (error.config) {
                      error.config.headers.Authorization = `Bearer ${refreshResponse.data.data.accessToken}`;
                      return axios(error.config);
                    }
                  }
                } catch {
                  // refresh failed
                }
              }
            } catch {
              // ignore
            }
          }
          // Clear auth and redirect
          localStorage.removeItem("acadivo-tokens");
          localStorage.removeItem("acadivo-user");
          window.dispatchEvent(new CustomEvent("acadivo:sessionExpired"));
        }
      }

      if (status === 403) {
        // Forbidden
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("acadivo:error", {
              detail: data?.error || "Access denied",
            })
          );
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
