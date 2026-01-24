import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserProjects } from "@/hooks/useUserProjects";
import { DemoModeProvider } from "@/contexts/DemoModeContext";
import { AppShell } from "@/components/AppShell";
import DesktopWrapper from "@/components/DesktopWrapper";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Account from "./pages/Account";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import About from "./pages/About";
import Notifications from "./pages/Notifications";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import Splash from "./pages/Splash";

const queryClient = new QueryClient();

// Check if we're in a preview/development environment
const isPreviewEnvironment = (): boolean => {
  const hostname = window.location.hostname;
  return (
    hostname === 'localhost' ||
    hostname.includes('127.0.0.1') ||
    hostname.includes('preview') ||
    hostname.includes('lovable.app') ||
    import.meta.env.DEV
  );
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Cargando...</div>
      </div>
    );
  }

  // In preview environment, allow unauthenticated access (demo mode)
  if (!user && isPreviewEnvironment()) {
    return <>{children}</>;
  }

  // In production, redirect to auth if not authenticated
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
  
  const { hasFetched } = useUserProjects(initialProjectId);

  if (authLoading || !hasFetched) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-muted-foreground">Cargando...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Always render Index - AppShell handles the 0-goals modal
  return <Index initialProjectId={initialProjectId} />;
};

const SplashHandler = ({ children }: { children: React.ReactNode }) => {
  const [showSplash, setShowSplash] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (showSplash) {
      const timer = setTimeout(() => {
        setShowSplash(false);
        // After splash, navigate based on auth state
        if (!authLoading) {
          if (user) {
            navigate("/", { replace: true });
          } else {
            navigate("/auth", { replace: true });
          }
        }
      }, 2500); // 2.5 seconds

      return () => clearTimeout(timer);
    }
  }, [showSplash, user, authLoading, navigate]);

  // If still loading auth after splash ends, wait a bit more
  useEffect(() => {
    if (!showSplash && authLoading) {
      // Auth is still loading, wait for it
      return;
    }
    if (!showSplash && !authLoading) {
      // Navigate based on final auth state
      if (user) {
        navigate("/", { replace: true });
      } else {
        navigate("/auth", { replace: true });
      }
    }
  }, [showSplash, authLoading, user, navigate]);

  if (showSplash) {
    return <Splash />;
  }

  return <>{children}</>;
};

const AppWithDemoMode = () => {
  const { user } = useAuth();
  
  return (
    <DemoModeProvider isAuthenticated={!!user}>
      <DesktopWrapper>
        <SplashHandler>
          <Routes>
            {/* Public routes */}
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />

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
        </SplashHandler>
      </DesktopWrapper>
    </DemoModeProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppWithDemoMode />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
