"use client";

import { useState, useEffect, useCallback } from "react";

export interface LowBandwidthState {
  dataSaver: boolean;
  lazyLoadImages: boolean;
  skeletonLoaders: boolean;
  imageQuality: "high" | "low" | "none";
}

const STORAGE_KEY = "acadivo_low_bandwidth";

const defaultState: LowBandwidthState = {
  dataSaver: false,
  lazyLoadImages: true,
  skeletonLoaders: true,
  imageQuality: "high",
};

export function useLowBandwidth() {
  const [state, setState] = useState<LowBandwidthState>(defaultState);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setState({ ...defaultState, ...parsed });
      }
    } catch {
      // ignore
    }
    setLoaded(true);
  }, []);

  const update = useCallback((patch: Partial<LowBandwidthState>) => {
    setState((prev) => {
      const next = { ...prev, ...patch };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const toggleDataSaver = useCallback(() => {
    update({ dataSaver: !state.dataSaver, imageQuality: state.dataSaver ? "high" : "low" });
  }, [state.dataSaver, update]);

  return { state, update, toggleDataSaver, loaded };
}
