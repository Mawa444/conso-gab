import { Routes, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/sonner";
import Index from "@/pages/Index";
import { HomePage } from "@/pages/HomePage";
import { CategoryPage } from "@/pages/CategoryPage";
import { MapPage } from "@/pages/MapPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { RankingsPage } from "@/pages/RankingsPage";
import NotFound from "@/pages/NotFound";
import { AuthPage } from "@/pages/AuthPage";
import { BusinessDashboard } from "@/pages/BusinessDashboard";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/category/:categoryName" element={<CategoryPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/rankings" element={<RankingsPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/business" element={<BusinessDashboard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
