<script lang="ts">
	import { BookOpen, ShoppingCart, Loader2, Check } from 'lucide-svelte';

	interface Product {
		id: number;
		name: string;
		description?: string;
		price: number;
		image?: string;
		category?: string;
		inCart?: boolean;
	}

	interface Props {
		product: Product;
		primaryColor?: string;
		accentColor?: string;
		onAddToCart?: (product: Product) => void | Promise<void>;
	}

	let {
		product,
		primaryColor = '#1a1a2e',
		accentColor = '#e94560',
		onAddToCart
	}: Props = $props();

	let isAdding = $state(false);

	async function handleAddToCart() {
		if (!onAddToCart || product.inCart) return;

		isAdding = true;
		try {
			await onAddToCart(product);
		} finally {
			isAdding = false;
		}
	}

	const truncatedDescription = $derived(
		product.description && product.description.length > 100
			? product.description.substring(0, 100) + '...'
			: product.description
	);

	function formatPrice(amount: number): string {
		return new Intl.NumberFormat('en-ZA', {
			style: 'currency',
			currency: 'ZAR',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(amount);
	}

	// Get category badge color based on category name
	function getCategoryStyle(category: string | undefined) {
		if (!category) return { bg: 'bg-gray-100', text: 'text-gray-700' };

		const lower = category.toLowerCase();
		if (lower.includes('ebook') || lower.includes('digital')) {
			return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
		}
		if (lower.includes('physical') || lower.includes('book')) {
			return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
		}
		if (lower.includes('consult') || lower.includes('service')) {
			return { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' };
		}
		return { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };
	}

	const categoryStyle = $derived(getCategoryStyle(product.category));
</script>

<div
	class="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
>
	<!-- Product Image -->
	<div class="relative aspect-square bg-gray-50 overflow-hidden">
		{#if product.image}
			<img
				src={product.image}
				alt={product.name}
				class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
				loading="lazy"
			/>
		{:else}
			<div class="flex items-center justify-center h-full bg-gradient-to-br from-gray-100 to-gray-50">
				<BookOpen class="h-16 w-16 text-gray-300" />
			</div>
		{/if}

		<!-- Category Badge -->
		{#if product.category}
			<div class="absolute top-3 left-3">
				<span
					class="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full border {categoryStyle.bg} {categoryStyle.text} {categoryStyle.border}"
				>
					{product.category}
				</span>
			</div>
		{/if}

		<!-- Quick View Overlay -->
		<div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
	</div>

	<!-- Product Details -->
	<div class="p-5">
		<h3
			class="font-semibold text-lg mb-2 line-clamp-2 text-gray-900 group-hover:text-accent transition-colors"
		>
			{product.name}
		</h3>

		{#if truncatedDescription}
			<p class="text-sm text-gray-500 mb-4 line-clamp-2 leading-relaxed">
				{truncatedDescription}
			</p>
		{/if}

		<div class="flex items-center justify-between mt-auto pt-2">
			<span class="text-xl font-bold text-gray-900">
				{formatPrice(product.price)}
			</span>

			{#if onAddToCart}
				<button
					class="cursor-pointer select-none active:scale-95 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm text-white transition-all duration-200 disabled:cursor-not-allowed"
					class:bg-green-500={product.inCart}
					class:hover:bg-green-600={product.inCart}
					style:background-color={!product.inCart ? primaryColor : undefined}
					onclick={handleAddToCart}
					disabled={isAdding || product.inCart}
				>
					{#if isAdding}
						<Loader2 class="h-4 w-4 animate-spin" />
						<span class="sr-only sm:not-sr-only">Adding...</span>
					{:else if product.inCart}
						<Check class="h-4 w-4" />
						<span class="sr-only sm:not-sr-only">In Cart</span>
					{:else}
						<ShoppingCart class="h-4 w-4" />
						<span class="sr-only sm:not-sr-only">Add</span>
					{/if}
				</button>
			{/if}
		</div>
	</div>
</div>

<style>
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
