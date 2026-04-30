import client from "prom-client";

// Create a Registry to register the metrics
const register = new client.Registry();

// Add default metrics (CPU, memory, event loop lag, etc.)
client.collectDefaultMetrics({
  register,
  prefix: "acadivo_",
  gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
});

// ── Custom Application Metrics ─────────────────────────────────────────────

// HTTP request counter
export const httpRequestCounter = new client.Counter({
  name: "acadivo_http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status"],
  registers: [register],
});

// HTTP request duration histogram
export const httpRequestDuration = new client.Histogram({
  name: "acadivo_http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status"],
  buckets: [0.001, 0.005, 0.015, 0.05, 0.1, 0.2, 0.3, 0.5, 1, 2, 5],
  registers: [register],
});

// Active connections gauge
export const activeConnectionsGauge = new client.Gauge({
  name: "acadivo_active_connections",
  help: "Number of active connections",
  registers: [register],
});

// Database query duration
export const dbQueryDuration = new client.Histogram({
  name: "acadivo_db_query_duration_seconds",
  help: "Duration of database queries in seconds",
  labelNames: ["operation", "table"],
  buckets: [0.001, 0.005, 0.015, 0.05, 0.1, 0.5, 1],
  registers: [register],
});

// Redis connection status
export const redisConnectedGauge = new client.Gauge({
  name: "acadivo_redis_connected",
  help: "Redis connection status (1 = connected, 0 = disconnected)",
  registers: [register],
});

// Socket.io connections gauge
export const socketConnectionsGauge = new client.Gauge({
  name: "acadivo_socket_connections_active",
  help: "Number of active Socket.io connections",
  registers: [register],
});

// User registration counter
export const userRegistrationCounter = new client.Counter({
  name: "acadivo_user_registrations_total",
  help: "Total number of user registrations",
  labelNames: ["role"],
  registers: [register],
});

// API errors counter
export const apiErrorCounter = new client.Counter({
  name: "acadivo_api_errors_total",
  help: "Total number of API errors",
  labelNames: ["type"],
  registers: [register],
});

export { register };
