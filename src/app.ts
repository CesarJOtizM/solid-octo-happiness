import express from "express";
import { logger } from "utils";
import { loggingMiddleware } from "middleware";
import { healthRoutes } from "routes";

const app = express();
const PORT = process.env["PORT"] ?? 3000;

app.use(express.json());
app.use(loggingMiddleware);

app.use("/", healthRoutes);

app.listen(PORT, () => {
  logger.info(`Servidor ejecutándose en puerto ${PORT}`, "Server");
  logger.info(
    "API de Fechas Hábiles - Colombia iniciada correctamente",
    "Server"
  );
});

export default app;
