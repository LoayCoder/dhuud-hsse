import React, { useState } from 'react';
import { z } from 'zod';
import { ShieldCheck, AlertCircle, ArrowRight, Ticket, Loader2 } from 'lucide-react';
import { useTenantStore } from '../../../store/tenant-store';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { PageProps } from '../../../types';
import { cn } from '../../../lib/utils';

// Zod Schema for strict input validation
const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginPage: React.FC<PageProps> = ({ params: { locale }, onNavigate }) => {
  const { tenant } = useTenantStore();
  const [isLoading, setIsLoading] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    // 1. Client-Side Validation
    const result = loginSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: any = {};
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
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-foreground p-4 relative overflow-hidden font-sans selection:bg-primary/30">
        
        {/* Animated Background Blobs - Consistent with Register Page */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-400/30 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[35%] h-[35%] bg-blue-400/30 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
            <div className="absolute top-[40%] left-[40%] w-[45%] h-[45%] bg-teal-400/30 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>
        </div>

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(circle at center, currentColor 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
        />

        <div className="relative z-10 w-full max-w-md animate-in fade-in zoom-in duration-500">
          
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary to-cyan-500 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                  <img src={tenant.branding.logoUrl} className="relative h-20 object-contain drop-shadow-2xl" alt="Tenant Logo" />
                </div>
            </div>
            
            <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">{tenant.name}</h1>
            <div className="flex items-center justify-center gap-2 mt-2 text-primary/80">
              <ShieldCheck className="h-4 w-4" />
              <p className="text-xs font-semibold uppercase tracking-widest">ISO 27001 Secure Access</p>
            </div>
          </div>

          {/* Glass Card */}
          <div className="backdrop-blur-xl bg-white/40 dark:bg-black/40 border border-white/20 shadow-2xl rounded-2xl p-8 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50 pointer-events-none" />
            
            <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1" htmlFor="email">
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
                  className={cn(
                    "bg-white/50 dark:bg-black/50 border-slate-200 dark:border-slate-800 focus:ring-primary/50 focus:border-primary transition-all shadow-inner rounded-xl h-11",
                    errors.email && "border-destructive focus-visible:ring-destructive"
                  )}
                />
                {errors.email && (
                  <p className="text-xs text-destructive flex items-center gap-1 pl-1">
                    <AlertCircle className="h-3 w-3" /> {errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between pl-1">
                   <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider" htmlFor="password">
                    {t.password}
                  </label>
                  <button type="button" className="text-xs text-primary hover:underline font-medium transition-colors">{t.forgot}</button>
                </div>
                <Input
                  id="password"
                  type="password"
                  disabled={isLoading}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className={cn(
                    "bg-white/50 dark:bg-black/50 border-slate-200 dark:border-slate-800 focus:ring-primary/50 focus:border-primary transition-all shadow-inner rounded-xl h-11",
                    errors.password && "border-destructive focus-visible:ring-destructive"
                  )}
                />
                {errors.password && (
                  <p className="text-xs text-destructive flex items-center gap-1 pl-1">
                    <AlertCircle className="h-3 w-3" /> {errors.password}
                  </p>
                )}
              </div>

              <Button disabled={isLoading} className="mt-4 w-full h-12 text-base font-bold shadow-xl hover:shadow-primary/30 rounded-xl transition-all">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t.submit}
                {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </form>
          </div>

          {/* Footer Action */}
          <div className="mt-8 text-center">
             <button 
                onClick={() => onNavigate('/register')}
                className="group inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-primary font-medium transition-all px-4 py-2 rounded-lg hover:bg-white/50 dark:hover:bg-black/20"
             >
                <div className="p-1.5 bg-slate-200 dark:bg-slate-800 rounded-md group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                  <Ticket className="h-4 w-4" />
                </div>
                <span>Have an invitation code? Redeem here</span>
             </button>
             
             <p className="mt-6 text-xs text-slate-400 dark:text-slate-500 font-medium">
               Protected by Dhuud Identity.
             </p>
          </div>
        </div>
    </div>
  );
};

export default LoginPage;