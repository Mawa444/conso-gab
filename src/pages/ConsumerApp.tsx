import { useEffect, useState } from "react";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Header } from "@/components/layout/Header";
import { HomePage } from "@/pages/HomePage";
import { MapPage } from "@/pages/MapPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { QRScanner } from "@/components/scanner/QRScanner";
import { MessageModal } from "@/components/messaging/MessageModal";
import { ProfileSettings } from "@/components/profile/ProfileSettings";
import { useAuth } from "@/components/auth/AuthProvider";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useProfileMode } from "@/hooks/use-profile-mode";
import { PageTransition } from "@/components/layout/PageTransition";
import { useActivityTracker } from "@/hooks/use-activity-tracker";

const ConsumerApp = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { trackNavigation, trackButtonClick, trackTabChange, trackModalOpen } = useActivityTracker();
  
  const [activeTab, setActiveTab] = useState("home");
  const [showScanner, setShowScanner] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [selectedCommerce, setSelectedCommerce] = useState<any>(null);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const [previousTab, setPreviousTab] = useState("home");

  const { currentMode, currentBusinessId } = useProfileMode();
  const getPageTitle = () => {
    switch (activeTab) {
      case "home": return "Découvrir";
      case "map": return "Carte";
      case "profile": return "Profil";
      default: return "Découvrir";
    }
  };

  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith("/consumer/map")) setActiveTab("map");
    else if (path.startsWith("/consumer/profile")) setActiveTab("profile");
    else setActiveTab("home");
  }, [location.pathname]);
  const handleTabChange = async (tab: string) => {
    if (tab === "scanner") {
      trackButtonClick("Scanner QR", "Navigation");
      trackModalOpen("Scanner QR");
      setShowScanner(true);
      return;
    }

    // Rediriger "Profil" selon le mode actuel
    if (tab === "profile") {
      if (currentMode === "business" && currentBusinessId) {
        trackNavigation(activeTab, "business-profile");
        navigate(`/business/${currentBusinessId}`);
        return;
      }
    }

    if (tab === activeTab) return;

    // Track l'activité de changement d'onglet
    trackTabChange(activeTab, tab);

    // Déterminer la direction du slide
    const tabOrder = ["home", "map", "profile"];
    const currentIndex = tabOrder.indexOf(activeTab);
    const newIndex = tabOrder.indexOf(tab);
    const direction = newIndex > currentIndex ? 'right' : 'left';

    setSlideDirection(direction);
    setPreviousTab(activeTab);
    setActiveTab(tab);
    
    const path = tab === "home" ? "/consumer/home" : `/consumer/${tab}`;
    if (location.pathname !== path) {
      navigate(path, { replace: false });
    }
  };

  const handleLocationClick = () => {
    trackButtonClick("Localisation", "Header");
    handleTabChange("map");
  };

  const handleMessageClick = () => {
    trackButtonClick("Messages", "Header");
    trackModalOpen("Messages");
    setShowMessageModal(true);
  };

  const handleProfileSettings = () => {
    trackButtonClick("Paramètres Profil", "Header");
    trackModalOpen("Paramètres Profil");
    setShowProfileSettings(true);
  };

  const handleScanResult = (result: string) => {
    console.log("QR Code scanné:", result);
    trackButtonClick("QR Code Scanné", "Scanner");
    setShowScanner(false);
  };

  const renderActiveTab = () => {
    const getTransitionDirection = () => {
      if (slideDirection === 'right') return 'right';
      if (slideDirection === 'left') return 'left';
      return 'fade';
    };

    const content = (() => {
      switch (activeTab) {
        case "map":
          return <MapPage onBack={() => setActiveTab("home")} />;
        case "profile":
          return <ProfilePage onBack={() => setActiveTab("home")} onSettings={handleProfileSettings} />;
        default:
          return <HomePage 
            onNavigate={setActiveTab} 
            onMessage={(commerce) => {
              setSelectedCommerce(commerce);
              handleMessageClick();
            }} 
          />;
      }
    })();

    return (
      <PageTransition 
        key={activeTab} 
        direction={getTransitionDirection()}
        className="h-full"
      >
        {content}
      </PageTransition>
    );
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
      
      <main className="pt-24 pb-[calc(var(--bottom-nav-height)+env(safe-area-inset-bottom)+1rem)] min-h-screen">
        {renderActiveTab()}
      </main>
      
      <BottomNavigation 
        activeTab={activeTab} 
        onTabChange={handleTabChange}
      />

      {showScanner && (
        <QRScanner
          onClose={() => {
            trackModalOpen("Scanner QR - Fermeture");
            setShowScanner(false);
          }}
          onScan={handleScanResult}
        />
      )}

      {showMessageModal && (
        <MessageModal
          open={showMessageModal}
          onClose={() => {
            trackModalOpen("Messages - Fermeture");
            setShowMessageModal(false);
          }}
          commerce={selectedCommerce}
        />
      )}

      {showProfileSettings && (
        <ProfileSettings
          open={showProfileSettings}
          onClose={() => {
            trackModalOpen("Paramètres Profil - Fermeture");
            setShowProfileSettings(false);
          }}
          userType="client"
        />
      )}
    </div>
  );
};

export default ConsumerApp;