import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Trophy, Star, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { QRScanner } from "@/components/scanner/QRScanner";
import { ProfileSettings } from "@/components/profile/ProfileSettings";
import { LoginModal } from "@/components/auth/LoginModal";
import { useAuth } from "@/components/auth/AuthProvider";

export const RankingsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate(); 
  const [showScanner, setShowScanner] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleBack = () => {
    navigate("/consumer/home");
  };

  const handleScanResult = (result: string) => {
    console.log("QR Code scanné:", result);
    setShowScanner(false);
  };

  const handleProfileSettings = () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    setShowProfileSettings(true);
  };

  // Mock data for rankings
  const topBusinesses = [
    { id: 1, name: "Restaurant Le Gaboma", rating: 4.9, reviews: 156, category: "Restaurant" },
    { id: 2, name: "Pharmacie Centrale", rating: 4.8, reviews: 89, category: "Santé" },
    { id: 3, name: "Boutique Mode & Style", rating: 4.7, reviews: 234, category: "Mode" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <header className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-b">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Button>
          <h1 className="text-lg font-semibold">Classements</h1>
          <div className="w-16" />
        </div>
      </header>
      
      <main className="pt-16 pb-[calc(var(--bottom-nav-height)+env(safe-area-inset-bottom)+1rem)] p-4">
        <div className="space-y-6">
          {/* Header Stats */}
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Top des entreprises</h2>
                <p className="text-muted-foreground">Les mieux notées cette semaine</p>
              </div>
            </div>
          </Card>

          {/* Rankings List */}
          <div className="space-y-3">
            {topBusinesses.map((business, index) => (
              <Card key={business.id} className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{business.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary">{business.category}</Badge>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{business.rating}</span>
                        <span className="text-sm text-muted-foreground">({business.reviews})</span>
                      </div>
                    </div>
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
              </Card>
            ))}
          </div>

          {/* Categories Rankings */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Classements par catégorie</h3>
            <div className="grid grid-cols-2 gap-3">
              {["Restaurant", "Commerce", "Services", "Santé"].map((category) => (
                <Button key={category} variant="outline" className="justify-start">
                  {category}
                </Button>
              ))}
            </div>
          </Card>
        </div>
      </main>
      
      <BottomNavigation 
        activeTab="rankings" 
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