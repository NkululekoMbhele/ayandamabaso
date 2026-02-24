<script lang="ts">
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import { authStore } from '$lib/stores/auth.svelte';
  import { portal } from '$lib/portal';
  import type { Order } from '@tredicik/portal-sdk';
  import * as Card from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Badge } from '$lib/components/ui/badge';
  import { User, Package, Calendar, ShoppingBag, Loader2, Download } from 'lucide-svelte';

  let orders = $state<Order[]>([]);
  let isLoading = $state(true);
  let dashboardLoaded = $state(false);
  let stats = $state({
    totalOrders: 0,
    totalSpent: 0,
    upcomingBookings: 0
  });

  async function loadDashboard() {
    isLoading = true;

    try {
      const ordersResponse = await portal.orders.getOrders({ page: 1, perPage: 5 });

      // SDK returns data directly: { orders: [...], total, page, perPage }
      if (ordersResponse && ordersResponse.orders) {
        orders = ordersResponse.orders;
        stats.totalOrders = ordersResponse.total || 0;
        stats.totalSpent = orders.reduce((sum, order) => sum + (order.total || 0), 0);
      }
    } catch (e) {
      console.error('Failed to load dashboard:', e);
    } finally {
      isLoading = false;
    }
  }

  function getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
      case 'refunded':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  // Client-side auth guard using $effect so it reacts to auth state changes.
  // With adapter-static, server-side guards don't run; this ensures we only
  // redirect after the auth store has finished loading from localStorage.
  $effect(() => {
    if (!browser) return;
    // Wait until the auth store has finished initialising
    if (authStore.isLoading) return;

    if (!authStore.isAuthenticated) {
      goto('/');
    } else if (!dashboardLoaded) {
      dashboardLoaded = true;
      loadDashboard();
    }
  });
</script>

<svelte:head>
  <title>Dashboard - Ayanda Mabaso</title>
</svelte:head>

<div class="min-h-screen bg-background">
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-4xl font-bold text-foreground mb-2">Dashboard</h1>
      {#if authStore.user}
        <p class="text-lg text-muted-foreground">
          Welcome back, {authStore.user.firstName || authStore.user.email}!
        </p>
      {/if}
    </div>

    {#if isLoading}
      <div class="flex items-center justify-center py-20">
        <Loader2 class="h-8 w-8 animate-spin text-primary" />
      </div>
    {:else}
      <div class="space-y-8">
        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card.Root>
            <Card.Content class="p-6">
              <div class="flex items-center gap-4">
                <div class="p-3 bg-primary/10 rounded-lg">
                  <Package class="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p class="text-sm text-muted-foreground">Total Orders</p>
                  <p class="text-2xl font-bold text-foreground">{stats.totalOrders}</p>
                </div>
              </div>
            </Card.Content>
          </Card.Root>

          <Card.Root>
            <Card.Content class="p-6">
              <div class="flex items-center gap-4">
                <div class="p-3 bg-primary/10 rounded-lg">
                  <ShoppingBag class="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p class="text-sm text-muted-foreground">Total Spent</p>
                  <p class="text-2xl font-bold text-foreground">R{stats.totalSpent.toFixed(2)}</p>
                </div>
              </div>
            </Card.Content>
          </Card.Root>

          <Card.Root>
            <Card.Content class="p-6">
              <div class="flex items-center gap-4">
                <div class="p-3 bg-primary/10 rounded-lg">
                  <Calendar class="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p class="text-sm text-muted-foreground">Upcoming Bookings</p>
                  <p class="text-2xl font-bold text-foreground">{stats.upcomingBookings}</p>
                </div>
              </div>
            </Card.Content>
          </Card.Root>
        </div>

        <!-- Recent Orders -->
        <Card.Root>
          <Card.Header>
            <div class="flex items-center justify-between">
              <Card.Title>Recent Orders</Card.Title>
              <Button variant="outline" size="sm" onclick={() => goto('/dashboard/orders')}>
                View All
              </Button>
            </div>
          </Card.Header>
          <Card.Content>
            {#if orders.length === 0}
              <div class="text-center py-12">
                <Package class="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p class="text-muted-foreground">No orders yet</p>
                <Button class="mt-4 bg-primary hover:bg-primary/90" onclick={() => goto('/store')}>
                  Start Shopping
                </Button>
              </div>
            {:else}
              <div class="space-y-4">
                {#each orders as order (order.id)}
                  <div class="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                    <div class="flex-1">
                      <div class="flex items-center gap-3 mb-2">
                        <span class="font-semibold text-foreground">#{order.order_number}</span>
                        <Badge class={getStatusClass(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                      <p class="text-sm text-muted-foreground">
                        {order.items_count} {order.items_count === 1 ? 'item' : 'items'} •
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div class="text-right">
                      <p class="font-semibold text-foreground">R{order.total.toFixed(2)}</p>
                      {#if order.items.some(item => item.is_digital)}
                        <Button variant="outline" size="sm" class="mt-2">
                          <Download class="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      {/if}
                    </div>
                  </div>
                {/each}
              </div>
            {/if}
          </Card.Content>
        </Card.Root>

        <!-- Profile Section -->
        <Card.Root>
          <Card.Header>
            <Card.Title>Profile Information</Card.Title>
          </Card.Header>
          <Card.Content>
            {#if authStore.user}
              <div class="space-y-4">
                <div class="flex items-center gap-4">
                  <div class="p-3 bg-primary/10 rounded-full">
                    <User class="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p class="font-medium text-foreground">
                      {authStore.user.firstName} {authStore.user.lastName}
                    </p>
                    <p class="text-sm text-muted-foreground">{authStore.user.email}</p>
                    {#if authStore.user.phoneNumber}
                      <p class="text-sm text-muted-foreground">{authStore.user.phoneNumber}</p>
                    {/if}
                  </div>
                </div>

                {#if authStore.user.credits !== undefined}
                  <div class="pt-4 border-t">
                    <p class="text-sm text-muted-foreground mb-1">Account Credits</p>
                    <p class="text-2xl font-bold text-primary">R{authStore.user.credits.toFixed(2)}</p>
                  </div>
                {/if}
              </div>
            {/if}
          </Card.Content>
        </Card.Root>
      </div>
    {/if}
  </div>
</div>
