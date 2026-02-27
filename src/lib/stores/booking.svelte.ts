/**
 * Booking Store - Manages consultation booking state and logic
 * Integrates with Portal SDK and Cart Store
 */

import { portal } from '$lib/portal';
import { cartStore } from './cart.svelte';
import { authStore } from './auth.svelte';
import { tenantConfig } from '$lib/config';
import type {
	ConsultationOffering,
	TimeSlot,
	BookedSlot,
	GuestInfo,
	BookingMetadata
} from '$lib/types/booking';
import {
	generateTimeSlots,
	getBookedSlotsFromOrders,
	DEFAULT_BUSINESS_HOURS
} from '$lib/utils/booking';
import { addDays } from '$lib/utils/date';

class BookingStore {
	offerings = $state<ConsultationOffering[]>([]);
	selectedOffering = $state<ConsultationOffering | null>(null);
	selectedDate = $state<Date | null>(null);
	selectedTime = $state<string | null>(null);
	availableSlots = $state<TimeSlot[]>([]);
	bookedSlots = $state<BookedSlot[]>([]);
	guestInfo = $state<GuestInfo | null>(null);
	isLoading = $state(false);
	error = $state<string | null>(null);

	/**
	 * Load consultation offerings from the backend
	 * Filters for SERVICE type offerings with consultation metadata
	 * Falls back to hardcoded packages if API is unavailable
	 */
	async loadConsultationOfferings(): Promise<void> {
		this.isLoading = true;
		this.error = null;

		try {
			// Fetch products/offerings from backend API (CORS now configured)
			const apiKey = import.meta.env.VITE_API_KEY || 'pk_live_tenant_41';
			const apiUrl = import.meta.env.VITE_API_URL || 'https://api.tredicik.com/api/external/v1';

			// Use direct API URL - CORS is now configured on backend
			const response = await fetch(
				`${apiUrl}/products?inStock=true&sortBy=createdAt&sortOrder=desc`,
				{
					headers: {
						'X-API-Key': apiKey,
						'Content-Type': 'application/json'
					},
					signal: AbortSignal.timeout(5000) // 5 second timeout
				}
			);

			if (!response.ok) {
				console.warn('[BookingStore] API request failed:', response.status);
				throw new Error(`API request failed with status ${response.status}`);
			}

			const data = await response.json();
			console.log('[BookingStore] API Response:', data);

			// Handle different response structures
			let products = [];
			if (Array.isArray(data)) {
				products = data;
			} else if (data.products && Array.isArray(data.products)) {
				products = data.products;
			} else if (data.items && Array.isArray(data.items)) {
				products = data.items;
			} else if (data.data && Array.isArray(data.data)) {
				products = data.data;
			} else if (data.results && Array.isArray(data.results)) {
				products = data.results;
			}

			if (!products || !Array.isArray(products) || products.length === 0) {
				console.warn('[BookingStore] No products in expected format, using fallback. Response:', data);
				throw new Error('No products returned from API');
			}

			// Filter and map to consultation offerings
			// Look for offerings with metadata indicating they're consultations
			const consultationOfferings = products
				.filter((product: any) => {
					return (
						product.offering_type === 'service' &&
						(product.name?.toLowerCase().includes('consultation') ||
							product.name?.toLowerCase().includes('session'))
					);
				})
				.map((product: any) => {
					const metadata = product.metadata || product.custom_metadata || {};
					return {
						id: product.id,
						name: product.name,
						description: product.description || '',
						package_type: metadata.package_type || 'discovery',
						duration_minutes: metadata.duration_minutes || 30,
						price: product.base_price || product.price,
						sale_price: product.sale_price,
						image_url: product.image_url,
						metadata: {
							includes: metadata.features || metadata.includes || [],
							buffer_minutes: metadata.buffer_minutes || tenantConfig.consultations?.defaultBufferMinutes || 15,
							advance_booking_days:
								metadata.advance_booking_days || tenantConfig.consultations?.advanceBookingDays || 1,
							max_booking_days:
								metadata.max_booking_days || tenantConfig.consultations?.maxBookingDays || 90,
							popular: metadata.popular || false
						}
					};
				});

			if (consultationOfferings.length === 0) {
				console.warn('[BookingStore] API returned products but none are consultation services, using fallback');
				throw new Error('No consultation offerings found in API products');
			}

			this.offerings = consultationOfferings;
			console.log(`Loaded ${this.offerings.length} consultation offerings from API`);
		} catch (err: any) {
			// Fallback to hardcoded packages if API fails
			console.warn('API unavailable, using hardcoded packages:', err.message);
			this.offerings = [
				{
					id: 1,
					name: '1 Hour Consultation',
					description: 'Focused one-on-one consultation session',
					package_type: 'standard',
					duration_minutes: 60,
					price: 2500,
					sale_price: null,
					image_url: null,
					metadata: {
						includes: [
							'One-on-one session',
							'Strategic guidance',
							'Actionable insights',
							'Post-session summary'
						],
						buffer_minutes: 15,
						advance_booking_days: 1,
						max_booking_days: 90,
						popular: false
					}
				},
				{
					id: 2,
					name: '2 Hours Deep Dive',
					description: 'In-depth consultation for comprehensive strategies',
					package_type: 'strategy',
					duration_minutes: 120,
					price: 4000,
					sale_price: null,
					image_url: null,
					metadata: {
						includes: [
							'Extended one-on-one session',
							'Deep strategy development',
							'Comprehensive business audit',
							'Detailed action plan',
							'Follow-up email support'
						],
						buffer_minutes: 15,
						advance_booking_days: 1,
						max_booking_days: 90,
						popular: true
					}
				},
				{
					id: 3,
					name: 'Live Group Session Teaching',
					description: 'Interactive training for corporate teams',
					package_type: 'group',
					duration_minutes: 120,
					price: 15000,
					sale_price: null,
					image_url: null,
					metadata: {
						includes: [
							'2-hour interactive training',
							'5-10 participants',
							'Perfect for corporate teams',
							'Social media strategy',
							'Marketing best practices',
							'Q&A session',
							'Course materials included'
						],
						buffer_minutes: 30,
						advance_booking_days: 1,
						max_booking_days: 90,
						popular: false
					}
				}
			];
			console.log(`Loaded ${this.offerings.length} consultation offerings from hardcoded fallback`);
		} finally {
			this.isLoading = false;
		}
	}

