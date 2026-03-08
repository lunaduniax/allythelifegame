import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Heart, Shuffle, SkipBack, SkipForward, Play, Pause, ListMusic } from 'lucide-react';
import { motion } from 'framer-motion';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface NowPlayingItem {
  id: string;
  title: string;
  author: string;
  type: string;
  meta: string;
  icon: React.ElementType;
}

interface NowPlayingViewProps {
  item: NowPlayingItem;
  onBack: () => void;
}

const NowPlayingView = ({ item, onBack }: NowPlayingViewProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [liked, setLiked] = useState(false);
  const [progress, setProgress] = useState(28);
  const [totalSeconds] = useState(155); // 2:35
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentSeconds = Math.floor((progress / 100) * totalSeconds);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) {
            setIsPlaying(false);
            return 0;
          }
          return p + 100 / totalSeconds;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, totalSeconds]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const remainingSeconds = totalSeconds - currentSeconds;

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 300 }}
      className="fixed inset-0 z-50 flex flex-col"
      style={{
        background: 'linear-gradient(180deg, hsl(var(--secondary)) 0%, hsl(var(--background)) 60%)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-14 pb-4">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-secondary/80 flex items-center justify-center"
        >
          <ArrowLeft size={20} className="text-foreground" />
        </button>
        <span className="text-sm font-semibold text-foreground">Reproduciendo</span>
        <button
          onClick={() => setLiked(!liked)}
          className="w-10 h-10 rounded-full bg-secondary/80 flex items-center justify-center"
        >
          <Heart
            size={18}
            className={cn('transition-colors', liked ? 'text-primary fill-primary' : 'text-foreground')}
          />
        </button>
      </div>

      {/* Cover Art */}
      <div className="flex-1 flex flex-col items-center justify-center px-10 gap-6">
        <div className="w-64 h-64 rounded-full bg-secondary/60 flex items-center justify-center shadow-2xl border-4 border-border/30">
          <item.icon size={80} className="text-primary/70" />
        </div>

        {/* Title & Author */}
        <div className="text-center mt-4">
          <h2 className="text-2xl font-bold text-foreground">{item.title}</h2>
          <p className="text-sm text-muted-foreground mt-1">{item.author}</p>
        </div>

        {/* Subtitle / Description line */}
        <p className="text-xs text-muted-foreground/60 text-center italic max-w-[260px]">
          Contenido de {item.type === 'videos' ? 'video' : item.type === 'podcasts' ? 'podcast' : item.type === 'music' ? 'música' : item.type === 'courses' ? 'curso' : 'libro'}
        </p>
      </div>

      {/* Controls Section */}
      <div className="px-6 pb-10">
        {/* Progress Bar */}
        <div className="mb-2">
          <Slider
            value={[progress]}
            max={100}
            step={0.5}
            onValueChange={([v]) => setProgress(v)}
            className="w-full"
          />
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-[11px] text-primary font-medium">{formatTime(currentSeconds)}</span>
            <span className="text-[11px] text-muted-foreground">-{formatTime(remainingSeconds)}</span>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-6 mt-4">
          <button className="w-11 h-11 rounded-full bg-secondary/80 flex items-center justify-center">
            <Shuffle size={18} className="text-foreground" />
          </button>
          <button className="w-12 h-12 rounded-full bg-secondary/80 flex items-center justify-center">
            <SkipBack size={20} className="text-foreground" fill="currentColor" />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30"
          >
            {isPlaying ? (
              <Pause size={28} className="text-primary-foreground" fill="currentColor" />
            ) : (
              <Play size={28} className="text-primary-foreground ml-1" fill="currentColor" />
            )}
          </button>
          <button className="w-12 h-12 rounded-full bg-secondary/80 flex items-center justify-center">
            <SkipForward size={20} className="text-foreground" fill="currentColor" />
          </button>
          <button className="w-11 h-11 rounded-full bg-secondary/80 flex items-center justify-center">
            <ListMusic size={18} className="text-foreground" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default NowPlayingView;
