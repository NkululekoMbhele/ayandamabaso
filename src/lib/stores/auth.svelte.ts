import { createAuthStore } from '@tredicik/portal-sdk-svelte/stores';
import { portal } from '$lib/portal';

/**
 * Sync the Svelte auth store token to the SDK's internal TokenStorage.
 *
 * The portal SDK reads tokens from `tredicik_portal_token` (hardcoded key),
 * but the Svelte auth store saves under `ayanda_token`. On page reload the
 * Svelte store restores the user, yet the SDK's TokenStorage may be empty,
 * causing SDK calls like `portal.orders.getOrders()` to be unauthenticated.
 *
 * This function bridges the two by writing the token in the format the SDK expects.
 */
function syncTokenToSDK(token: string | null) {
  if (typeof window === 'undefined') return;

  const SDK_TOKEN_KEY = 'tredicik_portal_token';

  if (token) {
    const tokenData = {
      accessToken: token,
      // Set a generous expiry — the backend will reject truly expired tokens
      expiresAt: Date.now() + 24 * 60 * 60 * 1000
    };
    localStorage.setItem(SDK_TOKEN_KEY, JSON.stringify(tokenData));
  } else {
    localStorage.removeItem(SDK_TOKEN_KEY);
  }
}

// On load, sync any existing token to the SDK
if (typeof window !== 'undefined') {
  const existingToken = localStorage.getItem('ayanda_token');
  if (existingToken) {
    syncTokenToSDK(existingToken);
  }
}

export const authStore = createAuthStore(portal, {
  storagePrefix: 'ayanda',
  onAuthStateChange: (customer) => {
    // When auth state changes (login/logout), keep SDK token storage in sync
    const token = typeof window !== 'undefined' ? localStorage.getItem('ayanda_token') : null;
    syncTokenToSDK(customer ? token : null);
  }
});
