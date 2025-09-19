import { Router } from "express";
import { getHealthCheck } from "controllers/healthController";

const router = Router();

// GET /health
router.get("/health", getHealthCheck);

export default router;
