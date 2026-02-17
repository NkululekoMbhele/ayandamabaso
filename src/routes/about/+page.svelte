<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { ArrowRight, Award, TrendingUp, Users, Target, Briefcase, MessageCircle, Handshake } from 'lucide-svelte';
</script>

<svelte:head>
	<title>About - Ayanda Mabaso</title>
	<meta name="description" content="Learn about Ayanda Mabaso - Digital creator, marketing expert & speaker helping businesses generate millions in sales." />
</svelte:head>

<!-- Hero Section -->
<section class="py-20 bg-muted/30">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="grid lg:grid-cols-2 gap-16 items-center">
			<!-- Image -->
			<div class="relative">
				<div class="aspect-square max-w-md mx-auto rounded-3xl overflow-hidden shadow-elegant">
					<img
						src="/ayanda.webp"
						alt="Ayanda Mabaso"
						class="w-full h-full object-cover object-top"
					/>
				</div>
				<div class="absolute -bottom-6 -right-6 w-32 h-32 rounded-full bg-accent/20 -z-10"></div>
				<div class="absolute -top-6 -left-6 w-24 h-24 rounded-2xl bg-primary/10 -z-10"></div>
			</div>

			<!-- Content -->
			<div class="space-y-6">
				<span class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-600 text-sm font-medium">
					About Me
				</span>
				<h1 class="text-4xl sm:text-5xl font-bold text-foreground leading-tight">
					Hi, I'm Ayanda Mabaso
				</h1>
				<p class="text-lg text-muted-foreground leading-relaxed">
					I'm a digital creator, marketing expert, and speaker with over 200,000 followers across platforms.
					I've helped businesses generate millions in sales through strategic marketing and content creation.
				</p>
				<p class="text-lg text-muted-foreground leading-relaxed">
					My journey started with a passion for connecting brands with their audiences in authentic ways.
					Today, I work with entrepreneurs, businesses, and organizations to scale their impact and revenue.
				</p>
				<div class="flex flex-wrap gap-4 pt-4">
					<Button href="/services" class="bg-primary hover:bg-primary/90 text-white px-8 py-6 rounded-xl">
						View Services
						<ArrowRight class="w-5 h-5 ml-2" />
					</Button>
					<Button href="/contact" variant="outline" class="border-2 border-primary text-primary hover:bg-primary hover:text-white px-8 py-6 rounded-xl">
						<MessageCircle class="w-5 h-5 mr-2" />
						Get In Touch
					</Button>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Stats Section -->
<section class="py-20">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="grid grid-cols-2 lg:grid-cols-4 gap-8">
			{#each [
				{ value: 'R10M+', label: 'Revenue Generated', icon: TrendingUp },
				{ value: '50+', label: 'Clients Served', icon: Target },
				{ value: '5+', label: 'Years Experience', icon: Award },
				{ value: '200K+', label: 'Community', icon: Users }
			] as stat (stat.label)}
				{@const StatIcon = stat.icon}
				<div class="text-center p-6 rounded-2xl bg-muted/30">
					<StatIcon class="w-8 h-8 text-primary mx-auto mb-4" />
					<p class="text-3xl font-bold text-foreground mb-1">{stat.value}</p>
					<p class="text-sm text-muted-foreground">{stat.label}</p>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- Mission Section -->
<section class="py-20 bg-primary text-white">
	<div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
		<h2 class="text-3xl sm:text-4xl font-bold mb-6">My Mission</h2>
		<p class="text-xl text-white/80 leading-relaxed">
			To empower entrepreneurs and businesses with the knowledge, strategies, and tools they need
			to build successful brands and generate sustainable revenue in the digital age.
		</p>
	</div>
</section>

<!-- CTA Section -->
<section class="py-20">
	<div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
		<h2 class="text-3xl sm:text-4xl font-bold text-foreground mb-6">
			Ready to Work Together?
		</h2>
		<p class="text-lg text-muted-foreground mb-8">
			Let's discuss how I can help you achieve your business goals.
		</p>
		<Button href="/contact" class="bg-primary hover:bg-primary/90 text-white px-8 py-6 rounded-xl text-base font-medium">
			<Handshake class="w-5 h-5 mr-2" />
			Start a Conversation
			<ArrowRight class="w-5 h-5 ml-2" />
		</Button>
	</div>
</section>
