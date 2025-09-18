import { logger } from "utils";

export function validateEnvironment(): void {
  try {
    const { config } = require("config");

    logger.info(
      "✅ Variables de entorno validadas correctamente",
      "Environment"
    );
    logger.info(`🌍 Entorno: ${config.server.nodeEnv}`, "Environment");
    logger.info(`🚀 Puerto: ${config.server.port}`, "Environment");
    logger.info(`⏰ Zona horaria: ${config.timezone.default}`, "Environment");
    logger.info(
      `🏢 Horario laboral: ${config.workSchedule.startHour}:00 - ${config.workSchedule.endHour}:00`,
      "Environment"
    );
    logger.info(
      `🍽️ Horario de almuerzo: ${config.workSchedule.lunchStartHour}:00 - ${config.workSchedule.lunchEndHour}:00`,
      "Environment"
    );
    logger.info(
      `📡 API de días festivos: ${config.holidayApi.url}`,
      "Environment"
    );
    logger.info(
      `💾 TTL de caché: ${config.cache.ttlMinutes} minutos`,
      "Environment"
    );
  } catch (error) {
    logger.error("❌ Error al validar variables de entorno", "Environment", {
      error,
    });
    process.exit(1);
  }
}
