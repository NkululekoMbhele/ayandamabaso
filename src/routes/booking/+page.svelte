<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Textarea } from '$lib/components/ui/textarea';
  import { Select } from '$lib/components/ui/select';
  import { Card } from '$lib/components/ui/card';
  import { Calendar, Clock, User, Mail, Phone, MessageSquare, BookOpen } from 'lucide-svelte';

  const consultationPackages = [
    {
      id: 'quick',
      title: '15-Minute Strategy Call',
      duration: 15,
      price: 150,
      description: 'Quick business consultation for specific questions'
    },
    {
      id: 'standard',
      title: '30-Minute Consultation',
      duration: 30,
      price: 350,
      description: 'In-depth business strategy and planning session'
    },
    {
      id: 'premium',
      title: '60-Minute Deep Dive',
      duration: 60,
      price: 650,
      description: 'Comprehensive business consultation with actionable plan'
    }
  ];

  let selectedPackage = $state('standard');
  let formData = $state({
    name: '',
    email: '',
    phone: '',
    date: '',
    topic: '',
    message: ''
  });
  let isSubmitting = $state(false);
  let submitSuccess = $state(false);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    isSubmitting = true;

    // Simulated API call - would use portal.booking in production
    await new Promise(resolve => setTimeout(resolve, 1500));

    isSubmitting = false;
    submitSuccess = true;

    // Reset form after 3 seconds
    setTimeout(() => {
      submitSuccess = false;
      formData = { name: '', email: '', phone: '', date: '', topic: '', message: '' };
    }, 3000);
  };
</script>

<svelte:head>
  <title>Book Consultation - Ayanda Mabaso</title>
  <meta name="description" content="Book a business consultation with Ayanda Mabaso" />
</svelte:head>

<div class="min-h-screen bg-background">
	<!-- Header -->
	<div class="bg-accent text-accent-foreground py-8">
		<div class="container mx-auto px-4 sm:px-6 lg:px-8">
			<div class="max-w-4xl mx-auto">
				<a
					href="/"
					class="inline-flex items-center gap-2 text-accent-foreground/80 hover:text-accent-foreground mb-4 transition-colors"
				>
					<ArrowLeft class="w-4 h-4" />
					<span>Back to Home</span>
				</a>
				<h1 class="text-4xl md:text-5xl font-bold mb-2">Book a Consultation</h1>
				<p class="text-accent-foreground/80 text-lg">
					Let's create your perfect style together
				</p>
			</div>
		</div>
	</div>

	<!-- Main Content -->
	<div class="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
		<div class="max-w-4xl mx-auto">
			<!-- Consultation Types -->
			<div class="mb-12">
				<h2 class="text-2xl font-bold text-foreground mb-6">Choose Your Service</h2>
				<div class="grid md:grid-cols-3 gap-4">
					{#each consultationTypes as type}
						<button
							onclick={() => selectedType = type.id}
							class="text-left p-6 rounded-xl border-2 transition-all duration-300 {selectedType === type.id
								? 'border-accent bg-accent/5'
								: 'border-border bg-card hover:border-accent/50'}"
						>
							<div class="flex items-start justify-between mb-3">
								<Calendar class="w-6 h-6 text-accent" />
								<span class="text-sm font-medium text-accent">{type.price}</span>
							</div>
							<h3 class="text-lg font-semibold text-foreground mb-2">{type.title}</h3>
							<div class="flex items-center gap-2 text-sm text-muted-foreground mb-3">
								<Clock class="w-4 h-4" />
								<span>{type.duration}</span>
							</div>
							<p class="text-sm text-muted-foreground">{type.description}</p>
						</button>
					{/each}
				</div>
			</div>

			<!-- Booking Form -->
			<div class="bg-card rounded-xl border border-border p-8">
				<h2 class="text-2xl font-bold text-foreground mb-6">Your Details</h2>
				<form onsubmit={handleSubmit} class="space-y-6">
					<div class="grid md:grid-cols-2 gap-6">
						<!-- Name -->
						<div>
							<label for="name" class="block text-sm font-medium text-foreground mb-2">
								<div class="flex items-center gap-2">
									<User class="w-4 h-4" />
									<span>Full Name</span>
								</div>
							</label>
							<input
								type="text"
								id="name"
								bind:value={formData.name}
								required
								class="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
								placeholder="Your name"
							/>
						</div>

						<!-- Email -->
						<div>
							<label for="email" class="block text-sm font-medium text-foreground mb-2">
								<div class="flex items-center gap-2">
									<Mail class="w-4 h-4" />
									<span>Email Address</span>
								</div>
							</label>
							<input
								type="email"
								id="email"
								bind:value={formData.email}
								required
								class="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
								placeholder="your@email.com"
							/>
						</div>

						<!-- Phone -->
						<div>
							<label for="phone" class="block text-sm font-medium text-foreground mb-2">
								<div class="flex items-center gap-2">
									<Phone class="w-4 h-4" />
									<span>Phone Number</span>
								</div>
							</label>
							<input
								type="tel"
								id="phone"
								bind:value={formData.phone}
								required
								class="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
								placeholder="+27 XX XXX XXXX"
							/>
						</div>

						<!-- Preferred Date -->
						<div>
							<label for="date" class="block text-sm font-medium text-foreground mb-2">
								<div class="flex items-center gap-2">
									<Calendar class="w-4 h-4" />
									<span>Preferred Date</span>
								</div>
							</label>
							<input
								type="date"
								id="date"
								bind:value={formData.date}
								required
								class="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
							/>
						</div>
					</div>

					<!-- Time -->
					<div>
						<label for="time" class="block text-sm font-medium text-foreground mb-2">
							<div class="flex items-center gap-2">
								<Clock class="w-4 h-4" />
								<span>Preferred Time</span>
							</div>
						</label>
						<select
							id="time"
							bind:value={formData.time}
							required
							class="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
						>
							<option value="">Select a time</option>
							<option value="09:00">09:00 AM</option>
							<option value="10:00">10:00 AM</option>
							<option value="11:00">11:00 AM</option>
							<option value="12:00">12:00 PM</option>
							<option value="14:00">02:00 PM</option>
							<option value="15:00">03:00 PM</option>
							<option value="16:00">04:00 PM</option>
						</select>
					</div>

					<!-- Message -->
					<div>
						<label for="message" class="block text-sm font-medium text-foreground mb-2">
							<div class="flex items-center gap-2">
								<MessageSquare class="w-4 h-4" />
								<span>Additional Notes (Optional)</span>
							</div>
						</label>
						<textarea
							id="message"
							bind:value={formData.message}
							rows={4}
							class="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent resize-none"
							placeholder="Tell us more about your styling needs..."
						></textarea>
					</div>

					<!-- Submit Button -->
					<button
						type="submit"
						class="w-full bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-4 rounded-lg font-medium text-lg transition-all duration-300 shadow-lg hover:shadow-xl"
					>
						Request Booking
					</button>

					<p class="text-sm text-muted-foreground text-center">
						We'll contact you within 24 hours to confirm your booking
					</p>
				</form>
			</div>
		</div>
	</div>
</div>
