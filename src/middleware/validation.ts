import { Request, Response, NextFunction } from "express";
import { businessDateRequestSchema } from "../schemas/businessDateRequestSchema";
import { BusinessDateRequest } from "../types/request";

/**
 * Middleware de validación para parámetros de consulta usando Zod
 * Maneja automáticamente todas las validaciones:
 * - Conversión de string a number para days/hours
 * - Validación de números enteros positivos
 * - Validación de formato de fecha ISO 8601
 * - Validación de que al menos uno de days/hours esté presente
 */
export const validateBusinessDateRequest = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    // Extraer parámetros de la query string
    const { days, hours, date } = req.query;

    // Preparar objeto para validación con Zod
    const params: Record<string, unknown> = {};

    // Solo agregar parámetros que existen
    if (days !== undefined) {
      params["days"] = days;
    }
    if (hours !== undefined) {
      params["hours"] = hours;
    }
    if (date !== undefined) {
      params["date"] = date;
    }

    // Validar usando el esquema Zod (incluye transformaciones automáticas)
    const validatedParams = businessDateRequestSchema.parse(params);

    // Agregar parámetros validados al request para uso posterior
    req.validatedParams = validatedParams as BusinessDateRequest;

    next();
  } catch (error) {
    // Zod maneja automáticamente todos los errores de validación
    // Solo necesitamos pasarlo al error handler
    next(error);
  }
};
