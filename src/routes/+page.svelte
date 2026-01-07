<script lang="ts">
	import { tenantConfig } from '$lib/config';
	import { Button } from '$lib/components/ui/button';
	import {
		ArrowRight,
		Calendar,
		Sparkles,
		ChevronRight,
		TrendingUp,
		Mic,
		Users,
		Award,
		Handshake,
		Check,
		Clock,
		Video,
		Zap
	} from 'lucide-svelte';

	const packages = [
		{
			name: 'Discovery Call',
			description: 'Perfect for getting started and understanding your needs',
			price: 'Free',
			duration: '30 min',
			icon: Clock,
			features: [
				'Initial business assessment',
				'Goal identification',
				'Strategy overview',
				'Q&A session'
			],
			cta: 'Book Free Call',
			popular: false,
			href: '/booking?package=discovery'
		},
		{
			name: 'Strategy Session',
			description: 'Deep-dive consultation for serious business growth',
			price: 'R2,500',
			duration: '90 min',
			icon: Video,
			features: [
				'Comprehensive business audit',
				'Custom marketing roadmap',
				'Content strategy blueprint',
				'Implementation guide',
				'30-day email support'
			],
			cta: 'Book Session',
			popular: true,
			href: '/booking?package=strategy'
		},
		{
			name: 'VIP Intensive',
			description: 'Full-day intensive for transformational results',
			price: 'R15,000',
			duration: 'Full Day',
			icon: Zap,
			features: [
				'Complete business transformation',
				'Brand & marketing overhaul',
				'Content calendar creation',
				'Team training session',
				'90-day support & follow-ups',
				'Priority access to resources'
			],
			cta: 'Apply Now',
			popular: false,
			href: '/booking?package=vip'
		}
	];

	const services = [
		{
			title: 'Marketing Consulting',
			description: 'Strategic marketing solutions that have generated millions in sales for businesses across industries.',
			icon: TrendingUp,
			href: '/services'
		},
		{
			title: 'Keynote Speaking',
			description: 'Inspiring talks on business growth, content creation, and entrepreneurship for your next event.',
			icon: Mic,
			href: '/speaking'
		},
		{
			title: 'Business Strategy',
			description: 'One-on-one consultations to scale your business and maximize your digital presence.',
			icon: Users,
			href: '/services'
		}
	];
</script>

<svelte:head>
	<title>{tenantConfig.name} - Marketing Expert & Speaker</title>
	<meta
		name="description"
		content="Digital creator, marketing expert & speaker. Helping businesses generate millions in sales through strategic marketing and content."
	/>
</svelte:head>

<!-- Hero Section -->
<section class="relative min-h-[90vh] flex items-center overflow-hidden grain">
	<!-- Elegant background -->
	<div class="absolute inset-0 -z-10">
		<div class="absolute inset-0 bg-linear-to-br from-primary/5 via-background to-accent/5"></div>
		<div class="absolute top-0 right-0 w-1/2 h-full bg-linear-to-l from-primary/3 to-transparent"></div>
		<div class="absolute bottom-0 left-0 w-1/3 h-1/2 bg-linear-to-t from-accent/5 to-transparent"></div>
		<!-- Decorative circles -->
		<div class="absolute top-20 right-20 w-64 h-64 rounded-full bg-accent/5 blur-3xl"></div>
		<div class="absolute bottom-20 left-20 w-96 h-96 rounded-full bg-primary/5 blur-3xl"></div>
	</div>

	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
		<div class="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
			<!-- Left: Content (shows second on mobile) -->
			<div class="space-y-8 animate-fade-in order-2 lg:order-1">
				<!-- Badge -->
				<div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-600 text-sm font-medium">
					<Sparkles class="w-4 h-4" />
					<span>Business • Content • Opportunities</span>
				</div>

				<!-- Main Heading -->
				<h1 class="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground leading-[1.1] tracking-tight">
					Scale Your <br />
					<span class="text-gradient">Business Growth</span>
				</h1>

				<!-- Subheading -->
				<p class="text-xl text-muted-foreground max-w-xl leading-relaxed">
					Digital creator with 200K+ followers. Marketing expert & speaker helping businesses
					generate millions in sales through strategic content and marketing.
				</p>

				<!-- CTAs -->
				<div class="flex flex-wrap gap-4 pt-4">
					<Button
						href="/services"
						class="bg-primary hover:bg-primary/90 text-white px-8 py-6 rounded-xl text-base font-medium hover-lift shadow-elegant"
					>
						<TrendingUp class="w-5 h-5 mr-2" />
						Work With Me
						<ArrowRight class="w-5 h-5 ml-2" />
					</Button>
					<Button
						href="/speaking"
						variant="outline"
						class="border-2 border-primary text-primary hover:bg-primary hover:text-white px-8 py-6 rounded-xl text-base font-medium transition-all duration-300"
					>
						<Mic class="w-5 h-5 mr-2" />
						Book for Speaking
					</Button>
				</div>
			</div>

			<!-- Right: Feature Image/Visual (shows first on mobile) -->
			<div class="relative animate-fade-in-delay-2 order-1 lg:order-2">
				<!-- Mobile: Centered smaller image -->
				<div class="lg:hidden flex justify-center mb-8">
					<div class="relative w-48 h-48 sm:w-64 sm:h-64">
						<img
							src="/ayanda.webp"
							alt="Ayanda Mabaso - Marketing Expert & Speaker"
							class="w-full h-full object-cover object-top rounded-full border-4 border-white shadow-elegant"
						/>
						<!-- Decorative ring -->
						<div class="absolute inset-0 rounded-full border-2 border-accent/30 scale-110"></div>
					</div>
				</div>

				<!-- Desktop: Smaller portrait -->
				<div class="hidden lg:flex justify-center">
					<div class="w-80 h-96 rounded-3xl overflow-hidden shadow-elegant">
						<img
							src="/ayanda.webp"
							alt="Ayanda Mabaso - Marketing Expert & Speaker"
							class="w-full h-full object-cover object-top"
						/>
					</div>
					<!-- Decorative elements -->
					<div class="absolute -top-4 -right-4 w-20 h-20 rounded-2xl bg-accent/20 -z-10"></div>
					<div class="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-primary/10 -z-10"></div>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Services Section -->