	/**
	 * Select a consultation offering
	 * @param offeringId ID of the offering to select
	 */
	selectOffering(offeringId: number): void {
		this.selectedOffering = this.offerings.find((o) => o.id === offeringId) || null;
		// Reset date/time when changing offering
		this.selectedDate = null;
		this.selectedTime = null;
		this.availableSlots = [];
	}

	/**
	 * Load available time slots for a specific date
	 * @param date Date to check availability for
	 */
	async loadAvailableSlots(date: Date): Promise<void> {
		if (!this.selectedOffering) {
			this.error = 'Please select a consultation package first';
			return;
		}

		this.isLoading = true;
		this.error = null;

		// Generate time slots based on business hours first (synchronous, fast)
		const businessHours = tenantConfig.businessHours || DEFAULT_BUSINESS_HOURS;
		const bufferMinutes = this.selectedOffering.metadata.buffer_minutes;

		console.log('[BookingStore] Loading slots for', date.toDateString());

		// Generate all possible slots immediately (no API dependency)
		const allSlots = generateTimeSlots(
			date,
			this.selectedOffering.duration_minutes,
			businessHours,
			[], // No booked slots initially - all are available
			bufferMinutes
		);

		// Show all slots as available immediately
		this.availableSlots = allSlots;
		console.log('[BookingStore] Generated', allSlots.length, 'slots for', date.toDateString());

		// If no slots were generated (e.g., weekend), keep loading false
		if (allSlots.length === 0) {
			this.isLoading = false;
			console.log('[BookingStore] No slots available for this day (possibly weekend or outside business hours)');
			return;
		}

		// Done with initial generation - slots are now visible
		this.isLoading = false;

		// Optional: Try to fetch booked slots in background (non-blocking)
		// Only attempt if user is authenticated to avoid 401 errors
		if (authStore.isAuthenticated) {
			try {
				const ordersResponse = await portal.orders.getOrders({
					page: 1,
					perPage: 50
				});

				// Extract booked slots from orders
				this.bookedSlots = getBookedSlotsFromOrders(ordersResponse.orders || [], date);
				console.log('[BookingStore] Booked slots found:', this.bookedSlots.length);

				// Re-generate with booked slots if any were found
				if (this.bookedSlots.length > 0) {
					this.availableSlots = generateTimeSlots(
						date,
						this.selectedOffering!.duration_minutes,
						businessHours,
						this.bookedSlots,
						bufferMinutes
					);
				}
			} catch (orderErr) {
				// Silent fail - keep all slots as available
				console.warn('[BookingStore] Could not fetch orders:', orderErr);
			}
		}
	}

