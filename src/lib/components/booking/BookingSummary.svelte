<script lang="ts">
	import type { ConsultationOffering, GuestInfo } from '$lib/types/booking';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Separator } from '$lib/components/ui/separator';
	import { Calendar, User, Mail, Phone, Check, ShoppingCart } from 'lucide-svelte';
	import { formatDate } from '$lib/utils/date';

	interface Props {
		offering: ConsultationOffering | null;
		date: Date | null;
		guestInfo: GuestInfo | null;
		onAddToCart: () => void;
		isComplete: boolean;
		isLoading?: boolean;
	}

	let { offering, date, guestInfo, onAddToCart, isComplete, isLoading = false }: Props = $props();

	function formatPrice(price: number): string {
		if (price === 0) return 'Free';
		return new Intl.NumberFormat('en-ZA', {
			style: 'currency',
			currency: 'ZAR',
			minimumFractionDigits: 0
		}).format(price);
	}
</script>

<div class="lg:sticky lg:top-24">
	<Card.Root class="border-2 border-gray-200">
		<Card.Header class="bg-gray-50">
			<Card.Title class="text-xl">Booking Summary</Card.Title>
			<Card.Description>Review your consultation details</Card.Description>
		</Card.Header>

		<Card.Content class="space-y-6 pt-6">
			{#if offering}
				<!-- Package Details -->
				<div class="space-y-3">
					<div class="flex items-start justify-between">
						<div class="space-y-1">
							<p class="font-semibold text-foreground">{offering.name}</p>
							<div class="flex items-center gap-2 text-sm text-muted-foreground">
								<Calendar class="w-4 h-4" />
								<span>{offering.duration_minutes} minutes</span>
							</div>
						</div>
						<div class="text-right">
							<p class="text-2xl font-bold text-primary">{formatPrice(offering.price)}</p>
						</div>
					</div>

					{#if offering.metadata.includes && offering.metadata.includes.length > 0}
						<div class="space-y-2">
							<p class="text-sm font-medium text-foreground">Includes:</p>
							<ul class="space-y-1.5">
								{#each offering.metadata.includes.slice(0, 3) as feature}
									<li class="flex items-start gap-2 text-sm text-muted-foreground">
										<Check class="w-4 h-4 text-green-600 shrink-0 mt-0.5" strokeWidth={2} />
										<span>{feature}</span>
									</li>
								{/each}
							</ul>
						</div>
					{/if}
				</div>

				<Separator />
			{:else}
				<div class="text-center py-4 text-muted-foreground text-sm">
					Select a consultation package to continue
				</div>
			{/if}

			{#if date}
				<!-- Date -->
				<div class="space-y-3">
					<p class="text-sm font-medium text-foreground">Preferred Date:</p>
					<div class="bg-primary/5 rounded-lg p-4">
						<div class="flex items-center gap-3">
							<Calendar class="w-4 h-4 text-primary" />
							<div>
								<p class="text-sm font-medium text-foreground">{formatDate(date, 'long')}</p>
								<p class="text-xs text-muted-foreground">{date.toLocaleDateString('en-ZA', { weekday: 'long' })}</p>
							</div>
						</div>
					</div>
					<p class="text-xs text-muted-foreground italic">
						Time will be confirmed via email within 24 hours
					</p>
				</div>

				<Separator />
			{/if}

			{#if guestInfo && (guestInfo.firstName || guestInfo.email)}
				<!-- Contact Info -->
				<div class="space-y-3">
					<p class="text-sm font-medium text-foreground">Contact Details:</p>
					<div class="space-y-2">
						{#if guestInfo.firstName || guestInfo.lastName}
							<div class="flex items-center gap-2 text-sm">
								<User class="w-4 h-4 text-muted-foreground" />
								<span>{guestInfo.firstName} {guestInfo.lastName}</span>
							</div>
						{/if}
						{#if guestInfo.email}
							<div class="flex items-center gap-2 text-sm">
								<Mail class="w-4 h-4 text-muted-foreground" />
								<span class="break-all">{guestInfo.email}</span>
							</div>
						{/if}
						{#if guestInfo.phone}
							<div class="flex items-center gap-2 text-sm">
								<Phone class="w-4 h-4 text-muted-foreground" />
								<span>{guestInfo.phone}</span>
							</div>
						{/if}
					</div>
				</div>

				<Separator />
			{/if}

			<!-- Total -->
			{#if offering}
				<div class="space-y-2">
					<div class="flex items-center justify-between text-sm">
						<span class="text-muted-foreground">Subtotal</span>
						<span class="font-medium">{formatPrice(offering.price)}</span>
					</div>
					<div class="flex items-center justify-between text-lg font-bold">
						<span>Total</span>
						<span class="text-primary">{formatPrice(offering.price)}</span>
					</div>
				</div>
			{/if}
		</Card.Content>

		<Card.Footer class="flex-col space-y-3">
			<Button
				onclick={onAddToCart}
				disabled={!isComplete || isLoading}
				class="w-full h-14 text-base font-semibold bg-primary hover:bg-primary/90 disabled:opacity-50"
				data-testid="btn-add-to-cart"
			>
				{#if isLoading}
					<span class="flex items-center gap-2">
						<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
						Processing...
					</span>
				{:else}
					<ShoppingCart class="w-5 h-5 mr-2" />
					Add to Cart
				{/if}
			</Button>

			{#if !isComplete}
				<p class="text-xs text-center text-muted-foreground">
					Complete all steps to proceed
				</p>
			{:else}
				<p class="text-xs text-center text-muted-foreground">
					You'll be redirected to checkout after adding to cart
				</p>
			{/if}
		</Card.Footer>
	</Card.Root>
</div>
