import { createCartStore } from '@tredicik/portal-sdk-svelte/stores';
import { portal } from '$lib/portal';

export const cartStore = createCartStore(portal, {
  storagePrefix: 'ayanda'
});
