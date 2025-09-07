import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { RoleBasedRouter } from "@/components/auth/RoleBasedRouter";
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
            <Routes>
              <Route path="/auth" element={<AuthFlowPage onComplete={() => {}} />} />
              
              {/* Routes consommateur */}
              <Route path="/consumer/home" element={<ConsumerApp />} />
              <Route path="/consumer/*" element={<ConsumerApp />} />
              
              {/* Routes supprimées - les opérateurs utilisent leur profil business */}
              
              {/* Routes partagées */}
              <Route path="/business/:id" element={<BusinessDetailPage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/promotion/:id" element={<PromotionDetailPage />} />
              <Route path="/rankings/personal" element={<PersonalRankingsPage />} />
              <Route path="/category/:categoryId" element={<CategoryPage />} />
              <Route path="/catalogs" element={<PublicCatalogsPage />} />
              
              {/* Route par défaut : page d'authentification */}
              <Route path="/" element={<AuthFlowPage onComplete={() => {}} />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </RoleBasedRouter>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;