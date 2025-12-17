import { createMiddleware } from '../helpers';
import { MiddlewareContext } from '../core';

/**
 * Day of week enum
 */
export enum DayOfWeek {
  Monday = 'monday',
  Tuesday = 'tuesday',
  Wednesday = 'wednesday',
  Thursday = 'thursday',
  Friday = 'friday',
  Saturday = 'saturday',
  Sunday = 'sunday',
}

/**
 * Configuration options for time window middleware
 */
export interface TimeWindowMiddlewareOptions {
  /**
   * Allowed hours (24-hour format)
   * Example: { start: 9, end: 17 } for 9 AM to 5 PM
   */
  allowedHours?: { start: number; end: number };
  /**
   * Allowed days of week
   * Default: All days
   */
  allowedDays?: DayOfWeek[];
  /**
   * Timezone for time calculations
   * Default: 'UTC'
   * Examples: 'America/New_York', 'Europe/London', 'Asia/Tokyo'
   */
  timezone?: string;
  /**
   * Redirect URL when access is denied
   */
  redirect?: string;
  /**
   * Custom message when access is denied
   */
  message?: string;
}

/**
 * Gets current time in specified timezone
 */
function getCurrentTime(timezone: string): { hour: number; day: number } {
  const now = new Date();
  
  // Simple timezone handling (for production, use a library like date-fns-tz)
  let hour: number;
  let day: number;
  
  if (timezone === 'UTC') {
    hour = now.getUTCHours();
    day = now.getUTCDay();
  } else {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      hour12: false,
      weekday: 'long',
    });
    
    const parts = formatter.formatToParts(now);
    hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0', 10);
    const dayName = parts.find(p => p.type === 'weekday')?.value?.toLowerCase() || '';
    day = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].indexOf(dayName);
  }
  
  return { hour, day };
}

/**
 * Converts day name to day number (0 = Sunday, 1 = Monday, etc.)
 */
function dayNameToNumber(dayName: DayOfWeek): number {
  const mapping: Record<DayOfWeek, number> = {
    [DayOfWeek.Sunday]: 0,
    [DayOfWeek.Monday]: 1,
    [DayOfWeek.Tuesday]: 2,
    [DayOfWeek.Wednesday]: 3,
    [DayOfWeek.Thursday]: 4,
    [DayOfWeek.Friday]: 5,
    [DayOfWeek.Saturday]: 6,
  };
  return mapping[dayName];
}

/**
 * Creates middleware that restricts access based on time windows
 *
 * @param options - Configuration options
 * @returns Middleware function
 *
 * @example
 * ```typescript
 * const businessHoursMiddleware = createTimeWindowMiddleware({
 *   allowedHours: { start: 9, end: 17 },
 *   allowedDays: [DayOfWeek.Monday, DayOfWeek.Friday],
 *   timezone: 'America/New_York'
 * });
 * ```
 */
export function createTimeWindowMiddleware(
  options: TimeWindowMiddlewareOptions = {}
): ReturnType<typeof createMiddleware> {
  const {
    allowedHours,
    allowedDays,
    timezone = 'UTC',
    redirect,
    message = 'Access denied: Outside allowed time window',
  } = options;

  return createMiddleware('time-window', (_context: MiddlewareContext) => {
    const { hour, day } = getCurrentTime(timezone);

    // Check day restriction
    if (allowedDays && allowedDays.length > 0) {
      const allowedDayNumbers = allowedDays.map(dayNameToNumber);
      if (!allowedDayNumbers.includes(day)) {
        if (redirect) {
          return {
            allow: false,
            redirect,
            reason: message,
          };
        }
        return false;
      }
    }

    // Check hour restriction
    if (allowedHours) {
      const { start, end } = allowedHours;
      if (start > end) {
        // Handle overnight window (e.g., 22:00 to 06:00)
        if (hour < start && hour >= end) {
          if (redirect) {
            return {
              allow: false,
              redirect,
              reason: message,
            };
          }
          return false;
        }
      } else {
        // Normal window (e.g., 09:00 to 17:00)
        if (hour < start || hour >= end) {
          if (redirect) {
            return {
              allow: false,
              redirect,
              reason: message,
            };
          }
          return false;
        }
      }
    }

    return true;
  });
}

