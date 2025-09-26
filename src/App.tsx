import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { RoleBasedRouter } from "@/components/auth/RoleBasedRouter";
import { ModeGuard } from "@/components/auth/ModeGuard";
import { DynamicIslandToaster } from "@/components/ui/DynamicIslandToaster";
import { SplashScreenOverlay } from "@/components/layout/SplashScreenOverlay";

import ConsumerApp from "./pages/ConsumerApp";
import { AuthFlowPage } from "./pages/AuthFlowPage";
import { BusinessDetailPage } from "./pages/BusinessDetailPage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { PromotionDetailPage } from "./pages/PromotionDetailPage";
import { PersonalRankingsPage } from "./pages/PersonalRankingsPage";
import { CategoryPage } from "./pages/CategoryPage";
import { PublicCatalogsPage } from "./pages/PublicCatalogsPage";
import MessagingPage from "./pages/MessagingPage";
import ConversationDetailPage from "./pages/ConversationDetailPage";
import { MerchantDashboard } from "./pages/MerchantDashboard";
import { LocationSettingsPage } from "./pages/LocationSettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <SplashScreenOverlay />
        <DynamicIslandToaster />
        <BrowserRouter>
          <RoleBasedRouter>
            <ModeGuard>
              <Routes>
              <Route path="/auth" element={<AuthFlowPage onComplete={() => {}} />} />
              
              {/* Routes consommateur */}
              <Route path="/consumer/home" element={<ConsumerApp />} />
              <Route path="/consumer/*" element={<ConsumerApp />} />
              
              {/* Routes business */}
              <Route path="/business/:businessId" element={<MerchantDashboard onNavigate={() => {}} />} />
              <Route path="/business/:businessId/catalog" element={<PublicCatalogsPage />} />
              
              {/* Routes messagerie */}
              <Route path="/messaging" element={<MessagingPage />} />
              <Route path="/conversation/:conversationId" element={<ConversationDetailPage />} />
              
              {/* Routes partagées */}
              <Route path="/business/:id" element={<BusinessDetailPage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/promotion/:id" element={<PromotionDetailPage />} />
              <Route path="/rankings/personal" element={<PersonalRankingsPage />} />
              <Route path="/category/:categoryId" element={<CategoryPage />} />
              <Route path="/catalogs" element={<PublicCatalogsPage />} />
              <Route path="/location-settings" element={<LocationSettingsPage />} />
              
              {/* Route par défaut : page d'authentification */}
              <Route path="/" element={<AuthFlowPage onComplete={() => {}} />} />
              <Route path="*" element={<NotFound />} />
              </Routes>
            </ModeGuard>
          </RoleBasedRouter>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;