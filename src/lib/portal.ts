import { TredicikPortal } from '@tredicik/portal-sdk';

export const portal = new TredicikPortal({
  apiUrl: '/api/proxy',
  apiKey: import.meta.env.VITE_API_KEY || 'pk_live_tenant_41',
  tenantId: Number(import.meta.env.VITE_TENANT_ID) || 41
});

// Apply theme to CSS variables on initialization
if (typeof window !== 'undefined') {
  const root = document.documentElement;
  const theme = {
    primary: '#1a1a2e',
    secondary: '#16213e',
    accent: '#e94560'
  };

  root.style.setProperty('--color-primary', theme.primary);
  root.style.setProperty('--color-secondary', theme.secondary);
  root.style.setProperty('--color-accent', theme.accent);
}
