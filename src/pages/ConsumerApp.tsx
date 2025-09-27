import { useEffect, useState } from "react";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Header } from "@/components/layout/Header";
import { HomePage } from "@/pages/HomePage";
import { MapPage } from "@/pages/MapPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { QRScanner } from "@/components/scanner/QRScanner";
import { ProfileSettings } from "@/components/profile/ProfileSettings";
import { useAuth } from "@/components/auth/AuthProvider";
import { useLocation, useNavigate, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useProfileMode } from "@/hooks/use-profile-mode";
import { PageTransition } from "@/components/layout/PageTransition";
import { useActivityTracker } from "@/hooks/use-activity-tracker";
const ConsumerApp = () => {
  const {
    user
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    trackNavigation,
    trackButtonClick,
    trackTabChange,
    trackModalOpen
  } = useActivityTracker();
  const [activeTab, setActiveTab] = useState("home");
  const [showScanner, setShowScanner] = useState(false);
  // Messaging functionality will be re-implemented
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [selectedCommerce, setSelectedCommerce] = useState<any>(null);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const [previousTab, setPreviousTab] = useState("home");
  const {
    currentMode,
    currentBusinessId
  } = useProfileMode();
  const getPageTitle = () => {
    switch (activeTab) {
      case "home":
        return "Découvrir";
      case "map":
        return "Carte";
      case "profile":
        return "Profil";
      default:
        return "Découvrir";
    }
  };
  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith("/consumer/map")) setActiveTab("map");else if (path.startsWith("/consumer/profile")) setActiveTab("profile");else setActiveTab("home");
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
      navigate(path, {
        replace: false
      });
    }
  };
  const handleLocationClick = () => {
    trackButtonClick("Localisation", "Header");
    handleTabChange("map");
  };
  const handleMessageClick = () => {
    trackButtonClick("Messages", "Header");
    navigate("/messaging");
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
          return <HomePage onNavigate={setActiveTab} onMessage={commerce => {
            setSelectedCommerce(commerce);
            handleMessageClick();
          }} />;
      }
    })();
    return <PageTransition key={activeTab} direction={getTransitionDirection()} className="h-full">
        {content}
      </PageTransition>;
  };
  return <div className="flex flex-col min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <Routes>
        <Route path="/home" element={<>
            <Header title="Découvrir" showBack={false} onLocationClick={() => navigate('/consumer/map')} onMessageClick={() => navigate('/messaging')} />
            <main className="flex-1 pt-24 pb-[calc(var(--bottom-nav-height)+env(safe-area-inset-bottom)+1rem)] overflow-y-auto rounded-none py-[71px]">
              <HomePage onNavigate={tab => navigate(`/consumer/${tab}`)} onMessage={commerce => {
            setSelectedCommerce(commerce);
            navigate('/messaging');
          }} />
            </main>
          </>} />
        
        <Route path="/map" element={<main className="flex-1 pt-24 pb-[calc(var(--bottom-nav-height)+env(safe-area-inset-bottom)+1rem)] overflow-y-auto">
            <MapPage onBack={() => navigate('/consumer/home')} />
          </main>} />
        
        <Route path="/profile" element={<main className="flex-1 pt-24 pb-[calc(var(--bottom-nav-height)+env(safe-area-inset-bottom)+1rem)] overflow-y-auto">
            <ProfilePage onBack={() => navigate('/consumer/home')} onSettings={() => setShowProfileSettings(true)} />
          </main>} />
        
        <Route path="/*" element={<Navigate to="/consumer/home" replace />} />
      </Routes>
      
      <BottomNavigation activeTab={activeTab} onTabChange={tab => {
      if (tab === "scanner") {
        trackButtonClick("Scanner QR", "Navigation");
        trackModalOpen("Scanner QR");
        setShowScanner(true);
        return;
      }
      if (tab === "profile" && currentMode === "business" && currentBusinessId) {
        trackNavigation(activeTab, "business-profile");
        navigate(`/business/${currentBusinessId}`);
        return;
      }
      trackTabChange(activeTab, tab);
      setActiveTab(tab);
      const path = tab === "home" ? "/consumer/home" : `/consumer/${tab}`;
      navigate(path);
    }} />

      {showScanner && <QRScanner onClose={() => {
      trackModalOpen("Scanner QR - Fermeture");
      setShowScanner(false);
    }} onScan={result => {
      console.log("QR Code scanné:", result);
      trackButtonClick("QR Code Scanné", "Scanner");
      setShowScanner(false);
    }} />}

      {showProfileSettings && <ProfileSettings open={showProfileSettings} onClose={() => {
      trackModalOpen("Paramètres Profil - Fermeture");
      setShowProfileSettings(false);
    }} userType="client" />}
    </div>;
};
export default ConsumerApp;