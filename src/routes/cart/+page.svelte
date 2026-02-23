<script lang="ts">
  import { goto } from '$app/navigation';
  import { cartStore } from '$lib/stores/cart.svelte';
  import { authStore } from '$lib/stores/auth.svelte';
  import * as Card from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Separator } from '$lib/components/ui/separator';
  import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, Loader2 } from 'lucide-svelte';

  let promoCode = $state('');
  let isApplyingPromo = $state(false);

  async function updateQuantity(itemId: number, newQuantity: number) {
    if (newQuantity < 1) {
      await cartStore.removeItem(itemId);
    } else {
      await cartStore.updateItem(itemId, newQuantity);
    }
  }

  async function removeItem(itemId: number) {
    if (confirm('Remove this item from your cart?')) {
      await cartStore.removeItem(itemId);
    }
  }

  async function applyPromoCode() {
    if (!promoCode.trim()) return;

    isApplyingPromo = true;
    const result = await cartStore.applyPromoCode(promoCode);
    isApplyingPromo = false;

    if (result.success) {
      promoCode = '';
      alert('Promo code applied!');
    } else {
      alert(result.error || 'Invalid promo code');
    }
  }

  function handleCheckout() {
    if (!authStore.isAuthenticated) {
      // Trigger login modal
      window.dispatchEvent(new CustomEvent('openLoginModal'));
    } else {
      // Proceed to checkout (would be implemented)
      goto('/checkout');
    }
  }
</script>

<svelte:head>
  <title>Shopping Cart - Ayanda Mabaso</title>
</svelte:head>

