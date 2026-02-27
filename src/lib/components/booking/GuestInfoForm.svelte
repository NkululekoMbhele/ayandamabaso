<script lang="ts">
	import type { GuestInfo, ConsultationOffering } from '$lib/types/booking';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as RadioGroup from '$lib/components/ui/radio-group';
	import { User, Mail, Phone, MessageSquare, Clock, MapPin, Info } from 'lucide-svelte';

	interface Props {
		guestInfo: GuestInfo;
		onChange: (info: GuestInfo) => void;
		isAuthenticated: boolean;
		offering?: ConsultationOffering | null;
	}

	let { guestInfo, onChange, isAuthenticated, offering = null }: Props = $props();

	const supportsInPerson = $derived(offering?.metadata?.supports_in_person === true);
	const inPersonLocation = $derived(offering?.metadata?.in_person_location || 'Durban, KwaZulu-Natal');

	function handleInput(field: keyof GuestInfo, value: string) {
		onChange({
			...guestInfo,
			[field]: value
		});
	}
</script>

<div class="space-y-6">
	<div class="text-center">
		<h2 class="text-3xl font-bold text-foreground mb-3">Your Contact Information</h2>
		<p class="text-muted-foreground max-w-2xl mx-auto">
			{#if isAuthenticated}
				Please confirm your details below
			{:else}
				Enter your contact information so we can confirm your booking
			{/if}
		</p>
	</div>

	<div class="max-w-2xl mx-auto bg-white rounded-3xl p-8 border-2 border-gray-100">
		<div class="grid sm:grid-cols-2 gap-6">
			<!-- First Name -->
			<div class="space-y-2">
				<Label for="firstName" class="flex items-center gap-2">
					<User class="w-4 h-4 text-muted-foreground" />
					<span>First Name</span>
					<span class="text-destructive">*</span>
				</Label>
				<Input
					id="firstName"
					name="firstName"
					type="text"
					placeholder="John"
					value={guestInfo.firstName}
					oninput={(e) => handleInput('firstName', e.currentTarget.value)}
					required
					class="h-12"
					data-testid="input-firstName"
				/>
			</div>

			<!-- Last Name -->
			<div class="space-y-2">
				<Label for="lastName" class="flex items-center gap-2">
					<User class="w-4 h-4 text-muted-foreground" />
					<span>Last Name</span>
					<span class="text-destructive">*</span>
				</Label>
				<Input
					id="lastName"
					name="lastName"
					type="text"
					placeholder="Doe"
					value={guestInfo.lastName}
					oninput={(e) => handleInput('lastName', e.currentTarget.value)}
					required
					class="h-12"
					data-testid="input-lastName"
				/>
			</div>

			<!-- Email -->
			<div class="space-y-2">
				<Label for="email" class="flex items-center gap-2">
					<Mail class="w-4 h-4 text-muted-foreground" />
					<span>Email Address</span>
					<span class="text-destructive">*</span>
				</Label>
				<Input
					id="email"
					name="email"
					type="email"
					placeholder="john@example.com"
					value={guestInfo.email}
					oninput={(e) => handleInput('email', e.currentTarget.value)}
					required
					class="h-12"
					data-testid="input-email"
				/>
			</div>

			<!-- Phone -->
			<div class="space-y-2">
				<Label for="phone" class="flex items-center gap-2">
					<Phone class="w-4 h-4 text-muted-foreground" />
					<span>Phone Number</span>
					<span class="text-destructive">*</span>
				</Label>
				<Input
					id="phone"
					name="phone"
					type="tel"
					placeholder="0821234567"
					value={guestInfo.phone}
					oninput={(e) => handleInput('phone', e.currentTarget.value)}
					required
					class="h-12"
					data-testid="input-phone"
				/>
			</div>
		</div>

		<!-- Preferred Time -->
		<div class="space-y-2 mt-6">
			<Label for="preferredTime" class="flex items-center gap-2">
				<Clock class="w-4 h-4 text-muted-foreground" />
				<span>Preferred Time for Consultation</span>
				<span class="text-muted-foreground text-sm">(Optional)</span>
			</Label>
			<Input
				id="preferredTime"
				name="preferredTime"
				type="text"
				placeholder="e.g., 9 AM - 12 PM, Afternoons, Evenings"
				value={guestInfo.preferredTime || ''}
				oninput={(e) => handleInput('preferredTime', e.currentTarget.value)}
				class="h-12"
			/>
			<p class="text-xs text-muted-foreground">
				We'll confirm the exact time via email
			</p>
		</div>

		<!-- Meeting Type — only shown for packages that support in-person (R15k group package) -->
		{#if supportsInPerson}
			<div class="space-y-3 mt-6">
				<Label class="flex items-center gap-2">
					<MapPin class="w-4 h-4 text-muted-foreground" />
					<span>Session Format</span>
					<span class="text-destructive">*</span>
				</Label>
				<RadioGroup.Root
					value={guestInfo.meetingType || 'virtual'}
					onValueChange={(value) => handleInput('meetingType', value as any)}
				>
					<div class="flex items-center space-x-2">
						<RadioGroup.Item value="virtual" id="virtual" />
						<Label for="virtual" class="font-normal cursor-pointer">Virtual (Zoom/Teams)</Label>
					</div>
					<div class="flex items-center space-x-2">
						<RadioGroup.Item value="in-person" id="in-person" />
						<Label for="in-person" class="font-normal cursor-pointer">
							In-Person <span class="text-muted-foreground text-sm">(Durban area only)</span>
						</Label>
					</div>
				</RadioGroup.Root>

				{#if guestInfo.meetingType === 'in-person'}
					<div class="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
						<Info class="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
						<p class="text-sm text-amber-800">
							In-person sessions are available within the <strong>{inPersonLocation}</strong> area.
							We'll confirm the exact venue when we contact you to finalise the booking.
						</p>
					</div>
				{/if}
			</div>
		{/if}

		<!-- Notes (Optional) -->
		<div class="space-y-2 mt-6">
			<Label for="notes" class="flex items-center gap-2">
				<MessageSquare class="w-4 h-4 text-muted-foreground" />
				<span>Additional Notes</span>
				<span class="text-muted-foreground text-sm">(Optional)</span>
			</Label>
			<Textarea
				id="notes"
				name="notes"
				placeholder="Tell us what you'd like to discuss in the consultation..."
				value={guestInfo.notes || ''}
				oninput={(e) => handleInput('notes', e.currentTarget.value)}
				rows={4}
				class="resize-none"
			/>
			<p class="text-xs text-muted-foreground">
				Share any specific topics or questions you'd like to cover
			</p>
		</div>

		{#if !isAuthenticated}
			<div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
				<p class="text-sm text-blue-900">
					<strong>💡 Tip:</strong> Create an account after booking to easily manage your consultations and access exclusive features.
				</p>
			</div>
		{/if}
	</div>
</div>
