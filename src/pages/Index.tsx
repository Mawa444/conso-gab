import { useState } from "react";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Header } from "@/components/layout/Header";
import { HomePage } from "@/pages/HomePage";
import { MapPage } from "@/pages/MapPage";
import { RankingsPage } from "@/pages/RankingsPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { QRScanner } from "@/components/scanner/QRScanner";
import { MessageModal } from "@/components/messaging/MessageModal";
import { ProfileSettings } from "@/components/profile/ProfileSettings";
import { LoginModal } from "@/components/auth/LoginModal";
import { useAuth } from "@/components/auth/AuthProvider";

const Index = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("home");
  const [showScanner, setShowScanner] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
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

  const showBackButton = activeTab !== "home";

  const handleTabChange = (tab: string) => {
    if (tab === "scanner") {
      setShowScanner(true);
    } else {
      setActiveTab(tab);
    }
  };

  const handleLocationClick = () => {
    setActiveTab("map");
  };

  const handleMessageClick = () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    setShowMessageModal(true);
  };

  const handleProfileSettings = () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    setShowProfileSettings(true);
  };

  const handleScanResult = (result: string) => {
    console.log("QR Code scanné:", result);
    setShowScanner(false);
    // Traiter le résultat du scan
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
        return <HomePage onNavigate={setActiveTab} onMessage={(commerce) => {
          if (!user) {
            setShowLoginModal(true);
            return;
          }
          setSelectedCommerce(commerce);
          setShowMessageModal(true);
        }} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <Header 
        title={getPageTitle()}
        showBack={showBackButton}
        onBack={() => setActiveTab("home")}
        onLocationClick={handleLocationClick}
        onMessageClick={handleMessageClick}
      />
      <main className="pt-24 pb-24 animate-fade-in min-h-screen">
        {renderActiveTab()}
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

      <LoginModal
        open={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  );
};

export default Index;
