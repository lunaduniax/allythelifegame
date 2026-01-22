import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

const goalSchema = z.object({
  name: z.string().min(1, 'La meta es requerida').max(200, 'La meta es muy larga'),
  category: z.string().min(1, 'La categoría es requerida'),
  importance: z.string().max(500, 'La descripción es muy larga').optional(),
});

const categories = [
  'Proyectos personales',
  'Work',
  'Salud',
  'Finanzas',
  'Educación',
  'Relaciones',
  'Creatividad',
];

const CreateGoal = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Proyectos personales');
  const [importance, setImportance] = useState('');
  const [targetDate, setTargetDate] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Debés iniciar sesión');
      return;
    }

    setIsLoading(true);

    try {
      const validatedData = goalSchema.parse({ name, category, importance });

      const { error } = await supabase.from('projects').insert({
        user_id: user.id,
        name: validatedData.name,
        category: validatedData.category,
        importance: validatedData.importance || null,
        target_date: targetDate || null,
        color: '#D4FE00',
      });

      if (error) {
        toast.error('Error al crear la meta. Intentá de nuevo.');
        console.error(error);
        return;
      }

      toast.success('¡Meta creada exitosamente!');
      navigate('/');
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

  return (
    <div className="min-h-screen bg-background flex flex-col px-5 pt-12 pb-8 safe-area-inset">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-4xl font-bold leading-tight text-foreground">
          ¿Qué querés lograr?
        </h1>
        <p className="text-primary mt-4 text-base leading-relaxed">
          Conectá con tu propósito, esto te va a ayudar cuando flaquee la motivación.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 flex-1">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm text-muted-foreground">
            Escribí tu meta...
          </Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-14 bg-card border-border rounded-lg text-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category" className="text-sm text-muted-foreground">
            ¿En qué categoría está?
          </Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="h-14 bg-card border-border rounded-lg text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="importance" className="text-sm text-muted-foreground">
            ¿Por qué es importante?
          </Label>
          <Textarea
            id="importance"
            value={importance}
            onChange={(e) => setImportance(e.target.value)}
            className="min-h-[100px] bg-card border-border rounded-lg text-foreground resize-none"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="targetDate" className="text-sm text-muted-foreground">
            Fecha estimada de finalización
          </Label>
          <div className="relative">
            <Input
              id="targetDate"
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="h-14 bg-card border-border rounded-lg text-foreground pl-12"
            />
            <Calendar 
              size={20} 
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" 
            />
          </div>
        </div>

        <div className="mt-auto pt-6">
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 rounded-lg bg-primary text-primary-foreground font-semibold text-base hover:bg-primary/90"
          >
            {isLoading ? 'Creando...' : 'Listo, siguiente!'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateGoal;
