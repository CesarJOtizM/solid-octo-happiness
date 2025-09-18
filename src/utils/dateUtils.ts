import {
  addDays,
  isWeekend,
  getDay,
  setHours,
  setMinutes,
  setSeconds,
  setMilliseconds,
  isAfter,
  isBefore,
  differenceInMinutes,
} from "date-fns";
import { utcToColombia, colombiaToUtc } from "./timezoneUtils";
import { WorkingHours, BusinessDayInfo } from "../types/businessDate";
import { config } from "../config";

export const WORKING_HOURS: WorkingHours = {
  start: config.workSchedule.startHour, // 8:00 AM
  end: config.workSchedule.endHour, // 5:00 PM
  lunchStart: config.workSchedule.lunchStartHour, // 12:00 PM
  lunchEnd: config.workSchedule.lunchEndHour, // 1:00 PM
};

export const WORKING_DAYS = [1, 2, 3, 4, 5]; // Monday to Friday (1 = Monday)

/**
 * Verifica si un día es laboral (lunes a viernes)
 */
export const isWorkingDay = (date: Date): boolean => {
  const dayOfWeek = getDay(date);
  return WORKING_DAYS.includes(dayOfWeek);
};

/**
 * Verifica si una hora está dentro del horario laboral
 */
export const isWithinWorkingHours = (date: Date): boolean => {
  const hour = date.getHours();
  const minute = date.getMinutes();
  const timeInMinutes = hour * 60 + minute;

  const startTime = WORKING_HOURS.start * 60; // 8:00 AM
  const endTime = WORKING_HOURS.end * 60; // 5:00 PM
  const lunchStartTime = WORKING_HOURS.lunchStart * 60; // 12:00 PM
  const lunchEndTime = WORKING_HOURS.lunchEnd * 60; // 1:00 PM

  // Está dentro del horario laboral pero fuera del almuerzo
  return (
    timeInMinutes >= startTime &&
    timeInMinutes < endTime &&
    !(timeInMinutes >= lunchStartTime && timeInMinutes < lunchEndTime)
  );
};

/**
 * Verifica si una fecha está en horario de almuerzo
 */
export const isLunchTime = (date: Date): boolean => {
  const hour = date.getHours();
  const minute = date.getMinutes();
  const timeInMinutes = hour * 60 + minute;

  const lunchStartTime = WORKING_HOURS.lunchStart * 60; // 12:00 PM
  const lunchEndTime = WORKING_HOURS.lunchEnd * 60; // 1:00 PM

  return timeInMinutes >= lunchStartTime && timeInMinutes < lunchEndTime;
};

/**
 * Obtiene información completa de un día laboral
 */
export const getBusinessDayInfo = (
  date: Date,
  isHolidayFlag: boolean = false
): BusinessDayInfo => {
  const colombiaDate = utcToColombia(date);
  const isWeekendDay = isWeekend(colombiaDate);
  const isWorkingDayFlag = isWorkingDay(colombiaDate) && !isHolidayFlag;

  // Crear fechas para horarios laborales
  const workingHoursStart = setHours(
    setMinutes(setSeconds(setMilliseconds(colombiaDate, 0), 0), 0),
    WORKING_HOURS.start
  );
  const workingHoursEnd = setHours(
    setMinutes(setSeconds(setMilliseconds(colombiaDate, 0), 0), 0),
    WORKING_HOURS.end
  );
  const lunchStart = setHours(
    setMinutes(setSeconds(setMilliseconds(colombiaDate, 0), 0), 0),
    WORKING_HOURS.lunchStart
  );
  const lunchEnd = setHours(
    setMinutes(setSeconds(setMilliseconds(colombiaDate, 0), 0), 0),
    WORKING_HOURS.lunchEnd
  );

  return {
    isWorkingDay: isWorkingDayFlag,
    isHoliday: isHolidayFlag,
    isWeekend: isWeekendDay,
    workingHoursStart: colombiaToUtc(workingHoursStart),
    workingHoursEnd: colombiaToUtc(workingHoursEnd),
    lunchStart: colombiaToUtc(lunchStart),
    lunchEnd: colombiaToUtc(lunchEnd),
  };
};

/**
 * Ajusta una fecha al inicio del horario laboral más cercano hacia atrás
 */
