import { parseISO } from "date-fns";
import { formatInTimeZone, toZonedTime, fromZonedTime } from "date-fns-tz";
import { config } from "../config";

export const COLOMBIA_TIMEZONE = config.timezone.default;

/**
 * Convierte una fecha UTC a la zona horaria de Colombia
 */
export const utcToColombia = (utcDate: Date): Date => {
  return toZonedTime(utcDate, COLOMBIA_TIMEZONE);
};

/**
 * Convierte una fecha de Colombia a UTC
 */
export const colombiaToUtc = (colombiaDate: Date): Date => {
  return fromZonedTime(colombiaDate, COLOMBIA_TIMEZONE);
};

/**
 * Convierte una fecha UTC a la zona horaria de Colombia y la formatea
 */
export const formatUtcToColombia = (
  utcDate: Date,
  formatString: string = "yyyy-MM-dd HH:mm:ss"
): string => {
  return formatInTimeZone(utcDate, COLOMBIA_TIMEZONE, formatString);
};

/**
 * Obtiene la fecha actual en Colombia
 */
export const getCurrentColombiaTime = (): Date => {
  const now = new Date();
  return utcToColombia(now);
};

/**
 * Convierte una fecha ISO string a Colombia y luego a UTC
 */
export const parseIsoToColombiaUtc = (isoString: string): Date => {
  const utcDate = parseISO(isoString);
  const colombiaDate = utcToColombia(utcDate);
  return colombiaToUtc(colombiaDate);
};

/**
 * Valida si una fecha ISO string es válida
 */
export const isValidIsoDate = (dateString: string): boolean => {
  try {
    const date = parseISO(dateString);
    return !isNaN(date.getTime()) && dateString.endsWith("Z");
  } catch {
    return false;
  }
};

/**
 * Convierte una fecha a formato ISO UTC con Z
 */
export const toIsoUtcString = (date: Date): string => {
  return date.toISOString();
};

/**
 * Crea una fecha en Colombia y la convierte a UTC
 */
export const createColombiaDate = (
  year: number,
  month: number,
  day: number,
  hour: number = 0,
  minute: number = 0,
  second: number = 0
): Date => {
  const colombiaDate = new Date(year, month - 1, day, hour, minute, second);
  return colombiaToUtc(colombiaDate);
};
