import { useState, useEffect, useMemo, useCallback } from "react";
import {
  useNavigate,
  useLocation,
  Routes, // Importé pour la structure de routing standard
  Route, // Importé pour la structure de routing standard
} from "react-router-dom";

// Imports des composants de Layout et Pages
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Header } from "@/components/layout/Header";
import { HomePage } from "@/pages/HomePage";
import { MapPage } from "@/pages/MapPage";
import { RankingsPage } from "@/pages/RankingsPage";
import { ProfilePage } from "@/pages/ProfilePage";

// Imports des Modals et Utilitaires
import { QRScanner } from "@/components/scanner/QRScanner";
import { ProfileSettings } from "@/components/profile/ProfileSettings";
import { LoginModal } from "@/components/auth/LoginModal";
import { useAuth } from "@/components/auth/AuthProvider";

// --- Définition des Types ---

// Définir les onglets pour un meilleur typage
type TabKey = "home" | "map" | "rankings" | "profile" | "scanner";

// Définir une interface pour l'objet "commerce" (ajustez si besoin)
interface Commerce {
  id: string | number;
  name: string;
  // ... autres propriétés
}

// --- Le Composant Principal ---

const AppLayout = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [showScanner, setShowScanner] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedCommerce, setSelectedCommerce] = useState<Commerce | null>(null);
  // L'état de transition est conservé si vous voulez ajouter des animations
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Déterminer l'onglet actif directement à partir de l'URL
  const activeTab: TabKey = useMemo(() => {
    const path = location.pathname;
    if (path.startsWith("/map")) return "map";
    if (path.startsWith("/rankings")) return "rankings";
    if (path.startsWith("/profile")) return "profile";
    return "home";
  }, [location.pathname]);

  // --- Fonctions de Gestion des Actions ---

  const getPageTitle = useCallback((): string => {
    switch (activeTab) {
      case "map":
        return "Carte";
      case "rankings":
        return "Classements";
      case "profile":
        return "Profil";
      default:
        return "Découvrir";
    }
  }, [activeTab]);

  const handleTabChange = useCallback(
    (tab: TabKey) => {
      if (tab === "scanner") {
        setShowScanner(true);
        return;
      }
      if (tab === activeTab) return;

      // Déclenchez l'état de transition avant la navigation
      setIsTransitioning(true);

      const targetPath = tab === "home" ? "/" : `/${tab}`;
      navigate(targetPath, { replace: true });

      // Petite temporisation pour simuler la fin de la transition
      // (à remplacer par une vraie gestion d'animation si implémentée)
      setTimeout(() => setIsTransitioning(false), 300);
    },
    [activeTab, navigate],
  );

  const handleAuthAction = useCallback(
    (action: () => void) => {
      if (!user) {
        setShowLoginModal(true);
        return;
      }
      action();
    },
    [user],
  );

  const handleMessageClick = () => {
    handleAuthAction(() => navigate("/messaging"));
  };

  const handleProfileSettings = () => {
    handleAuthAction(() => setShowProfileSettings(true));
  };

  const handleLocationClick = () => {
    navigate("/map", { replace: true });
  };

  const handleScanResult = (result: string) => {
    setShowScanner(false);
    // Logique de traitement du résultat du scan
    console.log("Résultat du scan:", result);
  };

  const handleHomeMessage = (commerce: Commerce) => {
    handleAuthAction(() => {
      setSelectedCommerce(commerce);
      // Optionnel: Naviguer vers la page de messagerie ou ouvrir une modal ici
    });
  };

  // --- Rendu du Loader ---

  if (loading || isTransitioning) {
    // Le loader est également affiché pendant la transition entre les pages
    return (
      <div className="min-h-screen bg-background flex items-center justify-center transition-opacity duration-300">
        <div className="animate-pulse text-center space-y-4">
          <div className="text-2xl font-bold">ConsoGab</div>
          <div className="text-sm text-muted-foreground">{loading ? "Chargement..." : "Transition..."}</div>
        </div>
      </div>
    );
  }

  // Si vous décidez de forcer la connexion
  // if (!user) {
  //    return null; // Ou afficher une page de connexion complète
  // }

  // --- Rendu de l'Application ---

  // Déterminer si le header doit être visible.
  // Dans cette structure, le header est souvent visible, mais son contenu change.
  // Vous pouvez ajuster la visibilité du bouton 'back'
  const showBackButton = activeTab !== "home";

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* HEADER */}
      {/* On utilise le Header pour toutes les routes, mais on adapte son contenu */}
      <Header
        title={getPageTitle()}
        showBack={showBackButton}
        onLocationClick={handleLocationClick}
        onMessageClick={handleMessageClick}
        // Le bouton 'Retour' dans le header peut naviguer vers '/' (home)
        onBack={() => navigate("/", { replace: true })}
      />

      {/* CONTENU PRINCIPAL (Les Routes) */}
      <main className="pt-24 pb-[calc(var(--bottom-nav-height)+env(safe-area-inset-bottom)+1rem)] py-0">
        {/* Utilisation standard de React Router pour le rendu des pages */}
        <Routes>
          <Route path="/" element={<HomePage onNavigate={handleTabChange} onMessage={handleHomeMessage} />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/rankings" element={<RankingsPage />} />
          <Route path="/profile" element={<ProfilePage onSettings={handleProfileSettings} />} />
          {/* Optionnel: Route de secours pour les chemins non définis */}
          <Route path="*" element={<HomePage onNavigate={handleTabChange} onMessage={handleHomeMessage} />} />
        </Routes>
      </main>

      {/* NAVIGATION DU BAS */}
      <BottomNavigation activeTab={activeTab} onTabChange={handleTabChange} />

      {/* MODALS / OVERLAYS */}

      {showScanner && <QRScanner onClose={() => setShowScanner(false)} onScan={handleScanResult} />}

      {showProfileSettings && (
        <ProfileSettings open={showProfileSettings} onClose={() => setShowProfileSettings(false)} userType="client" />
      )}

      <LoginModal open={showLoginModal} onClose={() => setShowLoginModal(false)} />

      {/* Le messaging modal/overlay si `selectedCommerce` n'est pas null */}
      {/* {selectedCommerce && <MessagingModal commerce={selectedCommerce} onClose={() => setSelectedCommerce(null)} />} */}
    </div>
  );
};

export default AppLayout;
