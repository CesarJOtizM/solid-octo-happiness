import { Request, Response, NextFunction } from "express";
import { logger } from "utils/logger";

export const loggingMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const startTime = Date.now();

  logger.apiRequest(req.method, req.url, {
    query: req.query,
    body: req.body,
  });

  res.on("finish", () => {
    const responseTime = Date.now() - startTime;
    logger.apiResponse(res.statusCode, responseTime);
  });

  next();
};
