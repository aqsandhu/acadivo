import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import axios, { AxiosError, AxiosRequestConfig, Method } from "axios";
import type { ApiResponse } from "@/types";

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (body?: unknown, config?: AxiosRequestConfig) => Promise<T | null>;
  refetch: () => Promise<T | null>;
  reset: () => void;
}

export function useApi<T>(
  url: string,
  method: Method = "GET",
  defaultBody?: unknown,
  defaultConfig?: AxiosRequestConfig
): UseApiReturn<T> {
  const { t } = useTranslation();
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (body?: unknown, config?: AxiosRequestConfig): Promise<T | null> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const requestBody = body !== undefined ? body : defaultBody;
        const mergedConfig = { ...defaultConfig, ...config };
        const response = await axios({
          url,
          method,
          data: requestBody,
          ...mergedConfig,
        });
        const result = response.data as ApiResponse<T>;
        if (result.success && result.data !== undefined) {
          setState({ data: result.data, loading: false, error: null });
          return result.data;
        }
        throw new Error(result.error || result.message || t("common.error"));
      } catch (err) {
        const axiosError = err as AxiosError<ApiResponse<unknown>>;
        const message =
          axiosError.response?.data?.error ||
          axiosError.response?.data?.message ||
          axiosError.message ||
          t("common.error");
        setState({ data: null, loading: false, error: message });
        return null;
      }
    },
    [url, method, defaultBody, defaultConfig, t]
  );

  const refetch = useCallback(() => {
    return execute(defaultBody, defaultConfig);
  }, [execute, defaultBody, defaultConfig]);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, execute, refetch, reset };
}
