import { Router } from "express";
import { getHealthCheck } from "controllers/healthController";

const router = Router();

// GET /health
router.get("/health", getHealthCheck);

// GET / (raíz también es health check)
router.get("/", getHealthCheck);

export default router;
