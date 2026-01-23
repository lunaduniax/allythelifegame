import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const LANGUAGE_OPTIONS = [
  { value: 'es', label: 'Español' },
  { value: 'en', label: 'English' },
];

const Settings = () => {
  const navigate = useNavigate();
  
  // Load preferences from localStorage
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('ally_notifications');
    return saved === 'true';
  });
  
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('ally_darkMode');
    return saved !== 'false'; // Default to true
  });
  
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('ally_language') || 'es';
  });
  
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);

  // Persist preferences
  useEffect(() => {
    localStorage.setItem('ally_notifications', String(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('ally_darkMode', String(darkMode));
    // Apply theme (for now app is dark-only, but preference is stored)
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('ally_language', language);
  }, [language]);

  const handleLanguageSelect = (lang: string) => {
    setLanguage(lang);
    setIsLanguageModalOpen(false);
  };

  const getCurrentLanguageLabel = () => {
    return LANGUAGE_OPTIONS.find(l => l.value === language)?.label || 'Español';
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-6 py-4 pt-12">
        <button
          onClick={() => navigate('/account')}
          className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
        >
          <ChevronLeft size={20} />
        </button>
        
        <h1 className="text-lg font-semibold">Settings</h1>
        
        <div className="w-10" /> {/* Spacer for centering */}
      </header>

      {/* Settings List */}
      <div className="px-6 pt-6 space-y-4">
        {/* Notificaciones */}
        <div className="flex items-center justify-between bg-transparent border border-border rounded-xl px-4 py-4">
          <span className="text-foreground">Notificaciones</span>
          <Switch
            checked={notifications}
            onCheckedChange={setNotifications}
            className="data-[state=checked]:bg-primary"
          />
        </div>

        {/* Dark Mood */}
        <div className="flex items-center justify-between bg-transparent border border-border rounded-xl px-4 py-4">
          <span className="text-foreground">Dark Mood</span>
          <Switch
            checked={darkMode}
            onCheckedChange={setDarkMode}
            className="data-[state=checked]:bg-primary"
          />
        </div>

        {/* Idioma */}
        <button
          onClick={() => setIsLanguageModalOpen(true)}
          className="w-full flex items-center justify-between bg-transparent border border-border rounded-xl px-4 py-4"
        >
          <span className="text-foreground">Idioma</span>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">{getCurrentLanguageLabel()}</span>
            <ChevronRight size={20} className="text-muted-foreground" />
          </div>
        </button>

        {/* Ayuda */}
        <button
          onClick={() => navigate('/help')}
          className="w-full flex items-center justify-between bg-transparent border border-border rounded-xl px-4 py-4"
        >
          <span className="text-foreground">Ayuda</span>
          <ChevronRight size={20} className="text-muted-foreground" />
        </button>

        {/* Sobre Ally */}
        <button
          onClick={() => navigate('/about')}
          className="w-full flex items-center justify-between bg-transparent border border-border rounded-xl px-4 py-4"
        >
          <span className="text-foreground">Sobre Ally</span>
          <ChevronRight size={20} className="text-muted-foreground" />
        </button>
      </div>

      {/* Language Selection Modal */}
      <Dialog open={isLanguageModalOpen} onOpenChange={setIsLanguageModalOpen}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center">Idioma</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 pt-4">
            {LANGUAGE_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleLanguageSelect(option.value)}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-colors",
                  language === option.value
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-muted-foreground"
                )}
              >
                <span>{option.label}</span>
                {language === option.value && (
                  <div className="w-2 h-2 rounded-full bg-primary" />
                )}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;
