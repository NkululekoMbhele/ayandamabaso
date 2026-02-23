<script lang="ts">
  import { onMount } from 'svelte';
  import { portal } from '$lib/portal';
  import { cartStore } from '$lib/stores/cart.svelte';
  import type { Product } from '@tredicik/portal-sdk';
  import { ProductCard } from '$lib/components/store';
  import { EmptyState } from '@tredicik/portal-sdk-svelte/components';
  import { Button } from '$lib/components/ui/button';
  import { BookOpen, Package, Grid3x3, Loader2, CheckCircle, XCircle } from 'lucide-svelte';

  let products = $state<Product[]>([]);
  let allProducts = $state<Product[]>([]);
  let isLoading = $state(true);
  let error = $state<string | null>(null);
  let selectedCategory = $state<string | null>(null);

  // Toast notification state
  let notification = $state<{ type: 'success' | 'error'; message: string } | null>(null);
  let notificationTimeout: ReturnType<typeof setTimeout> | null = null;

  function showNotification(type: 'success' | 'error', message: string) {
    // Clear any existing timeout
    if (notificationTimeout) {
      clearTimeout(notificationTimeout);
    }
    notification = { type, message };
    // Auto-hide after 3 seconds
    notificationTimeout = setTimeout(() => {
      notification = null;
    }, 3000);
  }

  const categories = [
    { id: null, name: 'All Consultations', icon: Grid3x3 },
    { id: 'consultation', name: 'Consultations', icon: Package }
  ];

  async function loadProducts() {
    isLoading = true;
    error = null;

    try {
      const response = await portal.products.getProducts({
        inStock: true,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });

      // SDK returns data directly: { products: [...] }
      if (response && response.products) {
        allProducts = response.products;
        filterProducts();
      } else {
        error = 'Failed to load products';
      }
    } catch (e: any) {
      error = e.message || 'Failed to load products';
    } finally {
      isLoading = false;
    }
  }

  function filterProducts() {
    let filtered = allProducts.filter((p) => {
      const categoryName = p.category?.name?.toLowerCase() || '';
      return categoryName.includes('consultation');
    });

    if (!selectedCategory) {
      products = filtered;
    } else {
      const categoryFilter = selectedCategory;
      products = filtered.filter((p) => {
        const categoryName = p.category?.name?.toLowerCase() || '';
        return categoryName.includes(categoryFilter.toLowerCase());
      });
    }
  }

  async function handleAddToCart(product: any) {
    const price = product.price || 0;
    const result = await cartStore.addItem({
      offeringId: product.id,
      offeringName: product.name,
      quantity: 1,
      unitPrice: price,
      imageUrl: product.image
    });

    if (result.success) {
      showNotification('success', `${product.name} added to cart!`);
    } else {
      showNotification('error', result.error || 'Failed to add to cart');
    }
  }

  // Check if a product is already in the cart
  function isInCart(productId: number): boolean {
    return cartStore.items.some((item: { offeringId?: number }) => item.offeringId === productId);
  }

  // Get cart item IDs as a Set for quick lookup
  const cartProductIds = $derived(
    new Set(cartStore.items.map((item: { offeringId?: number }) => item.offeringId))
  );

  // Map API products to ProductCard format with inCart status
  const mappedProducts = $derived(
    products.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: Number(p.price) || 0,
      image: p.thumbnail || p.images?.[0]?.url,
      category: p.category?.name,
      inCart: cartProductIds.has(p.id)
    }))
  );

  // Load products on mount
  $effect(() => {
    loadProducts();
  });

  // Filter products when category changes
  $effect(() => {
    // Read selectedCategory directly to track it as a dependency
    const category = selectedCategory;
    if (allProducts.length > 0) {
      filterProducts();
    }
  });
</script>

<svelte:head>
  <title>Consultations - Ayanda Mabaso</title>
  <meta name="description" content="Book consultation sessions with Ayanda Mabaso to transform your business strategy and marketing approach" />
</svelte:head>

<div class="min-h-screen bg-background">
  <!-- Toast Notification -->
  {#if notification}
    <div
      class="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 fade-in duration-300"
    >
      <div
        class="flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg {notification.type === 'success'
          ? 'bg-green-50 border border-green-200 text-green-800'
          : 'bg-red-50 border border-red-200 text-red-800'}"
      >
        {#if notification.type === 'success'}
          <CheckCircle class="h-5 w-5 text-green-600" />
        {:else}
          <XCircle class="h-5 w-5 text-red-600" />
        {/if}
        <span class="font-medium">{notification.message}</span>
        <button
          onclick={() => (notification = null)}
          class="cursor-pointer select-none active:scale-90 ml-2 text-gray-400 hover:text-gray-600 transition-all"
          aria-label="Close notification"
        >
          ×
        </button>
      </div>
    </div>
  {/if}

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-4xl font-bold text-foreground mb-2">Consultations</h1>
      <p class="text-lg text-muted-foreground">
        Book a consultation with Ayanda to transform your business strategy and marketing
      </p>
    </div>

    <!-- Category Filters -->
    <div class="flex flex-wrap gap-2 mb-8">
      {#each categories as category (category.id ?? category.name)}
        {@const CategoryIcon = category.icon}
        <Button
          variant={selectedCategory === category.id ? 'default' : 'outline'}
          class={selectedCategory === category.id ? 'bg-primary hover:bg-primary/90' : ''}
          onclick={() => (selectedCategory = category.id)}
        >
          <CategoryIcon class="h-4 w-4 mr-2" />
          {category.name}
        </Button>
      {/each}
    </div>

    <!-- Loading State -->
    {#if isLoading}
      <div class="flex items-center justify-center py-20">
        <Loader2 class="h-8 w-8 animate-spin text-primary" />
      </div>
    {/if}

    <!-- Error State -->
    {#if error}
      <div class="p-6 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
        <p class="font-medium">Error loading products</p>
        <p class="text-sm mt-1">{error}</p>
        <Button variant="outline" class="mt-4" onclick={() => loadProducts()}>
          Try Again
        </Button>
      </div>
    {/if}

    <!-- Products Grid -->
    {#if !isLoading && !error}
      {#if products.length === 0}
        <EmptyState
          icon={Package}
          title="No products found"
          description="Try selecting a different category"
        />
      {:else}
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {#each mappedProducts as product (product.id)}
            <ProductCard
              {product}
              primaryColor="#1a1a2e"
              accentColor="#e94560"
              onAddToCart={handleAddToCart}
            />
          {/each}
        </div>
      {/if}
    {/if}
  </div>
</div>
