import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("home");
  const [showScanner, setShowScanner] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedCommerce, setSelectedCommerce] = useState<any>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Déterminer l'onglet actif basé sur l'URL
  useEffect(() => {
    const currentPath = location.pathname;
    if (currentPath === '/map') {
      setActiveTab('map');
    } else if (currentPath === '/rankings') {
      setActiveTab('rankings');
    } else if (currentPath === '/profile') {
      setActiveTab('profile');
    } else {
      setActiveTab('home');
    }
  }, [location.pathname]);

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

    // Naviguer vers la bonne URL
    const targetPath = tab === "home" ? "/" : `/${tab}`;
    navigate(targetPath, {
      replace: true
    });
  };
  const handleLocationClick = () => {
    navigate("/map", {
      replace: true
    });
  };
  const handleMessageClick = () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    navigate("/mimo-chat");
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
            return <MapPage onBack={() => navigate("/home", {
              replace: true
            })} />;
          case "rankings":
            return <RankingsPage onBack={() => navigate("/home", {
              replace: true
            })} />;
          case "profile":
            return <ProfilePage onBack={() => navigate("/home", {
              replace: true
            })} onSettings={handleProfileSettings} />;
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
      <main className="pt-24 pb-[calc(var(--bottom-nav-height)+env(safe-area-inset-bottom)+1rem)] py-0">
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