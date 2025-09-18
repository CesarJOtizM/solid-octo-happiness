import { z } from "zod";
import { isValidIsoDate } from "utils/timezoneUtils";

export const businessDateRequestSchema = z
  .object({
    days: z
      .number()
      .int("El parámetro 'days' debe ser un número entero")
      .min(0, "El parámetro 'days' debe ser un número positivo")
      .optional(),
    hours: z
      .number()
      .int("El parámetro 'hours' debe ser un número entero")
      .min(0, "El parámetro 'hours' debe ser un número positivo")
      .optional(),
    date: z
      .string()
      .refine(
        val => isValidIsoDate(val),
        "El parámetro 'date' debe ser una fecha válida en formato ISO 8601 UTC (YYYY-MM-DDTHH:mm:ssZ)"
      )
      .optional(),
  })
  .refine(data => data.days !== undefined || data.hours !== undefined, {
    message:
      "Se debe proporcionar al menos uno de los parámetros: days o hours",
    path: ["days", "hours"], // Indica que el error afecta ambos campos
  });
