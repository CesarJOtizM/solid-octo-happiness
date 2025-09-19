import { Request, Response } from "express";
import { logger } from "utils";
import {
  calculateBusinessDate,
  formatBusinessDateResponse,
  formatBusinessDateError,
} from "../services/businessDateService";
import { BusinessDateRequest } from "../types/request";

export const getBusinessDate = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const validatedParams = req.validatedParams as BusinessDateRequest;

    logger.info(
      `Calculando fecha hábil para: ${JSON.stringify(validatedParams)}`,
      "BusinessDateController"
    );

    const calculationResult = await calculateBusinessDate(validatedParams);

    if (calculationResult.success) {
      const response = formatBusinessDateResponse(calculationResult);

      logger.info(
        `Fecha hábil calculada: ${response.date}`,
        "BusinessDateController"
      );

      res.status(200).json(response);
    } else {
      const errorResponse = formatBusinessDateError(calculationResult);

      logger.warn(
        `Error en cálculo de fecha hábil: ${errorResponse.message}`,
        "BusinessDateController"
      );

      const statusCode =
        calculationResult.error === "HolidayServiceError" ? 503 : 400;

      res.status(statusCode).json(errorResponse);
    }
  } catch (error) {
    logger.error(
      `Error inesperado en controlador: ${error instanceof Error ? error.message : "Error desconocido"}`,
      "BusinessDateController",
      { error }
    );

    res.status(500).json({
      error: "InternalServerError",
      message: "Error interno del servidor",
    });
  }
};
