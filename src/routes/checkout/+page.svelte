<script lang="ts">
  import { goto } from '$app/navigation';
  import { cartStore } from '$lib/stores/cart.svelte';
  import { authStore } from '$lib/stores/auth.svelte';
  import * as Card from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Separator } from '$lib/components/ui/separator';
  import { ShoppingCart, CreditCard, Lock, ArrowLeft, Loader2, CheckCircle } from 'lucide-svelte';

  // Form state
  let isLoading = $state(false);
  let error = $state('');
  let step = $state<'details' | 'payment' | 'processing'>('details');

  // Customer details
  let firstName = $state(authStore.user?.firstName || '');
  let lastName = $state(authStore.user?.lastName || '');
  let email = $state(authStore.user?.email || '');
  let phone = $state(authStore.user?.phoneNumber || '');

  // Shipping address (for physical products)
  let streetAddress = $state('');
  let city = $state('');
  let postalCode = $state('');
  let province = $state('');

  // Payment form ref for submission
  let paymentForm: HTMLFormElement | null = $state(null);
  let paymentFormData = $state<{ action: string; fields: Record<string, string> } | null>(null);

  // Check if cart has only digital/service products (no physical delivery needed)
  const isDigitalOnly = $derived(
    cartStore.cart?.items?.every((item: { offeringName?: string; isDigital?: boolean }) =>
      item.isDigital === true ||
      item.offeringName?.toLowerCase().includes('consultation') ||
      item.offeringName?.toLowerCase().includes('session') ||
      item.offeringName?.toLowerCase().includes('coaching') ||
      item.offeringName?.toLowerCase().includes('ebook') ||
      item.offeringName?.toLowerCase().includes('e-book') ||
      item.offeringName?.toLowerCase().includes('digital') ||
      item.offeringName?.toLowerCase().includes('workbook') ||
      item.offeringName?.toLowerCase().includes('blueprint') ||
      item.offeringName?.toLowerCase().includes('guide') ||
      item.offeringName?.toLowerCase().includes('masterclass') ||
      item.offeringName?.toLowerCase().includes('course') ||
      item.offeringName?.toLowerCase().includes('workshop')
    ) ?? false
  );

  // Fulfillment type based on cart contents
  const fulfillmentType = $derived(isDigitalOnly ? 'digital' : 'delivery');

  // Validate form
  function validateForm(): boolean {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      error = 'Please fill in all required fields';
      return false;
    }

    if (!email.includes('@')) {
      error = 'Please enter a valid email address';
      return false;
    }

    if (!isDigitalOnly && (!streetAddress.trim() || !city.trim())) {
      error = 'Please enter your shipping address';
      return false;
    }

    return true;
  }

  // Helper to make API calls with proper session/auth headers
  async function apiPost(url: string, data: any) {
    const apiKey = import.meta.env.VITE_API_KEY || 'pk_live_tenant_41';
    const apiUrl = import.meta.env.VITE_API_URL || 'https://api.tredicik.com/api/external/v1';

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey
    };

    // Add auth token if available (use correct key from our auth store)
    const token = localStorage.getItem('ayanda_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Add session ID for cart (use correct key from our cart store)
    const sessionId = localStorage.getItem('ayanda_cart_session');
    if (sessionId) {
      headers['X-Session-Id'] = sessionId;
    }

    // Use direct API URL - CORS is now configured on backend
    const response = await fetch(`${apiUrl}${url}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.message || `Request failed with status code ${response.status}`);
    }

    return response.json();
  }

  async function handleCheckout() {
    if (!validateForm()) return;
    if (!cartStore.cart || cartStore.itemsCount === 0) {
      error = 'Your cart is empty';
      return;
    }

    isLoading = true;
    error = '';
    step = 'processing';

    try {
      // Build shipping address for physical products
      const shippingAddress = !isDigitalOnly ? {
        street_address: streetAddress,
        city: city,
        postal_code: postalCode,
        state_province: province,
        country: 'South Africa',
        contact_name: `${firstName} ${lastName}`,
        contact_phone: phone
      } : undefined;

      // Step 1: Create order using direct API call (to include session ID)
      const orderPayload: Record<string, any> = {
        payment_method: 'card',
        fulfillment_type: fulfillmentType,
        billing_same_as_shipping: true
      };

      // Add shipping address if needed
      if (shippingAddress) {
        orderPayload.shipping_address = shippingAddress;
      }

      // Add guest info if not authenticated
      if (!authStore.isAuthenticated) {
        orderPayload.guest_email = email;
        orderPayload.guest_name = `${firstName} ${lastName}`;
        orderPayload.guest_phone = phone;
      }

      const order = await apiPost('/orders', orderPayload);

      if (!order || !order.id) {
        throw new Error('Failed to create order');
      }

      console.log('Order created:', order.order_number);

      // Step 2: Initialize payment (direct API call since SDK doesn't have this method yet)
      const paymentResult = await apiPost(`/checkout/orders/${order.id}/initialize`, {
        return_url: `${window.location.origin}/checkout/success?order=${order.order_number}`,
        cancel_url: `${window.location.origin}/checkout/cancelled?order=${order.order_number}`
      });

      if (!paymentResult) {
        throw new Error('Failed to initialize payment');
      }

      // Check if already paid (e.g., via credits)
      if (paymentResult.already_paid) {
        // Redirect to success page
        await goto(`/checkout/success?order=${order.order_number}`);
        return;
      }

      // Step 3: Submit to PayFast
      paymentFormData = {
        action: paymentResult.form_action,
        fields: paymentResult.form_fields
      };

      step = 'payment';

      // Auto-submit form after render
      setTimeout(() => {
        if (paymentForm) {
          paymentForm.submit();
        }
      }, 100);

    } catch (err: any) {
      console.error('Checkout error:', err);
      error = err.message || 'An error occurred during checkout';
      step = 'details';
    } finally {
      isLoading = false;
    }
  }

  // Redirect if cart is empty
  $effect(() => {
    if (!cartStore.isLoading && (!cartStore.cart || cartStore.itemsCount === 0)) {
      goto('/cart');
    }
  });
</script>

<svelte:head>
  <title>Checkout - Ayanda Mabaso</title>
</svelte:head>

<div class="min-h-screen bg-background">
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <!-- Back Button -->
    <Button variant="ghost" class="mb-6" onclick={() => goto('/cart')}>
      <ArrowLeft class="h-4 w-4 mr-2" />
      Back to Cart
    </Button>

    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-4xl font-bold text-foreground mb-2">Checkout</h1>
      <p class="text-lg text-muted-foreground">Complete your purchase securely</p>
    </div>

    {#if cartStore.isLoading}
      <div class="flex items-center justify-center py-20">
        <Loader2 class="h-8 w-8 animate-spin text-primary" />
      </div>
    {:else if step === 'payment' && paymentFormData}
      <!-- PayFast Redirect -->
      <div class="text-center py-20">
        <Loader2 class="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
        <h3 class="text-xl font-semibold mb-2">Redirecting to PayFast...</h3>
        <p class="text-muted-foreground">Please wait while we redirect you to complete your payment.</p>

        <!-- Hidden form for PayFast submission -->
        <form
          bind:this={paymentForm}
          action={paymentFormData.action}
          method="POST"
          class="hidden"
        >
          {#each Object.entries(paymentFormData.fields) as [name, value]}
            <input type="hidden" {name} {value} />
          {/each}
        </form>
      </div>
    {:else if step === 'processing'}
      <!-- Processing -->
      <div class="text-center py-20">
        <Loader2 class="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
        <h3 class="text-xl font-semibold mb-2">Processing your order...</h3>
        <p class="text-muted-foreground">Please wait while we create your order.</p>
      </div>
    {:else}
      <div class="grid lg:grid-cols-3 gap-8">
        <!-- Checkout Form -->
        <div class="lg:col-span-2 space-y-6">
          {#if error}
            <div class="p-4 bg-destructive/10 text-destructive rounded-lg">
              {error}
            </div>
          {/if}

          <!-- Customer Details -->
          <Card.Root>
            <Card.Header>
              <Card.Title>Customer Details</Card.Title>
              {#if authStore.isAuthenticated}
                <Card.Description>Logged in as {authStore.user?.email}</Card.Description>
              {:else}
                <Card.Description>Enter your details for this order</Card.Description>
              {/if}
            </Card.Header>
            <Card.Content class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <Label for="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    bind:value={firstName}
                    placeholder="Enter first name"
                    required
                  />
                </div>
                <div>
                  <Label for="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    bind:value={lastName}
                    placeholder="Enter last name"
                    required
                  />
                </div>
              </div>
              <div>
                <Label for="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  bind:value={email}
                  placeholder="you@example.com"
                  required
                  disabled={authStore.isAuthenticated}
                />
              </div>
              <div>
                <Label for="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  bind:value={phone}
                  placeholder="082 123 4567"
                />
              </div>
            </Card.Content>
          </Card.Root>

          <!-- Shipping Address (only for physical products) -->
          {#if !isDigitalOnly}
            <Card.Root>
              <Card.Header>
                <Card.Title>Shipping Address</Card.Title>
                <Card.Description>Where should we deliver your order?</Card.Description>
              </Card.Header>
              <Card.Content class="space-y-4">
                <div>
                  <Label for="streetAddress">Street Address *</Label>
                  <Input
                    id="streetAddress"
                    bind:value={streetAddress}
                    placeholder="123 Main Street"
                    required
                  />
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <Label for="city">City *</Label>
                    <Input
                      id="city"
                      bind:value={city}
                      placeholder="Durban"
                      required
                    />
                  </div>
                  <div>
                    <Label for="province">Province</Label>
                    <Input
                      id="province"
                      bind:value={province}
                      placeholder="KwaZulu-Natal"
                    />
                  </div>
                </div>
                <div>
                  <Label for="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    bind:value={postalCode}
                    placeholder="4001"
                  />
                </div>
              </Card.Content>
            </Card.Root>
          {:else}
            <Card.Root>
              <Card.Header>
                <Card.Title class="flex items-center gap-2">
                  <CheckCircle class="h-5 w-5 text-green-500" />
                  Digital Delivery
                </Card.Title>
                <Card.Description>
                  Your digital products will be delivered to your email address after payment.
                </Card.Description>
              </Card.Header>
            </Card.Root>
          {/if}

          <!-- Payment Method -->
          <Card.Root>
            <Card.Header>
              <Card.Title class="flex items-center gap-2">
                <CreditCard class="h-5 w-5" />
                Payment Method
              </Card.Title>
            </Card.Header>
            <Card.Content>
              <div class="p-4 border rounded-lg bg-muted/50">
                <div class="flex items-center gap-3">
                  <img
                    src="/payfast.svg"
                    alt="PayFast"
                    class="h-8"
                  />
                  <div>
                    <p class="font-medium">Secure payment via PayFast</p>
                    <p class="text-sm text-muted-foreground">
                      Credit/Debit Card, EFT, or Instant EFT
                    </p>
                  </div>
                </div>
              </div>
              <p class="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                <Lock class="h-3 w-3" />
                Your payment details are secured with 256-bit SSL encryption
              </p>
            </Card.Content>
          </Card.Root>
        </div>

        <!-- Order Summary -->
        <div class="lg:col-span-1">
          <Card.Root class="sticky top-20">
            <Card.Header>
              <Card.Title>Order Summary</Card.Title>
            </Card.Header>
            <Card.Content class="space-y-4">
              <!-- Items List -->
              <div class="space-y-3">
                {#if cartStore.cart?.items}
                  {#each cartStore.cart.items as item}
                    <div class="flex justify-between text-sm">
                      <div class="flex-1">
                        <p class="font-medium truncate pr-4">{item.offeringName}</p>
                        <p class="text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <span class="font-medium">R{item.total.toFixed(2)}</span>
                    </div>
                  {/each}
                {/if}
              </div>

              <Separator />

              <!-- Price Breakdown -->
              <div class="space-y-2">
                <div class="flex justify-between text-sm">
                  <span class="text-muted-foreground">Subtotal</span>
                  <span class="font-medium">R{cartStore.cart?.subtotal?.toFixed(2) || '0.00'}</span>
                </div>

                {#if cartStore.cart?.discountAmount && cartStore.cart.discountAmount > 0}
                  <div class="flex justify-between text-sm">
                    <span class="text-muted-foreground">Discount</span>
                    <span class="font-medium text-green-600">
                      -R{cartStore.cart.discountAmount.toFixed(2)}
                    </span>
                  </div>
                {/if}

                {#if cartStore.cart?.promoCode}
                  <div class="flex justify-between text-sm">
                    <span class="text-muted-foreground">Promo ({cartStore.cart.promoCode})</span>
                    <span class="font-medium text-green-600">
                      -R{cartStore.cart.promoDiscount?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                {/if}
              </div>

              <Separator />

              <!-- Total -->
              <div class="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span class="text-primary">R{cartStore.cart?.total?.toFixed(2) || '0.00'}</span>
              </div>

              <!-- Checkout Button -->
              <Button
                class="w-full bg-primary hover:bg-primary/90 py-6 text-lg"
                onclick={handleCheckout}
                disabled={isLoading}
              >
                {#if isLoading}
                  <Loader2 class="h-5 w-5 animate-spin mr-2" />
                  Processing...
                {:else}
                  <Lock class="h-5 w-5 mr-2" />
                  Pay R{cartStore.cart?.total?.toFixed(2) || '0.00'}
                {/if}
              </Button>

              <p class="text-xs text-muted-foreground text-center">
                By placing this order, you agree to our Terms of Service
              </p>
            </Card.Content>
          </Card.Root>
        </div>
      </div>
    {/if}
  </div>
</div>
