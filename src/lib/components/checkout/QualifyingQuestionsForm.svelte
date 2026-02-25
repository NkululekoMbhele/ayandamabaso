<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { AlertCircle, Loader2, CheckCircle } from 'lucide-svelte';

	interface Props {
		orderNumber: string;
		onComplete?: () => void;
	}

	let { orderNumber, onComplete }: Props = $props();

	let formData = $state({
		goals: '',
		targets: '',
		businessNature: '',
		struggles: ''
	});

	let isSubmitting = $state(false);
	let error = $state('');
	let success = $state(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();

		// Validate all fields are filled
		if (!formData.goals.trim() || !formData.targets.trim() || !formData.businessNature.trim() || !formData.struggles.trim()) {
			error = 'Please answer all questions';
			return;
		}

		isSubmitting = true;
		error = '';

		try {
			// Call backend API directly - CORS is now configured
			const apiKey = import.meta.env.VITE_API_KEY || 'pk_live_tenant_41';
			const apiUrl = import.meta.env.VITE_API_URL || 'https://api.tredicik.com/api/external/v1';
			const token = typeof window !== 'undefined' ? localStorage.getItem('ayanda_token') : null;

			const headers: Record<string, string> = {
				'Content-Type': 'application/json',
				'X-API-Key': apiKey
			};
			if (token) {
				headers['Authorization'] = `Bearer ${token}`;
			}

			const response = await fetch(`${apiUrl}/orders/${orderNumber}/qualifying-questions`, {
				method: 'POST',
				headers,
				body: JSON.stringify({
					goals: formData.goals.trim(),
					targets: formData.targets.trim(),
					business_nature: formData.businessNature.trim(),
					struggles: formData.struggles.trim(),
					submitted_at: new Date().toISOString()
				})
			});

			if (!response.ok) {
				throw new Error('Failed to submit questions');
			}

			success = true;
			if (onComplete) {
				// Show success message briefly before calling onComplete
				setTimeout(() => {
					onComplete();
				}, 500);
			}
		} catch (err: any) {
			error = err.message || 'Failed to submit your responses. Please try again.';
			console.error('Error submitting qualifying questions:', err);
		} finally {
			isSubmitting = false;
		}
	}
</script>

{#if success}
	<div class="min-h-screen bg-background flex items-center justify-center px-4">
		<Card.Root class="w-full max-w-2xl">
			<Card.Header>
				<div class="text-center">
					<div class="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
						<CheckCircle class="w-8 h-8 text-green-600" />
					</div>
					<Card.Title class="text-2xl">Thank You!</Card.Title>
				</div>
			</Card.Header>
			<Card.Content class="text-center space-y-4">
				<p class="text-muted-foreground">
					We've received your responses and will be in touch soon to discuss your consultation.
				</p>
				<p class="text-sm text-muted-foreground">
					A confirmation email has been sent to your inbox.
				</p>
			</Card.Content>
		</Card.Root>
	</div>
{:else}
	<div class="min-h-screen bg-background flex items-center justify-center px-4 py-8">
		<Card.Root class="w-full max-w-2xl">
			<Card.Header>
				<Card.Title class="text-2xl">Help Us Serve You Better</Card.Title>
				<Card.Description>
					Please answer a few questions about your consultation goals so we can provide the best guidance.
				</Card.Description>
			</Card.Header>

			<Card.Content>
				<form onsubmit={handleSubmit} class="space-y-6">
					{#if error}
						<div class="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
							<AlertCircle class="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
							<p class="text-sm text-red-700">{error}</p>
						</div>
					{/if}

					<!-- Question 1: Goals -->
					<div class="space-y-2">
						<Label for="goals" class="text-base font-medium">
							What are you hoping to achieve?
						</Label>
						<Textarea
							id="goals"
							bind:value={formData.goals}
							placeholder="E.g., Increase online sales, build brand awareness, improve social media presence..."
							class="min-h-24"
							disabled={isSubmitting}
							required
						/>
					</div>

					<!-- Question 2: Target Audience -->
					<div class="space-y-2">
						<Label for="targets" class="text-base font-medium">
							Who is your target audience?
						</Label>
						<Textarea
							id="targets"
							bind:value={formData.targets}
							placeholder="E.g., Small business owners aged 25-45, tech startups, corporate clients..."
							class="min-h-24"
							disabled={isSubmitting}
							required
						/>
					</div>

					<!-- Question 3: Business Nature -->
					<div class="space-y-2">
						<Label for="businessNature" class="text-base font-medium">
							What is the nature of your business?
						</Label>
						<Textarea
							id="businessNature"
							bind:value={formData.businessNature}
							placeholder="E.g., E-commerce fashion, digital marketing agency, coaching business..."
							class="min-h-24"
							disabled={isSubmitting}
							required
						/>
					</div>

					<!-- Question 4: Challenges -->
					<div class="space-y-2">
						<Label for="struggles" class="text-base font-medium">
							What challenges are you currently facing?
						</Label>
						<Textarea
							id="struggles"
							bind:value={formData.struggles}
							placeholder="E.g., Low social media engagement, unclear content strategy, difficulty converting leads..."
							class="min-h-24"
							disabled={isSubmitting}
							required
						/>
					</div>

					<!-- Submit Button -->
					<Button
						type="submit"
						disabled={isSubmitting}
						class="w-full h-12 bg-primary hover:bg-primary/90 text-white font-medium"
					>
						{#if isSubmitting}
							<Loader2 class="w-4 h-4 mr-2 animate-spin" />
							Submitting...
						{:else}
							Continue
						{/if}
					</Button>
				</form>
			</Card.Content>
		</Card.Root>
	</div>
{/if}
