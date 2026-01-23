import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Camera } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { mockDemoProfile } from '@/data/mockDemoData';
import { toast } from 'sonner';
import { z } from 'zod';

const profileSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es requerido').max(100, 'El nombre es muy largo'),
  username: z.string().trim().max(30, 'El username es muy largo').regex(/^[a-z0-9_]*$/, 'Solo letras minúsculas, números y guiones bajos').optional().or(z.literal('')),
  phone_number: z.string().trim().max(20, 'El número es muy largo').optional().or(z.literal('')),
});

interface ProfileData {
  name: string;
  email: string;
  username: string;
  phone_number: string;
  avatar_url: string | null;
}

const Account = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDemoMode } = useDemoMode();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    name: '',
    email: '',
    username: '',
    phone_number: '',
    avatar_url: null,
  });

  useEffect(() => {
    if (isDemoMode) {
      // Use mock data for demo mode
      setProfile({
        name: mockDemoProfile.name || '',
        email: mockDemoProfile.email || '',
        username: mockDemoProfile.username || '',
        phone_number: mockDemoProfile.phone_number || '',
        avatar_url: mockDemoProfile.avatar_url,
      });
      setLoading(false);
    } else if (user) {
      fetchProfile();
    }
  }, [user, isDemoMode]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('name, email, username, phone_number, avatar_url')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      setProfile({
        name: data?.name || '',
        email: data?.email || user.email || '',
        username: data?.username || '',
        phone_number: data?.phone_number || '',
        avatar_url: data?.avatar_url || null,
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (isDemoMode) {
      toast.info('Modo demo', { description: 'Inicia sesión para guardar cambios' });
      return;
    }
    
    if (!user) return;

    // Validate input before saving
    const validationResult = profileSchema.safeParse({
      name: profile.name,
      username: profile.username,
      phone_number: profile.phone_number,
    });

    if (!validationResult.success) {
      toast.error(validationResult.error.errors[0].message);
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: validationResult.data.name,
          username: validationResult.data.username || null,
          phone_number: validationResult.data.phone_number || null,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Perfil actualizado');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    if (isDemoMode) {
      navigate('/auth', { replace: true });
      return;
    }
    await supabase.auth.signOut();
    navigate('/auth', { replace: true });
  };

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    // Sanitize username input on change
    if (field === 'username') {
      value = value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    }
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-muted-foreground">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-6 py-4 pt-12">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
        >
          <ChevronLeft size={20} />
        </button>
        
        <h1 className="text-lg font-semibold">Edit Profile</h1>
        
        <button
          onClick={handleSave}
          disabled={saving}
          className="text-primary font-medium disabled:opacity-50"
        >
          {saving ? '...' : 'Guardar'}
        </button>
      </header>

      {/* Avatar Section */}
      <div className="flex justify-center mt-6 mb-8">
        <div className="relative">
          <div className="w-28 h-28 rounded-full bg-pink-200 overflow-hidden flex items-center justify-center">
            {profile.avatar_url ? (
              <img 
                src={profile.avatar_url} 
                alt="Avatar" 
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-4xl">👤</span>
            )}
          </div>
          <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-secondary border-2 border-background flex items-center justify-center">
            <Camera size={14} className="text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Form Fields */}
      <div className="px-6 space-y-5">
        {/* Name */}
        <div>
          <label className="text-sm text-muted-foreground block mb-2">Name</label>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="w-full bg-transparent border border-border rounded-xl px-4 py-3.5 text-foreground focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Email (read-only) */}
        <div>
          <label className="text-sm text-muted-foreground block mb-2">Email</label>
          <input
            type="email"
            value={profile.email}
            readOnly
            className="w-full bg-transparent border border-border rounded-xl px-4 py-3.5 text-foreground/70 cursor-not-allowed"
          />
        </div>

        {/* Username */}
        <div>
          <label className="text-sm text-muted-foreground block mb-2">Username</label>
          <input
            type="text"
            value={profile.username}
            onChange={(e) => handleInputChange('username', e.target.value)}
            placeholder="@username"
            className="w-full bg-transparent border border-border rounded-xl px-4 py-3.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Phone Number */}
        <div>
          <label className="text-sm text-muted-foreground block mb-2">Number</label>
          <input
            type="tel"
            value={profile.phone_number}
            onChange={(e) => handleInputChange('phone_number', e.target.value)}
            placeholder="+1234567890"
            className="w-full bg-transparent border border-border rounded-xl px-4 py-3.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Action Rows */}
        <div className="pt-4 space-y-3">
          <button
            onClick={() => navigate('/settings')}
            className="w-full flex items-center justify-between bg-transparent border border-border rounded-xl px-4 py-3.5 text-foreground"
          >
            <span>Configuración</span>
            <ChevronRight size={20} className="text-muted-foreground" />
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between bg-transparent border border-border rounded-xl px-4 py-3.5 text-foreground"
          >
            <span>Log Out</span>
            <ChevronRight size={20} className="text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Account;
