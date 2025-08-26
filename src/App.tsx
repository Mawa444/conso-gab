import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { AuthFlowPage } from "./pages/AuthFlowPage";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { useAnonymousSession } from "@/hooks/use-anonymous-session";
import { useEffect } from "react";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const location = useLocation();
  const anonymousSession = useAnonymousSession();
  
  useEffect(() => {
    // Start anonymous session when visiting home page without being on auth page
    if (location.pathname === '/' && !location.pathname.includes('/auth')) {
      if (!anonymousSession.isAnonymous && !localStorage.getItem('supabase.auth.token')) {
        anonymousSession.startAnonymousSession();
      }
    }
  }, [location.pathname, anonymousSession]);

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<AuthFlowPage onComplete={() => {}} />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
