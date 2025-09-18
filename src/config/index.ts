import { env, type EnvConfig } from "./env";

export const config = {
  server: {
    port: env.PORT,
    nodeEnv: env.NODE_ENV,
  },

  holidayApi: {
    url: env.HOLIDAY_API_URL,
  },

  timezone: {
    default: env.TIMEZONE,
  },

  workSchedule: {
    startHour: env.WORK_START_HOUR,
    endHour: env.WORK_END_HOUR,
    lunchStartHour: env.LUNCH_START_HOUR,
    lunchEndHour: env.LUNCH_END_HOUR,
  },

  cache: {
    ttlMinutes: env.CACHE_TTL_MINUTES,
  },
} as const;

export type Config = typeof config;
export type { EnvConfig };
