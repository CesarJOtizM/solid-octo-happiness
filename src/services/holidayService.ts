import axios, { AxiosError } from "axios";
import {
  HolidayApiResponse,
  HolidayCache,
  HolidayServiceConfig,
  HolidayServiceError,
  HolidayResult,
  CacheResult,
} from "types";
import { config } from "config";

let cache: HolidayCache | null = null;

const DEFAULT_CONFIG: HolidayServiceConfig = {
  apiUrl: config.holidayApi.url,
  cacheTtlMinutes: config.cache.ttlMinutes,
  timeoutMs: 10000,
  maxRetries: 3,
};

const createError = (
  type: HolidayServiceError["type"],
  message: string,
  statusCode?: number,
  url?: string
): HolidayServiceError => {
  const error: HolidayServiceError = {
    type,
    message,
  };

  if (statusCode !== undefined) {
    error.statusCode = statusCode;
  }

  if (url !== undefined) {
    error.url = url;
  }

  return error;
};

const isCacheValid = (cacheData: HolidayCache): boolean => {
  const now = Date.now();
  return now - cacheData.lastUpdated < cacheData.ttl;
};

const createCacheResult = (data: string[]): CacheResult => ({
  hit: true,
  data,
});
const createCacheMiss = (): CacheResult => ({ hit: false });

const getFromCache = (): CacheResult => {
  if (!cache) {
    return createCacheMiss();
  }

  return isCacheValid(cache)
    ? createCacheResult(cache.holidays)
    : createCacheMiss();
};

const updateCache = (holidays: string[], ttlMs: number): void => {
  cache = {
    holidays,
    lastUpdated: Date.now(),
    ttl: ttlMs,
  };
};

const minutesToMs = (minutes: number): number => minutes * 60 * 1000;

const createSuccessResult = (data: string[]): HolidayResult => ({
  success: true,
  data,
});

const createErrorResult = (error: HolidayServiceError): HolidayResult => ({
  success: false,
  error,
});

const handleAxiosError = (error: AxiosError): HolidayServiceError => {
  if (error.code === "ECONNABORTED") {
    return createError(
      "TIMEOUT_ERROR",
      "Timeout al consultar la API de días festivos",
      undefined,
      error.config?.url
    );
  }

  if (error.response) {
    return createError(
      "NETWORK_ERROR",
      `Error HTTP ${error.response.status}: ${error.response.statusText}`,
      error.response.status,
      error.config?.url
    );
  }

  if (error.request) {
    return createError(
      "NETWORK_ERROR",
      "No se pudo conectar con la API de días festivos",
      undefined,
      error.config?.url
    );
  }

  return createError(
    "UNKNOWN_ERROR",
    `Error inesperado: ${error.message}`,
    undefined,
    error.config?.url
  );
};

const validateApiResponse = (response: unknown): HolidayApiResponse => {
  if (!Array.isArray(response)) {
    throw new Error("La respuesta de la API debe ser un array");
  }

  const isValidDateString = (str: unknown): str is string => {
    return typeof str === "string" && /^\d{4}-\d{2}-\d{2}$/.test(str);
  };

  if (!response.every(isValidDateString)) {
    throw new Error(
      "Todos los elementos del array deben ser fechas en formato YYYY-MM-DD"
    );
  }

  return response;
};

const fetchHolidaysFromApi = async (
  config: HolidayServiceConfig
): Promise<HolidayResult> => {
  try {
    const response = await axios.get<HolidayApiResponse>(config.apiUrl, {
      timeout: config.timeoutMs,
      headers: {
        Accept: "application/json",
        "User-Agent": "BusinessDates-API/1.0.0",
      },
    });

    const validatedData = validateApiResponse(response.data);

    updateCache(validatedData, minutesToMs(config.cacheTtlMinutes));

    return createSuccessResult(validatedData);
  } catch (error) {
    if (error instanceof Error && error.message.includes("debe ser")) {
      return createErrorResult(
        createError(
          "PARSE_ERROR",
          `Error al validar respuesta: ${error.message}`,
          undefined,
          config.apiUrl
        )
      );
    }

    if (axios.isAxiosError(error)) {
      return createErrorResult(handleAxiosError(error));
    }

    return createErrorResult(
      createError(
        "UNKNOWN_ERROR",
        `Error inesperado: ${error instanceof Error ? error.message : "Error desconocido"}`,
        undefined,
        config.apiUrl
      )
    );
  }
};

export const getHolidays = async (
  config: HolidayServiceConfig = DEFAULT_CONFIG
): Promise<HolidayResult> => {
  const cacheResult = getFromCache();

  if (cacheResult.hit) {
    return createSuccessResult(cacheResult.data);
  }

  return await fetchHolidaysFromApi(config);
};

export const clearCache = (): void => {
  cache = null;
};

export const getCacheInfo = (): {
  hasCache: boolean;
  isValid: boolean;
  lastUpdated?: number;
} => {
  if (!cache) {
    return { hasCache: false, isValid: false };
  }

  return {
    hasCache: true,
    isValid: isCacheValid(cache),
    lastUpdated: cache.lastUpdated,
  };
};

export const isHoliday = async (
  date: string,
  config: HolidayServiceConfig = DEFAULT_CONFIG
): Promise<boolean> => {
  const result = await getHolidays(config);

  if (!result.success) {
    throw new Error(`Error al obtener días festivos: ${result.error.message}`);
  }

  return result.data.includes(date);
};

export const getHolidaysForYear = async (
  year: number,
  config: HolidayServiceConfig = DEFAULT_CONFIG
): Promise<string[]> => {
  const result = await getHolidays(config);

  if (!result.success) {
    throw new Error(`Error al obtener días festivos: ${result.error.message}`);
  }

  return result.data.filter(date => date.startsWith(year.toString()));
};
