/**
 * Tenant Configuration for Ayanda Mabaso
 *
 * This configuration defines the tenant-specific settings for the
 * Ayanda Mabaso website, including branding, features, and API integration.
 */

import type { BusinessHours } from '$lib/types/booking';

export interface TenantTheme {
	primary: string;
	secondary: string;
	accent: string;
}

export interface TenantFeatures {
	store: boolean;
	booking: boolean;
	blog: boolean;
	newsletter: boolean;
}

export interface TenantConfig {
	tenantId: number;
	name: string;
	domain: string;
	theme: TenantTheme;
	features: TenantFeatures;
	api: {
		baseUrl: string;
		timeout: number;
	};
	social: {
		facebook?: string;
		instagram?: string;
		twitter?: string;
		linkedin?: string;
	};
	businessHours?: BusinessHours;
	consultations?: {
		enabled: boolean;
		defaultBufferMinutes: number;
		advanceBookingDays: number;
		maxBookingDays: number;
	};
}

export const tenantConfig: TenantConfig = {
	tenantId: Number(import.meta.env.VITE_TENANT_ID) || 41,
	name: 'Ayanda Mabaso',
	domain: 'ayandamabaso.co.za',
	theme: {
		primary: '#1a1a2e',
		secondary: '#16213e',
		accent: '#e94560'
	},
	features: {
		store: true,
		booking: true,
		blog: false,
		newsletter: true
	},
	api: {
		baseUrl: import.meta.env.VITE_API_URL || 'https://api.ayandamabaso.co.za',
		timeout: 30000
	},
	social: {
		instagram: 'https://instagram.com/ayandamabaso',
		facebook: 'https://facebook.com/ayandamabaso',
		linkedin: 'https://linkedin.com/in/ayandamabaso'
	},
	businessHours: {
		monday: { start: '09:00', end: '17:00' },
		tuesday: { start: '09:00', end: '17:00' },
		wednesday: { start: '09:00', end: '17:00' },
		thursday: { start: '09:00', end: '17:00' },
		friday: { start: '09:00', end: '17:00' },
		saturday: null,
		sunday: null
	},
	consultations: {
		enabled: true,
		defaultBufferMinutes: 15,
		advanceBookingDays: 1,
		maxBookingDays: 90
	}
};

/**
 * Helper function to check if a feature is enabled
 */
export function isFeatureEnabled(feature: keyof TenantFeatures): boolean {
	return tenantConfig.features[feature];
}

/**
 * Get tenant-specific API URL
 */
export function getApiUrl(endpoint: string): string {
	return `${tenantConfig.api.baseUrl}${endpoint}`;
}
