<script lang="ts">
	import type { AuthStore } from '@tredicik/portal-sdk-svelte/stores';
	import { portal } from '$lib/portal';
	import { User, Mail, Phone, Lock, Loader2, X } from 'lucide-svelte';

	interface Props {
		open: boolean;
		onOpenChange?: (open: boolean) => void;
		authStore: AuthStore;
		brandName?: string;
		title?: string;
		description?: string;
		primaryColor?: string;
		accentColor?: string;
		showPhoneField?: boolean;
		minPasswordLength?: number;
		onSwitchToLogin?: () => void;
		onSuccess?: () => void;
		class?: string;
	}

	let {
		open = $bindable(false),
		onOpenChange,
		authStore,
		brandName = 'Portal',
		title = 'Create Account',
		description,
		primaryColor = '#1a1a2e',
		accentColor = '#e94560',
		showPhoneField = true,
		minPasswordLength = 8,
		onSwitchToLogin,
		onSuccess,
		class: className = ''
	}: Props = $props();

	let firstName = $state('');
	let lastName = $state('');
	let email = $state('');
	let phone = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let isLoading = $state(false);
	let error = $state('');

	const descriptionText = $derived(description || `Join ${brandName} and get started`);

	function handleClose() {
		open = false;
		onOpenChange?.(false);
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			handleClose();
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			handleClose();
		}
	}

	function resetForm() {
		firstName = '';
		lastName = '';
		email = '';
		phone = '';
		password = '';
		confirmPassword = '';
		error = '';
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = '';

		if (!firstName.trim() || !lastName.trim()) {
			error = 'Please enter your full name';
			return;
		}

		if (password !== confirmPassword) {
			error = 'Passwords do not match';
			return;
		}

		if (password.length < minPasswordLength) {
			error = `Password must be at least ${minPasswordLength} characters long`;
			return;
		}

		isLoading = true;

		try {
			// Call the API directly with proper field names (SDK expects camelCase)
			const response = await portal.auth.register({
				firstName: firstName.trim(),
				lastName: lastName.trim(),
				email: email.trim(),
				password
			} as any);

			if (response.success && response.data) {
				// Store user data in auth store
				const customer = response.data.customer;
				const token = response.data.access_token;

				// Save to localStorage
				localStorage.setItem('ayanda_user', JSON.stringify(customer));
				localStorage.setItem('ayanda_token', token);

				handleClose();
				resetForm();
				onSuccess?.();

				// Reload page to update auth state
				window.location.reload();
			} else {
				error = response.error || 'Registration failed. Please try again.';
			}
		} catch (err: any) {
			error = err.message || 'An unexpected error occurred. Please try again.';
		} finally {
			isLoading = false;
		}
	}

	function handleSwitchToLogin() {
		handleClose();
		if (onSwitchToLogin) {
			setTimeout(() => onSwitchToLogin(), 100);
		}
	}

	$effect(() => {
		if (!open) {
			resetForm();
		}
	});
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
		onclick={handleBackdropClick}
		onkeydown={(e) => e.key === 'Escape' && handleClose()}
		role="dialog"
		aria-modal="true"
		aria-labelledby="register-title"
		tabindex="-1"
	>
		<div class="relative w-full max-w-md mx-4 p-6 bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto {className}">
			<div class="flex items-center justify-between mb-2">
				<h2 id="register-title" class="text-2xl font-bold" style:color={primaryColor}>
					{title}
				</h2>
				<button
					type="button"
					class="cursor-pointer select-none active:scale-95 p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-all"
					onclick={handleClose}
					aria-label="Close"
				>
					<X size={20} />
				</button>
			</div>

			<p class="text-sm text-gray-500 mb-6">{descriptionText}</p>

			<form onsubmit={handleSubmit} class="space-y-4">
				{#if error}
					<div class="p-3 rounded-lg bg-red-50 text-red-700 text-sm">
						{error}
					</div>
				{/if}

				<div class="grid grid-cols-2 gap-3">
					<div class="space-y-2">
						<label for="reg-firstname" class="text-sm font-medium text-gray-700">First Name</label>
						<div class="relative">
							<User class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
							<input
								id="reg-firstname"
								type="text"
								bind:value={firstName}
								placeholder="First name"
								required
								disabled={isLoading}
								class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50"
								style:--tw-ring-color={primaryColor}
							/>
						</div>
					</div>
					<div class="space-y-2">
						<label for="reg-lastname" class="text-sm font-medium text-gray-700">Last Name</label>
						<div class="relative">
							<User class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
							<input
								id="reg-lastname"
								type="text"
								bind:value={lastName}
								placeholder="Last name"
								required
								disabled={isLoading}
								class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50"
								style:--tw-ring-color={primaryColor}
							/>
						</div>
					</div>
				</div>

				<div class="space-y-2">
					<label for="reg-email" class="text-sm font-medium text-gray-700">Email</label>
					<div class="relative">
						<Mail class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
						<input
							id="reg-email"
							type="email"
							bind:value={email}
							placeholder="you@example.com"
							required
							disabled={isLoading}
							class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50"
							style:--tw-ring-color={primaryColor}
						/>
					</div>
				</div>

				{#if showPhoneField}
					<div class="space-y-2">
						<label for="reg-phone" class="text-sm font-medium text-gray-700">Phone Number</label>
						<div class="relative">
							<Phone class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
							<input
								id="reg-phone"
								type="tel"
								bind:value={phone}
								placeholder="Your phone number"
								required
								disabled={isLoading}
								class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50"
								style:--tw-ring-color={primaryColor}
							/>
						</div>
					</div>
				{/if}

				<div class="space-y-2">
					<label for="reg-password" class="text-sm font-medium text-gray-700">Password</label>
					<div class="relative">
						<Lock class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
						<input
							id="reg-password"
							type="password"
							bind:value={password}
							placeholder="Create a password"
							required
							minlength={minPasswordLength}
							disabled={isLoading}
							class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50"
							style:--tw-ring-color={primaryColor}
						/>
					</div>
					<p class="text-xs text-gray-500">Must be at least {minPasswordLength} characters</p>
				</div>

				<div class="space-y-2">
					<label for="reg-confirm" class="text-sm font-medium text-gray-700">Confirm Password</label>
					<div class="relative">
						<Lock class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
						<input
							id="reg-confirm"
							type="password"
							bind:value={confirmPassword}
							placeholder="Confirm your password"
							required
							minlength={minPasswordLength}
							disabled={isLoading}
							class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50"
							style:--tw-ring-color={primaryColor}
						/>
					</div>
				</div>

				<button
					type="submit"
					class="cursor-pointer select-none active:scale-[0.98] w-full py-3 px-4 text-white text-sm font-medium rounded-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
					style:background-color={primaryColor}
					disabled={isLoading}
				>
					{#if isLoading}
						<Loader2 class="h-4 w-4 animate-spin" />
						Creating account...
					{:else}
						Create Account
					{/if}
				</button>

				{#if onSwitchToLogin}
					<div class="text-center text-sm text-gray-500">
						Already have an account?
						<button
							type="button"
							onclick={handleSwitchToLogin}
							class="cursor-pointer select-none active:scale-95 ml-1 font-medium transition-colors"
							style:color={primaryColor}
						>
							Sign in
						</button>
					</div>
				{/if}
			</form>
		</div>
	</div>
{/if}
