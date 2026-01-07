<script lang="ts">
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { authStore } from '$lib/stores/auth.svelte';
	import { cartStore } from '$lib/stores/cart.svelte';
	import { LoginModal, RegisterModal } from '@tredicik/portal-sdk-svelte/components';
	import { Button } from '$lib/components/ui/button';
	import * as Avatar from '$lib/components/ui/avatar';
	import {
		Menu,
		X,
		ShoppingCart,
		User,
		LogOut,
		Package,
		Calendar,
		Home,
		Store,
		Instagram,
		Linkedin,
		Mail,
		MapPin,
		ArrowRight
	} from 'lucide-svelte';

	let { children } = $props();

	let showLoginModal = $state(false);
	let showRegisterModal = $state(false);
	let showMobileMenu = $state(false);
	let showUserMenu = $state(false);
	let scrolled = $state(false);

	// Listen for scroll
	$effect(() => {
		if (!browser) return;

		const handleScroll = () => {
			scrolled = window.scrollY > 20;
		};

		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	});

	// Listen for modal events
	$effect(() => {
		if (!browser) return;

		const openLogin = () => {
			showLoginModal = true;
			showRegisterModal = false;
		};

		const openRegister = () => {
			showRegisterModal = true;
			showLoginModal = false;
		};

		window.addEventListener('openLoginModal', openLogin);
		window.addEventListener('openRegisterModal', openRegister);

		return () => {
			window.removeEventListener('openLoginModal', openLogin);
			window.removeEventListener('openRegisterModal', openRegister);
		};
	});

	// Close menus on route change
	$effect(() => {
		$page.url.pathname;
		showMobileMenu = false;
		showUserMenu = false;
	});

	function handleLogout() {
		authStore.logout();
		showUserMenu = false;
	}

	const navLinks = [
		{ href: '/', label: 'Home', icon: Home },
		{ href: '/about', label: 'About', icon: User },
		{ href: '/services', label: 'Services', icon: Package },
		{ href: '/speaking', label: 'Speaking', icon: Calendar },
		{ href: '/store', label: 'Shop', icon: Store },
		{ href: '/contact', label: 'Contact', icon: Mail }
	];

	const socialLinks = [
		{ href: 'https://instagram.com/ayandamabaso_official', icon: Instagram, label: 'Instagram' },
		{ href: 'https://tiktok.com/@ayandamabaso_official', icon: null, label: 'TikTok' },
		{ href: 'https://linkedin.com/in/ayandamabaso', icon: Linkedin, label: 'LinkedIn' }
	];
</script>

<ModeWatcher />

