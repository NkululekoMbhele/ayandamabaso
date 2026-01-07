<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { ArrowRight, Mic, Users, Calendar, MapPin, Clock, Check } from 'lucide-svelte';

	const topics = [
		'Digital Marketing & Content Strategy',
		'Building a Personal Brand',
		'Social Media Growth & Monetization',
		'Entrepreneurship & Business Scaling',
		'Sales & Conversion Optimization',
		'The Future of Marketing'
	];

	const speakingTypes = [
		{
			title: 'Keynote Speaking',
			description: 'Inspiring keynotes for conferences, corporate events, and industry summits.',
			duration: '45-60 min',
			icon: Mic
		},
		{
			title: 'Workshop Sessions',
			description: 'Interactive workshops with hands-on activities and actionable takeaways.',
			duration: '2-4 hours',
			icon: Users
		},
		{
			title: 'Corporate Training',
			description: 'Customized training programs for your team or organization.',
			duration: 'Half/Full Day',
			icon: Calendar
		}
	];
</script>

<svelte:head>
	<title>Speaking - Ayanda Mabaso</title>
	<meta name="description" content="Book Ayanda Mabaso for keynote speaking, workshops, and corporate training on marketing, business growth, and entrepreneurship." />
</svelte:head>

<!-- Hero Section -->
<section class="py-20 bg-muted/30">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="max-w-3xl mx-auto text-center">
			<div class="space-y-6">
				<span class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-600 text-sm font-medium">
					Speaking
				</span>
				<h1 class="text-4xl sm:text-5xl font-bold text-foreground leading-tight">
					Inspire Your Audience
				</h1>
				<p class="text-lg text-muted-foreground leading-relaxed">
					I deliver engaging talks that educate, inspire, and motivate audiences to take action.
					From intimate workshops to large-scale conferences, I bring energy and insights that make an impact.
				</p>
				<div class="flex flex-wrap gap-4 pt-4 justify-center">
					<Button href="/contact" class="bg-primary hover:bg-primary/90 text-white px-8 py-6 rounded-xl">
						<Mic class="w-5 h-5 mr-2" />
						Book Me to Speak
						<ArrowRight class="w-5 h-5 ml-2" />
					</Button>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Speaking Types -->
<section class="py-20">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="text-center max-w-3xl mx-auto mb-16">
			<h2 class="text-3xl sm:text-4xl font-bold text-foreground mb-6">
				Speaking Formats
			</h2>
			<p class="text-lg text-muted-foreground">
				Choose the format that best fits your event and audience needs.
			</p>
		</div>

		<div class="grid md:grid-cols-3 gap-8">
			{#each speakingTypes as type (type.title)}
				{@const TypeIcon = type.icon}
				<div class="bg-white rounded-3xl p-8 border-2 border-gray-100 text-center">
					<div class="w-14 h-14 rounded-full border-2 border-gray-100 flex items-center justify-center mx-auto mb-6">
						<TypeIcon class="w-6 h-6 text-gray-600" />
					</div>
					<h3 class="text-xl font-bold text-foreground mb-2">{type.title}</h3>
					<p class="text-muted-foreground text-sm mb-4">{type.description}</p>
					<div class="flex items-center justify-center gap-2 text-sm text-gray-500">
						<Clock class="w-4 h-4" />
						<span>{type.duration}</span>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- Topics -->
<section class="py-20 bg-muted/30">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="grid lg:grid-cols-2 gap-16 items-center">
			<div>
				<h2 class="text-3xl sm:text-4xl font-bold text-foreground mb-6">
					Popular Topics
				</h2>
				<p class="text-lg text-muted-foreground mb-8">
					I can customize my presentation to match your event theme and audience.
					Here are some of my most requested topics:
				</p>
				<ul class="space-y-4">
					{#each topics as topic (topic)}
						<li class="flex items-center gap-3">
							<Check class="w-5 h-5 text-primary shrink-0" />
							<span class="text-foreground">{topic}</span>
						</li>
					{/each}
				</ul>
			</div>
			<div class="bg-white rounded-3xl p-8 border-2 border-gray-100">
				<h3 class="text-2xl font-bold text-foreground mb-4">Book Ayanda for Your Event</h3>
				<p class="text-muted-foreground mb-6">
					Have an upcoming event? Let's discuss how I can add value to your audience.
				</p>
				<ul class="space-y-3 mb-8">
					<li class="flex items-center gap-3 text-sm text-gray-600">
						<MapPin class="w-4 h-4 text-gray-400" />
						Available in South Africa & International
					</li>
					<li class="flex items-center gap-3 text-sm text-gray-600">
						<Calendar class="w-4 h-4 text-gray-400" />
						In-person & Virtual Events
					</li>
				</ul>
				<Button href="/contact" class="bg-primary hover:bg-primary/90 text-white w-full py-6 rounded-xl">
					Inquire About Availability
					<ArrowRight class="w-5 h-5 ml-2" />
				</Button>
			</div>
		</div>
	</div>
</section>
