import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';

interface ProfileOnboardingModalProps {
  user: User | null;
  onComplete: () => void;
}

const ProfileOnboardingModal = ({ user, onComplete }: ProfileOnboardingModalProps) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    if (!user) return;

    const checkProfileCompletion = async () => {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('name, username')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      // Show modal if name is missing or empty (common for OAuth users)
      const needsOnboarding = !profile?.name || profile.name.trim() === '';
      
      if (needsOnboarding) {
        // Pre-fill with Google data if available
        const googleName = user.user_metadata?.full_name || user.user_metadata?.name || '';
        setName(googleName);
        setOpen(true);
      }
    };

    checkProfileCompletion();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('El nombre es requerido');
      return;
    }

    if (!user) return;

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: name.trim(),
          username: username.trim() || null,
          phone_number: phoneNumber.trim() || null,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('¡Perfil completado!');
      setOpen(false);
      onComplete();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error('Error al guardar el perfil');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">
            ¡Bienvenido a Ally! 🎉
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Completá tu perfil para personalizar tu experiencia.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div className="space-y-2">
            <Label htmlFor="onboard-name" className="text-sm text-muted-foreground">
              Nombre <span className="text-destructive">*</span>
            </Label>
            <Input
              id="onboard-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="¿Cómo te llamás?"
              className="h-12 bg-background border-border rounded-lg text-foreground"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="onboard-username" className="text-sm text-muted-foreground">
              Nombre de usuario
            </Label>
            <Input
              id="onboard-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              placeholder="@usuario"
              className="h-12 bg-background border-border rounded-lg text-foreground"
            />
            <p className="text-xs text-muted-foreground">
              Solo letras minúsculas, números y guiones bajos.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="onboard-phone" className="text-sm text-muted-foreground">
              Teléfono (opcional)
            </Label>
            <Input
              id="onboard-phone"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+54 11 1234-5678"
              className="h-12 bg-background border-border rounded-lg text-foreground"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
                onComplete();
              }}
              className="flex-1 h-12 rounded-lg border-border"
            >
              Omitir
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="flex-1 h-12 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
            >
              {isLoading ? 'Guardando...' : 'Continuar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileOnboardingModal;