	/**
	 * Select date and time for the booking
	 * @param date Selected date
	 * @param time Selected time (24-hour format, e.g., "09:00")
	 */
	selectDateTime(date: Date, time: string): void {
		// Validate that the slot is still available
		const slot = this.availableSlots.find((s) => s.time === time);
		if (!slot || !slot.available) {
			this.error = 'Selected time slot is no longer available';
			return;
		}

		this.selectedDate = date;
		this.selectedTime = time;
		this.error = null;
	}

	/**
	 * Set guest information for non-authenticated users
	 * @param info Guest contact information
	 */
	setGuestInfo(info: GuestInfo): void {
		this.guestInfo = info;
	}

	/**
	 * Add the consultation booking to the cart
	 * @returns Result object with success status and optional error message
	 */
	async addToCart(): Promise<{ success: boolean; error?: string }> {
		// Validation
		if (!this.selectedOffering) {
			return { success: false, error: 'Please select a consultation package' };
		}

		if (!this.selectedDate) {
			return { success: false, error: 'Please select a date for your consultation' };
		}

		// Check if authenticated user or guest info provided
		if (!authStore.isAuthenticated && !this.guestInfo) {
			return { success: false, error: 'Please provide your contact information' };
		}

		// Prepare booking metadata
		const bookingMetadata: BookingMetadata = {
			booking_date: this.selectedDate.toISOString(),
			booking_time: this.selectedTime,
			booking_duration: this.selectedOffering.duration_minutes,
			booking_type: 'consultation',
			package_type: this.selectedOffering.package_type,
			guest_info: !authStore.isAuthenticated && this.guestInfo ? this.guestInfo : undefined
		};

		try {
			// Add to cart using cart store
			const result = await cartStore.addItem({
				offeringId: this.selectedOffering.id,
				offeringName: this.selectedOffering.name,
				quantity: 1, // Consultations are always quantity 1
				unitPrice: this.selectedOffering.price,
				imageUrl: this.selectedOffering.image_url ?? undefined,
				extraData: bookingMetadata
			});

			if (result.success) {
				console.log('Consultation added to cart successfully', bookingMetadata);
				return { success: true };
			} else {
				return { success: false, error: result.error || 'Failed to add to cart' };
			}
		} catch (err: any) {
			console.error('Error adding consultation to cart:', err);
			return { success: false, error: err.message || 'An unexpected error occurred' };
		}
	}

	/**
	 * Get minimum booking date (today + advance days)
	 */
	get minBookingDate(): Date {
		const advanceDays = this.selectedOffering?.metadata.advance_booking_days || 1;
		return addDays(new Date(), advanceDays);
	}

	/**
	 * Get maximum booking date (today + max days)
	 */
	get maxBookingDate(): Date {
		const maxDays = this.selectedOffering?.metadata.max_booking_days || 90;
		return addDays(new Date(), maxDays);
	}

	/**
	 * Check if booking form is complete and valid
	 * Note: Date-only booking - time will be confirmed via email
	 */
	get isComplete(): boolean {
		return !!(
			this.selectedOffering &&
			this.selectedDate &&
			(authStore.isAuthenticated || this.guestInfo)
		);
	}

	/**
	 * Reset the booking state
	 */
	reset(): void {
		this.selectedOffering = null;
		this.selectedDate = null;
		this.selectedTime = null;
		this.availableSlots = [];
		this.bookedSlots = [];
		this.guestInfo = null;
		this.error = null;
	}
}

// Export singleton instance
export const bookingStore = new BookingStore();
