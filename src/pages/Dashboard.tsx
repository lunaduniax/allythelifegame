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
  'hsl(75, 100%, 55%)',   // primary
  'hsl(258, 90%, 66%)',   // accent
  'hsl(145, 60%, 45%)',   // success
  'hsl(35, 100%, 60%)',   // orange
  'hsl(200, 80%, 55%)',   // blue
];

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

  // Filter tasks in period
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

  // Activity chart data
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

  // Projects breakdown for pie chart
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

  // Streak calculation (consecutive days with completed tasks)
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
      else if (i > 0) break; // Allow today to not have completions
    }
    return count;
  }, [tasks]);

  const periodLabels: Record<Period, string> = {
    week: 'Esta semana',
    month: 'Este mes',
    year: 'Este año',
  };

  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 pt-12">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-lg font-semibold">Dashboard</h1>
        <div className="w-10" />
      </header>

      {/* Period Tabs */}
      <div className="px-6 pt-2 pb-4">
        <div className="flex gap-2 bg-secondary/50 rounded-2xl p-1">
          {(['week', 'month', 'year'] as Period[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "flex-1 py-2.5 rounded-xl text-sm font-medium transition-all",
                period === p
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {p === 'week' ? 'Semana' : p === 'month' ? 'Mes' : 'Año'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-6 grid grid-cols-2 gap-3 mb-6">
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <CheckCircle2 size={16} className="text-primary" />
            </div>
          </div>
          <p className="text-2xl font-bold">{completedInPeriod.length}</p>
          <p className="text-xs text-muted-foreground">Completadas</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
              <TrendingUp size={16} className="text-accent" />
            </div>
          </div>
          <p className="text-2xl font-bold">{completionRate}%</p>
          <p className="text-xs text-muted-foreground">Progreso total</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-[hsl(var(--success))]/20 flex items-center justify-center">
              <Target size={16} className="text-[hsl(var(--success))]" />
            </div>
          </div>
          <p className="text-2xl font-bold">{projects.length}</p>
          <p className="text-xs text-muted-foreground">Metas activas</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-destructive/20 flex items-center justify-center">
              <Flame size={16} className="text-destructive" />
            </div>
          </div>
          <p className="text-2xl font-bold">{streak}</p>
          <p className="text-xs text-muted-foreground">Días de racha</p>
        </div>
      </div>

      {/* Activity Chart */}
      <div className="px-6 mb-6">
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Actividad</h2>
            <span className="text-xs text-muted-foreground">{periodLabels[period]}</span>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData} barSize={period === 'year' ? 16 : 24}>
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(215, 20%, 65%)', fontSize: 11 }}
                />
                <YAxis hide allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(222, 47%, 11%)',
                    border: '1px solid hsl(215, 28%, 17%)',
                    borderRadius: '12px',
                    color: 'hsl(210, 40%, 98%)',
                    fontSize: 12,
                  }}
                />
                <Bar
                  dataKey="completadas"
                  fill="hsl(75, 100%, 55%)"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Completion Trend */}
      <div className="px-6 mb-6">
        <div className="bg-card border border-border rounded-2xl p-4">
          <h2 className="font-semibold mb-4">Tendencia de completado</h2>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(75, 100%, 55%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(75, 100%, 55%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(215, 20%, 65%)', fontSize: 11 }}
                />
                <YAxis hide allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(222, 47%, 11%)',
                    border: '1px solid hsl(215, 28%, 17%)',
                    borderRadius: '12px',
                    color: 'hsl(210, 40%, 98%)',
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="completadas"
                  stroke="hsl(75, 100%, 55%)"
                  strokeWidth={2}
                  fill="url(#completedGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Projects Breakdown */}
      {projectBreakdown.length > 0 && (
        <div className="px-6 mb-6">
          <div className="bg-card border border-border rounded-2xl p-4">
            <h2 className="font-semibold mb-4">Progreso por meta</h2>
            <div className="flex gap-4">
              <div className="w-32 h-32 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={projectBreakdown}
                      dataKey="completed"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={55}
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
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{p.name}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-secondary">
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
        </div>
      )}

      {/* Empty state */}
      {tasks.length === 0 && (
        <div className="px-6 py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
            <Calendar size={28} className="text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">Creá metas y completá tareas para ver tus métricas</p>
        </div>
      )}

      <div className="h-24" />
    </div>
  );
};

export default Dashboard;
