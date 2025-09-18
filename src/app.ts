import express from "express";
import { logger } from "utils";
import {
  loggingMiddleware,
  validateEnvironment,
  errorHandler,
  notFoundHandler,
} from "middleware";
import { healthRoutes } from "routes";
import { config } from "config";

validateEnvironment();

const app = express();
const PORT = config.server.port;

app.use(express.json());
app.use(loggingMiddleware);
app.use("/", healthRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Servidor ejecutándose en puerto ${PORT}`, "Server");
  logger.info(
    "API de Fechas Hábiles - Colombia iniciada correctamente",
    "Server"
  );
});

export default app;