<section class="py-24 bg-muted/30">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<!-- Section Header -->
		<div class="text-center max-w-3xl mx-auto mb-16 stagger-children">
			<span class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-600 text-sm font-medium mb-6">
				Services
			</span>
			<h2 class="text-4xl sm:text-5xl font-bold text-foreground mb-6">
				How I Can Help
			</h2>
			<p class="text-lg text-muted-foreground">
				From strategic marketing consulting to keynote speaking engagements,
				I help businesses scale and individuals level up their game.
			</p>
		</div>

		<!-- Services Grid -->
		<div class="grid md:grid-cols-3 gap-8">
			{#each services as service, i (service.title)}
				{@const ServiceIcon = service.icon}
				<a
					href={service.href}
					class="group relative bg-card rounded-2xl p-8 border border-border hover:border-gray-300 transition-all duration-500 hover:shadow-elegant overflow-hidden"
					style="animation-delay: {i * 100}ms"
				>
					<!-- Icon -->
					<div class="relative mb-6">
						<div class="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors duration-300">
							<ServiceIcon class="w-7 h-7 text-gray-700" />
						</div>
					</div>

					<!-- Content -->
					<h3 class="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
						{service.title}
					</h3>
					<p class="text-muted-foreground leading-relaxed mb-6">
						{service.description}
					</p>

					<!-- Link -->
					<div class="inline-flex items-center gap-2 text-gray-600 font-medium group-hover:text-primary transition-colors duration-300">
						<span>Learn more</span>
						<ChevronRight class="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
					</div>
				</a>
			{/each}
		</div>
	</div>
</section>

<!-- Packages Section -->
<section class="py-24">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<!-- Section Header -->
		<div class="text-center max-w-3xl mx-auto mb-16">
			<span class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-600 text-sm font-medium mb-6">
				Packages
			</span>
			<h2 class="text-4xl sm:text-5xl font-bold text-foreground mb-6">
				Consultation Plans
			</h2>
			<p class="text-lg text-muted-foreground">
				Choose the right consultation package for your business needs and budget.
			</p>
		</div>

		<!-- Packages Grid -->
		<div class="grid md:grid-cols-3 gap-6 lg:gap-8 items-start">
			{#each packages as pkg, i (pkg.name)}
				{@const PkgIcon = pkg.icon}
				<div
					class="relative bg-white rounded-3xl p-8 border-2 {pkg.popular ? 'border-primary/80' : 'border-gray-100'} transition-all duration-300 hover:border-gray-200 flex flex-col"
				>
					<!-- Popular Badge -->
					{#if pkg.popular}
						<div class="absolute -top-3.5 left-1/2 -translate-x-1/2">
							<span class="px-5 py-1.5 bg-primary text-white text-xs font-semibold rounded-full shadow-sm">
								Most Popular
							</span>
						</div>
					{/if}

					<!-- Icon & Duration -->
					<div class="flex items-center justify-between mb-8">
						<div class="w-12 h-12 rounded-full border-2 border-gray-100 flex items-center justify-center">
							<PkgIcon class="w-5 h-5 text-gray-600" strokeWidth={1.5} />
						</div>
						<span class="text-sm text-gray-400">{pkg.duration}</span>
					</div>

					<!-- Name & Description -->
					<h3 class="text-xl font-bold text-foreground mb-2">{pkg.name}</h3>
					<p class="text-gray-500 text-sm leading-relaxed mb-6">{pkg.description}</p>

					<!-- Price -->
					<div class="mb-8">
						<span class="text-4xl font-bold text-foreground tracking-tight">{pkg.price}</span>
					</div>

					<!-- Features -->
					<ul class="space-y-4 mb-10 flex-1">
						{#each pkg.features as feature (feature)}
							<li class="flex items-center gap-3">
								<Check class="w-4 h-4 text-gray-400 shrink-0" strokeWidth={2} />
								<span class="text-sm text-gray-600">{feature}</span>
							</li>
						{/each}
					</ul>

					<!-- CTA Button -->
					<Button
						href={pkg.href}
						class="{pkg.popular
							? 'bg-primary hover:bg-primary/90 text-white'
							: 'bg-gray-50 hover:bg-gray-100 text-foreground border border-gray-200'} w-full h-14 rounded-full text-sm font-semibold transition-all duration-300"
					>
						{pkg.cta}
						<ArrowRight class="w-4 h-4 ml-2" />
					</Button>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- About/CTA Section -->
<section class="py-24 relative overflow-hidden bg-primary">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="grid lg:grid-cols-2 gap-16 items-center">
			<!-- Left: Image/Visual -->
			<div class="relative">
				<div class="aspect-square max-w-md mx-auto rounded-3xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
					<div class="text-center text-white space-y-4 p-8">
						<Award class="w-16 h-16 mx-auto opacity-80" />
						<p class="text-2xl font-semibold">200K+ Followers</p>
						<p class="text-white/70">Millions in sales generated for clients</p>
					</div>
				</div>
			</div>

			<!-- Right: Content -->
			<div class="text-white space-y-8">
				<h2 class="text-4xl sm:text-5xl font-bold leading-tight">
					Let's Scale Your <br />
					Business Together
				</h2>
				<p class="text-xl text-white/80 leading-relaxed">
					I've helped countless businesses transform their marketing and content strategy.
					Ready to be the next success story?
				</p>
				<ul class="space-y-4">
					{#each ['Strategic marketing consulting', 'Content creation expertise', 'Speaking & training engagements'] as item, i (i)}
						<li class="flex items-center gap-3">
							<div class="w-6 h-6 rounded-full bg-accent flex items-center justify-center">
								<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
								</svg>
							</div>
							<span class="text-white/90">{item}</span>
						</li>
					{/each}
				</ul>
				<Button
					href="/contact"
					class="bg-accent hover:bg-accent/90 text-white px-8 py-6 rounded-xl text-base font-medium hover-lift"
				>
					<Handshake class="w-5 h-5 mr-2" />
					Let's Work Together
					<ArrowRight class="w-5 h-5 ml-2" />
				</Button>
			</div>
		</div>
	</div>
</section>

<!-- Final CTA Section -->
<section class="py-16 bg-muted/30">
	<div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
		<h2 class="text-3xl sm:text-4xl font-bold text-foreground mb-6">
			Ready to Level Up?
		</h2>
		<p class="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
			Whether you need marketing consulting, a keynote speaker, or digital products
			to grow your business - let's make it happen.
		</p>
		<div class="flex flex-wrap gap-4 justify-center">
			<Button
				href="/services"
				class="bg-primary hover:bg-primary/90 text-white px-8 py-6 rounded-xl text-base font-medium hover-lift"
			>
				<TrendingUp class="w-5 h-5 mr-2" />
				View Services
			</Button>
			<Button
				href="/contact"
				variant="outline"
				class="border-2 border-accent text-accent hover:bg-accent hover:text-white px-8 py-6 rounded-xl text-base font-medium transition-all duration-300"
			>
				<Calendar class="w-5 h-5 mr-2" />
				Get In Touch
			</Button>
		</div>
	</div>
</section>
