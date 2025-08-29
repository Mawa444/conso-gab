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

const ConsumerApp = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("home");
  const [showScanner, setShowScanner] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [selectedCommerce, setSelectedCommerce] = useState<any>(null);

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

    // Interface unifiée: pas de redirection spéciale pour les marchands

    setActiveTab(tab);
    const path = tab === "home" ? "/consumer/home" : `/consumer/${tab}`;
    if (location.pathname !== path) {
      navigate(path, { replace: false });
    }
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
        <div className="transition-transform duration-500 ease-out">
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