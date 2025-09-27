import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { HeroBlock } from "@/components/blocks/HeroBlock";
import { CategoriesSection } from "@/components/blocks/CategoriesSection";
import { RealCommerceListBlock } from "@/components/blocks/RealCommerceListBlock";
import { ActionButtonsBlock } from "@/components/blocks/ActionButtonsBlock";
import { QRScanner } from "@/components/scanner/QRScanner";
import { ProfileSettings } from "@/components/profile/ProfileSettings";
import { LoginModal } from "@/components/auth/LoginModal";
import { useAuth } from "@/components/auth/AuthProvider";

export const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showScanner, setShowScanner] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleLocationClick = () => {
    navigate("/consumer/map");
  };

  const handleMessageClick = () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    navigate("/messaging");
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
  };

  const handleMessage = (commerce: any) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    // Handle messaging logic
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <Header 
        title="Découvrir"
        showBack={false}
        onLocationClick={handleLocationClick}
        onMessageClick={handleMessageClick}
      />
      
      <main className="pt-24 pb-[calc(var(--bottom-nav-height)+env(safe-area-inset-bottom)+1rem)]">
        <div className="space-y-6">
          <HeroBlock />
          <CategoriesSection />
          <RealCommerceListBlock onMessage={handleMessage} />
          <ActionButtonsBlock />
        </div>
      </main>
      
      <BottomNavigation 
        activeTab="home" 
        onScannerClick={() => setShowScanner(true)} 
      />

      {showScanner && (
        <QRScanner
          onClose={() => setShowScanner(false)}
          onScan={handleScanResult}
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