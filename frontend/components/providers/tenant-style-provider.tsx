import React, { useEffect } from 'react';
import { useTenantStore } from '../../store/tenant-store';

interface TenantStyleProviderProps {
  children: React.ReactNode;
}

export const TenantStyleProvider: React.FC<TenantStyleProviderProps> = ({ children }) => {
  const { tenant } = useTenantStore();

  useEffect(() => {
    if (!tenant) return;

    const root = document.documentElement;

    // 1. Inject CSS Variables for dynamic coloring
    // We update the HSL values which Tailwind uses for its classes
    root.style.setProperty('--primary', tenant.colors.primary);
    root.style.setProperty('--ring', tenant.colors.ring);
    
    // Optional: Inject secondary colors if tenant has them defined, otherwise fallbacks apply
    if (tenant.colors.secondary) {
      root.style.setProperty('--secondary', tenant.colors.secondary);
    }

    // 2. Dynamic Favicon Update
    const updateFavicon = (url: string) => {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = url;
    };

    if (tenant.branding.iconUrl) {
      updateFavicon(tenant.branding.iconUrl);
    }

    // 3. Update Title (Optional)
    if (tenant.name) {
      document.title = `${tenant.name} | Dhuud Secure`;
    }

  }, [tenant]);

  return <>{children}</>;
};