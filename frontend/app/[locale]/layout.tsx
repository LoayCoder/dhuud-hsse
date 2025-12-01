import React, { useEffect } from 'react';
import { Changa } from 'next/font/google';
import { TenantStyleProvider } from '../../components/providers/tenant-style-provider';
import { cn } from '../../lib/utils';

// Securely configure Google Font via Next.js optimizer
// This prevents runtime requests to Google servers in production
const changa = Changa({
  subsets: ['latin', 'arabic'],
  display: 'swap',
  variable: '--font-changa',
  weight: ['200', '300', '400', '500', '600', '700', '800'],
});

interface RootLayoutProps {
  children: React.ReactNode;
  params: {
    locale: 'en' | 'ar';
  };
}

const RootLayout: React.FC<RootLayoutProps> = ({ children, params: { locale } }) => {
  
  // Handle Direction (RTL/LTR)
  useEffect(() => {
    const dir = locale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <div className={cn(
      "antialiased w-full h-full",
      changa.variable, // Inject the CSS variable
      "font-sans"      // Apply the font family defined in Tailwind
    )}>
      <TenantStyleProvider>
        {children}
      </TenantStyleProvider>
    </div>
  );
};

export default RootLayout;