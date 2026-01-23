import { FC, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Calendar } from 'lucide-react';
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

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; category: string; color: string; importance?: string; targetDate?: string; reminderFrequency: string }) => void;
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
  onSubmit,
  currentStep = 1,
  totalSteps = 2,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [color, setColor] = useState(colorOptions[0].value);
  const [importance, setImportance] = useState('');
  const [targetDate, setTargetDate] = useState<Date | undefined>(undefined);
  const [reminderFrequency, setReminderFrequency] = useState('3 veces por semana');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !category.trim()) return;

    onSubmit({
      name: name.trim(),
      category: category.trim(),
      color,
      importance: importance.trim() || undefined,
      targetDate: targetDate ? format(targetDate, 'yyyy-MM-dd') : undefined,
      reminderFrequency,
    });

    setName('');
    setCategory('');
    setColor(colorOptions[0].value);
    setImportance('');
    setTargetDate(undefined);
    setReminderFrequency('3 veces por semana');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-2xl border-t border-border max-h-[90vh] overflow-y-auto"
          >
            {/* Sticky Step Header */}
            <div className="sticky top-0 z-10 bg-card pt-6 px-6 pb-4 border-b border-border/50">
              <div className="flex items-center justify-between gap-4">
                {/* Left: Back button */}
                <div className="w-16 flex items-center">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Volver"
                  >
                    <ChevronLeft size={20} />
                    <span className="text-sm">Back</span>
                  </button>
                </div>

                {/* Center: Step bars */}
                <div className="flex items-center gap-1.5 flex-1 justify-center">
                  {Array.from({ length: totalSteps }, (_, i) => {
                    const stepNumber = i + 1;
                    const isFilled = stepNumber <= currentStep;
                    
                    return (
                      <div
                        key={stepNumber}
                        className={`h-1 flex-1 max-w-12 rounded-full transition-colors ${
                          isFilled ? 'bg-foreground' : 'bg-muted-foreground/30'
                        }`}
                      />
                    );
                  })}
                </div>

                {/* Right: Step text */}
                <div className="w-16 flex justify-end">
                  <span className="text-sm text-muted-foreground">
                    {currentStep} of {totalSteps}
                  </span>
                </div>
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
                disabled={!name.trim() || !category.trim()}
                className="w-full bg-primary text-primary-foreground font-semibold py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
              >
                Listo, siguiente!
              </button>
            </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
