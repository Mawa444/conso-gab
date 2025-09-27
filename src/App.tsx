import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { RoleBasedRouter } from "@/components/auth/RoleBasedRouter";
import { RealTimeProvider } from "@/components/messaging/RealTimeProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";

// Consumer pages
import { HomePage } from "@/pages/HomePage";
import { MapPage } from "@/pages/MapPage";
import { RankingsPage } from "@/pages/RankingsPage";
import { ProfilePage } from "@/pages/ProfilePage";

// Auth pages
import { AuthFlowPage } from "@/pages/AuthFlowPage";

// Business pages
import MessagingPage from "@/pages/MessagingPage";
import ConversationDetailPage from "@/pages/ConversationDetailPage";
import BusinessDashboardPage from "@/pages/BusinessDashboardPage";
import BusinessCreationPage from "@/pages/BusinessCreationPage";
import { BusinessDetailPage } from "@/pages/BusinessDetailPage";
import CreateCatalogPage from "@/pages/CreateCatalogPage";

// Other pages
import { CategoryPage } from "@/pages/CategoryPage";
import { PublicCatalogsPage } from "@/pages/PublicCatalogsPage";
import NotFound from "@/pages/NotFound";

import "./App.css";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <RealTimeProvider>
            <Router>
              <RoleBasedRouter>
                <div className="min-h-screen bg-background">
                  <Routes>
                    {/* Consumer Routes */}
                    <Route path="/" element={<Navigate to="/consumer/home" replace />} />
                    <Route path="/consumer/home" element={<HomePage />} />
                    <Route path="/consumer/map" element={<MapPage />} />
                    <Route path="/consumer/rankings" element={<RankingsPage />} />
                    <Route path="/consumer/profile" element={<ProfilePage />} />
                    
                    {/* Legacy redirects */}
                    <Route path="/home" element={<Navigate to="/consumer/home" replace />} />
                    <Route path="/map" element={<Navigate to="/consumer/map" replace />} />
                    <Route path="/rankings" element={<Navigate to="/consumer/rankings" replace />} />
                    <Route path="/profile" element={<Navigate to="/consumer/profile" replace />} />

                    {/* Auth Routes */}
                    <Route path="/auth" element={<AuthFlowPage onComplete={() => {}} />} />
                    <Route path="/auth/:step" element={<AuthFlowPage onComplete={() => {}} />} />

                    {/* Business Routes */}
                    <Route path="/business/create" element={<BusinessCreationPage />} />
                    <Route path="/business/dashboard" element={<BusinessDashboardPage />} />
                    <Route path="/business/create-catalog" element={<CreateCatalogPage />} />
                    <Route path="/business/:businessId" element={<BusinessDetailPage />} />

                    {/* Messaging Routes */}
                    <Route path="/messaging" element={<MessagingPage />} />
                    <Route path="/messaging/:section" element={<MessagingPage />} />
                    <Route path="/messaging/conversation/:conversationId" element={<ConversationDetailPage />} />

                    {/* Content Routes */}
                    <Route path="/category/:categoryId" element={<CategoryPage />} />
                    <Route path="/catalogs" element={<PublicCatalogsPage />} />

                    {/* 404 */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
                <Toaster />
              </RoleBasedRouter>
            </Router>
          </RealTimeProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
