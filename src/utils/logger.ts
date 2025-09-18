import chalk from "chalk";

export enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: string;
  data?: unknown;
}

// Configuración del logger
const isDevelopment = process.env["NODE_ENV"] !== "production";

// Funciones puras para formateo
const formatTimestamp = (date: Date): string =>
  date.toISOString().replace("T", " ").replace("Z", "");

const getColoredLevel = (level: LogLevel): string => {
  const levelColors = {
    [LogLevel.DEBUG]: chalk.gray,
    [LogLevel.INFO]: chalk.blue,
    [LogLevel.WARN]: chalk.yellow,
    [LogLevel.ERROR]: chalk.red,
  };
  return levelColors[level](`[${level}]`);
};

const formatMessage = (entry: LogEntry): string => {
  const timestamp = formatTimestamp(entry.timestamp);
  const coloredLevel = getColoredLevel(entry.level);
  const context = entry.context ? chalk.cyan(`[${entry.context}]`) : "";
  const data = entry.data
    ? chalk.gray(`\n${JSON.stringify(entry.data, null, 2)}`)
    : "";

  return `${chalk.gray(timestamp)} ${coloredLevel} ${context} ${entry.message}${data}`;
};

// Función principal de logging
const log = (
  level: LogLevel,
  message: string,
  context?: string,
  data?: unknown
): void => {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date(),
    ...(context ? { context } : {}),
    ...(data ? { data } : {}),
  };

  const formattedMessage = formatMessage(entry);

  // En desarrollo, siempre mostrar logs
  // En producción, solo mostrar WARN y ERROR
  if (isDevelopment || level === LogLevel.WARN || level === LogLevel.ERROR) {
    // eslint-disable-next-line no-console
    console.log(formattedMessage);
  }
};

// Funciones específicas por nivel
export const debug = (
  message: string,
  context?: string,
  data?: unknown
): void => log(LogLevel.DEBUG, message, context, data);

export const info = (message: string, context?: string, data?: unknown): void =>
  log(LogLevel.INFO, message, context, data);

export const warn = (message: string, context?: string, data?: unknown): void =>
  log(LogLevel.WARN, message, context, data);

export const error = (
  message: string,
  context?: string,
  data?: unknown
): void => log(LogLevel.ERROR, message, context, data);

// Funciones específicas para la API
export const apiRequest = (
  method: string,
  url: string,
  params?: unknown
): void => info(`API Request: ${method} ${url}`, "API", params);

export const apiResponse = (
  statusCode: number,
  responseTime: number,
  data?: unknown
): void => {
  const level = statusCode >= 400 ? LogLevel.ERROR : LogLevel.INFO;
  log(level, `API Response: ${statusCode} (${responseTime}ms)`, "API", data);
};

export const businessDateCalculation = (
  startDate: Date,
  endDate: Date,
  days: number,
  hours: number
): void =>
  info(
    `Business Date Calculation: ${startDate.toISOString()} → ${endDate.toISOString()}`,
    "BusinessDate",
    { days, hours }
  );

export const holidayService = (action: string, data?: unknown): void =>
  info(`Holiday Service: ${action}`, "HolidayService", data);

export const holidayServiceError = (error: string, data?: unknown): void =>
  log(
    LogLevel.ERROR,
    `Holiday Service Error: ${error}`,
    "HolidayService",
    data
  );

// Objeto logger para compatibilidad con el código existente
export const logger = {
  debug,
  info,
  warn,
  error,
  apiRequest,
  apiResponse,
  businessDateCalculation,
  holidayService,
  holidayServiceError,
};
