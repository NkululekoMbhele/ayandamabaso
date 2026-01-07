<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Mail, MapPin, Instagram, Linkedin, ArrowRight, Send } from 'lucide-svelte';

	let name = $state('');
	let email = $state('');
	let subject = $state('');
	let message = $state('');
	let isSubmitting = $state(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		isSubmitting = true;
		// Handle form submission here
		await new Promise(resolve => setTimeout(resolve, 1000));
		isSubmitting = false;
		alert('Thank you for your message! I will get back to you soon.');
		name = '';
		email = '';
		subject = '';
		message = '';
	}
</script>

<svelte:head>
	<title>Contact - Ayanda Mabaso</title>
	<meta name="description" content="Get in touch with Ayanda Mabaso for marketing consulting, speaking engagements, or business inquiries." />
</svelte:head>

<!-- Hero Section -->
<section class="py-20 bg-muted/30">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="max-w-3xl mx-auto text-center">
			<span class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-600 text-sm font-medium mb-6">
				Contact
			</span>
			<h1 class="text-4xl sm:text-5xl font-bold text-foreground mb-6">
				Let's Connect
			</h1>
			<p class="text-lg text-muted-foreground leading-relaxed">
				Have a question, project, or opportunity? I'd love to hear from you.
				Fill out the form below or reach out directly.
			</p>
		</div>
	</div>
</section>

<!-- Contact Section -->
<section class="py-20">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="grid lg:grid-cols-5 gap-16">
			<!-- Contact Info -->
			<div class="lg:col-span-2 space-y-8">
				<div>
					<h2 class="text-2xl font-bold text-foreground mb-6">Get In Touch</h2>
					<p class="text-muted-foreground">
						Whether you're interested in working together or just want to say hello,
						I'm always open to new connections and opportunities.
					</p>
				</div>

				<div class="space-y-6">
					<div class="flex items-start gap-4">
						<div class="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
							<Mail class="w-5 h-5 text-gray-600" />
						</div>
						<div>
							<p class="font-semibold text-foreground mb-1">Email</p>
							<a href="mailto:biz@mabasomedia.co.za" class="text-muted-foreground hover:text-primary transition-colors">
								biz@mabasomedia.co.za
							</a>
						</div>
					</div>

					<div class="flex items-start gap-4">
						<div class="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
							<MapPin class="w-5 h-5 text-gray-600" />
						</div>
						<div>
							<p class="font-semibold text-foreground mb-1">Location</p>
							<p class="text-muted-foreground">Durban, South Africa</p>
						</div>
					</div>
				</div>

				<div>
					<p class="font-semibold text-foreground mb-4">Follow Me</p>
					<div class="flex gap-3">
						<a
							href="https://instagram.com/ayandamabaso_official"
							target="_blank"
							rel="noopener noreferrer"
							class="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
						>
							<Instagram class="w-5 h-5" />
						</a>
						<a
							href="https://tiktok.com/@ayandamabaso_official"
							target="_blank"
							rel="noopener noreferrer"
							class="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
						>
							<svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
								<path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
							</svg>
						</a>
						<a
							href="https://linkedin.com/in/ayandamabaso"
							target="_blank"
							rel="noopener noreferrer"
							class="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
						>
							<Linkedin class="w-5 h-5" />
						</a>
					</div>
				</div>
			</div>

			<!-- Contact Form -->
			<div class="lg:col-span-3">
				<form onsubmit={handleSubmit} class="bg-white rounded-3xl p-8 border-2 border-gray-100">
					<h3 class="text-xl font-bold text-foreground mb-6">Send a Message</h3>

					<div class="grid sm:grid-cols-2 gap-6 mb-6">
						<div>
							<label for="name" class="block text-sm font-medium text-foreground mb-2">Name</label>
							<input
								type="text"
								id="name"
								bind:value={name}
								required
								class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:outline-none transition-colors"
								placeholder="Your name"
							/>
						</div>
						<div>
							<label for="email" class="block text-sm font-medium text-foreground mb-2">Email</label>
							<input
								type="email"
								id="email"
								bind:value={email}
								required
								class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:outline-none transition-colors"
								placeholder="your@email.com"
							/>
						</div>
					</div>

					<div class="mb-6">
						<label for="subject" class="block text-sm font-medium text-foreground mb-2">Subject</label>
						<input
							type="text"
							id="subject"
							bind:value={subject}
							required
							class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:outline-none transition-colors"
							placeholder="What's this about?"
						/>
					</div>

					<div class="mb-8">
						<label for="message" class="block text-sm font-medium text-foreground mb-2">Message</label>
						<textarea
							id="message"
							bind:value={message}
							required
							rows="5"
							class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:outline-none transition-colors resize-none"
							placeholder="Tell me about your project or inquiry..."
						></textarea>
					</div>

					<Button
						type="submit"
						disabled={isSubmitting}
						class="bg-primary hover:bg-primary/90 text-white w-full h-14 rounded-xl text-base font-semibold disabled:opacity-50"
					>
						{#if isSubmitting}
							Sending...
						{:else}
							Send Message
							<Send class="w-4 h-4 ml-2" />
						{/if}
					</Button>
				</form>
			</div>
		</div>
	</div>
</section>
