# Ayanda Mabaso - Fashion & Style Consultancy

A modern SvelteKit 5 application for fashion e-commerce and personal styling consultations, built with shadcn-svelte and Tailwind CSS v4.

## Technologies

- **SvelteKit 5** - Fast, modern web framework with SSR/SSG support
- **Svelte 5** - Reactive UI framework with runes
- **TypeScript** - Type-safe development
- **Tailwind CSS v4** - Utility-first CSS framework (using @import syntax)
- **shadcn-svelte** - Re-usable component library
- **@tredicik/portal-sdk** - Multi-tenant portal integration

## Features

- **Landing Page** - Modern hero section with features showcase
- **Store** - E-commerce product catalog with filtering
- **Booking** - Consultation scheduling system
- **Dashboard** - Customer portal for orders and appointments

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or pnpm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production (static site)
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
ayandamabaso/
├── src/
│   ├── routes/              # SvelteKit routes
│   │   ├── +page.svelte     # Landing page
│   │   ├── store/           # E-commerce store
│   │   ├── booking/         # Consultation booking
│   │   └── dashboard/       # Customer portal
│   ├── lib/
│   │   ├── config.ts        # Tenant configuration
│   │   ├── components/      # shadcn-svelte components
│   │   └── utils.ts         # Utility functions
│   ├── app.html             # HTML template
│   └── app.css              # Global styles (Tailwind v4)
├── static/                  # Static assets
├── svelte.config.js         # SvelteKit config (static adapter)
└── package.json
```

## Tenant Configuration

Multi-tenant support is configured in `src/lib/config.ts`:

```typescript
export const tenantConfig = {
  tenantId: 41,
  name: 'Ayanda Mabaso',
  domain: 'ayandamabaso.co.za',
  theme: {
    primary: '#1a1a2e',
    secondary: '#16213e',
    accent: '#e94560'
  },
  features: {
    store: true,
    booking: true,
    blog: false
  }
};
```

## Deployment

This project uses `@sveltejs/adapter-static` for static site generation, suitable for:
- AWS S3 + CloudFront
- Netlify
- Vercel
- GitHub Pages

Build output is in the `build/` directory after running `npm run build`.

## Development

The development server is configured to run on port 5176. Start the server with:

```bash
npm run dev
```

The app will be available at `http://localhost:5176`.

**Note:** Always use port 5176 for this application to avoid conflicts with other projects.

## Integration

To integrate with Tredicik backend:
1. Update `VITE_API_URL` in `.env`
2. Use `@tredicik/portal-sdk` for authenticated API calls
3. Configure tenant ID in `src/lib/config.ts`

## License

MIT
