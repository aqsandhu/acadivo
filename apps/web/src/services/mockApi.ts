// ═══════════════════════════════════════════════════════════════
// Re-export from real API client — all mock data replaced
// ═══════════════════════════════════════════════════════════════

export * from "./apiClient";
export { mockApi as default } from "./apiClient";
