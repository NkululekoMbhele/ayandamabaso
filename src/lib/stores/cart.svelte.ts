// Check if we're in browser
const isBrowser = typeof window !== 'undefined';

// API URL - use api.tredicik.com for HTTPS compatibility
const API_URL = 'https://api.tredicik.com/api/v1';

// Storage keys
const CART_KEY = 'ayanda_cart';
const SESSION_KEY = 'ayanda_cart_session';

// Generate a unique session ID
function generateSessionId(): string {
  return 'sess_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Get or create session ID
function getSessionId(): string {
  if (!isBrowser) return '';
  let sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

// Store session ID from cart response
function storeCartSession(cartData: any) {
  if (!isBrowser || !cartData) return;
  // If the cart has an ID, use it as part of our session tracking
  if (cartData.id) {
    localStorage.setItem(SESSION_KEY + '_cart_id', cartData.id.toString());
  }
}

// Get common headers for API requests
function getApiHeaders(includeContentType = false): Record<string, string> {
  const headers: Record<string, string> = {
    'X-API-Key': import.meta.env.VITE_API_KEY
  };

  if (includeContentType) {
    headers['Content-Type'] = 'application/json';
  }

  // Add auth token if available
  const token = localStorage.getItem('ayanda_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Add session ID for anonymous cart tracking
  const sessionId = getSessionId();
  if (sessionId) {
    headers['X-Session-Id'] = sessionId;
  }

  return headers;
}

// Svelte 5 reactive state
let cart = $state<any>(null);
let isLoading = $state(!isBrowser);
let error = $state<string | null>(null);

// Derived values
const itemsCount = $derived(cart?.items_count || cart?.itemsCount || 0);
const subtotal = $derived(cart?.subtotal || 0);
const discount = $derived((cart?.discount_amount || 0) + (cart?.promo_discount || 0));
const total = $derived(cart?.total || 0);
const isEmpty = $derived(itemsCount === 0);
const items = $derived(cart?.items || []);
const promoCode = $derived(cart?.promo_code || cart?.promoCode);
const creditApplied = $derived(cart?.credit_applied || cart?.creditApplied || 0);

// Load cart from localStorage
function loadFromStorage() {
  if (!isBrowser) return;
  try {
    const storedCart = localStorage.getItem(CART_KEY);
    if (storedCart) {
      const parsed = JSON.parse(storedCart);
      cart = normalizeCart(parsed);
      console.log('[CartStore:ayanda] Cart restored from storage:', cart?.itemsCount, 'items');
    }
  } catch (e) {
    console.error('[CartStore:ayanda] Failed to load cart from storage:', e);
    clearStorage();
  }
}

// Save cart to localStorage
function saveToStorage(cartData: any) {
  if (!isBrowser) return;
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cartData));
  } catch (e) {
    console.error('[CartStore:ayanda] Failed to save cart to storage:', e);
  }
}

// Clear cart from localStorage
function clearStorage() {
  if (!isBrowser) return;
  localStorage.removeItem(CART_KEY);
}

// Normalize cart item from API (snake_case to camelCase)
function normalizeCartItem(item: any): any {
  return {
    id: item.id,
    offeringId: item.offering_id ?? item.offeringId,
    offeringName: item.offering_name ?? item.offeringName ?? '',
    variantId: item.variant_id ?? item.variantId,
    variantName: item.variant_name ?? item.variantName,
    quantity: item.quantity ?? 1,
    unitPrice: Number(item.unit_price ?? item.unitPrice ?? 0),
    discountAmount: Number(item.discount_amount ?? item.discountAmount ?? 0),
    total: Number(item.total ?? item.line_total ?? (item.quantity ?? 1) * Number(item.unit_price ?? item.unitPrice ?? 0)),
    imageUrl: item.image_url ?? item.imageUrl,
    extraData: item.extra_data ?? item.extraData
  };
}

// Normalize cart object from API
function normalizeCart(apiCart: any): any {
  if (!apiCart) return null;

  return {
    ...apiCart,
    items: (apiCart.items || []).map(normalizeCartItem),
    itemsCount: apiCart.items_count ?? apiCart.itemsCount ?? apiCart.items?.length ?? 0,
    subtotal: Number(apiCart.subtotal ?? 0),
    discountAmount: Number(apiCart.discount_amount ?? apiCart.discountAmount ?? 0),
    promoDiscount: Number(apiCart.promo_discount ?? apiCart.promoDiscount ?? 0),
    taxAmount: Number(apiCart.tax_amount ?? apiCart.taxAmount ?? 0),
    shippingAmount: Number(apiCart.shipping_amount ?? apiCart.shippingAmount ?? 0),
    total: Number(apiCart.total ?? 0),
    promoCode: apiCart.promo_code ?? apiCart.promoCode
  };
}

// Update cart state
function updateCart(newCart: any) {
  cart = normalizeCart(newCart);
  if (cart) {
    saveToStorage(cart);
    storeCartSession(cart);
  } else {
    clearStorage();
  }
}

