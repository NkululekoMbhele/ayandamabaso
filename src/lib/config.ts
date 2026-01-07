/**
 * Tenant Configuration for Ayanda Mabaso
 *
 * This configuration defines the tenant-specific settings for the
 * Ayanda Mabaso website, including branding, features, and API integration.
 */

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
}

export const tenantConfig: TenantConfig = {
	tenantId: 41,
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
