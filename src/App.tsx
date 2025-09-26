import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { RealTimeProvider } from "@/components/messaging/RealTimeProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import Index from "@/pages/Index";
import MessagingPage from "@/pages/MessagingPage";
import ConversationDetailPage from "@/pages/ConversationDetailPage";
import BusinessDashboardPage from "@/pages/BusinessDashboardPage";
import BusinessCreationPage from "@/pages/BusinessCreationPage";
import { BusinessDetailPage } from "@/pages/BusinessDetailPage";
import CreateCatalogPage from "@/pages/CreateCatalogPage";
import { CategoryPage } from "@/pages/CategoryPage";
import { PublicCatalogsPage } from "@/pages/PublicCatalogsPage";
import "./App.css";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <RealTimeProvider>
            <Router>
            <div className="min-h-screen bg-background">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/messaging" element={<MessagingPage />} />
                <Route path="/messaging/:section" element={<MessagingPage />} />
                <Route path="/messaging/conversation/:conversationId" element={<ConversationDetailPage />} />
                <Route path="/business/create" element={<BusinessCreationPage />} />
                <Route path="/business/dashboard" element={<BusinessDashboardPage />} />
                <Route path="/business/create-catalog" element={<CreateCatalogPage />} />
                <Route path="/business/:businessId" element={<BusinessDetailPage />} />
                <Route path="/category/:categoryId" element={<CategoryPage />} />
                <Route path="/catalogs" element={<PublicCatalogsPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
            <Toaster />
            </Router>
          </RealTimeProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;