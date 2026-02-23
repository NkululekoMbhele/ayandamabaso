export interface ConsultationOffering {
	id: number;
	name: string;
	description: string;
	package_type: 'discovery' | 'strategy' | 'vip';
	duration_minutes: number;
	price: number;
	sale_price?: number;
	image_url?: string;
	metadata: {
		includes: string[];
		buffer_minutes: number;
		advance_booking_days: number;
		max_booking_days: number;
		popular?: boolean;
	};
}

export interface TimeSlot {
	time: string; // "09:00", "10:30"
	available: boolean;
	reason?: string; // "Booked", "Outside business hours", etc.
}

export interface BookedSlot {
	date: string; // ISO date string
	start_time: string; // "09:00"
	end_time: string; // "10:30"
	offering_id: number;
}

export interface GuestInfo {
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	notes?: string;
	preferredTime?: string;
	meetingType?: 'virtual' | 'in-person' | 'both';
	preferredLocation?: string;
}

export interface BookingMetadata {
	booking_date: string; // ISO date string
	booking_time: string; // "09:00"
	booking_duration: number; // minutes
	booking_type: 'consultation';
	package_type: string; // "discovery", "strategy", "vip"
	guest_info?: GuestInfo; // For non-authenticated users
}

export interface BusinessHours {
	[key: string]: { start: string; end: string } | null;
	monday: { start: string; end: string } | null;
	tuesday: { start: string; end: string } | null;
	wednesday: { start: string; end: string } | null;
	thursday: { start: string; end: string } | null;
	friday: { start: string; end: string } | null;
	saturday: { start: string; end: string } | null;
	sunday: { start: string; end: string } | null;
}