export const adjustToPreviousWorkingTime = (
  date: Date,
  isHolidayFlag: boolean = false
): Date => {
  const colombiaDate = utcToColombia(date);
  const dayInfo = getBusinessDayInfo(date, isHolidayFlag);

  // Si es fin de semana o festivo, ir al viernes anterior a las 5:00 PM
  if (dayInfo.isWeekend || dayInfo.isHoliday) {
    let targetDate = colombiaDate;

    // Retroceder hasta encontrar un día laboral
    while (!isWorkingDay(targetDate) || isHolidayFlag) {
      targetDate = addDays(targetDate, -1);
    }

    // Establecer a las 5:00 PM
    const adjustedDate = setHours(
      setMinutes(setSeconds(setMilliseconds(targetDate, 0), 0), 0),
      WORKING_HOURS.end
    );

    return colombiaToUtc(adjustedDate);
  }

  // Si está antes del horario laboral, ir al día anterior a las 5:00 PM
  if (isBefore(colombiaDate, dayInfo.workingHoursStart)) {
    const previousDay = addDays(colombiaDate, -1);
    const previousDayInfo = getBusinessDayInfo(previousDay, false);

    if (previousDayInfo.isWorkingDay) {
      return dayInfo.workingHoursEnd;
    } else {
      // Si el día anterior no es laboral, ajustar recursivamente
      return adjustToPreviousWorkingTime(dayInfo.workingHoursEnd, false);
    }
  }

  // Si está después del horario laboral, ir a las 5:00 PM del mismo día
  if (isAfter(colombiaDate, dayInfo.workingHoursEnd)) {
    return dayInfo.workingHoursEnd;
  }

  // Si está en horario de almuerzo, ir al inicio del almuerzo
  if (isLunchTime(colombiaDate)) {
    return dayInfo.lunchStart;
  }

  // Si está dentro del horario laboral, mantener la fecha
  return date;
};

/**
 * Calcula el próximo día laboral
 */
export const getNextWorkingDay = (date: Date): Date => {
  const colombiaDate = utcToColombia(date);
  let nextDay = addDays(colombiaDate, 1);

  // Avanzar hasta encontrar un día laboral
  while (!isWorkingDay(nextDay)) {
    nextDay = addDays(nextDay, 1);
  }

  // Establecer al inicio del horario laboral (8:00 AM)
  const workingDayStart = setHours(
    setMinutes(setSeconds(setMilliseconds(nextDay, 0), 0), 0),
    WORKING_HOURS.start
  );

  return colombiaToUtc(workingDayStart);
};

/**
 * Calcula minutos hábiles entre dos fechas
 */
export const calculateWorkingMinutes = (
  startDate: Date,
  endDate: Date,
  isHolidayFlag: boolean = false
): number => {
  const startColombia = utcToColombia(startDate);

  if (!isWorkingDay(startColombia) || isHolidayFlag) {
    return 0;
  }

  const dayInfo = getBusinessDayInfo(startDate, isHolidayFlag);

  // Si está fuera del horario laboral, no hay minutos hábiles
  if (
    isBefore(startColombia, dayInfo.workingHoursStart) ||
    isAfter(startColombia, dayInfo.workingHoursEnd) ||
    isLunchTime(startColombia)
  ) {
    return 0;
  }

  // Calcular minutos hasta el final del día laboral
  const endOfWorkingDay = dayInfo.workingHoursEnd;

  let workingMinutes = 0;

  // Minutos hasta el almuerzo (si aplica)
  if (isBefore(startColombia, dayInfo.lunchStart)) {
    const minutesToLunch = differenceInMinutes(dayInfo.lunchStart, startDate);
    workingMinutes += Math.max(0, minutesToLunch);
  }

  // Minutos después del almuerzo hasta el final del día
  if (isAfter(startColombia, dayInfo.lunchEnd)) {
    const minutesFromLunchToEnd = differenceInMinutes(
      endOfWorkingDay,
      colombiaToUtc(dayInfo.lunchEnd)
    );
    workingMinutes += Math.max(0, minutesFromLunchToEnd);
  }

  return Math.min(workingMinutes, differenceInMinutes(endDate, startDate));
};
