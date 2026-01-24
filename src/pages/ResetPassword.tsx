import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import PasswordRequirements, { validatePassword } from '@/components/PasswordRequirements';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    // Listen for auth state changes to detect PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('[ResetPassword] Auth event:', event);
        if (event === 'PASSWORD_RECOVERY') {
          setIsValidSession(true);
          setIsCheckingSession(false);
        } else if (session?.user) {
          // User is logged in with a valid recovery session
          setIsValidSession(true);
          setIsCheckingSession(false);
        }
      }
    );

    // Check if we're in a valid recovery flow
    const checkRecoverySession = async () => {
      try {
        const hash = window.location.hash;
        const params = new URLSearchParams(hash.substring(1));
        const type = params.get('type');
        const accessToken = params.get('access_token');
        
        console.log('[ResetPassword] URL hash type:', type);

        if (type === 'recovery' && accessToken) {
          // We have recovery tokens in the URL, Supabase will handle the session
          setIsValidSession(true);
        } else {
          // Check for existing session
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            setIsValidSession(true);
          } else {
            // No valid recovery session, redirect to auth
            console.log('[ResetPassword] No valid session, redirecting to auth');
            toast.error('Link de recuperación inválido o expirado');
            navigate('/auth');
          }
        }
      } catch (error) {
        console.error('[ResetPassword] Error checking session:', error);
        navigate('/auth');
      } finally {
        setIsCheckingSession(false);
      }
    };

    checkRecoverySession();

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePassword(newPassword)) {
      toast.error('La contraseña no cumple los requisitos');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        console.error('[ResetPassword] Update error:', error);
        toast.error(error.message);
        return;
      }

      toast.success('¡Contraseña actualizada exitosamente!');
      navigate('/');
    } catch (error) {
      console.error('[ResetPassword] Error:', error);
      toast.error('Ocurrió un error. Intentá de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Verificando...</div>
      </div>
    );
  }

  if (!isValidSession) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-background flex flex-col px-5 pt-10 pb-6 safe-area-inset lg:min-h-0 lg:h-auto lg:max-w-[440px] lg:mx-auto lg:justify-center lg:py-8">
      {/* Header */}
      <div className="mb-6 lg:mb-5">
        <h1 className="text-3xl lg:text-2xl font-bold leading-tight text-foreground">
          Nueva contraseña ✨
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Ingresá tu nueva contraseña.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 flex-1 lg:flex-initial">
        <div className="space-y-1.5">
          <Label htmlFor="newPassword" className="text-sm text-muted-foreground">
            Nueva contraseña
          </Label>
          <div className="relative">
            <Input
              id="newPassword"
              name="newPassword"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="h-12 bg-card border-border rounded-lg text-foreground pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          <PasswordRequirements password={newPassword} />
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="h-12 rounded-lg bg-primary text-primary-foreground font-semibold text-base hover:bg-primary/90 mt-2"
        >
          {isLoading ? 'Guardando...' : 'Guardar contraseña'}
        </Button>

        <div className="mt-auto pt-4 lg:pt-3 text-center lg:mt-0">
          <span className="text-muted-foreground text-sm">
            Ingresá tu nueva contraseña
          </span>
        </div>
      </form>
    </div>
  );
};

export default ResetPassword;
