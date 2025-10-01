import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { RoleBasedRouter } from "@/components/auth/RoleBasedRouter";
import { ModeGuard } from "@/components/auth/ModeGuard";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { SplashScreen } from "@/pages/SplashScreen";
import ConsumerApp from "@/pages/ConsumerApp";
import { ProductDetailPage } from "@/pages/ProductDetailPage";

// Pages Business
import BusinessCreationPage from "@/pages/BusinessCreationPage";
import BusinessDashboardPage from "@/pages/BusinessDashboardPage";
import BusinessSettingsPage from "@/pages/BusinessSettingsPage";
import BusinessProfilePage from "@/pages/BusinessProfilePage";
import { BusinessDetailPage } from "@/pages/BusinessDetailPage";

// Pages Entreprises
import EntreprisesPage from "@/pages/EntreprisesPage";

// Pages Catalogues
import CreateCatalogPage from "@/pages/CreateCatalogPage";
import { PublicCatalogsPage } from "@/pages/PublicCatalogsPage";

// Pages Catégories
import { CategoryPage } from "@/pages/CategoryPage";

// Pages Auth
import { AuthFlowPage } from "@/pages/AuthFlowPage";

// Pages Chat
import { MimoChatPage } from "@/pages/MimoChatPage";
import { MimoConversationPage } from "@/pages/MimoConversationPage";

import "./App.css";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <RoleBasedRouter>
              <ModeGuard>
                <Routes>
                  {/* Routes publiques */}
                  <Route path="/auth" element={<AuthFlowPage onComplete={() => {}} />} />
                  <Route path="/splash" element={<SplashScreen onStart={() => {}} />} />
                  
                  {/* Routes consommateur */}
                  <Route path="/consumer/*" element={<ConsumerApp />} />
                  <Route path="/home" element={<Navigate to="/consumer/home" replace />} />
                  
                  {/* Routes gestion des entreprises (depuis mode consommateur) */}
                  <Route path="/entreprises" element={<EntreprisesPage />} />
                  <Route path="/entreprises/create" element={<BusinessCreationPage />} />
                  
                  {/* Routes Business publiques (accessibles à tous) */}
                  <Route path="/business/:businessId" element={<BusinessDetailPage />} />
                  
                  {/* Routes Business privées (mode business uniquement) */}
                  <Route path="/business/:businessId/dashboard" element={<BusinessDashboardPage />} />
                  <Route path="/business/:businessId/settings" element={<BusinessSettingsPage />} />
                  <Route path="/business/:businessId/profile" element={<BusinessProfilePage />} />
                  <Route path="/business/:businessId/catalogues" element={<CreateCatalogPage />} />
                  
                  {/* Anciennes routes business (redirection) */}
                  <Route path="/business/create" element={<Navigate to="/entreprises/create" replace />} />
                  <Route path="/business/profile" element={<Navigate to="/entreprises" replace />} />
                  <Route path="/business/profile/edit" element={<Navigate to="/entreprises" replace />} />
                  <Route path="/business/create-catalog" element={<Navigate to="/entreprises" replace />} />
                  
                  {/* Routes catalogues publics */}
                  <Route path="/catalogs" element={<PublicCatalogsPage />} />
                  
                  {/* Routes produits */}
                  <Route path="/product/:productId" element={<ProductDetailPage />} />
                  
                  {/* Routes Chat MIMO */}
                  <Route path="/mimo-chat" element={<MimoChatPage />} />
                  <Route path="/mimo-chat/:conversationId" element={<MimoConversationPage />} />
                  <Route path="/messaging" element={<Navigate to="/mimo-chat" replace />} />
                  
                  {/* Routes catégories */}
                  <Route path="/category/:categoryId" element={<CategoryPage />} />
                  
                  {/* Route par défaut */}
                  <Route path="/" element={<Navigate to="/consumer/home" replace />} />
                  <Route path="*" element={<Navigate to="/consumer/home" replace />} />
                </Routes>
                <Toaster />
              </ModeGuard>
            </RoleBasedRouter>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
