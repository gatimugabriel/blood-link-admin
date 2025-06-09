import { format, parseISO } from "date-fns";

export function formatDate(dateString: string, formatStr: string = 'PPp'): string {
  try {
    const date = parseISO(dateString);
    return format(date, formatStr);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
}

// Common date formats
export const dateFormats = {
  full: 'PPpp', // e.g., "Apr 29, 2021, 9:00 AM"
  date: 'PP',   // e.g., "Apr 29, 2021"
  time: 'p',    // e.g., "9:00 AM"
  short: 'Pp',  // e.g., "04/29/2021, 9:00 AM"
} as const; 