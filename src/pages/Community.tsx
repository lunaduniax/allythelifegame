import { useState } from 'react';
import { Video, Headphones, Music, BookOpen, Library, Play, Heart, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const categories = [
  { id: 'all', label: 'Todo' },
  { id: 'videos', label: 'Videos' },
  { id: 'podcasts', label: 'Podcasts' },
  { id: 'music', label: 'Música' },
  { id: 'courses', label: 'Cursos' },
  { id: 'books', label: 'Libros' },
] as const;

type CategoryId = (typeof categories)[number]['id'];

const featuredItems = [
  {
    id: '1',
    title: 'Hábitos Atómicos',
    description: 'Pequeños cambios, resultados extraordinarios.',
    category: 'books',
    gradient: 'from-accent/60 to-primary/30',
    icon: Library,
    duration: '8h lectura',
  },
  {
    id: '2',
    title: 'Mentalidad Ganadora',
    description: 'Podcast semanal sobre productividad y crecimiento.',
    category: 'podcasts',
    gradient: 'from-primary/40 to-accent/20',
    icon: Headphones,
    duration: '45 min',
  },
  {
    id: '3',
    title: 'Productividad 101',
    description: 'Curso completo para dominar tu día.',
    category: 'courses',
    gradient: 'from-destructive/30 to-accent/30',
    icon: BookOpen,
    duration: '12 lecciones',
  },
];

const contentItems = [
  { id: '1', title: 'Cómo crear rutinas que duran', author: 'Carlos López', type: 'videos', icon: Video, meta: '12 min' },
  { id: '2', title: 'Focus Mode: Deep Work', author: 'Ana García', type: 'music', icon: Music, meta: '1h 20min' },
  { id: '3', title: 'El poder de los micro-hábitos', author: 'María Torres', type: 'podcasts', icon: Headphones, meta: '38 min' },
  { id: '4', title: 'Planificación semanal efectiva', author: 'Diego Ruiz', type: 'videos', icon: Video, meta: '18 min' },
  { id: '5', title: 'Mindfulness para productividad', author: 'Laura Vega', type: 'courses', icon: BookOpen, meta: '6 lecciones' },
  { id: '6', title: 'Resumen: El monje que vendió su Ferrari', author: 'Ally Reads', type: 'books', icon: Library, meta: '15 min' },
  { id: '7', title: 'Beats para concentrarse', author: 'ChillFi', type: 'music', icon: Music, meta: '2h' },
  { id: '8', title: 'Metas SMART en 5 pasos', author: 'Pedro Ríos', type: 'videos', icon: Video, meta: '9 min' },
];

const Community = () => {
  const [active, setActive] = useState<CategoryId>('all');

  const filtered = active === 'all' ? contentItems : contentItems.filter((i) => i.type === active);
  const featured = active === 'all' ? featuredItems : featuredItems.filter((i) => i.category === active);

  return (
    <div className="px-5 pt-14 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Comunidad</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Aprende, escucha y crece</p>
        </div>
        <button className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
          <Heart size={18} className="text-muted-foreground" />
        </button>
      </div>

      {/* Category Chips */}
      <div className="flex gap-2 overflow-x-auto pb-4 -mx-5 px-5 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActive(cat.id)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all shrink-0',
              active === cat.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground'
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Featured Section */}
      {featured.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-3">Destacado</h2>
          <div className="flex gap-3 overflow-x-auto -mx-5 px-5 pb-2 scrollbar-hide">
            {featured.map((item) => (
              <div
                key={item.id}
                className={cn(
                  'min-w-[260px] rounded-2xl p-5 bg-gradient-to-br relative overflow-hidden shrink-0',
                  item.gradient
                )}
              >
                <div className="absolute top-3 right-3 w-9 h-9 rounded-full bg-primary flex items-center justify-center">
                  <Play size={16} className="text-primary-foreground ml-0.5" fill="currentColor" />
                </div>
                <item.icon size={28} className="text-foreground mb-3 opacity-80" />
                <h3 className="font-bold text-foreground text-base leading-tight">{item.title}</h3>
                <p className="text-xs text-foreground/70 mt-1 line-clamp-2">{item.description}</p>
                <div className="flex items-center gap-1.5 mt-3">
                  <Clock size={12} className="text-foreground/60" />
                  <span className="text-[11px] text-foreground/60 font-medium">{item.duration}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-foreground">
            {active === 'all' ? 'Todo el contenido' : categories.find((c) => c.id === active)?.label}
          </h2>
          <span className="text-xs text-muted-foreground">{filtered.length} items</span>
        </div>

        <AnimatePresence mode="popLayout">
          <div className="space-y-2">
            {filtered.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-card border border-border/50 active:scale-[0.98] transition-transform"
              >
                <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                  <item.icon size={20} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-foreground truncate">{item.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.author} · {item.meta}
                  </p>
                </div>
                <button className="w-9 h-9 rounded-full bg-secondary/80 flex items-center justify-center shrink-0">
                  <Play size={14} className="text-foreground ml-0.5" fill="currentColor" />
                </button>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-sm">No hay contenido en esta categoría aún</p>
            <span className="inline-block mt-2 text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
              Próximamente
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Community;
