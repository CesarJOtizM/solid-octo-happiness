import { addMinutes } from "date-fns";
import { z } from "zod";
import {
  utcToColombia,
  colombiaToUtc,
  getCurrentColombiaTime,
  toIsoUtcString,
} from "utils/timezoneUtils";
import {
  adjustToPreviousWorkingTime,
  getNextWorkingDay,
  getBusinessDayInfo,
  WORKING_HOURS,
} from "utils/dateUtils";
import {
  BusinessDateRequest,
  BusinessDateResponse,
  BusinessDateError,
  DateCalculationResponse,
  DateCalculationResult,
} from "types/businessDate";
import { businessDateRequestSchema } from "schemas";

const validateRequest = (
  request: BusinessDateRequest
): BusinessDateError | null => {
  try {
    businessDateRequestSchema.parse(request);
    return null;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return {
        error: "InvalidParameters",
        message: firstError?.message ?? "Error de validación",
      };
    }

    return {
      error: "InvalidParameters",
      message: "Error de validación inesperado",
    };
  }
};

const getStartDate = (request: BusinessDateRequest): Date => {
  if (request.date) {
    return utcToColombia(new Date(request.date));
  }

  return getCurrentColombiaTime();
};

const adjustStartDateToWorkingTime = async (
  startDate: Date,
  holidays: string[]
): Promise<Date> => {
  const colombiaDate = utcToColombia(startDate);
  const dateString = colombiaDate.toISOString().split("T")[0] ?? "";
  const isHolidayFlag = holidays.includes(dateString);

  return adjustToPreviousWorkingTime(startDate, isHolidayFlag);
};

const addWorkingDays = async (
  startDate: Date,
  daysToAdd: number,
  holidays: string[]
): Promise<Date> => {
  let currentDate = startDate;
  let daysAdded = 0;

  while (daysAdded < daysToAdd) {
    currentDate = getNextWorkingDay(currentDate);
    const colombiaDate = utcToColombia(currentDate);
    const dateString = colombiaDate.toISOString().split("T")[0] ?? "";

    if (!holidays.includes(dateString)) {
      daysAdded++;
    }
  }

  return currentDate;
};

const addWorkingHours = async (
  startDate: Date,
  hoursToAdd: number,
  holidays: string[]
): Promise<Date> => {
  let currentDate = startDate;
  let hoursAdded = 0;

  while (hoursAdded < hoursToAdd) {
    const colombiaDate = utcToColombia(currentDate);
    const dayInfo = getBusinessDayInfo(currentDate, false);

    const dateString = colombiaDate.toISOString().split("T")[0] ?? "";
    const isHolidayFlag = holidays.includes(dateString);

    if (isHolidayFlag || !dayInfo.isWorkingDay) {
      currentDate = getNextWorkingDay(currentDate);
      continue;
    }

    const currentHour = colombiaDate.getHours();
    const currentMinute = colombiaDate.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;

    const endTimeInMinutes = WORKING_HOURS.end * 60;
    const lunchStartTimeInMinutes = WORKING_HOURS.lunchStart * 60;
    const lunchEndTimeInMinutes = WORKING_HOURS.lunchEnd * 60;

    let availableMinutesInDay = 0;

    if (currentTimeInMinutes < lunchStartTimeInMinutes) {
      availableMinutesInDay = lunchStartTimeInMinutes - currentTimeInMinutes;
    } else if (currentTimeInMinutes >= lunchEndTimeInMinutes) {
      availableMinutesInDay = endTimeInMinutes - currentTimeInMinutes;
    } else {
      currentDate = addMinutes(
        currentDate,
        lunchEndTimeInMinutes - currentTimeInMinutes
      );
      availableMinutesInDay = endTimeInMinutes - lunchEndTimeInMinutes;
    }

    const remainingMinutes = (hoursToAdd - hoursAdded) * 60;

    if (availableMinutesInDay >= remainingMinutes) {
      currentDate = addMinutes(currentDate, remainingMinutes);
      hoursAdded = hoursToAdd;
    } else {
      currentDate = addMinutes(currentDate, availableMinutesInDay);
      hoursAdded += Math.floor(availableMinutesInDay / 60);

      currentDate = getNextWorkingDay(currentDate);
    }
  }

  return currentDate;
};

export const calculateBusinessDate = async (
  request: BusinessDateRequest
): Promise<DateCalculationResponse> => {
  const validationError = validateRequest(request);
  if (validationError) {
    return {
      success: false,
      error: validationError.error,
      message: validationError.message,
    };
  }

  try {
    const holidayResult = await import("./holidayService").then(module =>
      module.getHolidays()
    );

    if (!holidayResult.success) {
      return {
        success: false,
        error: "HolidayServiceError",
        message: `Error al obtener días festivos: ${holidayResult.error.message}`,
      };
    }

    const holidays = holidayResult.data;

    let startDate = getStartDate(request);

    startDate = await adjustStartDateToWorkingTime(startDate, holidays);

    if (request.days !== undefined && request.days > 0) {
      startDate = await addWorkingDays(startDate, request.days, holidays);
    }

    if (request.hours !== undefined && request.hours > 0) {
      startDate = await addWorkingHours(startDate, request.hours, holidays);
    }

    const resultDate = colombiaToUtc(startDate);

    return {
      success: true,
      resultDate,
      originalDate: request.date
        ? new Date(request.date)
        : getCurrentColombiaTime(),
      addedDays: request.days ?? 0,
      addedHours: request.hours ?? 0,
    };
  } catch (error) {
    return {
      success: false,
      error: "CalculationError",
      message: `Error durante el cálculo: ${error instanceof Error ? error.message : "Error desconocido"}`,
    };
  }
};

export const formatBusinessDateResponse = (
  result: DateCalculationResult
): BusinessDateResponse => {
  return {
    date: toIsoUtcString(result.resultDate),
  };
};

export const formatBusinessDateError = (
  error: DateCalculationResponse & { success: false }
): BusinessDateError => {
  return {
    error: error.error,
    message: error.message,
  };
};
