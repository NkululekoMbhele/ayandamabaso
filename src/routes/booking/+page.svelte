<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { bookingStore } from '$lib/stores/booking.svelte';
	import { authStore } from '$lib/stores/auth.svelte';
	import { Button } from '$lib/components/ui/button';
	import { ArrowLeft, ArrowRight, Check } from 'lucide-svelte';
	import type { GuestInfo } from '$lib/types/booking';

	import PackageSelector from '$lib/components/booking/PackageSelector.svelte';
	import DateTimePicker from '$lib/components/booking/DateTimePicker.svelte';
	import GuestInfoForm from '$lib/components/booking/GuestInfoForm.svelte';
	import BookingSummary from '$lib/components/booking/BookingSummary.svelte';

	// Multi-step wizard state
	let currentStep = $state<1 | 2 | 3>(1);
	let isAddingToCart = $state(false);

	// Guest info state
	let guestInfo = $state<GuestInfo>({
		firstName: '',
		lastName: '',
		email: '',
		phone: '',
		notes: ''
	});

	// Track if we've handled the URL package parameter
	let hasHandledUrlPackage = $state(false);

	// Load offerings on mount
	onMount(async () => {
		await bookingStore.loadConsultationOfferings();

		// Pre-fill guest info if authenticated
		if (authStore.isAuthenticated && authStore.user) {
			guestInfo = {
				firstName: authStore.user.firstName || '',
				lastName: authStore.user.lastName || '',
				email: authStore.user.email || '',
				phone: authStore.user.phoneNumber || '',
				notes: ''
			};
		}
	});

	// Handle URL parameter pre-selection when offerings are loaded
	$effect(() => {
		// Only run once when offerings are loaded
		if (hasHandledUrlPackage || bookingStore.offerings.length === 0) return;

		const packageParam = page.url.searchParams.get('package');
		if (packageParam) {
			// Map URL params to package types
			const packageTypeMap: Record<string, string> = {
				'strategy': 'strategy',
				'deep-dive': 'deep-dive',
				'discovery': 'discovery',
				'premium': 'premium',
				'standard': 'standard'
			};

			const packageType = packageTypeMap[packageParam] || packageParam;
			const offering = bookingStore.offerings.find(
				(o) => o.package_type?.toLowerCase() === packageType.toLowerCase() ||
				       o.name?.toLowerCase().includes(packageType.toLowerCase())
			);

			if (offering) {
				bookingStore.selectOffering(offering.id);
				currentStep = 2; // Auto-advance to date/time selection
				hasHandledUrlPackage = true;
			}
		}
	});

	// Handle package selection
	function handlePackageSelect(offeringId: number) {
		bookingStore.selectOffering(offeringId);
	}

	// Handle date selection
	function handleDateChange(date: Date) {
		bookingStore.selectedDate = date;
	}

	// Handle guest info change
	function handleGuestInfoChange(info: GuestInfo) {
		guestInfo = info;
		bookingStore.setGuestInfo(info);
	}

	// Navigation
	function goToNextStep() {
		if (currentStep === 1 && bookingStore.selectedOffering) {
			currentStep = 2;
		} else if (currentStep === 2 && bookingStore.selectedDate) {
			// Date-only booking flow: time will be confirmed via email
			currentStep = 3;
		}
	}

	function goToPreviousStep() {
		if (currentStep > 1) {
			currentStep = (currentStep - 1) as 1 | 2 | 3;
		}
	}

	// Add to cart and redirect to checkout
	async function handleAddToCart() {
		isAddingToCart = true;

		const result = await bookingStore.addToCart();

		if (result.success) {
			// Redirect to checkout
			await goto('/checkout');
		} else {
			// Show error
			alert(result.error || 'Failed to add booking to cart');
			isAddingToCart = false;
		}
	}

	// Computed properties
	const canProceedStep1 = $derived(!!bookingStore.selectedOffering);
	const canProceedStep2 = $derived(!!bookingStore.selectedDate);
	const canProceedStep3 = $derived(
		!!guestInfo.firstName && !!guestInfo.lastName && !!guestInfo.email && !!guestInfo.phone
	);

	const stepTitles = ['Choose Package', 'Select Date', 'Contact Information'];
</script>

<svelte:head>
	<title>Book Consultation - Ayanda Mabaso</title>
	<meta name="description" content="Book a business consultation with Ayanda Mabaso" />
</svelte:head>

