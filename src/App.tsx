import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { RoleBasedRouter } from "@/components/auth/RoleBasedRouter";
import { ModeGuard } from "@/components/auth/ModeGuard";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import Index from "@/pages/Index";
import ConsumerApp from "@/pages/ConsumerApp";

import BusinessCreationPage from "@/pages/BusinessCreationPage";
import BusinessProfilePage from "@/pages/BusinessProfilePage";
import BusinessProfileEditPage from "@/pages/BusinessProfileEditPage";
import { BusinessDetailPage } from "@/pages/BusinessDetailPage";
import CreateCatalogPage from "@/pages/CreateCatalogPage";
import { CategoryPage } from "@/pages/CategoryPage";
import { PublicCatalogsPage } from "@/pages/PublicCatalogsPage";
import { AuthFlowPage } from "@/pages/AuthFlowPage";
import { MimoChatPage } from "@/pages/MimoChatPage";
import { MimoConversationPage } from "@/pages/MimoConversationPage";
import { MimoChatProvider } from "@/contexts/MimoChatContext";
import "./App.css";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <MimoChatProvider>
            <Router>
              <RoleBasedRouter>
                <ModeGuard>
                  <div className="flex flex-col min-h-screen bg-background">
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/home" element={<Index />} />
                      <Route path="/map" element={<Index />} />
                      <Route path="/rankings" element={<Index />} />
                      <Route path="/profile" element={<Index />} />
                      
                      {/* Routes consumer */}
                      <Route path="/consumer/*" element={<ConsumerApp />} />
                      {/* Routes business */}
                      <Route path="/business/create" element={<BusinessCreationPage />} />
                      
                      <Route path="/business/profile" element={<BusinessProfilePage />} />
                      <Route path="/business/profile/edit" element={<BusinessProfileEditPage />} />
                      <Route path="/business/create-catalog" element={<CreateCatalogPage />} />
                      <Route path="/business/:businessId" element={<BusinessDetailPage />} />
                      
                      {/* Routes publiques */}
                      <Route path="/category/:categoryId" element={<CategoryPage />} />
                      <Route path="/catalogs" element={<PublicCatalogsPage />} />
                      <Route path="/auth" element={<AuthFlowPage onComplete={() => {}} />} />
                      
                      {/* Routes MIMO Chat */}
                      <Route path="/mimo-chat" element={<MimoChatPage />} />
                      <Route path="/mimo-chat/conversation/:conversationId" element={<MimoConversationPage />} />
                      
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </div>
                  <Toaster />
                </ModeGuard>
              </RoleBasedRouter>
            </Router>
          </MimoChatProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;