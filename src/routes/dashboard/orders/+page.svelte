<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { portal } from '$lib/portal';
	import { authStore } from '$lib/stores/auth.svelte';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import {
		ArrowLeft,
		Package,
		Loader2,
		ChevronLeft,
		ChevronRight,
		Download,
		Eye,
		Calendar,
		CreditCard,
		Truck,
		Search,
		Filter,
		RefreshCw
	} from 'lucide-svelte';

	interface OrderItem {
		id: number;
		offeringId: number;
		offeringName: string;
		quantity: number;
		unitPrice: number;
		total: number;
		imageUrl?: string;
		isDigital?: boolean;
	}

	interface Order {
		id: number;
		orderNumber: string;
		status: string;
		createdAt: string;
		total: number;
		subtotal: number;
		taxAmount?: number;
		shippingAmount?: number;
		discountAmount?: number;
		items: OrderItem[];
		paymentMethod?: string;
		fulfillmentType?: string;
		trackingNumber?: string;
		trackingUrl?: string;
	}

	// State
	let orders = $state<Order[]>([]);
	let isLoading = $state(true);
	let error = $state<string | null>(null);
	let currentPage = $state(1);
	let totalPages = $state(1);
	let totalOrders = $state(0);
	let perPage = $state(10);
	let statusFilter = $state<string>('all');
	let selectedOrder = $state<Order | null>(null);
	let showOrderDetail = $state(false);

	const statusOptions = [
		{ value: 'all', label: 'All Orders' },
		{ value: 'pending', label: 'Pending' },
		{ value: 'paid', label: 'Paid' },
		{ value: 'processing', label: 'Processing' },
		{ value: 'shipped', label: 'Shipped' },
		{ value: 'delivered', label: 'Delivered' },
		{ value: 'cancelled', label: 'Cancelled' }
	];

	onMount(async () => {
		if (!authStore.isAuthenticated) {
			goto('/');
			return;
		}
		await loadOrders();
	});

	async function loadOrders() {
		isLoading = true;
		error = null;

		try {
			const params: any = {
				page: currentPage,
				perPage: perPage
			};

			if (statusFilter !== 'all') {
				params.status = statusFilter;
			}

			const response = await portal.orders.getOrders(params);

			// Map API response to our Order interface (handles snake_case to camelCase)
			orders = (response.orders || []).map((o: any) => ({
				id: o.id,
				orderNumber: o.order_number || o.orderNumber,
				status: o.status,
				createdAt: o.created_at || o.createdAt,
				total: o.total,
				subtotal: o.subtotal,
				taxAmount: o.tax_amount || o.taxAmount,
				shippingAmount: o.shipping_amount || o.shippingAmount,
				discountAmount: o.discount_amount || o.discountAmount,
				items: o.items || [],
				paymentMethod: o.payment_method || o.paymentMethod,
				fulfillmentType: o.fulfillment_type || o.fulfillmentType,
				trackingNumber: o.tracking_number || o.trackingNumber,
				trackingUrl: o.tracking_url || o.trackingUrl,
				shippingAddress: o.shipping_address || o.shippingAddress,
				digitalDelivery: o.digital_delivery || o.digitalDelivery
			})) as Order[];
			totalOrders = response.total || orders.length;
			totalPages = Math.ceil(totalOrders / perPage);

		} catch (err: any) {
			console.error('Error loading orders:', err);
			error = err.message || 'Failed to load orders';
		} finally {
			isLoading = false;
		}
	}

	function handlePageChange(newPage: number) {
		if (newPage >= 1 && newPage <= totalPages) {
			currentPage = newPage;
			loadOrders();
		}
	}

	function handleStatusFilter(status: string) {
		statusFilter = status;
		currentPage = 1;
		loadOrders();
	}

	function viewOrderDetails(order: Order) {
		selectedOrder = order;
		showOrderDetail = true;
	}

	function closeOrderDetail() {
		showOrderDetail = false;
		selectedOrder = null;
	}

	function getStatusColor(status: string): string {
		const colors: Record<string, string> = {
			pending: 'bg-yellow-100 text-yellow-800',
			paid: 'bg-blue-100 text-blue-800',
			processing: 'bg-purple-100 text-purple-800',
			shipped: 'bg-indigo-100 text-indigo-800',
			delivered: 'bg-green-100 text-green-800',
			cancelled: 'bg-red-100 text-red-800'
		};
		return colors[status] || 'bg-gray-100 text-gray-800';
	}

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('en-ZA', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	function formatPrice(amount: number): string {
		return new Intl.NumberFormat('en-ZA', {
			style: 'currency',
			currency: 'ZAR'
		}).format(amount);
	}

	// Generate page numbers for pagination
	const pageNumbers = $derived(() => {
		const pages: (number | string)[] = [];
		const maxVisible = 5;

		if (totalPages <= maxVisible) {
			for (let i = 1; i <= totalPages; i++) {
				pages.push(i);
			}
		} else {
			if (currentPage <= 3) {
				for (let i = 1; i <= 4; i++) pages.push(i);
				pages.push('...');
				pages.push(totalPages);
			} else if (currentPage >= totalPages - 2) {
				pages.push(1);
				pages.push('...');
				for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
			} else {
				pages.push(1);
				pages.push('...');
				for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
				pages.push('...');
				pages.push(totalPages);
			}
		}

		return pages;
	});
</script>

<svelte:head>
	<title>My Orders - Ayanda Mabaso</title>
</svelte:head>

<div class="min-h-screen bg-background">
	<div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
		<!-- Header -->
		<div class="mb-8">
			<Button variant="ghost" class="mb-4" onclick={() => goto('/dashboard')}>
				<ArrowLeft class="h-4 w-4 mr-2" />
				Back to Dashboard
			</Button>

			<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<h1 class="text-3xl font-bold text-foreground">My Orders</h1>
					<p class="text-muted-foreground mt-1">
						{totalOrders} order{totalOrders !== 1 ? 's' : ''} total
					</p>
				</div>

				<Button variant="outline" onclick={loadOrders} disabled={isLoading}>
					<RefreshCw class="h-4 w-4 mr-2 {isLoading ? 'animate-spin' : ''}" />
					Refresh
				</Button>
			</div>
		</div>

		<!-- Filters -->
		<Card.Root class="mb-6">
			<Card.Content class="pt-6">
				<div class="flex flex-wrap gap-2">
					{#each statusOptions as option}
						<button
							type="button"
							onclick={() => handleStatusFilter(option.value)}
							class="px-4 py-2 text-sm font-medium rounded-lg transition-colors
								{statusFilter === option.value
									? 'bg-primary text-white'
									: 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
						>
							{option.label}
						</button>
					{/each}
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Loading State -->
		{#if isLoading}
			<div class="flex items-center justify-center py-20">
				<Loader2 class="h-8 w-8 animate-spin text-primary" />
				<span class="ml-3 text-muted-foreground">Loading orders...</span>
			</div>

		<!-- Error State -->
		{:else if error}
			<Card.Root class="border-red-200 bg-red-50">
				<Card.Content class="pt-6 text-center">
					<p class="text-red-600 mb-4">{error}</p>
					<Button onclick={loadOrders}>Try Again</Button>
				</Card.Content>
			</Card.Root>

		<!-- Empty State -->
		{:else if orders.length === 0}
			<Card.Root>
				<Card.Content class="pt-6 text-center py-16">
					<Package class="h-16 w-16 mx-auto text-muted-foreground mb-4" />
					<h3 class="text-xl font-semibold text-foreground mb-2">No orders found</h3>
					<p class="text-muted-foreground mb-6">
						{statusFilter !== 'all'
							? `You don't have any ${statusFilter} orders.`
							: "You haven't placed any orders yet."}
					</p>
					<Button onclick={() => goto('/store')} class="bg-primary hover:bg-primary/90">
						Start Shopping
					</Button>
				</Card.Content>
			</Card.Root>

		<!-- Orders List -->
		{:else}
			<div class="space-y-4">
				{#each orders as order (order.id)}
					<Card.Root class="hover:shadow-md transition-shadow">
						<Card.Content class="pt-6">
							<div class="flex flex-col lg:flex-row lg:items-center gap-4">
								<!-- Order Info -->
								<div class="flex-1">
									<div class="flex items-center gap-3 mb-2">
										<span class="font-mono font-semibold text-foreground">
											{order.orderNumber}
										</span>
										<Badge class={getStatusColor(order.status)}>
											{order.status}
										</Badge>
									</div>

									<div class="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
										<span class="flex items-center gap-1">
											<Calendar class="h-4 w-4" />
											{formatDate(order.createdAt)}
										</span>
										<span class="flex items-center gap-1">
											<Package class="h-4 w-4" />
											{order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
										</span>
										{#if order.trackingNumber}
											<span class="flex items-center gap-1">
												<Truck class="h-4 w-4" />
												{order.trackingNumber}
											</span>
										{/if}
									</div>

									<!-- Items Preview -->
									{#if order.items && order.items.length > 0}
										<div class="mt-3 flex flex-wrap gap-2">
											{#each order.items.slice(0, 3) as item}
												<span class="text-xs bg-gray-100 px-2 py-1 rounded">
													{item.offeringName}
													{#if item.quantity > 1}
														<span class="text-muted-foreground">×{item.quantity}</span>
													{/if}
												</span>
											{/each}
											{#if order.items.length > 3}
												<span class="text-xs text-muted-foreground">
													+{order.items.length - 3} more
												</span>
											{/if}
										</div>
									{/if}
								</div>

								<!-- Price & Actions -->
								<div class="flex items-center gap-4">
									<div class="text-right">
										<div class="text-lg font-bold text-foreground">
											{formatPrice(order.total)}
										</div>
										{#if order.paymentMethod}
											<div class="text-xs text-muted-foreground flex items-center justify-end gap-1">
												<CreditCard class="h-3 w-3" />
												{order.paymentMethod}
											</div>
										{/if}
									</div>

									<div class="flex gap-2">
										<Button
											variant="outline"
											size="sm"
											onclick={() => viewOrderDetails(order)}
										>
											<Eye class="h-4 w-4 mr-1" />
											View
										</Button>

										{#if order.items?.some(item => item.isDigital) && order.status === 'paid'}
											<Button
												variant="outline"
												size="sm"
												onclick={() => window.open(`/api/downloads/${order.id}`, '_blank')}
											>
												<Download class="h-4 w-4 mr-1" />
												Download
											</Button>
										{/if}
									</div>
								</div>
							</div>
						</Card.Content>
					</Card.Root>
				{/each}
			</div>

			<!-- Pagination -->
			{#if totalPages > 1}
				<div class="mt-8 flex items-center justify-center gap-2">
					<Button
						variant="outline"
						size="sm"
						disabled={currentPage === 1}
						onclick={() => handlePageChange(currentPage - 1)}
					>
						<ChevronLeft class="h-4 w-4" />
					</Button>

					{#each pageNumbers() as pageNum}
						{#if pageNum === '...'}
							<span class="px-3 py-2 text-muted-foreground">...</span>
						{:else}
							<Button
								variant={currentPage === pageNum ? 'default' : 'outline'}
								size="sm"
								onclick={() => handlePageChange(pageNum as number)}
								class={currentPage === pageNum ? 'bg-primary' : ''}
							>
								{pageNum}
							</Button>
						{/if}
					{/each}

					<Button
						variant="outline"
						size="sm"
						disabled={currentPage === totalPages}
						onclick={() => handlePageChange(currentPage + 1)}
					>
						<ChevronRight class="h-4 w-4" />
					</Button>
				</div>

				<p class="text-center text-sm text-muted-foreground mt-4">
					Showing {(currentPage - 1) * perPage + 1} to {Math.min(currentPage * perPage, totalOrders)} of {totalOrders} orders
				</p>
			{/if}
		{/if}
	</div>
</div>

<!-- Order Detail Modal -->
{#if showOrderDetail && selectedOrder}
	<div
		class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
		onclick={closeOrderDetail}
		onkeydown={(e) => e.key === 'Escape' && closeOrderDetail()}
		role="dialog"
		aria-modal="true"
		tabindex="-1"
	>
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<div
			class="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
			role="document"
		>
			<!-- Modal Header -->
			<div class="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
				<div>
					<h2 class="text-xl font-bold text-foreground">{selectedOrder.orderNumber}</h2>
					<Badge class={getStatusColor(selectedOrder.status)}>
						{selectedOrder.status}
					</Badge>
				</div>
				<button
					type="button"
					onclick={closeOrderDetail}
					class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
					aria-label="Close"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<!-- Modal Content -->
			<div class="p-6 space-y-6">
				<!-- Order Info -->
				<div class="grid grid-cols-2 gap-4 text-sm">
					<div>
						<span class="text-muted-foreground">Order Date</span>
						<p class="font-medium">{formatDate(selectedOrder.createdAt)}</p>
					</div>
					<div>
						<span class="text-muted-foreground">Payment Method</span>
						<p class="font-medium">{selectedOrder.paymentMethod || 'Card'}</p>
					</div>
					{#if selectedOrder.trackingNumber}
						<div class="col-span-2">
							<span class="text-muted-foreground">Tracking Number</span>
							<p class="font-medium">
								{#if selectedOrder.trackingUrl}
									<a href={selectedOrder.trackingUrl} target="_blank" rel="noopener" class="text-primary hover:underline">
										{selectedOrder.trackingNumber}
									</a>
								{:else}
									{selectedOrder.trackingNumber}
								{/if}
							</p>
						</div>
					{/if}
				</div>

				<!-- Order Items -->
				<div>
					<h3 class="font-semibold text-foreground mb-3">Items</h3>
					<div class="space-y-3">
						{#each selectedOrder.items || [] as item}
							<div class="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
								{#if item.imageUrl}
									<img
										src={item.imageUrl}
										alt={item.offeringName}
										class="w-16 h-16 object-cover rounded-lg"
									/>
								{:else}
									<div class="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
										<Package class="w-6 h-6 text-gray-400" />
									</div>
								{/if}
								<div class="flex-1">
									<p class="font-medium text-foreground">{item.offeringName}</p>
									<p class="text-sm text-muted-foreground">
										{formatPrice(item.unitPrice)} × {item.quantity}
									</p>
								</div>
								<div class="font-semibold">
									{formatPrice(item.total)}
								</div>
							</div>
						{/each}
					</div>
				</div>

				<!-- Price Summary -->
				<div class="border-t pt-4 space-y-2">
					<div class="flex justify-between text-sm">
						<span class="text-muted-foreground">Subtotal</span>
						<span>{formatPrice(selectedOrder.subtotal)}</span>
					</div>
					{#if selectedOrder.discountAmount && selectedOrder.discountAmount > 0}
						<div class="flex justify-between text-sm">
							<span class="text-muted-foreground">Discount</span>
							<span class="text-green-600">-{formatPrice(selectedOrder.discountAmount)}</span>
						</div>
					{/if}
					{#if selectedOrder.taxAmount}
						<div class="flex justify-between text-sm">
							<span class="text-muted-foreground">Tax</span>
							<span>{formatPrice(selectedOrder.taxAmount)}</span>
						</div>
					{/if}
					{#if selectedOrder.shippingAmount}
						<div class="flex justify-between text-sm">
							<span class="text-muted-foreground">Shipping</span>
							<span>{formatPrice(selectedOrder.shippingAmount)}</span>
						</div>
					{/if}
					<div class="flex justify-between text-lg font-bold pt-2 border-t">
						<span>Total</span>
						<span class="text-primary">{formatPrice(selectedOrder.total)}</span>
					</div>
				</div>

				<!-- Actions -->
				<div class="flex gap-3">
					{#if selectedOrder.trackingUrl}
						<Button
							variant="outline"
							class="flex-1"
							onclick={() => window.open(selectedOrder?.trackingUrl, '_blank')}
						>
							<Truck class="h-4 w-4 mr-2" />
							Track Order
						</Button>
					{/if}
					{#if selectedOrder.items?.some(item => item.isDigital) && selectedOrder.status === 'paid'}
						<Button class="flex-1 bg-primary hover:bg-primary/90">
							<Download class="h-4 w-4 mr-2" />
							Download Products
						</Button>
					{/if}
				</div>
			</div>
		</div>
	</div>
{/if}