<div class="min-h-screen bg-background">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <!-- Back Button -->
    <Button variant="ghost" class="mb-6" onclick={() => goto('/store')}>
      <ArrowLeft class="h-4 w-4 mr-2" />
      Continue Shopping
    </Button>

    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-4xl font-bold text-foreground mb-2">Shopping Cart</h1>
      <p class="text-lg text-muted-foreground">
        {cartStore.itemsCount} {cartStore.itemsCount === 1 ? 'item' : 'items'} in your cart
      </p>
    </div>

    {#if cartStore.isLoading}
      <div class="flex items-center justify-center py-20">
        <Loader2 class="h-8 w-8 animate-spin text-primary" />
      </div>
    {:else if !cartStore.cart || cartStore.itemsCount === 0}
      <!-- Empty Cart -->
      <div class="text-center py-20">
        <ShoppingCart class="h-24 w-24 mx-auto text-muted-foreground mb-4" />
        <h3 class="text-2xl font-semibold text-foreground mb-2">Your cart is empty</h3>
        <p class="text-muted-foreground mb-6">Add some products to get started</p>
        <Button onclick={() => goto('/store')} class="bg-primary hover:bg-primary/90">
          Browse Products
        </Button>
      </div>
    {:else}
      <div class="grid lg:grid-cols-3 gap-8">
        <!-- Cart Items -->
        <div class="lg:col-span-2 space-y-4">
          {#each cartStore.cart.items as item (item.id)}
          {@const isDigital = item.offeringName?.toLowerCase().includes('ebook') ||
                              item.offeringName?.toLowerCase().includes('e-book') ||
                              item.offeringName?.toLowerCase().includes('digital') ||
                              item.offeringName?.toLowerCase().includes('workbook') ||
                              item.offeringName?.toLowerCase().includes('blueprint') ||
                              item.offeringName?.toLowerCase().includes('guide')}
            <Card.Root>
              <Card.Content class="p-4">
                <div class="flex gap-4">
                  <!-- Item Image -->
                  <div class="w-24 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                    {#if item.imageUrl}
                      <img src={item.imageUrl} alt={item.offeringName} class="w-full h-full object-cover" />
                    {:else}
                      <div class="flex items-center justify-center h-full">
                        <ShoppingCart class="h-8 w-8 text-muted-foreground" />
                      </div>
                    {/if}
                  </div>

                  <!-- Item Details -->
                  <div class="flex-1">
                    <h3 class="font-semibold text-lg text-foreground mb-1">
                      {item.offeringName}
                    </h3>
                    {#if item.variantName}
                      <p class="text-sm text-muted-foreground mb-2">{item.variantName}</p>
                    {/if}
                    <div class="flex items-center gap-4">
                      <span class="text-primary font-semibold">
                        R{item.unitPrice.toFixed(2)}
                      </span>
                      {#if item.discountAmount > 0}
                        <span class="text-sm text-muted-foreground line-through">
                          R{(item.unitPrice + item.discountAmount).toFixed(2)}
                        </span>
                      {/if}
                    </div>
                  </div>

                  <!-- Quantity Controls -->
                  <div class="flex flex-col items-end gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onclick={() => removeItem(item.id)}
                      class="text-destructive hover:text-destructive"
                    >
                      <Trash2 class="h-4 w-4" />
                    </Button>

                    {#if isDigital}
                      <!-- Digital product - quantity locked at 1 -->
                      <div class="flex items-center gap-2">
                        <span class="text-sm text-muted-foreground px-3 py-1 bg-muted rounded">
                          Digital Product
                        </span>
                      </div>
                    {:else}
                      <!-- Physical product - quantity controls -->
                      <div class="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onclick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus class="h-3 w-3" />
                        </Button>
                        <span class="w-8 text-center font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onclick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus class="h-3 w-3" />
                        </Button>
                      </div>
                    {/if}

                    <div class="text-right">
                      <p class="text-sm text-muted-foreground">Subtotal</p>
                      <p class="font-semibold text-foreground">R{item.total.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </Card.Content>
            </Card.Root>
          {/each}
        </div>

        <!-- Cart Summary -->
        <div class="lg:col-span-1">
          <Card.Root class="sticky top-20">
            <Card.Header>
              <Card.Title>Order Summary</Card.Title>
            </Card.Header>
            <Card.Content class="space-y-4">
              <!-- Promo Code -->
              <div>
                <label for="promoCode" class="text-sm font-medium mb-2 block">
                  Promo Code
                </label>
                <div class="flex gap-2">
                  <Input
                    id="promoCode"
                    placeholder="Enter code"
                    bind:value={promoCode}
                    disabled={isApplyingPromo}
                  />
                  <Button
                    variant="outline"
                    onclick={applyPromoCode}
                    disabled={isApplyingPromo || !promoCode.trim()}
                  >
                    Apply
                  </Button>
                </div>
              </div>

              <Separator />

              <!-- Price Breakdown -->
              <div class="space-y-2">
                <div class="flex justify-between text-sm">
                  <span class="text-muted-foreground">Subtotal</span>
                  <span class="font-medium">R{cartStore.cart.subtotal.toFixed(2)}</span>
                </div>

                {#if cartStore.cart.discountAmount > 0}
                  <div class="flex justify-between text-sm">
                    <span class="text-muted-foreground">Discount</span>
                    <span class="font-medium text-green-600">
                      -R{cartStore.cart.discountAmount.toFixed(2)}
                    </span>
                  </div>
                {/if}

                {#if cartStore.cart.promoCode}
                  <div class="flex justify-between text-sm">
                    <span class="text-muted-foreground">
                      Promo ({cartStore.cart.promoCode})
                    </span>
                    <span class="font-medium text-green-600">
                      -R{cartStore.cart.promoDiscount.toFixed(2)}
                    </span>
                  </div>
                {/if}

                {#if cartStore.cart.taxAmount > 0}
                  <div class="flex justify-between text-sm">
                    <span class="text-muted-foreground">Tax</span>
                    <span class="font-medium">R{cartStore.cart.taxAmount.toFixed(2)}</span>
                  </div>
                {/if}

                {#if cartStore.cart.shippingAmount > 0}
                  <div class="flex justify-between text-sm">
                    <span class="text-muted-foreground">Shipping</span>
                    <span class="font-medium">R{cartStore.cart.shippingAmount.toFixed(2)}</span>
                  </div>
                {/if}
              </div>

              <Separator />

              <!-- Total -->
              <div class="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span class="text-primary">R{cartStore.cart.total.toFixed(2)}</span>
              </div>

              <!-- Checkout Button -->
              <Button
                class="w-full bg-primary hover:bg-primary/90 py-6 text-lg"
                onclick={handleCheckout}
              >
                Proceed to Checkout
              </Button>

              {#if !authStore.isAuthenticated}
                <p class="text-xs text-muted-foreground text-center">
                  Sign in to save your cart and track orders
                </p>
              {/if}
            </Card.Content>
          </Card.Root>
        </div>
      </div>
    {/if}
  </div>
</div>
