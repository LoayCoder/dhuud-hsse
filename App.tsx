import React, { useState, useEffect } from 'react';
import RootLayout from './frontend/app/[locale]/layout';
import LoginPage from './frontend/app/[locale]/login/page';
import RegisterPage from './frontend/app/[locale]/register/page';
import { useTenantStore } from './frontend/store/tenant-store';

// This component simulates the Next.js App Router for the demo environment
const App: React.FC = () => {
  const [locale, setLocale] = useState<'en' | 'ar'>('en');
  // Enforce Gatekeeper: Default to /register so users see the invite code screen first
  const [currentPath, setCurrentPath] = useState('/register');
  
  // Simulation: Toggle tenant to show dynamic branding
  const toggleTenant = useTenantStore((state) => state.toggleTenant);
  const currentTenant = useTenantStore((state) => state.tenant);

  // Client-Side Router Logic
  // This prevents full page reloads which breaks the preview environment ("refused to connect")
  const handleNavigate = (path: string) => {
    setCurrentPath(path);
    // In a real app we would pushState, but for iframe stability we just manage React state
  };

  useEffect(() => {
    const path = window.location.pathname;
    // Basic check if the user somehow landed on a specific path
    if (path === '/login') {
      setCurrentPath('/login');
    } else {
      setCurrentPath('/register');
    }
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Simulation Control Panel - Would not exist in prod */}
      <div className="fixed bottom-4 right-4 z-50 bg-black/80 text-white p-4 rounded-lg shadow-lg text-xs backdrop-blur-md">
        <p className="font-bold mb-2 text-muted-foreground uppercase tracking-wider">Dev Controls</p>
        <div className="flex flex-col gap-2">
           <div className="flex items-center justify-between gap-4">
            <span>Lang: {locale.toUpperCase()}</span>
            <button 
              onClick={() => setLocale(l => l === 'en' ? 'ar' : 'en')}
              className="bg-white/10 hover:bg-white/20 px-2 py-1 rounded"
            >
              Switch
            </button>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span>Tenant: {currentTenant?.name || 'Loading'}</span>
            <button 
              onClick={toggleTenant}
              className="bg-primary text-primary-foreground hover:opacity-90 px-2 py-1 rounded transition-colors duration-300"
            >
              Toggle
            </button>
          </div>
          <div className="border-t border-white/20 pt-2 flex items-center justify-between gap-4">
             <span>Nav:</span>
             <div className="space-x-2">
               <button 
                 onClick={() => handleNavigate('/login')} 
                 className={`hover:underline ${currentPath === '/login' ? 'text-green-400 font-bold' : 'text-blue-400'}`}
               >
                 Login
               </button>
               <button 
                 onClick={() => handleNavigate('/register')} 
                 className={`hover:underline ${currentPath === '/register' ? 'text-green-400 font-bold' : 'text-blue-400'}`}
               >
                 Register
               </button>
             </div>
          </div>
        </div>
      </div>

      {/* Actual Application Structure */}
      <RootLayout params={{ locale }}>
        {currentPath === '/register' ? (
           <RegisterPage params={{ locale }} onNavigate={handleNavigate} />
        ) : (
           <LoginPage params={{ locale }} onNavigate={handleNavigate} />
        )}
      </RootLayout>
    </div>
  );
};

export default App;