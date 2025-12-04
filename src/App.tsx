import React, { lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { RoleBasedRouter } from "@/components/auth/RoleBasedRouter";
import { ModeGuard } from "@/components/auth/ModeGuard";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import { Toaster } from "@/components/ui/toaster";
import { SplashScreen } from "@/pages/SplashScreen";
import ConsumerApp from "@/pages/ConsumerApp";
import { ProductDetailPage } from "@/pages/ProductDetailPage";
import { GeoLocationProvider } from "@/contexts/GeoLocationContext";

// Lazy loaded pages pour code splitting
import {
  LazyBusinessDashboard,
  LazyBusinessSettings,
  LazyBusinessProfile,
  LazyBusinessCreation,
  LazyMessagingPage,
  LazyConversationPage,
  LazyCreateCatalog,
  LazyPublicCatalogs,
  LazyEntreprisesPage,
  LazyCategoryPage
} from "@/lib/performance/lazy-components";

// Pages Business légères (gardées normales)
import { BusinessDetailPage } from "@/pages/BusinessDetailPage";

// Pages Auth
import { AuthFlowPage } from "@/pages/AuthFlowPage";
import { ResetPasswordPage } from "@/pages/ResetPasswordPage";

import "./App.css";

// Configuration QueryClient avec optimisations
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (anciennement cacheTime)
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
});

const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <GeoLocationProvider>
            <AuthProvider>
              <Router>
                <RoleBasedRouter>
                  <ModeGuard>
                    <Routes>
                  {/* Routes publiques */}
                  <Route path="/auth" element={<AuthFlowPage onComplete={() => {}} />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />
                  <Route path="/splash" element={<SplashScreen onStart={() => {}} />} />
                  
                  {/* Routes consommateur */}
                  <Route path="/consumer/*" element={<ConsumerApp />} />
                  <Route path="/home" element={<Navigate to="/consumer/home" replace />} />
                  
                  {/* Routes gestion des entreprises (depuis mode consommateur) */}
                  <Route path="/entreprises" element={<LazyEntreprisesPage />} />
                  <Route path="/entreprises/create" element={<LazyBusinessCreation />} />
                  
                  {/* Routes Business publiques (accessibles à tous) */}
                  <Route path="/business/:businessId" element={<BusinessDetailPage />} />
                  
                  {/* Routes Business privées (mode business uniquement) */}
                  <Route path="/business/:businessId/dashboard" element={<LazyBusinessDashboard />} />
                  <Route path="/business/:businessId/settings" element={<LazyBusinessSettings />} />
                  <Route path="/business/:businessId/profile" element={<LazyBusinessProfile />} />
                  <Route path="/business/:businessId/catalogues" element={<LazyCreateCatalog />} />
                  
                  {/* Anciennes routes business (redirection) */}
                  <Route path="/business/create" element={<Navigate to="/entreprises/create" replace />} />
                  <Route path="/business/profile" element={<Navigate to="/entreprises" replace />} />
                  <Route path="/business/profile/edit" element={<Navigate to="/entreprises" replace />} />
                  <Route path="/business/create-catalog" element={<Navigate to="/entreprises" replace />} />
                  
                  {/* Routes catalogues publics */}
                  <Route path="/catalogs" element={<LazyPublicCatalogs />} />
                  
                  {/* Routes produits */}
                  <Route path="/product/:productId" element={<ProductDetailPage />} />
                  
                  {/* Routes Messagerie */}
                  <Route path="/messaging" element={<LazyMessagingPage />} />
                  <Route path="/messaging/:conversationId" element={<LazyConversationPage />} />

                  
                  {/* Routes catégories */}
                  <Route path="/category/:categoryId" element={<LazyCategoryPage />} />
                  
                  {/* Route par défaut */}
                  <Route path="/" element={<Navigate to="/consumer/home" replace />} />
                  <Route path="*" element={<Navigate to="/consumer/home" replace />} />
                    </Routes>
                    <Toaster />
                  </ModeGuard>
                </RoleBasedRouter>
              </Router>
            </AuthProvider>
          </GeoLocationProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
