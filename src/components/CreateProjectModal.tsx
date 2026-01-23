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
    
    // Validate required fields
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

      // Success!
      toast.success('Meta creada ✅');
      
      // Reset form and close modal
      resetForm();
      onClose();
      
      // Trigger refetch if callback provided
      if (onSuccess) {
        await onSuccess();
      }
      
      // Navigate to /home with the new project selected
      navigate('/', { state: { selectedProjectId: data.id } });
    } catch (err) {
      console.error('Unexpected error creating goal:', err);
      toast.error('No se pudo guardar. Probá de nuevo.');
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Full-screen loading overlay */}
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
              onClick={isSubmitting ? undefined : onClose}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            />
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-2xl border-t border-border max-h-[90vh] overflow-y-auto"
          >
            {/* Sticky Header with Close Button */}
            <div className="sticky top-0 z-10 bg-card pt-6 px-6 pb-4 border-b border-border/50">
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="w-10 h-10 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors disabled:opacity-50"
                  aria-label="Cerrar"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 pb-8">
              <div className="mb-4">
                <h2 className="text-xl font-semibold">¿Qué querés lograr?</h2>
                <p className="text-sm text-primary mt-1">
                  Conectá con tu propósito, esto te va a ayudar cuando flaquee la motivación.
                </p>
              </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-2">
                  Escribí tu meta…
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-input border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-2">
                  ¿En qué categoría está?
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  placeholder="Ej: Work, Personal, Side project..."
                  className="w-full bg-input border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-2">
                  ¿Por qué es importante?
                </label>
                <textarea
                  value={importance}
                  onChange={e => setImportance(e.target.value)}
                  rows={3}
                  className="w-full bg-input border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-2">
                  Fecha estimada de finalización
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        "w-full bg-input border border-border rounded-xl px-4 py-3 text-left flex items-center gap-3",
                        !targetDate && "text-muted-foreground"
                      )}
                    >
                      <Calendar size={20} className="text-muted-foreground flex-shrink-0" />
                      {targetDate ? format(targetDate, "dd/MM/yyyy", { locale: es }) : "Seleccionar fecha"}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-card border-border" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={targetDate}
                      onSelect={setTargetDate}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-1">
                  ¿Con qué frecuencia querés trabajar en esta meta?
                </label>
                <p className="text-xs text-primary mb-3">
                  Te vamos a mandar recordatorios motivacionales :D
                </p>
                <Select value={reminderFrequency} onValueChange={setReminderFrequency}>
                  <SelectTrigger className="w-full bg-input border border-border rounded-xl px-4 py-3 h-auto text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {frequencyOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-2">
                  Color de la tarjeta
                </label>
                <div className="flex gap-3 flex-wrap">
                  {colorOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setColor(option.value)}
                      className={cn(
                        "w-12 h-12 rounded-xl transition-all",
                        color === option.value && "ring-2 ring-primary ring-offset-2 ring-offset-card"
                      )}
                      style={{ backgroundColor: option.value }}
                      title={option.name}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={!name.trim() || !category.trim() || isSubmitting}
                className="w-full bg-primary text-primary-foreground font-semibold py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
              >
                {isSubmitting ? 'Creando...' : 'Listo, crear meta!'}
              </button>
            </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
    </>
  );
};
