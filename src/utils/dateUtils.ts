import { format, parseISO, isWeekend, getDay } from "date-fns";

export const COLOMBIA_TIMEZONE = "America/Bogota";

export function utcToColombiaTime(utcDate: Date): Date {
  const colombiaTime = new Date(utcDate.getTime() - 5 * 60 * 60 * 1000);
  return colombiaTime;
}

export function colombiaTimeToUtc(colombiaDate: Date): Date {
  const utcTime = new Date(colombiaDate.getTime() + 5 * 60 * 60 * 1000);
  return utcTime;
}

export function isBusinessDay(date: Date): boolean {
  return !isWeekend(date);
}

export function getWeekDay(date: Date): number {
  const day = getDay(date);
  return day === 0 ? 7 : day;
}

export function formatDateForLog(date: Date): string {
  return format(date, "yyyy-MM-dd HH:mm:ss");
}

export function formatDateForApi(date: Date): string {
  return date.toISOString();
}

export function parseISODate(dateString: string): Date {
  return parseISO(dateString);
}

export function isValidDate(date: Date): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}

export function getStartOfDay(date: Date): Date {
  const colombiaDate = utcToColombiaTime(date);
  const startOfDay = new Date(colombiaDate);
  startOfDay.setHours(0, 0, 0, 0);
  return colombiaTimeToUtc(startOfDay);
}

export function getEndOfDay(date: Date): Date {
  const colombiaDate = utcToColombiaTime(date);
  const endOfDay = new Date(colombiaDate);
  endOfDay.setHours(23, 59, 59, 999);
  return colombiaTimeToUtc(endOfDay);
}
