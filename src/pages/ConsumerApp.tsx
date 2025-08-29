import { useEffect, useState } from "react";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Header } from "@/components/layout/Header";
import { HomePage } from "@/pages/HomePage";
import { MapPage } from "@/pages/MapPage";
import { RankingsPage } from "@/pages/RankingsPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { QRScanner } from "@/components/scanner/QRScanner";
import { MessageModal } from "@/components/messaging/MessageModal";
import { ProfileSettings } from "@/components/profile/ProfileSettings";
import { useAuth } from "@/components/auth/AuthProvider";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useProfileMode } from "@/hooks/use-profile-mode";

const ConsumerApp = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("home");
  const [showScanner, setShowScanner] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [selectedCommerce, setSelectedCommerce] = useState<any>(null);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const { currentMode, currentBusinessId } = useProfileMode();
  const getPageTitle = () => {
    switch (activeTab) {
      case "home": return "Découvrir";
      case "map": return "Carte";
      case "rankings": return "Classements";
      case "profile": return "Profil";
      default: return "Découvrir";
    }
  };

  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith("/consumer/map")) setActiveTab("map");
    else if (path.startsWith("/consumer/rankings")) setActiveTab("rankings");
    else if (path.startsWith("/consumer/profile")) setActiveTab("profile");
    else setActiveTab("home");
  }, [location.pathname]);
  const handleTabChange = async (tab: string) => {
    if (tab === "scanner") {
      setShowScanner(true);
      return;
    }

    // Rediriger "Profil" selon le mode actuel
    if (tab === "profile") {
      if (currentMode === "business" && currentBusinessId) {
        navigate(`/business/${currentBusinessId}`);
        return;
      }
    }

    if (tab === activeTab) return;

    // Déterminer la direction du slide
    const tabOrder = ["home", "map", "rankings", "profile"];
    const currentIndex = tabOrder.indexOf(activeTab);
    const newIndex = tabOrder.indexOf(tab);
    const direction = newIndex > currentIndex ? 'right' : 'left';

    // Démarrer la transition
    setIsTransitioning(true);
    setSlideDirection(direction);

    // Changer l'onglet après un court délai pour l'animation
    setTimeout(() => {
      setActiveTab(tab);
      const path = tab === "home" ? "/consumer/home" : `/consumer/${tab}`;
      if (location.pathname !== path) {
        navigate(path, { replace: false });
      }
      
      // Terminer la transition
      setTimeout(() => {
        setIsTransitioning(false);
        setSlideDirection(null);
      }, 50);
    }, 150);
  };

  const handleLocationClick = () => {
    handleTabChange("map");
  };

  const handleMessageClick = () => {
    setShowMessageModal(true);
  };

  const handleProfileSettings = () => {
    setShowProfileSettings(true);
  };

  const handleScanResult = (result: string) => {
    console.log("QR Code scanné:", result);
    setShowScanner(false);
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case "map":
        return <MapPage onBack={() => setActiveTab("home")} />;
      case "rankings":
        return <RankingsPage onBack={() => setActiveTab("home")} />;
      case "profile":
        return <ProfilePage onBack={() => setActiveTab("home")} onSettings={handleProfileSettings} />;
      default:
        return <HomePage 
          onNavigate={setActiveTab} 
          onMessage={(commerce) => {
            setSelectedCommerce(commerce);
            setShowMessageModal(true);
          }} 
        />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background transition-all duration-300">
      {activeTab === "home" && (
        <Header 
          title={getPageTitle()}
          showBack={false}
          onLocationClick={handleLocationClick}
          onMessageClick={handleMessageClick}
        />
      )}
      
      <main className="pt-24 pb-[calc(var(--bottom-nav-height)+env(safe-area-inset-bottom)+1rem)] min-h-screen overflow-hidden">
        <div className={`transition-all duration-300 ease-out ${
          isTransitioning 
            ? slideDirection === 'left' 
              ? 'animate-slide-out-left' 
              : 'animate-slide-out-right'
            : 'animate-slide-in-right'
        }`}>
          {renderActiveTab()}
        </div>
      </main>
      
      <BottomNavigation 
        activeTab={activeTab} 
        onTabChange={handleTabChange}
      />

      {showScanner && (
        <QRScanner
          onClose={() => setShowScanner(false)}
          onScan={handleScanResult}
        />
      )}

      {showMessageModal && (
        <MessageModal
          open={showMessageModal}
          onClose={() => setShowMessageModal(false)}
          commerce={selectedCommerce}
        />
      )}

      {showProfileSettings && (
        <ProfileSettings
          open={showProfileSettings}
          onClose={() => setShowProfileSettings(false)}
          userType="client"
        />
      )}
    </div>
  );
};

export default ConsumerApp;