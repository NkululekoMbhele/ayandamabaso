<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { ArrowRight, TrendingUp, Mic, Users, Check, Target, BarChart, Lightbulb } from 'lucide-svelte';

	const services = [
		{
			title: 'Marketing Consulting',
			description: 'Strategic marketing solutions tailored to your business goals. I help you create campaigns that convert and build lasting customer relationships.',
			icon: TrendingUp,
			features: [
				'Marketing strategy development',
				'Campaign planning & execution',
				'Brand positioning',
				'Digital marketing optimization',
				'Performance tracking & analytics'
			]
		},
		{
			title: 'Business Strategy',
			description: 'Comprehensive business consulting to help you scale efficiently. From market analysis to growth planning, I guide you every step of the way.',
			icon: Target,
			features: [
				'Business model optimization',
				'Market research & analysis',
				'Growth strategy planning',
				'Revenue optimization',
				'Competitive positioning'
			]
		},
		{
			title: 'Content Strategy',
			description: 'Build a content engine that attracts, engages, and converts your target audience across all platforms.',
			icon: Lightbulb,
			features: [
				'Content calendar creation',
				'Platform-specific strategies',
				'Content repurposing systems',
				'Engagement optimization',
				'Community building'
			]
		},
		{
			title: 'Team Training',
			description: 'Equip your team with the skills and knowledge they need to execute effective marketing strategies.',
			icon: Users,
			features: [
				'Marketing workshops',
				'Sales training',
				'Social media masterclasses',
				'Content creation training',
				'Analytics & reporting skills'
			]
		}
	];
</script>

<svelte:head>
	<title>Services - Ayanda Mabaso</title>
	<meta name="description" content="Marketing consulting, business strategy, content strategy, and team training services by Ayanda Mabaso." />
</svelte:head>

<!-- Hero Section -->
<section class="py-20 bg-muted/30">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="max-w-3xl mx-auto text-center">
			<span class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-600 text-sm font-medium mb-6">
				Services
			</span>
			<h1 class="text-4xl sm:text-5xl font-bold text-foreground mb-6">
				How I Can Help You Grow
			</h1>
			<p class="text-lg text-muted-foreground leading-relaxed">
				From strategic consulting to hands-on implementation, I offer a range of services
				designed to help your business thrive in the digital landscape.
			</p>
		</div>
	</div>
</section>

<!-- Services Grid -->
<section class="py-20">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="grid md:grid-cols-2 gap-8">
			{#each services as service (service.title)}
				{@const ServiceIcon = service.icon}
				<div class="bg-white rounded-3xl p-8 border-2 border-gray-100 hover:border-gray-200 transition-colors">
					<div class="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-6">
						<ServiceIcon class="w-7 h-7 text-gray-700" />
					</div>
					<h3 class="text-2xl font-bold text-foreground mb-3">{service.title}</h3>
					<p class="text-muted-foreground mb-6">{service.description}</p>
					<ul class="space-y-3">
						{#each service.features as feature (feature)}
							<li class="flex items-center gap-3">
								<Check class="w-4 h-4 text-primary shrink-0" />
								<span class="text-sm text-gray-600">{feature}</span>
							</li>
						{/each}
					</ul>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- CTA Section -->
<section class="py-20 bg-primary text-white">
	<div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
		<h2 class="text-3xl sm:text-4xl font-bold mb-6">
			Ready to Transform Your Business?
		</h2>
		<p class="text-xl text-white/80 mb-8">
			Book a consultation to discuss your specific needs and how I can help.
		</p>
		<div class="flex flex-wrap gap-4 justify-center">
			<Button href="/booking" class="bg-accent hover:bg-accent/90 text-white px-8 py-6 rounded-xl text-base font-medium">
				Book Consultation
				<ArrowRight class="w-5 h-5 ml-2" />
			</Button>
			<Button href="/contact" variant="outline" class="border-2 border-white text-white hover:bg-white hover:text-primary px-8 py-6 rounded-xl text-base font-medium">
				Contact Me
			</Button>
		</div>
	</div>
</section>