// Load cart from API
async function loadCart() {
  if (!isBrowser) return;
  try {
    isLoading = true;
    error = null;

    // Use api.tredicik.com for HTTPS compatibility (avoid mixed-content errors)
    const apiUrl = 'https://api.tredicik.com/api/v1';
    const response = await fetch(`${apiUrl}/cart`, {
      headers: getApiHeaders()
    });

    if (response.ok) {
      const data = await response.json();
      const apiItemCount = data.items_count || data.itemsCount || data.items?.length || 0;
      const localItemCount = cart?.items_count || cart?.itemsCount || cart?.items?.length || 0;

      // Only update if API has items OR if we don't have local items
      // This prevents losing cart items when API returns empty
      if (apiItemCount > 0 || localItemCount === 0) {
        updateCart(data);
        console.log('[CartStore:ayanda] Cart loaded from API:', apiItemCount, 'items');
      } else {
        console.log('[CartStore:ayanda] Keeping local cart:', localItemCount, 'items (API returned empty)');
      }
    } else {
      console.log('[CartStore:ayanda] API returned status:', response.status);
    }
  } catch (e: any) {
    console.error('[CartStore:ayanda] Failed to load cart:', e);
    error = e.message || 'Failed to load cart';
    // Keep existing cart from localStorage on error
  } finally {
    isLoading = false;
  }
}

// Initialize
if (isBrowser) {
  loadFromStorage();
  loadCart();
}

// Export cart store
export const cartStore = {
  // Reactive getters
  get cart() { return cart; },
  get items() { return items; },
  get itemsCount() { return itemsCount; },
  get subtotal() { return subtotal; },
  get discount() { return discount; },
  get total() { return total; },
  get isEmpty() { return isEmpty; },
  get isLoading() { return isLoading; },
  get error() { return error; },
  get promoCode() { return promoCode; },
  get creditApplied() { return creditApplied; },

  async refresh() {
    await loadCart();
  },

  async addItem(item: {
    offeringId: number;
    offeringName: string;
    quantity: number;
    unitPrice: number;
    variantId?: number;
    variantName?: string;
    imageUrl?: string;
    extraData?: any;
  }) {
    error = null;
    isLoading = true;

    try {
      // Transform to snake_case for backend API
      const payload = {
        offering_id: item.offeringId,
        offering_name: item.offeringName,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        variant_id: item.variantId,
        variant_name: item.variantName,
        image_url: item.imageUrl,
        extra_data: item.extraData
      };

      const response = await fetch(`${API_URL}/cart/items`, {
        method: 'POST',
        headers: getApiHeaders(true),
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        updateCart(data);
        return { success: true };
      } else {
        const errorData = await response.json().catch(() => ({}));
        error = errorData.message || errorData.detail || `Failed to add item (${response.status})`;
        return { success: false, error };
      }
    } catch (e: any) {
      error = e.message || 'Failed to add item';
      return { success: false, error };
    } finally {
      isLoading = false;
    }
  },

  async updateItem(itemId: number, quantity: number) {
    error = null;
    isLoading = true;

    try {
      const response = await fetch(`${API_URL}/cart/items/${itemId}`, {
        method: 'PATCH',
        headers: getApiHeaders(true),
        body: JSON.stringify({ quantity })
      });

      if (response.ok) {
        const data = await response.json();
        updateCart(data);
        return { success: true };
      } else {
        const errorData = await response.json().catch(() => ({}));
        error = errorData.message || errorData.detail || 'Failed to update item';
        return { success: false, error };
      }
    } catch (e: any) {
      error = e.message || 'Failed to update item';
      return { success: false, error };
    } finally {
      isLoading = false;
    }
  },

  async removeItem(itemId: number) {
    error = null;
    isLoading = true;

    try {
      const response = await fetch(`${API_URL}/cart/items/${itemId}`, {
        method: 'DELETE',
        headers: getApiHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        updateCart(data);
        return { success: true };
      } else {
        const errorData = await response.json().catch(() => ({}));
        error = errorData.message || errorData.detail || 'Failed to remove item';
        return { success: false, error };
      }
    } catch (e: any) {
      error = e.message || 'Failed to remove item';
      return { success: false, error };
    } finally {
      isLoading = false;
    }
  },

  async clearCart() {
    error = null;
    isLoading = true;

    try {
      const response = await fetch(`${API_URL}/cart`, {
        method: 'DELETE',
        headers: getApiHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        updateCart(data);
        return { success: true };
      } else {
        const errorData = await response.json().catch(() => ({}));
        error = errorData.message || errorData.detail || 'Failed to clear cart';
        return { success: false, error };
      }
    } catch (e: any) {
      error = e.message || 'Failed to clear cart';
      return { success: false, error };
    } finally {
      isLoading = false;
    }
  },

  async applyPromoCode(code: string): Promise<{ success: boolean; error?: string }> {
    error = null;
    isLoading = true;

    try {
      const response = await fetch(`${API_URL}/cart/promo`, {
        method: 'POST',
        headers: getApiHeaders(true),
        body: JSON.stringify({ promo_code: code })
      });

      if (response.ok) {
        const data = await response.json();
        updateCart(data);
        return { success: true };
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errMsg = errorData.message || errorData.detail || 'Invalid promo code';
        error = errMsg;
        return { success: false, error: errMsg };
      }
    } catch (e: any) {
      const errMsg = e.message || 'Failed to apply promo code';
      error = errMsg;
      return { success: false, error: errMsg };
    } finally {
      isLoading = false;
    }
  },

  clearError() {
    error = null;
  }
};
