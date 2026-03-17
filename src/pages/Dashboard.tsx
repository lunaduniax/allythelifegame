import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, TrendingUp, Target, CheckCircle2, Flame, Calendar } from 'lucide-react';
import { useUserProjects } from '@/hooks/useUserProjects';
import { cn } from '@/lib/utils';
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip,
  AreaChart, Area, PieChart, Pie, Cell,
} from 'recharts';
import {
  startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear,
  eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval,
  format, isWithinInterval, parseISO,
} from 'date-fns';
import { es } from 'date-fns/locale';

type Period = 'week' | 'month' | 'year';

const CHART_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--accent))',
  'hsl(var(--success))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-3))',
];

const chartTooltipStyle = {
  background: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '16px',
  color: 'hsl(var(--foreground))',
  fontSize: 12,
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { projects, tasks } = useUserProjects();
  const [period, setPeriod] = useState<Period>('week');

  const now = new Date();

  const dateRange = useMemo(() => {
    switch (period) {
      case 'week':
        return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
      case 'month':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case 'year':
        return { start: startOfYear(now), end: endOfYear(now) };
    }
  }, [period]);

  const tasksInPeriod = useMemo(() => {
    return tasks.filter(t => {
      try {
        const d = parseISO(t.updated_at);
        return isWithinInterval(d, dateRange);
      } catch { return false; }
    });
  }, [tasks, dateRange]);

  const completedInPeriod = tasksInPeriod.filter(t => t.status === 'completed');
  const totalTasks = tasks.length;
  const totalCompleted = tasks.filter(t => t.status === 'completed').length;
  const completionRate = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;

  const activityData = useMemo(() => {
    if (period === 'week') {
      const days = eachDayOfInterval(dateRange);
      return days.map(day => ({
        label: format(day, 'EEE', { locale: es }),
        completadas: tasks.filter(t => {
          try {
            const d = parseISO(t.updated_at);
            return t.status === 'completed' && format(d, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
          } catch { return false; }
        }).length,
      }));
    } else if (period === 'month') {
      const weeks = eachWeekOfInterval(dateRange, { weekStartsOn: 1 });
      return weeks.map((weekStart, i) => {
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        return {
          label: `Sem ${i + 1}`,
          completadas: tasks.filter(t => {
            try {
              const d = parseISO(t.updated_at);
              return t.status === 'completed' && isWithinInterval(d, { start: weekStart, end: weekEnd });
            } catch { return false; }
          }).length,
        };
      });
    } else {
      const months = eachMonthOfInterval(dateRange);
      return months.map(month => ({
        label: format(month, 'MMM', { locale: es }),
        completadas: tasks.filter(t => {
          try {
            const d = parseISO(t.updated_at);
            return t.status === 'completed' && format(d, 'yyyy-MM') === format(month, 'yyyy-MM');
          } catch { return false; }
        }).length,
      }));
    }
  }, [tasks, period, dateRange]);

  const projectBreakdown = useMemo(() => {
    return projects.map(p => {
      const projectTasks = tasks.filter(t => t.project_id === p.id);
      const completed = projectTasks.filter(t => t.status === 'completed').length;
      return {
        name: p.name,
        total: projectTasks.length,
        completed,
        progress: projectTasks.length > 0 ? Math.round((completed / projectTasks.length) * 100) : 0,
      };
    }).filter(p => p.total > 0);
  }, [projects, tasks]);

  const streak = useMemo(() => {
    let count = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const day = new Date(today);
      day.setDate(day.getDate() - i);
      const dayStr = format(day, 'yyyy-MM-dd');
      const hasCompleted = tasks.some(t => {
        try {
          return t.status === 'completed' && format(parseISO(t.updated_at), 'yyyy-MM-dd') === dayStr;
        } catch { return false; }
      });
      if (hasCompleted) count++;
      else if (i > 0) break;
    }
    return count;
  }, [tasks]);

  const periodLabels: Record<Period, string> = {
    week: 'Esta semana',
    month: 'Este mes',
    year: 'Este año',
  };

  const statCards = [
    { label: 'Completadas', value: completedInPeriod.length, icon: CheckCircle2, tone: 'bg-primary/16 text-primary' },
    { label: 'Progreso total', value: `${completionRate}%`, icon: TrendingUp, tone: 'bg-accent/18 text-accent' },
    { label: 'Metas activas', value: projects.length, icon: Target, tone: 'bg-secondary text-foreground' },
    { label: 'Días de racha', value: streak, icon: Flame, tone: 'bg-destructive/16 text-destructive' },
  ];

  return (
    <div className="min-h-screen text-foreground px-5 pt-10 pb-28">
      <header className="glass-panel premium-outline rounded-[32px] px-5 py-5 mb-5">
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => navigate(-1)}
            className="glass-chip w-11 h-11 rounded-full flex items-center justify-center"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="text-center">
            <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-1">Insights</div>
            <h1 className="text-[1.7rem] font-semibold">Dashboard</h1>
          </div>
          <div className="glass-chip rounded-full px-3 py-2 text-xs text-muted-foreground">
            {periodLabels[period]}
          </div>
        </div>
      </header>

      <div className="glass-panel premium-outline rounded-[28px] p-1 mb-5">
        <div className="flex gap-2">
          {(['week', 'month', 'year'] as Period[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                'flex-1 py-3 rounded-[22px] text-sm font-medium transition-all',
                period === p
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground glass-chip'
              )}
            >
              {p === 'week' ? 'Semana' : p === 'month' ? 'Mes' : 'Año'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        {statCards.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="glass-panel premium-outline rounded-[26px] p-4">
            <div className={cn('w-10 h-10 rounded-full flex items-center justify-center mb-5', tone)}>
              <Icon size={18} />
            </div>
            <p className="text-3xl font-semibold leading-none mb-2">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      <div className="glass-panel premium-outline rounded-[30px] p-4 mb-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">Actividad</h2>
          <span className="glass-chip rounded-full px-3 py-1 text-xs text-muted-foreground">{periodLabels[period]}</span>
        </div>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activityData} barSize={period === 'year' ? 16 : 24}>
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
              <YAxis hide allowDecimals={false} />
              <Tooltip contentStyle={chartTooltipStyle} cursor={{ fill: 'hsl(var(--foreground) / 0.04)' }} />
              <Bar dataKey="completadas" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-panel premium-outline rounded-[30px] p-4 mb-5 overflow-hidden">
        <h2 className="font-semibold text-lg mb-4">Tendencia de completado</h2>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={activityData}>
              <defs>
                <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
              <YAxis hide allowDecimals={false} />
              <Tooltip contentStyle={chartTooltipStyle} cursor={{ stroke: 'hsl(var(--primary) / 0.3)' }} />
              <Area type="monotone" dataKey="completadas" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#completedGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {projectBreakdown.length > 0 && (
        <div className="glass-panel premium-outline rounded-[30px] p-4 mb-5">
          <h2 className="font-semibold text-lg mb-4">Progreso por meta</h2>
          <div className="flex gap-4 items-center">
            <div className="w-32 h-32 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={projectBreakdown}
                    dataKey="completed"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={32}
                    outerRadius={56}
                    strokeWidth={0}
                  >
                    {projectBreakdown.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-3 overflow-hidden">
              {projectBreakdown.map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{p.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-2 rounded-full bg-secondary/90 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${p.progress}%`,
                            backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
                          }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{p.progress}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tasks.length === 0 && (
        <div className="glass-panel premium-outline rounded-[30px] px-6 py-12 text-center">
          <div className="w-16 h-16 rounded-full glass-chip flex items-center justify-center mx-auto mb-4">
            <Calendar size={28} className="text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">Creá metas y completá tareas para ver tus métricas</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;