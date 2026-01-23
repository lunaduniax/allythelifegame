import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserProjects } from "@/hooks/useUserProjects";
import { AppShell } from "@/components/AppShell";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import CreateGoal from "./pages/CreateGoal";
import AddTasks from "./pages/AddTasks";
import GoalCreated from "./pages/GoalCreated";
import Account from "./pages/Account";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import About from "./pages/About";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Cargando...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

const HomeContent = () => {
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  const projectIdFromUrl = searchParams.get('project');
  const projectIdFromState = location.state?.selectedProjectId;
  const initialProjectId = projectIdFromUrl || projectIdFromState || null;
  
  const { projects, hasFetched } = useUserProjects(initialProjectId);

  if (authLoading || !hasFetched) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Cargando...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (projects.length === 0) {
    return <Navigate to="/create-goal" replace />;
  }

  return <Index initialProjectId={initialProjectId} />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/auth" element={<Auth />} />
          
          {/* Onboarding routes (no bottom nav) */}
          <Route
            path="/create-goal"
            element={
              <ProtectedRoute>
                <CreateGoal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-tasks"
            element={
              <ProtectedRoute>
                <AddTasks />
              </ProtectedRoute>
            }
          />
          <Route
            path="/goal-created"
            element={
              <ProtectedRoute>
                <GoalCreated />
              </ProtectedRoute>
            }
          />

          {/* Main app routes with persistent bottom nav */}
          <Route
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<HomeContent />} />
            <Route path="/home" element={<HomeContent />} />
            <Route path="/account" element={<Account />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/help" element={<Help />} />
            <Route path="/about" element={<About />} />
            <Route path="/notifications" element={<Notifications />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
