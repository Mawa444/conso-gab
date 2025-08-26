import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Header } from "@/components/layout/Header";
import { HeroBlock } from "@/components/blocks/HeroBlock";
import { IntelligentSearchBar } from "@/components/search/IntelligentSearchBar";
import { CategoriesSection } from "@/components/blocks/CategoriesSection";
import { CommerceListBlock } from "@/components/blocks/CommerceListBlock";
import { AdCarousel } from "@/components/advertising/AdCarousel";
import { ActionButtonsBlock } from "@/components/blocks/ActionButtonsBlock";
import { StatsBlock } from "@/components/blocks/StatsBlock";
import { GeolocalizedAdCarousel } from "@/components/advertising/GeolocalizedAdCarousel";
import { useAuth } from "@/components/auth/AuthProvider";
import { Link } from "react-router-dom";

const Index = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Header uniquement sur la page d'accueil */}
      <Header />
      
      {/* Auth Actions */}
      <div className="container mx-auto px-4 py-2">
        <div className="flex justify-end space-x-2">
          {user ? (
            <>
              <span className="text-sm text-muted-foreground">
                Bonjour {user.email}
              </span>
              <Button variant="outline" size="sm" asChild>
                <Link to="/business">Business</Link>
              </Button>
              <Button variant="outline" size="sm" onClick={() => signOut()}>
                Déconnexion
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" asChild>
              <Link to="/auth">Connexion</Link>
            </Button>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <HeroBlock />
        
        {/* Search Bar */}
        <div className="my-6">
          <IntelligentSearchBar />
        </div>

        {/* Action Buttons */}
        <ActionButtonsBlock />

        {/* Stats */}
        <StatsBlock />

        {/* Geolocalized Ads */}
        <GeolocalizedAdCarousel />

        {/* Categories */}
        <CategoriesSection />

        {/* Commerce List */}
        <CommerceListBlock
          title="Commerces populaires"
          commerces={[]}
          onSelect={() => {}}
          onFavorite={() => {}}
          onMessage={() => {}}
        />

        {/* Ads Carousel */}
        <AdCarousel />
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab="home" onTabChange={() => {}} />
      
      <Toaster />
    </div>
  );
};

export default Index;
