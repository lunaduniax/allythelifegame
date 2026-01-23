import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import PasswordRequirements, { validatePassword } from '@/components/PasswordRequirements';
import ForgotPasswordModal from '@/components/ForgotPasswordModal';

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

type AuthMode = 'signup' | 'login' | 'reset';

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
  const [rememberMe, setRememberMe] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const isLogin = mode === 'login';
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
    if (isLogin) return 'Bienvenido de vuelta';
    return 'Empezá tu camino';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="min-h-screen bg-background flex flex-col px-6 pt-16 pb-8 safe-area-inset lg:min-h-0 lg:h-auto lg:max-w-[440px] lg:mx-auto lg:justify-center lg:py-10"
    >
      {/* Header */}
      <div className="mb-10 lg:mb-8">
        <h1 className="text-4xl lg:text-3xl font-semibold leading-tight text-foreground tracking-tight">
          {getTitle()} <span className="inline-block animate-pulse-soft">✨</span>
        </h1>
        {isReset && (
          <p className="text-muted-foreground mt-3 text-base leading-relaxed">
            Ingresá tu nueva contraseña.
          </p>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 flex-1 lg:flex-initial">
        {/* Reset password form */}
        {isReset && (
          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-sm text-muted-foreground font-medium">
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
                className="h-14 bg-input/50 border-border/30 rounded-2xl text-foreground pr-14 px-5 focus:ring-2 focus:ring-primary/50 focus:border-primary/30 transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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
            <Label htmlFor="name" className="text-sm text-muted-foreground font-medium">
              Nombre
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-14 bg-input/50 border-border/30 rounded-2xl text-foreground px-5 focus:ring-2 focus:ring-primary/50 focus:border-primary/30 transition-all duration-200"
            />
          </div>
        )}

        {/* Email field */}
        {!isReset && (
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm text-muted-foreground font-medium">
              Correo electrónico
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-14 bg-input/50 border-border/30 rounded-2xl text-foreground px-5 focus:ring-2 focus:ring-primary/50 focus:border-primary/30 transition-all duration-200"
            />
          </div>
        )}

        {/* Password field */}
        {(isLogin || mode === 'signup') && (
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm text-muted-foreground font-medium">
              Contraseña
            </Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-14 bg-input/50 border-border/30 rounded-2xl text-foreground pr-14 px-5 focus:ring-2 focus:ring-primary/50 focus:border-primary/30 transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {mode === 'signup' && <PasswordRequirements password={password} />}
            {isLogin && (
              <button
                type="button"
                onClick={() => setForgotPasswordOpen(true)}
                className="text-sm text-primary/80 hover:text-primary transition-colors mt-1"
              >
                ¿Olvidaste tu contraseña?
              </button>
            )}
          </div>
        )}

        {/* Remember me checkbox */}
        {isLogin && (
          <div className="flex items-center space-x-3">
            <Checkbox
              id="rememberMe"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked === true)}
              className="rounded-md"
            />
            <Label
              htmlFor="rememberMe"
              className="text-sm text-muted-foreground cursor-pointer"
            >
              Recordarme
            </Label>
          </div>
        )}

        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-semibold text-base hover:bg-primary/90 mt-4 shadow-glow-sm hover:shadow-glow transition-all duration-200"
          >
            {isLoading
              ? 'Cargando...'
              : isReset
              ? 'Guardar contraseña'
              : isLogin
              ? 'Iniciar sesión'
              : 'Empezar ahora'}
          </Button>
        </motion.div>

        {/* Toggle Auth Mode */}
        <div className="mt-auto pt-6 lg:pt-4 text-center lg:mt-0">
          {isReset ? (
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
                className="text-primary font-semibold text-sm hover:text-primary/80 transition-colors"
              >
                {isLogin ? 'Registrate' : 'Iniciá sesión'}
              </button>
            </>
          )}
        </div>
      </form>

      <ForgotPasswordModal
        open={forgotPasswordOpen}
        onOpenChange={setForgotPasswordOpen}
      />
    </motion.div>
  );
};

export default Auth;
