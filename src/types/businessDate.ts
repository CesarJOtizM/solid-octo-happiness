export interface WorkingHours {
  start: number; // 8 (8:00 AM)
  end: number; // 17 (5:00 PM)
  lunchStart: number; // 12 (12:00 PM)
  lunchEnd: number; // 13 (1:00 PM)
}

export interface BusinessDateConfig {
  timezone: string; // "America/Bogota"
  workingDays: number[]; // [1, 2, 3, 4, 5] (Monday to Friday)
  workingHours: WorkingHours;
}

export interface DateCalculationResult {
  success: true;
  resultDate: Date;
  originalDate: Date;
  addedDays: number;
  addedHours: number;
}

export interface DateCalculationError {
  success: false;
  error: string;
  message: string;
}

export type DateCalculationResponse =
  | DateCalculationResult
  | DateCalculationError;

export interface TimeAdjustment {
  days: number;
  hours: number;
  minutes: number;
}

export interface BusinessDayInfo {
  isWorkingDay: boolean;
  isHoliday: boolean;
  isWeekend: boolean;
  workingHoursStart: Date;
  workingHoursEnd: Date;
  lunchStart: Date;
  lunchEnd: Date;
}
