import { z } from "zod";
import { config } from "dotenv";

// Cargar variables de entorno
config();

export const envSchema = z.object({
  PORT: z
    .string()
    .default("3000")
    .transform(val => parseInt(val, 10))
    .refine(val => val > 0 && val < 65536, {
      message: "PORT debe ser un número entre 1 y 65535",
    }),

  HOLIDAY_API_URL: z
    .url("HOLIDAY_API_URL debe ser una URL válida")
    .default("https://content.capta.co/Recruitment/WorkingDays.json"),

  // Zona horaria de Colombia
  TIMEZONE: z
    .string()
    .default("America/Bogota")
    .refine(
      val => {
        try {
          Intl.DateTimeFormat(undefined, { timeZone: val });
          return true;
        } catch {
          return false;
        }
      },
      {
        message: "TIMEZONE debe ser una zona horaria válida",
      }
    ),

  // Configuración de horario laboral
  WORK_START_HOUR: z
    .string()
    .default("8")
    .transform(val => parseInt(val, 10))
    .refine(val => val >= 0 && val <= 23, {
      message: "WORK_START_HOUR debe ser un número entre 0 y 23",
    }),

  WORK_END_HOUR: z
    .string()
    .default("17")
    .transform(val => parseInt(val, 10))
    .refine(val => val >= 0 && val <= 23, {
      message: "WORK_END_HOUR debe ser un número entre 0 y 23",
    }),

  LUNCH_START_HOUR: z
    .string()
    .default("12")
    .transform(val => parseInt(val, 10))
    .refine(val => val >= 0 && val <= 23, {
      message: "LUNCH_START_HOUR debe ser un número entre 0 y 23",
    }),

  LUNCH_END_HOUR: z
    .string()
    .default("13")
    .transform(val => parseInt(val, 10))
    .refine(val => val >= 0 && val <= 23, {
      message: "LUNCH_END_HOUR debe ser un número entre 0 y 23",
    }),

  // Configuración de caché (en minutos)
  CACHE_TTL_MINUTES: z
    .string()
    .default("60")
    .transform(val => parseInt(val, 10))
    .refine(val => val > 0, {
      message: "CACHE_TTL_MINUTES debe ser un número positivo",
    }),

  // Entorno de ejecución
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(): EnvConfig {
  try {
    const env = envSchema.parse(process.env);

    // Validaciones adicionales de lógica de negocio
    if (env.WORK_START_HOUR >= env.WORK_END_HOUR) {
      throw new Error("WORK_START_HOUR debe ser menor que WORK_END_HOUR");
    }

    if (env.LUNCH_START_HOUR >= env.LUNCH_END_HOUR) {
      throw new Error("LUNCH_START_HOUR debe ser menor que LUNCH_END_HOUR");
    }

    if (
      env.LUNCH_START_HOUR < env.WORK_START_HOUR ||
      env.LUNCH_END_HOUR > env.WORK_END_HOUR
    ) {
      throw new Error(
        "El horario de almuerzo debe estar dentro del horario laboral"
      );
    }

    return env;
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues.map(
        (err: z.ZodIssue) => `${err.path.join(".")}: ${err.message}`
      );
      throw new Error(
        `Error de validación de variables de entorno:\n${errorMessages.join("\n")}`
      );
    }
    throw error;
  }
}

export const env = validateEnv();
