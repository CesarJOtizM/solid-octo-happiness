export interface BusinessHours {
  startHour: number;
  endHour: number;
  lunchStartHour: number;
  lunchEndHour: number;
}

export interface BusinessDayInfo {
  date: Date;
  isBusinessDay: boolean;
  isHoliday: boolean;
  isWorkingDay: boolean;
  businessHours: BusinessHours;
}

export interface TimeCalculation {
  startDate: Date;
  endDate: Date;
  businessDaysAdded: number;
  businessHoursAdded: number;
  holidaysFound: number;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface HolidayInfo {
  date: Date;
  name: string;
  type: string;
}
