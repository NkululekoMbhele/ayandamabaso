<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { portal } from '$lib/portal';
  import { cartStore } from '$lib/stores/cart.svelte';
  import type { Product } from '@tredicik/portal-sdk';
  import * as Card from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Badge } from '$lib/components/ui/badge';
  import { Separator } from '$lib/components/ui/separator';
  import { ShoppingCart, BookOpen, Loader2, ArrowLeft, Star, CheckCircle, XCircle } from 'lucide-svelte';
  import { goto } from '$app/navigation';
  import DOMPurify from 'dompurify';

  let product = $state<Product | null>(null);
  let isLoading = $state(true);
  let error = $state<string | null>(null);
  let quantity = $state(1);
  let selectedImage = $state(0);

  // Toast notification state
  let notification = $state<{ type: 'success' | 'error'; message: string } | null>(null);
  let notificationTimeout: ReturnType<typeof setTimeout> | null = null;

  function showNotification(type: 'success' | 'error', message: string) {
    if (notificationTimeout) clearTimeout(notificationTimeout);
    notification = { type, message };
    notificationTimeout = setTimeout(() => { notification = null; }, 3000);
  }

  const productId = $derived(parseInt(page.url.pathname.split('/').pop() || '0'));

  async function loadProduct() {
    isLoading = true;
    error = null;

    try {
      // SDK returns Product directly
      const productData = await portal.products.getProduct(productId);

      if (productData) {
        product = productData;
        if (product.images && product.images.length > 0) {
          selectedImage = 0;
        }
      } else {
        error = 'Product not found';
      }
    } catch (e: any) {
      error = e.message || 'Failed to load product';
    } finally {
      isLoading = false;
    }
  }

  async function handleAddToCart() {
    if (!product) return;

    const result = await cartStore.addItem({
      offeringId: product.id,
      offeringName: product.name,
      quantity,
      unitPrice: product.salePrice || product.price,
      imageUrl: product.thumbnail || product.images?.[0]?.url
    });

    if (result.success) {
      showNotification('success', `${product.name} added to cart!`);
      setTimeout(() => goto('/cart'), 1000);
    } else {
      showNotification('error', result.error || 'Failed to add to cart');
    }
  }

  onMount(() => {
    loadProduct();
  });
</script>

<svelte:head>
  <title>{product?.name || 'Product'} - Ayanda Mabaso</title>
</svelte:head>

