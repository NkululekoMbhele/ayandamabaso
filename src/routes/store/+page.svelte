<script lang="ts">
  import { onMount } from 'svelte';
  import { portal } from '$lib/portal';
  import { cartStore } from '$lib/stores/cart.svelte';
  import type { Product } from '@tredicik/portal-sdk';
  import { ProductCard, EmptyState, LoadingSpinner } from '@tredicik/portal-sdk-svelte/components';
  import { Button } from '$lib/components/ui/button';
  import { BookOpen, Package, Grid3x3, Loader2 } from 'lucide-svelte';

  let products = $state<Product[]>([]);
  let isLoading = $state(true);
  let error = $state<string | null>(null);
  let selectedCategory = $state<number | null>(null);

  const categories = [
    { id: null, name: 'All Products', icon: Grid3x3 },
    { id: 1, name: 'Ebooks', icon: BookOpen },
    { id: 2, name: 'Physical Books', icon: Package }
  ];

  async function loadProducts() {
    isLoading = true;
    error = null;

    try {
      const response = await portal.products.getProducts({
        categoryId: selectedCategory || undefined,
        inStock: true,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });

      // SDK returns data directly: { products: [...] }
      if (response && response.products) {
        products = response.products;
      } else {
        error = 'Failed to load products';
      }
    } catch (e: any) {
      error = e.message || 'Failed to load products';
    } finally {
      isLoading = false;
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
      alert('Added to cart!');
    } else {
      alert(result.error || 'Failed to add to cart');
    }
  }

  // Map API products to ProductCard format
  const mappedProducts = $derived(
    products.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price?.base_price || 0,
      image: p.image_url,
      category: p.category?.name
    }))
  );

  // Load products when category changes
  $effect(() => {
    // Read selectedCategory directly to track it as a dependency
    const category = selectedCategory;
    loadProducts();
  });
</script>

<svelte:head>
  <title>Store - Ayanda Mabaso</title>
  <meta name="description" content="Browse our collection of business ebooks and resources" />
</svelte:head>

<div class="min-h-screen bg-background">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-4xl font-bold text-foreground mb-2">Store</h1>
      <p class="text-lg text-muted-foreground">
        Discover our collection of business ebooks and resources
      </p>
    </div>

    <!-- Category Filters -->
    <div class="flex flex-wrap gap-2 mb-8">
      {#each categories as category}
        <Button
          variant={selectedCategory === category.id ? 'default' : 'outline'}
          class={selectedCategory === category.id ? 'bg-primary hover:bg-primary/90' : ''}
          onclick={() => (selectedCategory = category.id)}
        >
          <svelte:component this={category.icon} class="h-4 w-4 mr-2" />
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
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
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
