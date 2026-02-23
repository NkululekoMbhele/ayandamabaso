/**
 * Booking utility functions for time slot management
 */

import type { BusinessHours, TimeSlot, BookedSlot } from '$lib/types/booking';
import { getDayOfWeek } from './date';

/**
 * Default business hours (Monday-Friday, 9 AM - 5 PM)
 */
export const DEFAULT_BUSINESS_HOURS: BusinessHours = {
	monday: { start: '09:00', end: '17:00' },
	tuesday: { start: '09:00', end: '17:00' },
	wednesday: { start: '09:00', end: '17:00' },
	thursday: { start: '09:00', end: '17:00' },
	friday: { start: '09:00', end: '17:00' },
	saturday: null,
	sunday: null
};

/**
 * Parse time string to hours and minutes
 * @param time Time string in 24-hour format ("09:00")
 * @returns Object with hours and minutes as numbers
 */
export function parseTime(time: string): { hours: number; minutes: number } {
	const [hours, minutes] = time.split(':').map(Number);
	return { hours, minutes };
}

/**
 * Add minutes to a time string
 * @param time Time string in 24-hour format ("09:00")
 * @param minutes Number of minutes to add
 * @returns New time string
 * @example addMinutes("09:00", 90) => "10:30"
 */
export function addMinutes(time: string, minutes: number): string {
	const { hours, minutes: mins } = parseTime(time);
	const totalMinutes = hours * 60 + mins + minutes;
	const newHours = Math.floor(totalMinutes / 60);
	const newMinutes = totalMinutes % 60;
	return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
}

/**
 * Compare two time strings
 * @param time1 First time string
 * @param time2 Second time string
 * @returns Negative if time1 < time2, positive if time1 > time2, 0 if equal
 */
export function compareTime(time1: string, time2: string): number {
	const t1 = parseTime(time1);
	const t2 = parseTime(time2);
	const min1 = t1.hours * 60 + t1.minutes;
	const min2 = t2.hours * 60 + t2.minutes;
	return min1 - min2;
}

/**
 * Check if a time slot overlaps with a booked slot
 * @param slotStart Start time of the slot to check
 * @param slotDuration Duration of the slot in minutes
 * @param bookedStart Start time of booked slot
 * @param bookedEnd End time of booked slot
 * @returns True if there is overlap, false otherwise
 */
function hasOverlap(
	slotStart: string,
	slotDuration: number,
	bookedStart: string,
	bookedEnd: string
): boolean {
	const slotEnd = addMinutes(slotStart, slotDuration);

	// Check if slot start is within booked range
	if (compareTime(slotStart, bookedStart) >= 0 && compareTime(slotStart, bookedEnd) < 0) {
		return true;
	}

	// Check if slot end is within booked range
	if (compareTime(slotEnd, bookedStart) > 0 && compareTime(slotEnd, bookedEnd) <= 0) {
		return true;
	}

	// Check if slot completely contains booked range
	if (compareTime(slotStart, bookedStart) <= 0 && compareTime(slotEnd, bookedEnd) >= 0) {
		return true;
	}

	return false;
}

/**
 * Check if a specific time slot is available
 * @param date Date to check
 * @param time Start time of the slot
 * @param duration Duration in minutes
 * @param bookedSlots Array of already booked slots for that date
 * @returns True if available, false if booked
 */
export function isSlotAvailable(
	date: Date,
	time: string,
	duration: number,
	bookedSlots: BookedSlot[]
): boolean {
	const dateStr = date.toISOString().split('T')[0];

	// Filter booked slots for this specific date
	const dayBookedSlots = bookedSlots.filter((slot) => slot.date === dateStr);

	// Check if proposed slot conflicts with any booked slot
	for (const booked of dayBookedSlots) {
		if (hasOverlap(time, duration, booked.start_time, booked.end_time)) {
			return false;
		}
	}

	return true;
}

/**
 * Generate all possible time slots for a given date
 * @param date Date to generate slots for
 * @param duration Duration of each consultation in minutes
 * @param businessHours Business hours configuration
 * @param bookedSlots Already booked slots
 * @param bufferMinutes Buffer time between consultations (default: 15)
 * @returns Array of time slots with availability status
 */
export function generateTimeSlots(
	date: Date,
	duration: number,
	businessHours: BusinessHours,
	bookedSlots: BookedSlot[],
	bufferMinutes: number = 15
): TimeSlot[] {
	const slots: TimeSlot[] = [];
	const dayOfWeek = getDayOfWeek(date);
	const hours = businessHours[dayOfWeek as keyof BusinessHours];

	console.log('[BookingSlots] Generating slots for', {
		date: date.toISOString(),
		dayOfWeek,
		duration,
		bufferMinutes,
		hasBusinessHours: !!hours,
		businessHours: hours
	});

	// If no business hours for this day (weekend), return empty array
	if (!hours) {
		console.log('[BookingSlots] No business hours for', dayOfWeek);
		return [];
	}

	const { start, end } = hours;
	const slotInterval = 30; // Generate slots every 30 minutes
	const totalDuration = duration + bufferMinutes; // Consultation + buffer

	// Check if we're generating slots for today and filter out past times
	const now = new Date();
	const isToday = date.toDateString() === now.toDateString();
	const currentHour = now.getHours();
	const currentMinute = now.getMinutes();

	let currentTime = start;
	let slotsGenerated = 0;

	while (compareTime(currentTime, end) < 0) {
		const slotEndTime = addMinutes(currentTime, totalDuration);
		const { hours: slotHour, minutes: slotMinute } = parseTime(currentTime);

		// Skip past times if generating for today
		if (isToday && (slotHour < currentHour || (slotHour === currentHour && slotMinute <= currentMinute))) {
			currentTime = addMinutes(currentTime, slotInterval);
			continue;
		}

		// Check if this slot fits within business hours
		if (compareTime(slotEndTime, end) <= 0) {
			const available = isSlotAvailable(date, currentTime, duration, bookedSlots);

			slots.push({
				time: currentTime,
				available,
				reason: !available ? 'Booked' : undefined
			});
			slotsGenerated++;
		}

		// Move to next slot (30-minute intervals)
		currentTime = addMinutes(currentTime, slotInterval);
	}

	console.log('[BookingSlots] Generated', slotsGenerated, 'slots, available:', slots.filter(s => s.available).length);
	return slots;
}

/**
 * Get booked slots from orders for a specific date
 * @param orders Array of orders
 * @param date Date to check
 * @returns Array of booked slots for that date
 */
export function getBookedSlotsFromOrders(orders: any[], date: Date): BookedSlot[] {
	const dateStr = date.toISOString().split('T')[0];
	const bookedSlots: BookedSlot[] = [];

	for (const order of orders) {
		for (const item of order.items || []) {
			// Check if this is a consultation booking
			if (item.extra_data?.booking_type === 'consultation') {
				const bookingDate = item.extra_data.booking_date.split('T')[0];

				// Only include bookings for the specified date
				if (bookingDate === dateStr) {
					const startTime = item.extra_data.booking_time;
					const duration = item.extra_data.booking_duration;
					const endTime = addMinutes(startTime, duration);

					bookedSlots.push({
						date: bookingDate,
						start_time: startTime,
						end_time: endTime,
						offering_id: item.offering_id || 0
					});
				}
			}
		}
	}

	return bookedSlots;
}
