import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { ShieldAlert, CheckCircle2, ArrowRight, Loader2, KeyRound, Building2, User } from 'lucide-react';
import { useTenantStore } from '../../../store/tenant-store';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { PageProps, Tenant } from '../../../types';
import { authApi } from '../../../lib/api/auth';

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
      setInviteData(data);
      
      // WOW Factor: Dynamically switch branding to the invited Tenant!
      // In a real app, we would fetch the full tenant object. 
      // Here we mock the switch based on ID.
      if (data.tenant_id === 'golf-saudi') {
        // Trigger store update to switch theme colors immediately
        useTenantStore.getState().toggleTenant(); 
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
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-6">
        <div className="mx-auto h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
          <KeyRound className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold">{t.enterCode}</h2>
        <p className="text-sm text-muted-foreground mt-2">
          {locale === 'en' ? 'Enter the security code sent to your email.' : 'أدخل رمز الأمان المرسل إلى بريدك الإلكتروني.'}
        </p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleValidateCode(inviteCode); }} className="space-y-4">
        <Input 
          placeholder="Ex: inv-8392-xyz"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value)}
          className="text-center text-lg tracking-widest uppercase font-mono"
        />
        <Button className="w-full" disabled={!inviteCode}>
          {locale === 'en' ? 'Validate Code' : 'تحقق من الرمز'} <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </form>
       <div className="mt-4 text-center">
        <p className="text-xs text-muted-foreground">Try demo code: <span className="font-mono font-bold select-all">valid-code-123</span></p>
      </div>
    </div>
  );

  const renderRegisterForm = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-3">
          <Building2 className="h-5 w-5 text-primary" />
          <div className="text-sm">
            <p className="text-muted-foreground text-xs uppercase tracking-wider">{locale === 'en' ? 'Joining Tenant' : 'الانضمام إلى المنشأة'}</p>
            <p className="font-bold">{inviteData.tenant_name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <User className="h-5 w-5 text-primary" />
          <div className="text-sm">
            <p className="text-muted-foreground text-xs uppercase tracking-wider">{locale === 'en' ? 'Email (Locked)' : 'البريد الإلكتروني'}</p>
            <p className="font-bold">{inviteData.email}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">{locale === 'en' ? 'First Name' : 'الاسم الأول'}</label>
            <Input 
              value={formData.firstName}
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              className={errors.firstName ? 'border-destructive' : ''}
            />
            {errors.firstName && <p className="text-xs text-destructive">{errors.firstName}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{locale === 'en' ? 'Last Name' : 'اسم العائلة'}</label>
            <Input 
              value={formData.lastName}
              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              className={errors.lastName ? 'border-destructive' : ''}
            />
             {errors.lastName && <p className="text-xs text-destructive">{errors.lastName}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">{locale === 'en' ? 'Create Password' : 'إنشاء كلمة مرور'}</label>
          <Input 
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            className={errors.password ? 'border-destructive' : ''}
          />
          {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">{locale === 'en' ? 'Confirm Password' : 'تأكيد كلمة المرور'}</label>
          <Input 
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
            className={errors.confirmPassword ? 'border-destructive' : ''}
          />
           {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
        </div>
        
        <div className="pt-4">
             <div className="flex items-start gap-2 mb-4">
                 <input type="checkbox" id="terms" className="mt-1" required />
                 <label htmlFor="terms" className="text-xs text-muted-foreground">
                    I agree to the <button type="button" className="underline">Terms of Service</button> and <button type="button" className="underline">Privacy Policy</button>.
                 </label>
             </div>
             <Button className="w-full h-11" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t.submit}
            </Button>
        </div>
      </form>
    </div>
  );

  const renderSuccess = () => (
     <div className="text-center space-y-4 animate-in zoom-in duration-500">
        <div className="mx-auto h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold">{t.success}</h2>
        <p className="text-muted-foreground">Redirecting to dashboard...</p>
        <Button variant="outline" onClick={() => onNavigate('/login')}>
            Go to Login
        </Button>
     </div>
  );

  // --- MAIN LAYOUT ---
  if (!tenant) return null;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50/50 dark:bg-black/90 p-4">
        {/* Background Pattern */}
        <div className="absolute inset-0 z-0 opacity-30 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(circle at center, var(--primary) 0.5px, transparent 1px)', backgroundSize: '24px 24px' }} 
        />

        <div className="relative z-10 w-full max-w-md bg-background border shadow-2xl rounded-2xl overflow-hidden">
            {/* Header / Branding */}
            <div className="bg-primary/10 p-6 flex flex-col items-center border-b">
                 <img src={tenant.branding.logoUrl} className="h-10 mb-2" alt="Logo" />
                 <p className="text-xs font-bold tracking-widest text-primary uppercase">{tenant.name} Secure Access</p>
            </div>

            {/* Error Banner */}
            {globalError && (
                <div className="bg-destructive/10 text-destructive p-3 text-sm flex items-center gap-2 px-6">
                    <ShieldAlert className="h-4 w-4" />
                    {globalError}
                </div>
            )}

            <div className="p-6 sm:p-8">
                {step === 'validating' && (
                    <div className="flex flex-col items-center justify-center py-8 space-y-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm font-medium text-muted-foreground">{t.validating}</p>
                    </div>
                )}

                {step === 'enter-code' && renderEnterCode()}
                {step === 'register' && renderRegisterForm()}
                {step === 'success' && renderSuccess()}
            </div>
            
            {step !== 'success' && (
                <div className="bg-muted/30 p-4 text-center border-t">
                    <button 
                      onClick={() => onNavigate('/login')}
                      className="text-xs text-muted-foreground hover:text-primary transition-colors hover:underline"
                    >
                        Already have an account? Sign in
                    </button>
                </div>
            )}
        </div>
    </div>
  );
};

export default RegisterPage;