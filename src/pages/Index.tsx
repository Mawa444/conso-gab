import { useState } from "react";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { HomePage } from "@/pages/HomePage";
import { MapPage } from "@/pages/MapPage";
import { RankingsPage } from "@/pages/RankingsPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { QRScanner } from "@/components/scanner/QRScanner";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [showScanner, setShowScanner] = useState(false);

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
        return <MapPage />;
      case "rankings":
        return <RankingsPage />;
      case "profile":
        return <ProfilePage />;
      default:
        return <HomePage onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {renderActiveTab()}
      
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
