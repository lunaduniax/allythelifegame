import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import PasswordRequirements, { validatePassword } from '@/components/PasswordRequirements';

const signupSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100, 'El nombre es muy largo'),
  email: z.string().email('Correo electrónico inválido').max(255, 'El correo es muy largo'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .refine(
      (val) => /[a-z]/.test(val) && /[A-Z]/.test(val) && /[0-9]/.test(val),
      'La contraseña debe incluir mayúscula, minúscula y número'
    ),
});

const loginSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

type AuthMode = 'signup' | 'login' | 'forgot' | 'reset';

const Auth = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>('signup');
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const isLogin = mode === 'login';
  const isForgot = mode === 'forgot';
  const isReset = mode === 'reset';

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          setMode('reset');
          return;
        }
        if (session?.user && mode !== 'reset') {
          navigate('/');
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // Check if we're in a password recovery flow
        const hash = window.location.hash;
        if (hash.includes('type=recovery')) {
          setMode('reset');
        } else {
          navigate('/');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isReset) {
        // Password reset flow
        if (!validatePassword(newPassword)) {
          toast.error('La contraseña no cumple los requisitos');
          return;
        }

        const { error } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (error) {
          toast.error(error.message);
          return;
        }

        toast.success('¡Contraseña actualizada exitosamente!');
        navigate('/');
        return;
      }

      if (isForgot) {
        // Send password reset email
        const validatedEmail = z.string().email('Correo electrónico inválido').parse(email);
        
        const { error } = await supabase.auth.resetPasswordForEmail(validatedEmail, {
          redirectTo: `${window.location.origin}/auth`,
        });

        if (error) {
          toast.error(error.message);
          return;
        }

        toast.success('Te enviamos un correo para restablecer tu contraseña');
        setMode('login');
        return;
      }

      if (isLogin) {
        const validatedData = loginSchema.parse({ email, password });

        const { error } = await supabase.auth.signInWithPassword({
          email: validatedData.email,
          password: validatedData.password,
        });

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast.error('Credenciales inválidas. Verificá tu correo y contraseña.');
          } else {
            toast.error(error.message);
          }
          return;
        }

        toast.success('¡Bienvenido de vuelta!');
      } else {
        const validatedData = signupSchema.parse({ name, email, password });

        const redirectUrl = `${window.location.origin}/`;

        const { error } = await supabase.auth.signUp({
          email: validatedData.email,
          password: validatedData.password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              name: validatedData.name,
            },
          },
        });

        if (error) {
          if (error.message.includes('already registered')) {
            toast.error('Este correo ya está registrado. Intentá iniciar sesión.');
          } else {
            toast.error(error.message);
          }
          return;
        }

        toast.success('¡Cuenta creada exitosamente!');
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error('Ocurrió un error. Intentá de nuevo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getTitle = () => {
    if (isReset) return 'Nueva contraseña';
    if (isForgot) return 'Recuperar contraseña';
    if (isLogin) return 'Bienvenido de vuelta';
    return 'Empezá tu camino';
  };

  return (
    <div className="min-h-screen bg-background flex flex-col px-5 pt-12 pb-8 safe-area-inset">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold leading-tight text-foreground">
          {getTitle()} ✨
        </h1>
        {isForgot && (
          <p className="text-muted-foreground mt-2">
            Ingresá tu correo y te enviaremos un enlace para restablecer tu contraseña.
          </p>
        )}
        {isReset && (
          <p className="text-muted-foreground mt-2">
            Ingresá tu nueva contraseña.
          </p>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 flex-1">
        {/* Reset password form */}
        {isReset && (
          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-sm text-muted-foreground">
              Nueva contraseña
            </Label>
            <div className="relative">
              <Input
                id="newPassword"
                name="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-14 bg-card border-border rounded-lg text-foreground pr-12"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showNewPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <PasswordRequirements password={newPassword} />
          </div>
        )}

        {/* Signup name field */}
        {mode === 'signup' && (
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm text-muted-foreground">
              Nombre
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-14 bg-card border-border rounded-lg text-foreground"
            />
          </div>
        )}

        {/* Email field - shown for login, signup, forgot */}
        {!isReset && (
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm text-muted-foreground">
              Correo electrónico
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-14 bg-card border-border rounded-lg text-foreground"
            />
          </div>
        )}

        {/* Password field - shown for login and signup only */}
        {(isLogin || mode === 'signup') && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm text-muted-foreground">
                Contraseña
              </Label>
              {isLogin && (
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-xs text-primary hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              )}
            </div>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-14 bg-card border-border rounded-lg text-foreground pr-12"
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
            {mode === 'signup' && <PasswordRequirements password={password} />}
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          className="h-14 rounded-lg bg-primary text-primary-foreground font-semibold text-base hover:bg-primary/90 mt-4"
        >
          {isLoading
            ? 'Cargando...'
            : isReset
            ? 'Guardar contraseña'
            : isForgot
            ? 'Enviar enlace'
            : isLogin
            ? 'Iniciar sesión'
            : 'Empezar ahora'}
        </Button>

        {/* Divider and social login - only for login/signup */}
        {(isLogin || mode === 'signup') && (
          <>
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-border" />
              <span className="text-sm text-muted-foreground">O ingresá con:</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-12 rounded-lg bg-card border-border text-foreground hover:bg-card-elevated hover:text-foreground"
                onClick={() => toast.info('Google login próximamente')}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </Button>

              <Button
                type="button"
                variant="outline"
                className="flex-1 h-12 rounded-lg bg-card border-border text-foreground hover:bg-card-elevated hover:text-foreground"
                onClick={() => toast.info('Apple login próximamente')}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                Apple
              </Button>
            </div>
          </>
        )}

        {/* Toggle Auth Mode */}
        <div className="mt-auto pt-8 text-center">
          {isForgot ? (
            <button
              type="button"
              onClick={() => setMode('login')}
              className="text-primary font-semibold text-sm"
            >
              ← Volver a iniciar sesión
            </button>
          ) : isReset ? (
            <span className="text-muted-foreground text-sm">
              Ingresá tu nueva contraseña
            </span>
          ) : (
            <>
              <span className="text-muted-foreground text-sm">
                {isLogin ? '¿No tenés cuenta? ' : '¿Ya sos parte de Ally? '}
              </span>
              <button
                type="button"
                onClick={() => setMode(isLogin ? 'signup' : 'login')}
                className="text-primary font-semibold text-sm"
              >
                {isLogin ? 'Registrate' : 'Iniciá sesión'}
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
};

export default Auth;
