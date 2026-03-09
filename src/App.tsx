import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useSearchParams } from "react-router-dom";
import SplashScreen from "@/components/SplashScreen";
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
import Dashboard from "./pages/Dashboard";
import Community from "./pages/Community";
import NotFound from "./pages/NotFound";

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

const AppWithDemoMode = () => {
  const { user } = useAuth();
  
  return (
    <DemoModeProvider isAuthenticated={!!user}>
      <DesktopWrapper>
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
            <Route path="/community" element={<Community />} />
            <Route path="/notifications" element={<Notifications />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </DesktopWrapper>
    </DemoModeProvider>
  );
};

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AnimatePresence mode="wait">
          {showSplash && (
            <SplashScreen key="splash" onFinish={() => setShowSplash(false)} />
          )}
        </AnimatePresence>
        {!showSplash && (
          <BrowserRouter>
            <AppWithDemoMode />
          </BrowserRouter>
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
