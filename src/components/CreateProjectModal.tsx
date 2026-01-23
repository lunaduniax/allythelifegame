import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => Promise<void>;
  currentStep?: 1 | 2;
  totalSteps?: number;
}

const frequencyOptions = [
  'Todos los días',
  '3 veces por semana',
  'Una vez por semana',
  'Prefiero no recibir recordatorios',
];

const colorOptions = [
  { name: 'Violet', value: '#DAD2FB' },
  { name: 'Yellow', value: '#D4FE00' },
  { name: 'Teal', value: '#4FD1C5' },
  { name: 'Coral', value: '#F6AD55' },
  { name: 'Mint', value: '#68D391' },
  { name: 'Sky', value: '#63B3ED' },
];

export const CreateProjectModal: FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentStep = 1,
  totalSteps = 1,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [color, setColor] = useState(colorOptions[0].value);
  const [importance, setImportance] = useState('');
  const [targetDate, setTargetDate] = useState<Date | undefined>(undefined);
  const [reminderFrequency, setReminderFrequency] = useState('3 veces por semana');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setName('');
    setCategory('');
    setColor(colorOptions[0].value);
    setImportance('');
    setTargetDate(undefined);
    setReminderFrequency('3 veces por semana');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('El título de la meta es requerido');
      return;
    }
    if (!category.trim()) {
      toast.error('La categoría es requerida');
      return;
    }

    if (!user) {
      toast.error('Debes iniciar sesión para crear una meta');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          name: name.trim(),
          category: category.trim(),
          color,
          importance: importance.trim() || null,
          target_date: targetDate ? format(targetDate, 'yyyy-MM-dd') : null,
          reminder_frequency: reminderFrequency,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating goal:', error);
        toast.error('No se pudo guardar. Probá de nuevo.');
        setIsSubmitting(false);
        return;
      }

      toast.success('Meta creada ✅');
      resetForm();
      onClose();
      
      if (onSuccess) {
        await onSuccess();
      }
      
      navigate('/', { state: { selectedProjectId: data.id } });
    } catch (err) {
      console.error('Unexpected error creating goal:', err);
      toast.error('No se pudo guardar. Probá de nuevo.');
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <LoadingOverlay
        isVisible={isSubmitting}
        message="Creando…"
        delayedMessage="Esto puede tardar unos segundos"
        delayMs={3000}
      />

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={isSubmitting ? undefined : onClose}
              className="fixed inset-0 bg-background/90 backdrop-blur-md z-50"
            />
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl rounded-t-3xl border-t border-border/30 max-h-[90vh] overflow-y-auto shadow-soft-lg"
          >
            {/* Header with Close Button */}
            <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-xl pt-6 px-6 pb-4">
              <div className="flex items-center justify-end">
                <motion.button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all duration-200 disabled:opacity-50"
                  aria-label="Cerrar"
                >
                  <X size={22} />
                </motion.button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 pb-10">
              <div className="mb-8">
                <h2 className="text-2xl font-semibold tracking-tight">¿Qué querés lograr?</h2>
                <p className="text-sm text-primary/80 mt-2 leading-relaxed">
                  Conectá con tu propósito, esto te va a ayudar cuando flaquee la motivación.
                </p>
              </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground block">
                  Escribí tu meta…
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-input/50 border border-border/30 rounded-2xl px-5 py-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/30 transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground block">
                  ¿En qué categoría está?
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  placeholder="Ej: Work, Personal, Side project..."
                  className="w-full bg-input/50 border border-border/30 rounded-2xl px-5 py-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/30 transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground block">
                  ¿Por qué es importante?
                </label>
                <textarea
                  value={importance}
                  onChange={e => setImportance(e.target.value)}
                  rows={3}
                  className="w-full bg-input/50 border border-border/30 rounded-2xl px-5 py-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/30 transition-all duration-200 resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground block">
                  Fecha estimada de finalización
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        "w-full bg-input/50 border border-border/30 rounded-2xl px-5 py-4 text-left flex items-center gap-3 hover:border-border/50 transition-all duration-200",
                        !targetDate && "text-muted-foreground"
                      )}
                    >
                      <Calendar size={20} className="text-muted-foreground flex-shrink-0" />
                      {targetDate ? format(targetDate, "dd/MM/yyyy", { locale: es }) : "Seleccionar fecha"}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-card border-border/30 rounded-2xl shadow-soft-lg" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={targetDate}
                      onSelect={setTargetDate}
                      initialFocus
                      className={cn("p-4 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground block">
                  ¿Con qué frecuencia querés trabajar en esta meta?
                </label>
                <p className="text-xs text-primary/70 mb-3">
                  Te vamos a mandar recordatorios motivacionales :D
                </p>
                <Select value={reminderFrequency} onValueChange={setReminderFrequency}>
                  <SelectTrigger className="w-full bg-input/50 border border-border/30 rounded-2xl px-5 py-4 h-auto text-foreground hover:border-border/50 transition-all duration-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border/30 rounded-2xl shadow-soft-lg">
                    {frequencyOptions.map((option) => (
                      <SelectItem key={option} value={option} className="rounded-xl">
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-muted-foreground block">
                  Color de la tarjeta
                </label>
                <div className="flex gap-3 flex-wrap">
                  {colorOptions.map((option) => (
                    <motion.button
                      key={option.value}
                      type="button"
                      onClick={() => setColor(option.value)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        "w-12 h-12 rounded-2xl transition-all duration-200",
                        color === option.value && "ring-2 ring-primary ring-offset-4 ring-offset-card shadow-glow-sm"
                      )}
                      style={{ backgroundColor: option.value }}
                      title={option.name}
                    />
                  ))}
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={!name.trim() || !category.trim() || isSubmitting}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-primary text-primary-foreground font-semibold py-4 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-glow-sm hover:shadow-glow text-base"
              >
                {isSubmitting ? 'Creando...' : 'Listo, crear meta!'}
              </motion.button>
            </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
    </>
  );
};
