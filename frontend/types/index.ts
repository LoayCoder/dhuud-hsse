export interface TenantColors {
  primary: string; // HSL value e.g. "221.2 83.2% 53.3%"
  secondary: string;
  ring: string;
}

export interface TenantBranding {
  logoUrl: string;
  iconUrl: string;
  heroImage: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  colors: TenantColors;
  branding: TenantBranding;
}

export interface PageProps {
  params: {
    locale: 'en' | 'ar';
  };
  onNavigate: (path: string) => void;
}