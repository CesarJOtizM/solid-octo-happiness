/**
 * Tipos para el health check de la API
 */

export interface HealthCheckResponse {
  name: string;
  version: string;
  status: "healthy" | "unhealthy" | "degraded";
  timestamp: string;
  uptime: number;
  environment: string;
}

export interface HealthCheckDetails {
  database?: {
    status: "connected" | "disconnected";
    responseTime?: number;
  };
  externalServices?: {
    holidayApi?: {
      status: "available" | "unavailable";
      responseTime?: number;
    };
  };
  memory?: {
    used: number;
    total: number;
    percentage: number;
  };
}
