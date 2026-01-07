import { createAuthStore } from '@tredicik/portal-sdk-svelte/stores';
import { portal } from '$lib/portal';

export const authStore = createAuthStore(portal, {
  storagePrefix: 'ayanda'
});
