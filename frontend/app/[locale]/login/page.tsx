import React, { useState } from 'react';
import { z } from 'zod';
import { ShieldCheck, Globe, Sun, Moon, AlertCircle, ArrowRight, Ticket } from 'lucide-react';
import { useTenantStore } from '../../../store/tenant-store';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { PageProps } from '../../../types';

// Zod Schema for strict input validation
const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginPage: React.FC<PageProps> = ({ params: { locale }, onNavigate }) => {
  const { tenant } = useTenantStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isDark, setIsDark] = useState(false); // Local toggle for demo
  const [errors, setErrors] = useState<Partial<LoginFormValues>>({});
  const [formData, setFormData] = useState<LoginFormValues>({ email: '', password: '' });

  // Translation mock
  const t = {
    title: locale === 'en' ? 'Sign in to your account' : 'سجل الدخول إلى حسابك',
    email: locale === 'en' ? 'Email' : 'البريد الإلكتروني',
    password: locale === 'en' ? 'Password' : 'كلمة المرور',
    submit: locale === 'en' ? 'Sign In' : 'تسجيل الدخول',
    secure: locale === 'en' ? 'Secure System' : 'نظام آمن',
    forgot: locale === 'en' ? 'Forgot password?' : 'نسيت كلمة المرور؟',
  };

  const handleThemeToggle = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    // 1. Client-Side Validation
    const result = loginSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: any = {};
      // Defensive check to ensure errors array exists before iterating
      result.error?.errors?.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0]] = err.message;
      });
      setErrors(fieldErrors);
      setIsLoading(false);
      return;
    }

    // 2. Mock API Call
    await new Promise(resolve => setTimeout(resolve, 1500));
    alert(`Login attempt for ${formData.email} on tenant: ${tenant?.name}`);
    setIsLoading(false);
  };

  if (!tenant) return null;

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row overflow-hidden">
      
      {/* LEFT: Branding / Hero Area */}
      <div className="relative hidden w-0 lg:block lg:flex-1 overflow-hidden bg-black">
        <div className="absolute inset-0 z-10 bg-primary/20 mix-blend-multiply" />
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
        
        <img 
          src={tenant.branding.heroImage} 
          alt="HSSE Safety" 
          className="h-full w-full object-cover transition-transform duration-1000 hover:scale-105"
        />

        {/* Tenant Logo & Name - Positioned at Top Start (Left for LTR, Right for RTL) */}
        {/* Updated visual style to match a clean Header look */}
        <div className="absolute top-8 start-8 z-20 flex items-center gap-4 text-white">
          <div className="h-12 w-12 shrink-0">
             <img 
              src={tenant.branding.logoUrl} 
              alt={`${tenant.name} Logo`} 
              className="w-full h-full object-contain drop-shadow-md" 
             />
          </div>
          <span className="font-bold tracking-tight text-3xl drop-shadow-lg font-sans">
            {tenant.name}
          </span>
        </div>

        <div className="absolute bottom-12 left-12 right-12 z-20 text-white">
          <blockquote className="space-y-4 max-w-lg">
            <p className="text-xl font-medium leading-relaxed drop-shadow-lg">
              &ldquo;Safety is not just a metric, it's a culture. {tenant.name} is committed to Zero Harm.&rdquo;
            </p>
            <footer className="text-sm text-white/80 font-semibold tracking-wide uppercase">— HSSE Director</footer>
          </blockquote>
        </div>
      </div>

      {/* RIGHT: Login Form */}
      <div className="flex flex-1 flex-col items-center justify-center p-8 sm:p-12 lg:p-24 bg-background relative transition-colors duration-300">
        
        {/* Top Bar Actions */}
        <div className="absolute top-6 right-6 flex items-center gap-4">
           <button onClick={handleThemeToggle} className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted">
              {isDark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
           </button>
           <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium border rounded-full px-3 py-1">
             <Globe className="h-3.5 w-3.5" />
             <span className="uppercase">{locale}</span>
           </div>
        </div>

        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[380px]">
          <div className="flex flex-col space-y-2 text-center lg:text-start">
            <div className="mx-auto lg:mx-0 h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4 transition-colors duration-300">
               <ShieldCheck className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
            <p className="text-sm text-muted-foreground">
              {t.secure} - ISO 27001 Certified
            </p>
          </div>

          <div className="grid gap-6">
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4">
                <div className="grid gap-2 text-start">
                  <label className="text-sm font-medium leading-none" htmlFor="email">
                    {t.email}
                  </label>
                  <Input
                    id="email"
                    placeholder="name@company.com"
                    type="email"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    disabled={isLoading}
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className={errors.email ? "border-destructive focus-visible:ring-destructive" : ""}
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {errors.email}
                    </p>
                  )}
                </div>
                <div className="grid gap-2 text-start">
                  <div className="flex items-center justify-between">
                     <label className="text-sm font-medium leading-none" htmlFor="password">
                      {t.password}
                    </label>
                    <button type="button" className="text-xs text-primary hover:underline">{t.forgot}</button>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    disabled={isLoading}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className={errors.password ? "border-destructive focus-visible:ring-destructive" : ""}
                  />
                  {errors.password && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {errors.password}
                    </p>
                  )}
                </div>
                <Button disabled={isLoading} className="mt-4 h-11 w-full group shadow-md hover:shadow-lg transition-all">
                  {t.submit}
                  {!isLoading && locale === 'en' && <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />}
                  {!isLoading && locale === 'ar' && <ArrowRight className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1 rotate-180" />}
                </Button>
              </div>
            </form>
          </div>
          
          {/* New Footer Link for Invite Redemption - Using onNavigate */}
          <div className="text-center text-sm">
             <button 
                onClick={() => onNavigate('/register')}
                className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors p-2 rounded-lg hover:bg-primary/5 cursor-pointer"
             >
                <Ticket className="h-4 w-4" />
                Have an invitation code? Redeem here
             </button>
          </div>

          <p className="px-8 text-center text-xs text-muted-foreground">
             Protected by Dhuud Identity. By clicking continue, you agree to our Terms of Service.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;