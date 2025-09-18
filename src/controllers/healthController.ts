import { Request, Response } from "express";
import { HealthCheckResponse } from "types/health";
import { logger } from "utils/logger";

/**
 * Controlador para el health check de la API
 */
export const getHealthCheck = (_req: Request, res: Response): void => {
  try {
    const healthData: HealthCheckResponse = {
      name: "API de Fechas Hábiles - Colombia",
      version: "1.0.0",
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env["NODE_ENV"] ?? "development",
    };

    logger.info("Health check requested", "HealthCheck", healthData);
    res.json(healthData);
  } catch (error) {
    logger.error("Error in health check", "HealthCheck", error);
    res.status(500).json({
      name: "API de Fechas Hábiles - Colombia",
      version: "1.0.0",
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env["NODE_ENV"] ?? "development",
      error: "Internal server error",
    });
  }
};
