import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserProjects } from "@/hooks/useUserProjects";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import CreateGoal from "./pages/CreateGoal";
import AddTasks from "./pages/AddTasks";
import Frequency from "./pages/Frequency";
import GoalCreated from "./pages/GoalCreated";
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

const HomeRoute = () => {
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  // Get selected project ID from either search params or location state
  const selectedProjectId = searchParams.get('project') || location.state?.selectedProjectId;
  
  const { projects, loading: projectsLoading } = useUserProjects(selectedProjectId);

  // Show loading while auth or projects are loading
  if (authLoading || projectsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Cargando...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Only redirect to onboarding after data has loaded and we confirm there are no projects
  if (projects.length === 0) {
    return <Navigate to="/create-goal" replace />;
  }

  // Pass the selected project ID to Index
  return <Index initialProjectId={selectedProjectId} />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<HomeRoute />} />
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
            path="/frequency"
            element={
              <ProtectedRoute>
                <Frequency />
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
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
