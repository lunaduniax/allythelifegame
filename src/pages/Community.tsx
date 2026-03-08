import { useState } from 'react';
import { Video, Headphones, Music, BookOpen, Library, Play, Heart, Clock, Sparkles, ExternalLink, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import NowPlayingView from '@/components/NowPlayingView';
import { useFavorites } from '@/hooks/useFavorites';
import { useAIRecommendations, useCommunityContent } from '@/hooks/useCommunityContent';
import { Skeleton } from '@/components/ui/skeleton';

const categories = [
  { id: 'all', label: 'Todo' },
  { id: 'favorites', label: '❤️ Favoritos' },
  { id: 'ai', label: '✨ IA' },
  { id: 'videos', label: 'Videos' },
  { id: 'podcasts', label: 'Podcasts' },
  { id: 'music', label: 'Música' },
  { id: 'courses', label: 'Cursos' },
  { id: 'books', label: 'Libros' },
] as const;

type CategoryId = (typeof categories)[number]['id'];

const iconMap: Record<string, React.ElementType> = {
  videos: Video,
  podcasts: Headphones,
  music: Music,
  courses: BookOpen,
  books: Library,
};

const Community = () => {
  const [active, setActive] = useState<CategoryId>('all');
  const [nowPlaying, setNowPlaying] = useState<any>(null);
  const { favoriteIds, isFavorite, toggleFavorite } = useFavorites();
  const { data: dbContent = [], isLoading: isLoadingContent } = useCommunityContent();
  const { data: aiRecs = [], isLoading: isLoadingAI } = useAIRecommendations(
    active === 'ai' ? 'all' : active
  );

  // Merge DB content into displayable items
  const dbItems = dbContent.map((c) => ({
    id: c.id,
    title: c.title,
    author: c.author || 'Desconocido',
    type: c.type,
    icon: iconMap[c.type] || Video,
    meta: c.duration || '',
    url: c.url,
    description: c.description,
    source: 'db' as const,
  }));

  // AI recommendations as displayable items
  const aiItems = aiRecs.map((r, i) => ({
    id: `ai-${i}`,
    title: r.title,
    author: r.author,
    type: r.type,
    icon: iconMap[r.type] || Video,
    meta: r.duration,
    url: r.url,
    description: r.description,
    source: 'ai' as const,
  }));

  const allItems = active === 'ai' ? aiItems : dbItems;

  const filtered =
    active === 'favorites'
      ? dbItems.filter((i) => favoriteIds.includes(i.id))
      : active === 'all'
        ? dbItems
        : active === 'ai'
          ? aiItems
          : dbItems.filter((i) => i.type === active);

  const featured = dbContent.filter((c) => c.featured && (active === 'all' || c.type === active));

  const isLoading = active === 'ai' ? isLoadingAI : isLoadingContent;

  const handleItemClick = (item: any) => {
    if (item.url) {
      window.open(item.url, '_blank', 'noopener,noreferrer');
    } else {
      setNowPlaying(item);
    }
  };

  return (
    <div className="px-5 pt-14 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Comunidad</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Aprende, escucha y crece</p>
        </div>
        <button
          onClick={() => setActive(active === 'favorites' ? 'all' : 'favorites')}
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center transition-colors',
            active === 'favorites' ? 'bg-primary' : 'bg-secondary'
          )}
        >
          <Heart
            size={18}
            className={cn(
              'transition-colors',
              active === 'favorites' ? 'text-primary-foreground fill-primary-foreground' : 'text-muted-foreground'
            )}
          />
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

      {/* AI Banner */}
      {active === 'ai' && (
        <div className="mb-4 p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/20">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={16} className="text-primary" />
            <span className="text-sm font-semibold text-foreground">Recomendaciones IA</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Contenido real sugerido por inteligencia artificial sobre desarrollo personal y productividad.
          </p>
        </div>
      )}

      {/* Featured Section (DB content) */}
      {featured.length > 0 && active !== 'ai' && active !== 'favorites' && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-3">Destacado</h2>
          <div className="flex gap-3 overflow-x-auto -mx-5 px-5 pb-2 scrollbar-hide">
            {featured.map((item) => {
              const Icon = iconMap[item.type] || Video;
              return (
                <div
                  key={item.id}
                  onClick={() => item.url ? window.open(item.url, '_blank') : null}
                  className="min-w-[260px] rounded-2xl p-5 bg-gradient-to-br from-accent/60 to-primary/30 relative overflow-hidden shrink-0 cursor-pointer"
                >
                  {item.url && (
                    <div className="absolute top-3 right-3 w-9 h-9 rounded-full bg-primary flex items-center justify-center">
                      <Play size={16} className="text-primary-foreground ml-0.5" fill="currentColor" />
                    </div>
                  )}
                  <Icon size={28} className="text-foreground mb-3 opacity-80" />
                  <h3 className="font-bold text-foreground text-base leading-tight">{item.title}</h3>
                  <p className="text-xs text-foreground/70 mt-1 line-clamp-2">{item.description}</p>
                  {item.duration && (
                    <div className="flex items-center gap-1.5 mt-3">
                      <Clock size={12} className="text-foreground/60" />
                      <span className="text-[11px] text-foreground/60 font-medium">{item.duration}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Content List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-foreground">
            {active === 'favorites'
              ? 'Tus favoritos'
              : active === 'ai'
                ? 'Sugerencias de IA'
                : active === 'all'
                  ? 'Todo el contenido'
                  : categories.find((c) => c.id === active)?.label}
          </h2>
          {!isLoading && <span className="text-xs text-muted-foreground">{filtered.length} items</span>}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-card border border-border/50">
                <Skeleton className="w-11 h-11 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="space-y-2">
              {filtered.map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-card border border-border/50 active:scale-[0.98] transition-transform cursor-pointer"
                    onClick={() => handleItemClick(item)}
                  >
                    <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                      <Icon size={20} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-foreground truncate">{item.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.author} · {item.meta}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {item.url && (
                        <ExternalLink size={14} className="text-muted-foreground" />
                      )}
                      {item.source === 'db' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(item.id);
                          }}
                          className="w-9 h-9 rounded-full bg-secondary/80 flex items-center justify-center"
                        >
                          <Heart
                            size={14}
                            className={cn(
                              'transition-colors',
                              isFavorite(item.id) ? 'text-primary fill-primary' : 'text-muted-foreground'
                            )}
                          />
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-sm">
              {active === 'favorites'
                ? 'Aún no tenés favoritos. Tocá el ❤️ en cualquier contenido para guardarlo.'
                : active === 'ai'
                  ? 'No se pudieron cargar las recomendaciones. Intentá de nuevo más tarde.'
                  : 'No hay contenido en esta categoría aún. ¡Probá la pestaña ✨ IA para descubrir contenido!'}
            </p>
          </div>
        )}
      </div>

      {/* Now Playing Overlay */}
      <AnimatePresence>
        {nowPlaying && (
          <NowPlayingView item={nowPlaying} onBack={() => setNowPlaying(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Community;
