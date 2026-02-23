<script lang="ts">
	import type { ConsultationOffering } from '$lib/types/booking';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Check, Clock, ArrowRight } from 'lucide-svelte';

	interface Props {
		offerings: ConsultationOffering[];
		selectedId: number | null;
		onSelect: (offeringId: number) => void;
	}

	let { offerings, selectedId, onSelect }: Props = $props();

	function formatPrice(price: number): string {
		if (price === 0) return 'Free';
		return new Intl.NumberFormat('en-ZA', {
			style: 'currency',
			currency: 'ZAR',
			minimumFractionDigits: 0
		}).format(price);
	}
</script>

<div class="space-y-6">
	<div class="text-center">
		<h2 class="text-3xl font-bold text-foreground mb-3">Choose Your Consultation Package</h2>
		<p class="text-muted-foreground max-w-2xl mx-auto">
			Select the consultation package that best fits your needs and budget
		</p>
	</div>

	<div class="grid md:grid-cols-3 gap-6 lg:gap-8">
		{#each offerings as offering (offering.id)}
			{@const isSelected = selectedId === offering.id}
			{@const isPopular = offering.metadata.popular}

			<button
				type="button"
				onclick={() => onSelect(offering.id)}
				class="relative bg-white rounded-3xl p-8 border-2 transition-all duration-300 hover:shadow-elegant text-left w-full
					{isSelected ? 'border-primary shadow-elegant scale-105' : isPopular ? 'border-primary/50' : 'border-gray-100 hover:border-gray-200'}"
				data-testid="package-{offering.package_type}"
				aria-pressed={isSelected}
			>
				<!-- Popular Badge -->
				{#if isPopular}
					<div class="absolute -top-3.5 left-1/2 -translate-x-1/2">
						<Badge class="bg-primary text-white px-5 py-1.5 text-xs font-semibold shadow-sm">
							Most Popular
						</Badge>
					</div>
				{/if}

				<!-- Selected Indicator -->
				{#if isSelected}
					<div class="absolute top-4 right-4">
						<div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
							<Check class="w-5 h-5 text-white" strokeWidth={3} />
						</div>
					</div>
				{/if}

				<!-- Icon & Duration -->
				<div class="flex items-center justify-between mb-6">
					<div class="w-12 h-12 rounded-full border-2 border-gray-100 flex items-center justify-center">
						<Clock class="w-5 h-5 text-gray-600" strokeWidth={1.5} />
					</div>
					<span class="text-sm text-gray-400">{offering.duration_minutes} min</span>
				</div>

				<!-- Package Name & Description -->
				<h3 class="text-xl font-bold text-foreground mb-2">{offering.name}</h3>
				<p class="text-gray-500 text-sm leading-relaxed mb-6">{offering.description}</p>

				<!-- Price -->
				<div class="mb-8">
					<span class="text-4xl font-bold text-foreground tracking-tight">
						{formatPrice(offering.price)}
					</span>
				</div>

				<!-- Features List -->
				{#if offering.metadata.includes && offering.metadata.includes.length > 0}
					<ul class="space-y-3 mb-8">
						{#each offering.metadata.includes as feature}
							<li class="flex items-start gap-3">
								<Check class="w-4 h-4 text-gray-400 shrink-0 mt-0.5" strokeWidth={2} />
								<span class="text-sm text-gray-600">{feature}</span>
							</li>
						{/each}
					</ul>
				{/if}

				<!-- Select Button (visual only, click handled by parent button) -->
				<div
					class="flex items-center justify-center gap-2 w-full h-12 rounded-full text-sm font-semibold transition-all duration-300
						{isSelected ? 'bg-primary text-white' : 'bg-gray-50 text-foreground border border-gray-200'}"
				>
					{isSelected ? 'Selected' : 'Select Package'}
					{#if !isSelected}
						<ArrowRight class="w-4 h-4" />
					{/if}
				</div>
			</button>
		{/each}
	</div>
</div>
