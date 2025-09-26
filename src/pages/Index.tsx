import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Header } from "@/components/layout/Header";
import { HomePage } from "@/pages/HomePage";
import { MapPage } from "@/pages/MapPage";
import { RankingsPage } from "@/pages/RankingsPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { QRScanner } from "@/components/scanner/QRScanner";
import { ProfileSettings } from "@/components/profile/ProfileSettings";
import { LoginModal } from "@/components/auth/LoginModal";
import { useAuth } from "@/components/auth/AuthProvider";
import { TransitionWrapper } from "@/components/layout/TransitionWrapper";
const Index = () => {
  const {
    user,
    loading
  } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("home");
  const [showScanner, setShowScanner] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedCommerce, setSelectedCommerce] = useState<any>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Redirection temporairement désactivée
  // useEffect(() => {
  //   if (!loading && !user) {
  //     navigate('/auth');
  //   }
  // }, [loading, user, navigate]);

  // Afficher un loader simple pendant la vérification
  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-center space-y-4">
          <div className="text-2xl font-bold">ConsoGab</div>
          <div className="text-sm text-muted-foreground">Chargement...</div>
        </div>
      </div>;
  }

  // Accès autorisé même sans utilisateur connecté (temporaire)
  // if (!user) {
  //   return null;
  // }

  const getPageTitle = () => {
    switch (activeTab) {
      case "home":
        return "Découvrir";
      case "map":
        return "Carte";
      case "rankings":
        return "Classements";
      case "profile":
        return "Profil";
      default:
        return "Découvrir";
    }
  };
  const showBackButton = activeTab !== "home";
  const handleTabChange = (tab: string) => {
    if (tab === "scanner") {
      setShowScanner(true);
      return;
    }
    if (tab === activeTab) return;

    // Déclencher la transition pour les changements de page
    setIsTransitioning(true);

    // Changer l'onglet après un petit délai pour la transition
    setTimeout(() => {
      setActiveTab(tab);
      setIsTransitioning(false);
    }, 150);
  };
  const handleLocationClick = () => {
    setActiveTab("map");
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
    // Traiter le résultat du scan
  };
  const renderActiveTab = () => {
    return <TransitionWrapper>
        {(() => {
        switch (activeTab) {
          case "map":
            return <MapPage onBack={() => setActiveTab("home")} />;
          case "rankings":
            return <RankingsPage onBack={() => setActiveTab("home")} />;
          case "profile":
            return <ProfilePage onBack={() => setActiveTab("home")} onSettings={handleProfileSettings} />;
          default:
            return <HomePage onNavigate={setActiveTab} onMessage={commerce => {
              if (!user) {
                setShowLoginModal(true);
                return;
              }
              setSelectedCommerce(commerce);
            }} />;
        }
      })()}
      </TransitionWrapper>;
  };
  return <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {activeTab === "home" && <Header title={getPageTitle()} showBack={false} onLocationClick={handleLocationClick} onMessageClick={handleMessageClick} />}
      <main className="pt-24 pb-[calc(var(--bottom-nav-height)+env(safe-area-inset-bottom)+1rem)] bg-white">
        {renderActiveTab()}
      </main>
      
      {/* Navigation toujours visible sauf en mode recherche */}
      <BottomNavigation activeTab={activeTab} onTabChange={handleTabChange} />

      {showScanner && <QRScanner onClose={() => setShowScanner(false)} onScan={handleScanResult} />}

      {/* Messaging functionality will be re-implemented */}

      {showProfileSettings && <ProfileSettings open={showProfileSettings} onClose={() => setShowProfileSettings(false)} userType="client" />}

      <LoginModal open={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>;
};
export default Index;