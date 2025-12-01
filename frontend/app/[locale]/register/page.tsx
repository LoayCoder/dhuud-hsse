import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { ShieldAlert, CheckCircle2, ArrowRight, Loader2, KeyRound, Building2, User, Sparkles } from 'lucide-react';
import { useTenantStore, DHUUD_LOGO, CLIENT_LOGO, DHUUD_TENANT, CLIENT_TENANT } from '../../../store/tenant-store';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { PageProps } from '../../../types';
import { authApi } from '../../../lib/api/auth';
import { cn } from '../../../lib/utils';

// --- Zod Schemas ---

// Step 1: Code Validation
const codeSchema = z.object({
  code: z.string().min(5, "Code is too short"),
});

// Step 2: Registration Form
const registerSchema = z.object({
  firstName: z.string().min(2, "First name required"),
  lastName: z.string().min(2, "Last name required"),
  password: z.string().min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain uppercase")
    .regex(/[0-9]/, "Must contain number"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type Step = 'validating' | 'enter-code' | 'register' | 'success';

const RegisterPage: React.FC<PageProps> = ({ params: { locale }, onNavigate }) => {
  // State
  const [step, setStep] = useState<Step>('enter-code');
  const [inviteCode, setInviteCode] = useState('');
  const [inviteData, setInviteData] = useState<any>(null);
  const [errors, setErrors] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Form Data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: ''
  });

  // Store access to switch branding upon validation
  const { setTenant, tenant } = useTenantStore();

  // translations
  const t = {
    title: locale === 'ar' ? 'تفعيل الحساب' : 'Account Activation',
    enterCode: locale === 'ar' ? 'أدخل رمز الدعوة' : 'Enter Invitation Code',
    validating: locale === 'ar' ? 'جاري التحقق...' : 'Validating Invite...',
    invalid: locale === 'ar' ? 'رمز غير صالح' : 'Invalid Code',
    details: locale === 'ar' ? 'بيانات الحساب' : 'Account Details',
    submit: locale === 'ar' ? 'إنشاء حساب' : 'Create Account',
    success: locale === 'ar' ? 'تم إنشاء الحساب بنجاح' : 'Account Created Successfully',
  };

  // 1. Check URL for code on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codeParam = params.get('code');
    if (codeParam) {
      setInviteCode(codeParam);
      handleValidateCode(codeParam);
    }
  }, []);

  // 2. Handler: Validate Code
  const handleValidateCode = async (codeToValidate: string) => {
    setGlobalError(null);
    setStep('validating');
    
    try {
      const data = await authApi.validateInvite(codeToValidate);
      
      // LOGIC: Existing User -> Redirect to Login
      if (data.existingUser) {
        // Show a brief success/redirect message could be nice, but we'll jump for speed
        // alert(`User ${data.email} already exists. Redirecting to Login...`);
        onNavigate('/login');
        return;
      }

      setInviteData(data);
      
      // LOGIC: New User -> Switch Branding & Show Form
      if (data.tenant_id === 'golf-saudi') {
        useTenantStore.getState().setTenant(CLIENT_TENANT);
      } else if (data.tenant_id === 'dhuud-admin') {
        useTenantStore.getState().setTenant(DHUUD_TENANT);
      }

      setStep('register');
    } catch (err: any) {
      setGlobalError(err.message);
      setStep('enter-code');
    }
  };

  // 3. Handler: Submit Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const result = registerSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: any = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0]] = err.message;
      });
      setErrors(fieldErrors);
      setIsLoading(false);
      return;
    }

    try {
      await authApi.register({
        code: inviteCode,
        ...formData
      });
      setStep('success');
    } catch (err: any) {
      setGlobalError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- RENDER HELPERS ---

  const renderEnterCode = () => (
    <div className="relative z-10 w-full max-w-sm">
      <div className="text-center mb-8">
        {/* GATEWAY BRANDING: ALWAYS DHUUD INITIALLY */}
        <div className="flex justify-center mb-6">
           <div className="relative group">
             <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
             <img src={DHUUD_LOGO} className="relative h-20 w-20 drop-shadow-2xl" alt="Dhuud Platform" />
           </div>
        </div>
        
        <h2 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">{t.enterCode}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 px-4">
          {locale === 'en' ? 'Secure Access Gateway' : 'بوابة الوصول الآمن'}
        </p>
      </div>

      <div className="backdrop-blur-xl bg-white/40 dark:bg-black/40 border border-white/20 shadow-2xl rounded-2xl p-8 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50 pointer-events-none" />
        
        <form onSubmit={(e) => { e.preventDefault(); handleValidateCode(inviteCode); }} className="space-y-6 relative z-10">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">Invitation Code</label>
            <Input 
              placeholder="INV-XXXX-XXXX"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              className="text-center text-xl h-14 tracking-[0.2em] font-mono bg-white/50 dark:bg-black/50 border-slate-200 dark:border-slate-800 focus:ring-primary/50 focus:border-primary transition-all shadow-inner rounded-xl placeholder:text-slate-300 dark:placeholder:text-slate-700"
            />
          </div>
          <Button 
            className="w-full h-12 text-lg shadow-lg hover:shadow-primary/25 transition-all rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 border border-white/10" 
            disabled={!inviteCode}
          >
            {locale === 'en' ? 'Validate' : 'تحقق'} <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </form>
      </div>

       <div className="mt-8 text-center bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/5">
        <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-3 font-bold">DEV MODE: CLICK TO TEST</p>
        <div className="flex flex-col gap-2">
            <button onClick={() => setInviteCode('INVITE-DHUUD-LOGIN')} className="text-xs font-mono text-cyan-600 dark:text-cyan-400 hover:underline bg-cyan-500/10 py-1.5 px-3 rounded border border-cyan-500/20 transition-colors">INVITE-DHUUD-LOGIN</button>
            <button onClick={() => setInviteCode('INVITE-GOLF-SIGNUP')} className="text-xs font-mono text-green-600 dark:text-green-400 hover:underline bg-green-500/10 py-1.5 px-3 rounded border border-green-500/20 transition-colors">INVITE-GOLF-SIGNUP</button>
            <button onClick={() => setInviteCode('INVITE-DHUUD-STAFF')} className="text-xs font-mono text-blue-600 dark:text-blue-400 hover:underline bg-blue-500/10 py-1.5 px-3 rounded border border-blue-500/20 transition-colors">INVITE-DHUUD-STAFF</button>
        </div>
      </div>
    </div>
  );

  const renderRegisterForm = () => (
    <div className="w-full max-w-lg animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* BRAND HEADER */}
      <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
             <img src={tenant?.branding.logoUrl} className="h-20 object-contain drop-shadow-xl" alt="Tenant Logo" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{tenant?.name}</h1>
          <p className="text-sm font-medium tracking-widest text-primary uppercase opacity-90 mt-1">Secure Registration</p>
      </div>

      <div className="backdrop-blur-2xl bg-white/60 dark:bg-black/40 border border-white/20 dark:border-white/10 rounded-2xl shadow-2xl p-8 relative overflow-hidden">
        
        <div className="bg-primary/5 border border-primary/10 rounded-xl p-5 mb-6 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
               <User className="h-5 w-5" />
            </div>
            <div className="text-sm">
                <p className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">{locale === 'en' ? 'Email (Locked)' : 'البريد الإلكتروني'}</p>
                <p className="font-bold text-foreground text-lg">{inviteData.email}</p>
            </div>
            <div className="ml-auto">
               <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
            <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/80 ml-1">{locale === 'en' ? 'First Name' : 'الاسم الأول'}</label>
                <Input 
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  className={cn("bg-background/50 border-input/50 h-11", errors.firstName && 'border-destructive')}
                />
                {errors.firstName && <p className="text-xs text-destructive ml-1">{errors.firstName}</p>}
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/80 ml-1">{locale === 'en' ? 'Last Name' : 'اسم العائلة'}</label>
                <Input 
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  className={cn("bg-background/50 border-input/50 h-11", errors.lastName && 'border-destructive')}
                />
                {errors.lastName && <p className="text-xs text-destructive ml-1">{errors.lastName}</p>}
            </div>
            </div>

            <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80 ml-1">{locale === 'en' ? 'Create Password' : 'إنشاء كلمة مرور'}</label>
            <Input 
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className={cn("bg-background/50 border-input/50 h-11", errors.password && 'border-destructive')}
            />
            {errors.password && <p className="text-xs text-destructive ml-1">{errors.password}</p>}
            </div>

            <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80 ml-1">{locale === 'en' ? 'Confirm Password' : 'تأكيد كلمة المرور'}</label>
            <Input 
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                className={cn("bg-background/50 border-input/50 h-11", errors.confirmPassword && 'border-destructive')}
            />
            {errors.confirmPassword && <p className="text-xs text-destructive ml-1">{errors.confirmPassword}</p>}
            </div>
            
            <div className="pt-4">
                <div className="flex items-start gap-3 mb-6 p-3 bg-background/30 rounded-lg border border-transparent hover:border-border transition-colors cursor-pointer" onClick={() => (document.getElementById('terms') as HTMLInputElement)?.click()}>
                    <input type="checkbox" id="terms" className="mt-1 accent-primary h-4 w-4" required />
                    <label htmlFor="terms" className="text-xs text-muted-foreground leading-relaxed cursor-pointer select-none">
                        I agree to the <span className="font-semibold text-primary hover:underline">Terms of Service</span> and <span className="font-semibold text-primary hover:underline">Privacy Policy</span>. I understand this is a Zero Trust environment.
                    </label>
                </div>
                <Button className="w-full h-12 text-base font-bold shadow-xl hover:shadow-primary/30 rounded-xl transition-all" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t.submit}
                </Button>
            </div>
        </form>
      </div>
    </div>
  );

  const renderSuccess = () => (
     <div className="text-center space-y-6 animate-in zoom-in duration-500 max-w-md w-full p-10 backdrop-blur-2xl bg-white/60 dark:bg-black/50 rounded-3xl shadow-2xl border border-green-500/20">
        <div className="mx-auto h-24 w-24 bg-gradient-to-tr from-green-400 to-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
            <CheckCircle2 className="h-12 w-12" />
        </div>
        <div>
            <h2 className="text-3xl font-bold text-foreground">{t.success}</h2>
            <p className="text-muted-foreground mt-3 text-lg">Your account has been securely provisioned.</p>
        </div>
        <Button size="lg" className="w-full h-12 text-lg rounded-xl shadow-lg" onClick={() => onNavigate('/login')}>
            Go to Login
        </Button>
     </div>
  );

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-foreground p-4 relative overflow-hidden font-sans selection:bg-primary/30">
        
        {/* Animated Background Blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-400/30 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
            <div className="absolute top-[20%] right-[-10%] w-[35%] h-[35%] bg-blue-400/30 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-[-10%] left-[20%] w-[45%] h-[45%] bg-teal-400/30 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>
        </div>

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(circle at center, currentColor 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
        />

        {/* Error Banner */}
        {globalError && (
            <div className="absolute top-8 z-50 animate-in slide-in-from-top-4">
                <div className="bg-destructive/90 backdrop-blur-md text-destructive-foreground px-6 py-4 rounded-full shadow-2xl text-sm flex items-center gap-3 font-semibold border border-red-500/30">
                    <ShieldAlert className="h-5 w-5" />
                    {globalError}
                </div>
            </div>
        )}

        <div className="relative z-10 w-full flex flex-col items-center">
            {step === 'validating' && (
                <div className="flex flex-col items-center justify-center space-y-6 backdrop-blur-md bg-white/30 dark:bg-black/30 p-12 rounded-3xl border border-white/10 shadow-xl">
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse"></div>
                        <Loader2 className="h-16 w-16 animate-spin text-primary relative z-10" />
                    </div>
                    <p className="text-xl font-medium text-foreground tracking-wide">{t.validating}</p>
                </div>
            )}

            {step === 'enter-code' && renderEnterCode()}
            {step === 'register' && renderRegisterForm()}
            {step === 'success' && renderSuccess()}
            
            {step !== 'success' && step !== 'register' && (
                <div className="mt-12 opacity-80 hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => onNavigate('/login')}
                      className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-primary transition-colors hover:underline flex items-center gap-2"
                    >
                        Already have an account? Sign in <ArrowRight className="h-3 w-3" />
                    </button>
                </div>
            )}
        </div>
    </div>
  );
};

export default RegisterPage;