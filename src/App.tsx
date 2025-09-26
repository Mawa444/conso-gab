import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { RealTimeProvider } from "@/components/messaging/RealTimeProvider";
import { Toaster } from "@/components/ui/toaster";
import Index from "@/pages/Index";
import MessagingPage from "@/pages/MessagingPage";
import ConversationDetailPage from "@/pages/ConversationDetailPage";
import BusinessDashboardPage from "@/pages/BusinessDashboardPage";
import BusinessCreationPage from "@/pages/BusinessCreationPage";
import BusinessProfilePage from "@/pages/BusinessProfilePage";
import CreateCatalogPage from "@/pages/CreateCatalogPage";
import "./App.css";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <RealTimeProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/messaging" element={<MessagingPage />} />
              <Route path="/messaging/conversation/:conversationId" element={<ConversationDetailPage />} />
              <Route path="/business/create" element={<BusinessCreationPage />} />
              <Route path="/business/dashboard" element={<BusinessDashboardPage />} />
              <Route path="/business/create-catalog" element={<CreateCatalogPage />} />
              <Route path="/business/:businessId" element={<BusinessProfilePage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
        <Toaster />
      </RealTimeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;