<div class="min-h-screen bg-background">
	<!-- Header -->
	<div class="bg-gradient-to-b from-gray-50 to-white py-12 border-b">
		<div class="container mx-auto px-4 sm:px-6 lg:px-8">
			<div class="max-w-7xl mx-auto">
				<a
					href="/"
					class="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
				>
					<ArrowLeft class="w-4 h-4" />
					<span>Back to Home</span>
				</a>

				<h1 class="text-4xl md:text-5xl font-bold text-foreground mb-3">Book Your Consultation</h1>
				<p class="text-lg text-muted-foreground max-w-2xl">
					Get expert marketing consultation to scale your business. Choose your package, select a time, and we'll be in touch.
				</p>
			</div>
		</div>
	</div>

	<!-- Progress Steps -->
	<div class="bg-white border-b">
		<div class="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
			<div class="max-w-4xl mx-auto">
				<div class="flex items-center justify-between">
					{#each [1, 2, 3] as step}
						<div class="flex items-center {step < 3 ? 'flex-1' : ''}">
							<button
								type="button"
								onclick={() => {
									if (step < currentStep) currentStep = step as 1 | 2 | 3;
								}}
								disabled={step > currentStep}
								class="flex items-center gap-3 {step <= currentStep ? 'cursor-pointer' : 'cursor-not-allowed'}"
							>
								<div
									class="flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all
										{currentStep === step
											? 'bg-primary border-primary text-white shadow-lg'
											: step < currentStep
												? 'bg-primary border-primary text-white'
												: 'border-gray-300 text-gray-400'}"
								>
									{#if step < currentStep}
										<Check class="w-5 h-5" strokeWidth={3} />
									{:else}
										<span class="font-semibold">{step}</span>
									{/if}
								</div>
								<div class="hidden sm:block">
									<div
										class="text-sm font-medium
											{currentStep >= step ? 'text-foreground' : 'text-muted-foreground'}"
									>
										Step {step}
									</div>
									<div class="text-xs text-muted-foreground">{stepTitles[step - 1]}</div>
								</div>
							</button>

							{#if step < 3}
								<div
									class="flex-1 h-0.5 mx-4
										{step < currentStep ? 'bg-primary' : 'bg-gray-200'}"
								></div>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>

	<!-- Main Content -->
	<div class="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
		<div class="max-w-7xl mx-auto">
			<div class="grid lg:grid-cols-3 gap-8">
				<!-- Steps Content (Left 2/3) -->
				<div class="lg:col-span-2 space-y-8">
					<!-- Step 1: Package Selection -->
					{#if currentStep === 1}
						<div class="animate-fade-in">
							<PackageSelector
								offerings={bookingStore.offerings}
								selectedId={bookingStore.selectedOffering?.id || null}
								onSelect={handlePackageSelect}
							/>
						</div>
					{/if}

					<!-- Step 2: Date Selection -->
					{#if currentStep === 2}
						<div class="animate-fade-in">
							<DateTimePicker
								selectedDate={bookingStore.selectedDate}
								onDateChange={handleDateChange}
								minDate={bookingStore.minBookingDate}
								maxDate={bookingStore.maxBookingDate}
							/>
						</div>
					{/if}

					<!-- Step 3: Guest Information -->
					{#if currentStep === 3}
						<div class="animate-fade-in">
							<GuestInfoForm
								guestInfo={guestInfo}
								onChange={handleGuestInfoChange}
								isAuthenticated={authStore.isAuthenticated}
								offering={bookingStore.selectedOffering}
							/>
						</div>
					{/if}

					<!-- Navigation Buttons -->
					<div class="flex items-center justify-between gap-4 pt-6 border-t">
						{#if currentStep > 1}
							<Button
								variant="outline"
								onclick={goToPreviousStep}
								class="h-12 px-6"
							>
								<ArrowLeft class="w-4 h-4 mr-2" />
								Previous
							</Button>
						{:else}
							<div></div>
						{/if}

						{#if currentStep < 3}
							<Button
								onclick={goToNextStep}
								disabled={
									(currentStep === 1 && !canProceedStep1) ||
									(currentStep === 2 && !canProceedStep2)
								}
								class="h-12 px-6 ml-auto bg-primary hover:bg-primary/90"
								data-testid="btn-next"
							>
								Next Step
								<ArrowRight class="w-4 h-4 ml-2" />
							</Button>
						{/if}
					</div>
				</div>

				<!-- Summary Sidebar (Right 1/3) -->
				<div class="lg:col-span-1">
					<BookingSummary
						offering={bookingStore.selectedOffering}
						date={bookingStore.selectedDate}
						guestInfo={currentStep === 3 ? guestInfo : null}
						onAddToCart={handleAddToCart}
						isComplete={bookingStore.isComplete && canProceedStep3}
						isLoading={isAddingToCart}
					/>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	@keyframes fade-in {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.animate-fade-in {
		animation: fade-in 0.3s ease-out;
	}
</style>
