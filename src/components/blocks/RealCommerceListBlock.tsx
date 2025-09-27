import { useState } from "react";
import { Search, Filter, Store, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRealBusinesses, type RealBusiness } from "@/hooks/use-real-businesses";
import { businessCategories } from "@/data/businessCategories";
import { useNavigate } from "react-router-dom";
import { CommerceListSkeleton } from "@/components/ui/skeleton-screens";

interface RealCommerceListBlockProps {
  title?: string;
  showFilters?: boolean;
  limit?: number;
}

export const RealCommerceListBlock = ({ 
  title = "Entreprises", 
  showFilters = true,
  limit 
}: RealCommerceListBlockProps) => {
  const navigate = useNavigate();
  const { businesses, loading, error } = useRealBusinesses();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  // Filtrage et tri des entreprises
  const filteredBusinesses = businesses.filter(business => {
    const searchMatch = searchQuery === "" || 
      business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      business.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      business.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      business.city?.toLowerCase().includes(searchQuery.toLowerCase());

    const categoryMatch = selectedCategory === "all" || business.category === selectedCategory;

    return searchMatch && categoryMatch;
  });

  // Tri des résultats
  const sortedBusinesses = [...filteredBusinesses].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "category":
        return a.category.localeCompare(b.category);
      case "recent":
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  // Limiter les résultats si nécessaire
  const displayedBusinesses = limit ? sortedBusinesses.slice(0, limit) : sortedBusinesses;

  const handleBusinessClick = (businessId: string) => {
    navigate(`/business/${businessId}`);
  };

  if (loading) {
    return <CommerceListSkeleton />;
  }

  if (error) {
    return (
      <Card className="animate-ui-card">
        <CardContent className="p-6 text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Erreur de chargement</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Réessayer
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (businesses.length === 0) {
    return (
      <Card className="animate-ui-card">
        <CardContent className="p-8 text-center">
          <Store className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Aucune entreprise pour le moment</h3>
          <p className="text-muted-foreground mb-6">
            Les entreprises apparaîtront ici une fois qu'elles seront inscrites sur la plateforme.
          </p>
          <Button onClick={() => navigate('/business/create')}>
            Créer mon entreprise
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec recherche et filtres */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{title}</h2>
          <Badge variant="outline" className="animate-ui-card">
            {filteredBusinesses.length} résultat{filteredBusinesses.length > 1 ? 's' : ''}
          </Badge>
        </div>

        {showFilters && (
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une entreprise..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes catégories</SelectItem>
                {businessCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.icon} {category.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Plus récent</SelectItem>
                <SelectItem value="name">Nom A-Z</SelectItem>
                <SelectItem value="category">Catégorie</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Liste des entreprises */}
      {filteredBusinesses.length === 0 ? (
        <Card className="animate-ui-card">
          <CardContent className="p-8 text-center">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun résultat</h3>
            <p className="text-muted-foreground">
              Aucune entreprise ne correspond à vos critères de recherche.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedBusinesses.map((business) => (
            <Card 
              key={business.id} 
              className="animate-ui-card cursor-pointer group hover:shadow-lg transition-all duration-200"
              onClick={() => handleBusinessClick(business.id)}
            >
              <CardContent className="p-0">
                {/* Image de couverture */}
                <div className="aspect-video relative bg-gradient-to-br from-primary/10 to-accent/10 overflow-hidden">
                  {business.cover_image_url ? (
                    <img 
                      src={business.cover_image_url} 
                      alt={business.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Store className="w-12 h-12 text-muted-foreground/50" />
                    </div>
                  )}
                  
                  {business.is_verified && (
                    <Badge className="absolute top-3 right-3 bg-primary/90 text-primary-foreground">
                      ✓ Vérifié
                    </Badge>
                  )}
                </div>

                {/* Contenu */}
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
                        {business.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {businessCategories.find(cat => cat.id === business.category)?.nom || business.category}
                      </p>
                    </div>
                    
                    {business.logo_url && (
                      <img 
                        src={business.logo_url} 
                        alt={`Logo ${business.name}`}
                        className="w-10 h-10 rounded-lg object-cover border"
                      />
                    )}
                  </div>

                  {business.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {business.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="text-xs text-muted-foreground">
                      {business.city && (
                        <span>{business.city}</span>
                      )}
                    </div>
                    
                    <Button size="sm" className="animate-ui-button">
                      Voir les détails
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Bouton "Voir plus" si limité */}
      {limit && sortedBusinesses.length > limit && (
        <div className="text-center">
          <Button 
            variant="default" 
            onClick={() => navigate('/businesses')}
            className="animate-ui-button"
          >
            Voir toutes les entreprises ({sortedBusinesses.length - limit} de plus)
          </Button>
        </div>
      )}
    </div>
  );
};