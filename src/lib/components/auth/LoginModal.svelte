<script lang="ts">
	import type { AuthStore } from '@tredicik/portal-sdk-svelte/stores';
	import { portal } from '$lib/portal';
	import { Mail, Lock, Loader2, X } from 'lucide-svelte';

	interface Props {
		open: boolean;
		onOpenChange?: (open: boolean) => void;
		authStore: AuthStore;
		brandName?: string;
		title?: string;
		description?: string;
		primaryColor?: string;
		accentColor?: string;
		onSwitchToRegister?: () => void;
		onSuccess?: () => void;
		class?: string;
	}

	let {
		open = $bindable(false),
		onOpenChange,
		authStore,
		brandName = 'Portal',
		title = 'Welcome Back',
		description,
		primaryColor = '#1a1a2e',
		accentColor = '#e94560',
		onSwitchToRegister,
		onSuccess,
		class: className = ''
	}: Props = $props();

	let email = $state('');
	let password = $state('');
	let isLoading = $state(false);
	let error = $state('');

	const descriptionText = $derived(description || `Sign in to your ${brandName} account`);

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

	async function handleSubmit(e: Event) {
		e.preventDefault();
		isLoading = true;
		error = '';

		try {
			// Call the API directly to avoid SDK issues
			const response = await portal.auth.login({ email: email.trim(), password });

			if (response.success && response.data) {
				const customer = response.data.customer;
				const token = response.data.access_token;

				// Save to localStorage
				localStorage.setItem('ayanda_user', JSON.stringify(customer));
				localStorage.setItem('ayanda_token', token);

				handleClose();
				email = '';
				password = '';
				onSuccess?.();

				// Reload page to update auth state
				window.location.reload();
			} else {
				error = response.error || 'Login failed. Please check your credentials.';
			}
		} catch (err: any) {
			error = err.message || 'An unexpected error occurred. Please try again.';
		} finally {
			isLoading = false;
		}
	}

	function handleSwitchToRegister() {
		handleClose();
		if (onSwitchToRegister) {
			setTimeout(() => onSwitchToRegister(), 100);
		}
	}

	$effect(() => {
		if (!open) {
			email = '';
			password = '';
			error = '';
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
		aria-labelledby="login-title"
		tabindex="-1"
	>
		<div class="relative w-full max-w-md mx-4 p-6 bg-white rounded-2xl shadow-2xl {className}">
			<div class="flex items-center justify-between mb-2">
				<h2 id="login-title" class="text-2xl font-bold" style:color={primaryColor}>
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

				<div class="space-y-2">
					<label for="login-email" class="text-sm font-medium text-gray-700">Email</label>
					<div class="relative">
						<Mail class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
						<input
							id="login-email"
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

				<div class="space-y-2">
					<label for="login-password" class="text-sm font-medium text-gray-700">Password</label>
					<div class="relative">
						<Lock class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
						<input
							id="login-password"
							type="password"
							bind:value={password}
							placeholder="Enter your password"
							required
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
						Signing in...
					{:else}
						Sign In
					{/if}
				</button>

				{#if onSwitchToRegister}
					<div class="text-center text-sm text-gray-500">
						Don't have an account?
						<button
							type="button"
							onclick={handleSwitchToRegister}
							class="cursor-pointer select-none active:scale-95 ml-1 font-medium transition-colors"
							style:color={primaryColor}
						>
							Sign up
						</button>
					</div>
				{/if}
			</form>
		</div>
	</div>
{/if}
