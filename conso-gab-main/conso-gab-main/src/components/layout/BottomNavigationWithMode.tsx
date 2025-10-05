import { Home, Map, QrCode, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useProfileMode } from "@/hooks/use-profile-mode";

interface BottomNavigationWithModeProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

/**
 * Navigation bottom contextuelle selon le mode (Consumer vs Business)
 * - En mode Consumer: bouton "Profil" → Profil consommateur
 * - En mode Business: bouton "Profil" → Profil Business actif
 */
export const BottomNavigationWithMode = ({ 
  activeTab, 
  onTabChange 
}: BottomNavigationWithModeProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentMode, currentBusinessId } = useProfileMode();

  const handleTabClick = (tab: string) => {
    if (tab === 'profile') {
      // Navigation contextuelle selon le mode
      if (currentMode === 'business' && currentBusinessId) {
        navigate(`/business/${currentBusinessId}/dashboard`);
      } else {
        navigate('/consumer/profile');
      }
    } else {
      onTabChange?.(tab);
    }
  };

  // Déterminer l'onglet actif selon l'URL
  const getCurrentTab = () => {
    if (location.pathname.includes('/business/') && currentMode === 'business') {
      return 'profile';
    }
    if (location.pathname.includes('/profile')) {
      return 'profile';
    }
    if (location.pathname.includes('/map')) {
      return 'map';
    }
    return 'home';
  };

  const currentTab = activeTab || getCurrentTab();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-inset-bottom z-50">
      <nav className="flex justify-around items-center h-16 max-w-screen-xl mx-auto">
        <button
          onClick={() => handleTabClick('home')}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            currentTab === 'home' ? 'text-primary' : 'text-gray-500'
          }`}
        >
          <Home className="w-6 h-6 mb-1" />
          <span className="text-xs">Accueil</span>
        </button>

        <button
          onClick={() => handleTabClick('map')}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            currentTab === 'map' ? 'text-primary' : 'text-gray-500'
          }`}
        >
          <Map className="w-6 h-6 mb-1" />
          <span className="text-xs">Carte</span>
        </button>

        <button
          onClick={() => handleTabClick('scanner')}
          className="flex flex-col items-center justify-center flex-1 h-full text-gray-500 hover:text-primary transition-colors"
        >
          <QrCode className="w-6 h-6 mb-1" />
          <span className="text-xs">Scanner</span>
        </button>

        <button
          onClick={() => handleTabClick('profile')}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            currentTab === 'profile' ? 'text-primary' : 'text-gray-500'
          }`}
        >
          <User className="w-6 h-6 mb-1" />
          <span className="text-xs">
            {currentMode === 'business' ? 'Business' : 'Profil'}
          </span>
        </button>
      </nav>
    </div>
  );
};
