<script lang="ts">
	import { browser } from "$app/environment"
	import { X } from "lucide-svelte"

	const STORAGE_KEY = "ayanda_cookie_ack"

	let visible = $state(false)

	$effect(() => {
		if (!browser) return
		try {
			const ack = localStorage.getItem(STORAGE_KEY)
			if (ack !== "true") visible = true
		} catch {
			visible = true
		}
	})

	function accept() {
		try {
			localStorage.setItem(STORAGE_KEY, "true")
		} catch {
			// storage unavailable — just dismiss for the session
		}
		visible = false
	}
</script>

{#if visible}
	<div
		class="fixed bottom-0 left-0 right-0 z-[60] border-t border-border bg-background text-foreground shadow-elegant"
		role="dialog"
		aria-live="polite"
		aria-label="Cookie notice"
	>
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
			<div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
				<p class="text-sm flex-1 leading-relaxed">
					This site stores essential data in your browser to keep your cart and login working.
					Read our
					<a href="/privacy" class="underline hover:text-accent transition-colors">Privacy Policy</a>.
				</p>
				<div class="flex items-center gap-2 shrink-0">
					<a
						href="/privacy"
						class="px-4 py-3 rounded-xl text-sm font-medium border border-border hover:bg-muted transition-colors"
					>
						Privacy Policy
					</a>
					<button
						type="button"
						onclick={accept}
						class="px-4 py-3 rounded-xl text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-colors"
					>
						Accept
					</button>
					<button
						type="button"
						onclick={accept}
						class="p-2 rounded-xl hover:bg-muted transition-colors"
						aria-label="Dismiss cookie notice"
					>
						<X class="h-4 w-4" />
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}
