import { useState } from "react";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Header } from "@/components/layout/Header";
import { HomePage } from "@/pages/HomePage";
import { MapPage } from "@/pages/MapPage";
import { RankingsPage } from "@/pages/RankingsPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { QRScanner } from "@/components/scanner/QRScanner";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [showScanner, setShowScanner] = useState(false);

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
        return <ProfilePage onBack={() => setActiveTab("home")} />;
      default:
        return <HomePage onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <Header 
        title={getPageTitle()}
        showBack={showBackButton}
        onBack={() => setActiveTab("home")}
      />
      <main className="pt-16 pb-20 animate-fade-in">
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
    </div>
  );
};

export default Index;
