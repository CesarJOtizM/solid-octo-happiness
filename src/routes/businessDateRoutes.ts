import { Router } from "express";
import { validateBusinessDateRequest } from "middleware/validation";
import { getBusinessDate } from "controllers/businessDateController";

const router = Router();

router.get("/business-date", validateBusinessDateRequest, getBusinessDate);

export default router;
