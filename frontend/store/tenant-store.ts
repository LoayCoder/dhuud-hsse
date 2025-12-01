import { create } from 'zustand';
import { Tenant } from '../types';

// SVG Logos (Data URIs)
// Dhuud: Connected Nodes forming a 'D' Shape
// Elements: 3 dots on left (Light, Medium, Dark Blue), connected by a white curved stroke.
export const DHUUD_LOGO = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='none'%3E%3C!-- Top Dot (Light) --%3E%3Ccircle cx='25' cy='25' r='12' fill='%237DD3FC' /%3E%3C!-- Middle Dot (Medium) --%3E%3Ccircle cx='25' cy='50' r='12' fill='%230EA5E9' /%3E%3C!-- Bottom Dot (Dark) --%3E%3Ccircle cx='25' cy='75' r='12' fill='%231E3A8A' /%3E%3C!-- Connecting Curve (White Stroke) --%3E%3Cpath d='M35 25 H 55 A 25 25 0 0 1 55 75 H 35' stroke='white' stroke-width='10' stroke-linecap='round' stroke-linejoin='round' /%3E%3C/svg%3E`;

// Client: Industrial/Drilling - White stroke
export const CLIENT_LOGO = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 2v8'/%3E%3Cpath d='m4.93 10.93 1.41 1.41'/%3E%3Cpath d='M2 18h2'/%3E%3Cpath d='M20 18h2'/%3E%3Cpath d='m19.07 10.93-1.41 1.41'/%3E%3Cpath d='M22 22H2'/%3E%3Cpath d='m8 22 4-10 4 10'/%3E%3C/svg%3E`;

// Mock Data for Simulation
export const DHUUD_TENANT: Tenant = {
  id: 'dhuud-admin',
  name: 'Dhuud Platform',
  slug: 'dhuud',
  colors: {
    primary: '221.2 83.2% 53.3%', // Blue
    secondary: '210 40% 96.1%',
    ring: '221.2 83.2% 53.3%',
  },
  branding: {
    logoUrl: DHUUD_LOGO,
    iconUrl: DHUUD_LOGO, // Using same for favicon in mock
    heroImage: 'https://picsum.photos/id/1031/1920/1080?grayscale', // Technical/Office
  },
};

export const CLIENT_TENANT: Tenant = {
  id: 'golf-saudi',
  name: 'GOLF SAUDI Co.',
  slug: 'golf-saudi',
  colors: {
    primary: '142.1 76.2% 36.3%', // Saudi Green
    secondary: '142.1 76.2% 96.3%',
    ring: '142.1 76.2% 36.3%',
  },
  branding: {
    logoUrl: CLIENT_LOGO,
    iconUrl: CLIENT_LOGO,
    heroImage: 'https://picsum.photos/id/563/1920/1080', // Industrial
  },
};

interface TenantState {
  tenant: Tenant | null;
  isLoading: boolean;
  setTenant: (tenant: Tenant) => void;
  toggleTenant: () => void;
}

export const useTenantStore = create<TenantState>((set, get) => ({
  tenant: DHUUD_TENANT, // Default start
  isLoading: false,
  setTenant: (tenant) => set({ tenant }),
  toggleTenant: () => {
    const current = get().tenant;
    const next = current?.id === 'dhuud-admin' ? CLIENT_TENANT : DHUUD_TENANT;
    set({ tenant: next });
  },
}));