<div class="min-h-screen bg-background">
  <!-- Toast Notification -->
  {#if notification}
    <div class="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
      <div class="flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg {notification.type === 'success'
        ? 'bg-green-50 border border-green-200 text-green-800'
        : 'bg-red-50 border border-red-200 text-red-800'}">
        {#if notification.type === 'success'}
          <CheckCircle class="h-5 w-5 text-green-600" />
        {:else}
          <XCircle class="h-5 w-5 text-red-600" />
        {/if}
        <span class="font-medium">{notification.message}</span>
        <button onclick={() => (notification = null)} class="cursor-pointer select-none active:scale-90 ml-2 text-gray-400 hover:text-gray-600 transition-all" aria-label="Close notification">×</button>
      </div>
    </div>
  {/if}

  <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <!-- Back Button -->
    <Button variant="ghost" class="mb-6" onclick={() => goto('/store')}>
      <ArrowLeft class="h-4 w-4 mr-2" />
      Back to Store
    </Button>

    <!-- Loading State -->
    {#if isLoading}
      <div class="flex items-center justify-center py-20">
        <Loader2 class="h-8 w-8 animate-spin text-primary" />
      </div>
    {/if}

    <!-- Error State -->
    {#if error}
      <div class="p-6 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
        <p class="font-medium">Error loading product</p>
        <p class="text-sm mt-1">{error}</p>
        <Button variant="outline" class="mt-4" onclick={() => goto('/store')}>
          Back to Store
        </Button>
      </div>
    {/if}

    <!-- Product Details -->
    {#if !isLoading && !error && product}
      <div class="grid md:grid-cols-2 gap-8 lg:gap-12">
        <!-- Images -->
        <div>
          <div class="aspect-square bg-muted rounded-lg overflow-hidden mb-4">
            {#if product.images[selectedImage]?.url || product.thumbnail}
              <img
                src={product.images[selectedImage]?.url || product.thumbnail || ''}
                alt={product.name}
                class="w-full h-full object-cover"
              />
            {:else}
              <div class="flex items-center justify-center h-full">
                <BookOpen class="h-24 w-24 text-muted-foreground" />
              </div>
            {/if}
          </div>

          {#if product.images && product.images.length > 1}
            <div class="grid grid-cols-4 gap-2">
              {#each product.images as image, index (image.url || index)}
                <button
                  onclick={() => (selectedImage = index)}
                  class="cursor-pointer select-none active:scale-95 aspect-square bg-muted rounded-lg overflow-hidden border-2 transition-all {selectedImage === index
                    ? 'border-primary'
                    : 'border-transparent'}"
                >
                  <img src={image.url} alt={`${product.name} ${index + 1}`} class="w-full h-full object-cover" />
                </button>
              {/each}
            </div>
          {/if}
        </div>

        <!-- Product Info -->
        <div>
          {#if product.category}
            <Badge variant="secondary" class="mb-2">
              {product.category.name}
            </Badge>
          {/if}

          <h1 class="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {product.name}
          </h1>

          {#if product.rating}
            <div class="flex items-center gap-2 mb-4">
              <div class="flex items-center">
                {#each Array(5) as _, i (i)}
                  <Star
                    class="h-5 w-5 {i < Math.floor(product.rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'}"
                  />
                {/each}
              </div>
              {#if product.reviewCount}
                <span class="text-sm text-muted-foreground">
                  ({product.reviewCount} reviews)
                </span>
              {/if}
            </div>
          {/if}

          <div class="flex items-center gap-3 mb-6">
            {#if product.salePrice}
              <span class="text-3xl font-bold text-primary">
                R{product.salePrice.toFixed(2)}
              </span>
              <span class="text-xl text-muted-foreground line-through">
                R{product.price.toFixed(2)}
              </span>
              <Badge variant="destructive">
                {Math.round(((product.price - product.salePrice) / product.price) * 100)}% OFF
              </Badge>
            {:else}
              <span class="text-3xl font-bold text-primary">
                R{product.price.toFixed(2)}
              </span>
            {/if}
          </div>

          {#if product.shortDescription}
            <p class="text-lg text-muted-foreground mb-6">
              {product.shortDescription}
            </p>
          {/if}

          <Separator class="my-6" />

          <!-- Stock Status -->
          {#if product.inStock}
            <p class="text-sm text-green-600 mb-4">In Stock</p>
          {:else}
            <p class="text-sm text-destructive mb-4">Out of Stock</p>
          {/if}

          <!-- Quantity Selector -->
          <div class="flex items-center gap-4 mb-6">
            <label for="quantity" class="text-sm font-medium">Quantity:</label>
            <div class="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onclick={() => quantity = Math.max(1, quantity - 1)}
              >
                -
              </Button>
              <span class="w-12 text-center">{quantity}</span>
              <Button
                variant="outline"
                size="sm"
                onclick={() => quantity = quantity + 1}
              >
                +
              </Button>
            </div>
          </div>

          <!-- Add to Cart Button -->
          <Button
            class="w-full bg-primary hover:bg-primary/90 text-lg py-6"
            disabled={!product.inStock}
            onclick={handleAddToCart}
          >
            <ShoppingCart class="h-5 w-5 mr-2" />
            Add to Cart
          </Button>

          <!-- Product Description -->
          {#if product.description}
            <Separator class="my-8" />
            <div>
              <h2 class="text-xl font-semibold mb-4">Description</h2>
              <div class="prose max-w-none text-muted-foreground">
                {@html DOMPurify.sanitize(product.description)}
              </div>
            </div>
          {/if}

          <!-- Product Attributes -->
          {#if product.attributes && product.attributes.length > 0}
            <Separator class="my-8" />
            <div>
              <h2 class="text-xl font-semibold mb-4">Details</h2>
              <dl class="space-y-2">
                {#each product.attributes as attr (attr.name)}
                  <div class="flex gap-4">
                    <dt class="font-medium text-foreground w-1/3">{attr.name}:</dt>
                    <dd class="text-muted-foreground">{attr.value}</dd>
                  </div>
                {/each}
              </dl>
            </div>
          {/if}
        </div>
      </div>
    {/if}
  </div>
</div>