<div class="min-h-screen flex flex-col bg-background">
	<!-- Fixed Navigation Header -->
	<header
		class="fixed top-0 left-0 right-0 z-50 transition-all duration-300 {scrolled
			? 'bg-white/90 backdrop-blur-xl shadow-sm'
			: 'bg-transparent'}"
	>
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="flex h-20 items-center justify-between">
				<!-- Logo -->
				<a href="/" class="flex items-center gap-2 group">
					<span class="inline-flex items-center gap-2" style="font-family: 'Playfair Display', serif;">
						<span class="relative flex items-center justify-end w-12 h-12 rounded-full bg-gray-100 text-foreground text-xl font-black transition-transform duration-300 group-hover:scale-110">
							<span class="mr-0.5">Ay</span>
						</span>
						<span class="text-2xl font-black text-foreground tracking-tight -ml-2">anda Mabaso</span>
					</span>
				</a>

				<!-- Desktop Navigation -->
				<nav class="hidden md:flex items-center gap-8">
					{#each navLinks as link (link.href)}
						<a
							href={link.href}
							class="relative text-sm font-medium transition-colors duration-200
								{$page.url.pathname === link.href
									? 'text-accent'
									: 'text-muted-foreground hover:text-foreground'}"
						>
							{link.label}
							{#if $page.url.pathname === link.href}
								<span class="absolute -bottom-1 left-0 right-0 h-0.5 bg-accent rounded-full"></span>
							{/if}
						</a>
					{/each}
				</nav>

				<!-- Right Side Actions -->
				<div class="flex items-center gap-3">
					<!-- Cart -->
					<a
						href="/cart"
						class="relative p-2.5 rounded-xl hover:bg-muted transition-colors duration-200"
					>
						<ShoppingCart class="h-5 w-5 text-foreground" />
						{#if cartStore.itemsCount > 0}
							<span
								class="absolute -top-0.5 -right-0.5 bg-accent text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-fade-in"
							>
								{cartStore.itemsCount}
							</span>
						{/if}
					</a>

					<!-- Auth Buttons / User Menu -->
					{#if authStore.isAuthenticated && authStore.user}
						<div class="relative">
							<button
								onclick={() => (showUserMenu = !showUserMenu)}
								class="flex items-center gap-2 p-1.5 rounded-xl hover:bg-muted transition-colors duration-200"
							>
								<Avatar.Root class="h-9 w-9">
									<Avatar.Fallback class="bg-primary text-white text-sm font-medium">
										{authStore.user.firstName[0]}{authStore.user.lastName[0]}
									</Avatar.Fallback>
								</Avatar.Root>
							</button>

							{#if showUserMenu}
								<div
									class="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-elegant border border-border/50 py-2 animate-fade-in"
								>
									<div class="px-4 py-3 border-b border-border/50">
										<p class="text-sm font-medium text-foreground">
											{authStore.user.firstName} {authStore.user.lastName}
										</p>
										<p class="text-xs text-muted-foreground">{authStore.user.email}</p>
									</div>
									<a
										href="/dashboard"
										class="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors"
										onclick={() => (showUserMenu = false)}
									>
										<User class="h-4 w-4 text-muted-foreground" />
										Dashboard
									</a>
									<a
										href="/dashboard/orders"
										class="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors"
										onclick={() => (showUserMenu = false)}
									>
										<Package class="h-4 w-4 text-muted-foreground" />
										My Orders
									</a>
									<hr class="my-2 border-border/50" />
									<button
										onclick={handleLogout}
										class="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors w-full text-left text-destructive"
									>
										<LogOut class="h-4 w-4" />
										Sign Out
									</button>
								</div>
							{/if}
						</div>
					{:else}
						<div class="hidden md:flex items-center gap-2">
							<Button
								variant="ghost"
								size="sm"
								class="text-sm font-medium"
								onclick={() => (showLoginModal = true)}
							>
								Sign In
							</Button>
							<Button
								size="sm"
								class="bg-primary hover:bg-primary/90 text-white rounded-xl px-5 hover-lift"
								onclick={() => (showRegisterModal = true)}
							>
								Sign Up
							</Button>
						</div>
					{/if}

					<!-- Mobile Menu Toggle -->
					<button
						class="md:hidden p-2.5 rounded-xl hover:bg-muted transition-colors duration-200"
						onclick={() => (showMobileMenu = !showMobileMenu)}
					>
						{#if showMobileMenu}
							<X class="h-6 w-6 text-foreground" />
						{:else}
							<Menu class="h-6 w-6 text-foreground" />
						{/if}
					</button>
				</div>
			</div>
		</div>

		<!-- Mobile Menu -->
		{#if showMobileMenu}
			<div
				class="md:hidden fixed inset-0 top-20 bg-white z-40 animate-fade-in overflow-y-auto"
			>
				<nav class="px-6 py-8 space-y-2">
					{#each navLinks as link (link.href)}
						<a
							href={link.href}
							class="flex items-center gap-4 px-4 py-4 rounded-xl text-lg font-medium transition-colors
								{$page.url.pathname === link.href
									? 'bg-accent/10 text-accent'
									: 'hover:bg-muted text-foreground'}"
							onclick={() => (showMobileMenu = false)}
						>
							{#if true}{@const Icon = link.icon}<Icon class="h-5 w-5" />{/if}
							{link.label}
						</a>
					{/each}

					{#if !authStore.isAuthenticated}
						<div class="pt-6 border-t border-border mt-6 space-y-3">
							<Button
								variant="outline"
								class="w-full h-12 text-base rounded-xl"
								onclick={() => {
									showLoginModal = true;
									showMobileMenu = false;
								}}
							>
								Sign In
							</Button>
							<Button
								class="w-full h-12 text-base bg-primary hover:bg-primary/90 rounded-xl"
								onclick={() => {
									showRegisterModal = true;
									showMobileMenu = false;
								}}
							>
								Sign Up
							</Button>
						</div>
					{/if}

					<!-- Social Links in Mobile -->
					<div class="pt-8 border-t border-border mt-8">
						<p class="text-sm text-muted-foreground mb-4 px-4">Follow Us</p>
						<div class="flex gap-3 px-4">
							{#each socialLinks as social (social.href)}
								<a
									href={social.href}
									target="_blank"
									rel="noopener noreferrer"
									class="w-12 h-12 rounded-xl bg-muted flex items-center justify-center hover:bg-primary hover:text-white transition-colors duration-200"
								>
									{#if social.icon}
										{@const SocialIcon = social.icon}<SocialIcon class="h-5 w-5" />
									{:else if social.label === 'TikTok'}
										<svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
											<path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
										</svg>
									{/if}
								</a>
							{/each}
						</div>
					</div>
				</nav>
			</div>
		{/if}
	</header>

	<!-- Main Content with header offset -->
	<main class="flex-1 pt-20">
		{@render children()}
	</main>

	<!-- Footer -->
	<footer class="bg-primary text-white mt-auto">
		<!-- Newsletter Section -->
		<div class="border-b border-white/10">
			<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
				<div class="max-w-xl mx-auto text-center">
					<h3 class="text-2xl font-semibold mb-3">Level Up Your Business</h3>
					<p class="text-white/60 mb-8 text-sm">
						Get exclusive marketing insights, business tips, and updates on upcoming events.
					</p>
					<form class="relative max-w-md mx-auto">
						<input
							type="email"
							placeholder="Enter your email"
							class="w-full h-14 pl-5 pr-36 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-white/40 transition-colors"
						/>
						<button
							type="submit"
							class="absolute right-1.5 top-1/2 -translate-y-1/2 h-11 px-6 bg-accent hover:bg-accent/90 text-white text-sm font-medium rounded-full transition-colors flex items-center gap-2"
						>
							Subscribe
							<ArrowRight class="w-4 h-4" />
						</button>
					</form>
				</div>
			</div>
		</div>

		<!-- Main Footer Content -->
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
				<!-- Brand Column -->
				<div class="lg:col-span-1">
					<div class="flex items-center gap-2 mb-6" style="font-family: 'Playfair Display', serif;">
						<span class="relative flex items-center justify-end w-12 h-12 rounded-full bg-white text-primary text-xl font-black">
							<span class="mr-0.5">Ay</span>
						</span>
						<span class="text-2xl font-black text-white tracking-tight -ml-2">anda Mabaso</span>
					</div>
					<p class="text-white/70 text-sm leading-relaxed mb-6">
						Digital creator, marketing expert & speaker. Helping businesses generate millions in sales.
					</p>
					<div class="flex gap-3">
						{#each socialLinks as social (social.href)}
							<a
								href={social.href}
								target="_blank"
								rel="noopener noreferrer"
								class="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-accent transition-colors duration-200"
								aria-label={social.label}
							>
								{#if social.icon}
									{@const FooterIcon = social.icon}<FooterIcon class="h-4 w-4" />
								{:else if social.label === 'TikTok'}
									<svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
										<path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
									</svg>
								{/if}
							</a>
						{/each}
					</div>
				</div>

				<!-- Quick Links -->
				<div>
					<h4 class="font-semibold mb-6 text-white/90">Quick Links</h4>
					<ul class="space-y-3">
						{#each navLinks as link (link.href)}
							<li>
								<a
									href={link.href}
									class="text-sm text-white/70 hover:text-accent transition-colors duration-200"
								>
									{link.label}
								</a>
							</li>
						{/each}
						<li>
							<a
								href="/dashboard"
								class="text-sm text-white/70 hover:text-accent transition-colors duration-200"
							>
								My Account
							</a>
						</li>
					</ul>
				</div>

				<!-- Services -->
				<div>
					<h4 class="font-semibold mb-6 text-white/90">Services</h4>
					<ul class="space-y-3">
						<li>
							<a href="/services" class="text-sm text-white/70 hover:text-accent transition-colors duration-200">
								Marketing Consulting
							</a>
						</li>
						<li>
							<a href="/speaking" class="text-sm text-white/70 hover:text-accent transition-colors duration-200">
								Keynote Speaking
							</a>
						</li>
						<li>
							<a href="/services" class="text-sm text-white/70 hover:text-accent transition-colors duration-200">
								Business Strategy
							</a>
						</li>
						<li>
							<a href="/store" class="text-sm text-white/70 hover:text-accent transition-colors duration-200">
								Digital Products
							</a>
						</li>
					</ul>
				</div>

				<!-- Contact -->
				<div>
					<h4 class="font-semibold mb-6 text-white/90">Contact</h4>
					<ul class="space-y-4">
						<li class="flex items-start gap-3">
							<Mail class="w-4 h-4 mt-1 text-accent shrink-0" />
							<a
								href="mailto:biz@mabasomedia.co.za"
								class="text-sm text-white/70 hover:text-accent transition-colors"
							>
								biz@mabasomedia.co.za
							</a>
						</li>
						<li class="flex items-start gap-3">
							<MapPin class="w-4 h-4 mt-1 text-accent shrink-0" />
							<span class="text-sm text-white/70">
								Durban, South Africa
							</span>
						</li>
					</ul>
				</div>
			</div>

			<!-- Copyright -->
			<div class="mt-16 pt-8 border-t border-white/10 text-center">
				<p class="text-sm text-white/60">
					&copy; {new Date().getFullYear()} Ayanda Mabaso. All rights reserved.
				</p>
				<p class="text-xs text-white/40 mt-2">
					Powered by <a href="https://tredicik.com" target="_blank" rel="noopener noreferrer" class="hover:text-accent transition-colors">Tredicik</a>
				</p>
			</div>
		</div>
	</footer>
</div>

<!-- Auth Modals -->
<LoginModal
	bind:open={showLoginModal}
	{authStore}
	brandName="Ayanda Mabaso"
	primaryColor="#1a1a2e"
	accentColor="#e94560"
	onSwitchToRegister={() => {
		showLoginModal = false;
		showRegisterModal = true;
	}}
/>
<RegisterModal
	bind:open={showRegisterModal}
	{authStore}
	brandName="Ayanda Mabaso"
	primaryColor="#1a1a2e"
	accentColor="#e94560"
	onSwitchToLogin={() => {
		showRegisterModal = false;
		showLoginModal = true;
	}}
/>
