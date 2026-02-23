/**
 * Date utility functions for booking system
 */

/**
 * Format a date for display
 * @param date Date string or Date object
 * @param format Display format ('short' | 'long')
 * @returns Formatted date string
 * @example formatDate('2025-01-15', 'long') => "Wednesday, 15 January 2025"
 * @example formatDate('2025-01-15', 'short') => "15 Jan 2025"
 */
export function formatDate(date: string | Date, format: 'short' | 'long' = 'short'): string {
	const d = typeof date === 'string' ? new Date(date) : date;

	if (format === 'long') {
		return d.toLocaleDateString('en-ZA', {
			weekday: 'long',
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		});
	}

	return d.toLocaleDateString('en-ZA', {
		day: 'numeric',
		month: 'short',
		year: 'numeric'
	});
}

/**
 * Format time for display
 * @param time Time string in 24-hour format ("09:00")
 * @returns Formatted time string in 12-hour format ("9:00 AM")
 */
export function formatTimeForDisplay(time: string): string {
	const [hours, minutes] = time.split(':').map(Number);
	const period = hours >= 12 ? 'PM' : 'AM';
	const displayHours = hours % 12 || 12;
	return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Add days to a date
 * @param date Base date
 * @param days Number of days to add
 * @returns New Date object
 */
export function addDays(date: Date, days: number): Date {
	const result = new Date(date);
	result.setDate(result.getDate() + days);
	return result;
}

/**
 * Check if two dates are the same day
 * @param date1 First date
 * @param date2 Second date
 * @returns True if same day, false otherwise
 */
export function isSameDay(date1: Date, date2: Date): boolean {
	return (
		date1.getFullYear() === date2.getFullYear() &&
		date1.getMonth() === date2.getMonth() &&
		date1.getDate() === date2.getDate()
	);
}

/**
 * Get local timezone identifier
 * @returns Timezone string (e.g., "Africa/Johannesburg")
 */
export function getLocalTimezone(): string {
	return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Format a date to ISO date string (YYYY-MM-DD)
 * @param date Date object
 * @returns ISO date string
 */
export function toISODateString(date: Date): string {
	return date.toISOString().split('T')[0];
}

/**
 * Get day of week from date (0 = Sunday, 1 = Monday, etc.)
 * @param date Date object
 * @returns Day of week as lowercase string
 */
export function getDayOfWeek(date: Date): string {
	const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
	return days[date.getDay()];
}
