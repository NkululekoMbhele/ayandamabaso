import { handleErrorWithSentry } from "@sentry/sveltekit"
import * as Sentry from "@sentry/sveltekit"
import { PUBLIC_SENTRY_DSN } from "$env/static/public"

// Initialise Sentry only when a DSN is provided so production builds without
// a DSN do not crash and dev environments stay quiet.
if (PUBLIC_SENTRY_DSN) {
	Sentry.init({
		dsn: PUBLIC_SENTRY_DSN,
		tracesSampleRate: 0.1,
		integrations: [Sentry.browserTracingIntegration()]
	})
}

// If you have a custom error handler, pass it to handleErrorWithSentry
export const handleError = handleErrorWithSentry()
