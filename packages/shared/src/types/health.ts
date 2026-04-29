/**
 * Health check types
 */

export interface HealthCheck {
  status: "ok" | "degraded" | "error";
  service: string;
  version: string;
  timestamp: string;
  uptime: number;
  checks: HealthCheckDetail[];
}

export interface HealthCheckDetail {
  name: string;
  status: "ok" | "degraded" | "error";
  responseTime?: number;
  error?: string;
}

export interface ServiceHealth {
  database: "connected" | "disconnected";
  redis: "connected" | "disconnected";
  memory: { used: number; total: number; percentage: number };
  cpu: { loadAvg: number[] };
}
