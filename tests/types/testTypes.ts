import { Request, Response, NextFunction } from "express";

// Tipos para mocks de Express - usando tipos más simples
export type MockRequest = Request;
export type MockResponse = Response;
export type MockNextFunction = NextFunction;

// Tipos para mocks de middleware - usando tipos de Express directamente
export type MockMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => void;
export type MockErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => void;

// Tipos para mocks de controladores
export type MockController = (req: Request, res: Response) => void;

// Tipos para mocks de logger
export interface MockLogger {
  info: jest.MockedFunction<(message: string, context?: string) => void>;
  error: jest.MockedFunction<(message: string, context?: string) => void>;
  warn: jest.MockedFunction<(message: string, context?: string) => void>;
  debug: jest.MockedFunction<(message: string, context?: string) => void>;
}

// Tipos para mocks de configuración
export interface MockConfig {
  server: {
    port: number;
  };
  api: {
    baseUrl: string;
    timeout: number;
  };
  cache: {
    ttl: number;
  };
}

// Tipos para mocks de rutas
export type MockRouter = () => Express.Application;

// Tipos para mocks de servicios
export interface MockHolidayService {
  getHolidays: jest.MockedFunction<(year: number) => Promise<unknown>>;
  clearCache: jest.MockedFunction<() => void>;
  getCacheInfo: jest.MockedFunction<() => unknown>;
  isHoliday: jest.MockedFunction<(date: Date) => Promise<boolean>>;
  getHolidaysForYear: jest.MockedFunction<(year: number) => Promise<unknown>>;
}

export interface MockBusinessDateService {
  calculateBusinessDate: jest.MockedFunction<
    (params: unknown) => Promise<unknown>
  >;
  formatBusinessDateResponse: jest.MockedFunction<(result: unknown) => unknown>;
  formatBusinessDateError: jest.MockedFunction<(error: Error) => unknown>;
}

// Tipos para mocks de utilidades
export interface MockDateUtils {
  addDays: jest.MockedFunction<(date: Date, days: number) => Date>;
  addHours: jest.MockedFunction<(date: Date, hours: number) => Date>;
  isWeekend: jest.MockedFunction<(date: Date) => boolean>;
  getNextWorkingDay: jest.MockedFunction<(date: Date) => Date>;
  getPreviousWorkingDay: jest.MockedFunction<(date: Date) => Date>;
}

export interface MockTimezoneUtils {
  convertToTimezone: jest.MockedFunction<
    (date: Date, timezone: string) => Date
  >;
  getTimezoneOffset: jest.MockedFunction<(timezone: string) => number>;
  formatDateForTimezone: jest.MockedFunction<
    (date: Date, timezone: string) => string
  >;
}
