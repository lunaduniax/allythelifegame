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
import GoalCreated from "./pages/GoalCreated";
import Account from "./pages/Account";
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
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get selected project ID from either search params or location state
  const projectIdFromUrl = searchParams.get('project');
  const projectIdFromState = location.state?.selectedProjectId;
  const initialProjectId = projectIdFromUrl || projectIdFromState || null;
  
  const { projects, loading: projectsLoading, hasFetched } = useUserProjects(initialProjectId);

  // Show loading while auth is loading, or while projects haven't been fetched yet
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

  // Only redirect to onboarding after data has loaded and we confirm there are no projects
  if (projects.length === 0) {
    return <Navigate to="/create-goal" replace />;
  }

  // Pass the selected project ID to Index
  return <Index initialProjectId={initialProjectId} />;
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
          <Route path="/home" element={<HomeRoute />} />
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
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <Account />
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
