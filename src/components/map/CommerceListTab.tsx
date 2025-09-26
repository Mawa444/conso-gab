import { useState, useMemo } from "react";
import { Search, Filter, Building } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useRealBusinesses } from "@/hooks/use-real-businesses";
import { businessCategories } from "@/data/businessCategories";
import { useNavigate } from "react-router-dom";
import { CommerceListSkeleton } from "@/components/ui/skeleton-screens";

export const CommerceListTab = () => {
  const navigate = useNavigate();
  const { businesses, loading, error } = useRealBusinesses();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [sortBy, setSortBy] = useState("relevance");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Catégories et districts des vraies données
  const categories = businessCategories.map(cat => ({ id: cat.id, name: cat.nom, icon: cat.icon }));
  const districts = [...new Set(businesses.map(b => b.city).filter(Boolean))] as string[];

  // Filtrage et tri
  const filteredAndSortedCommerces = useMemo(() => {
    let filtered = businesses.filter(business => {
      const searchMatch = searchQuery === "" || 
        business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        business.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        business.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        business.city?.toLowerCase().includes(searchQuery.toLowerCase());

      const categoryMatch = selectedCategory === "all" || business.category === selectedCategory;
      const districtMatch = selectedDistrict === "all" || business.city === selectedDistrict;
      const verifiedMatch = !verifiedOnly || business.is_verified;

      return searchMatch && categoryMatch && districtMatch && verifiedMatch;
    });

    // Tri
    switch (sortBy) {
      case "relevance":
        filtered.sort((a, b) => {
          if (a.is_verified && !b.is_verified) return -1;
          if (!a.is_verified && b.is_verified) return 1;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
        break;
      case "alphabetical":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "newest":
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }

    return filtered;
  }, [businesses, searchQuery, selectedCategory, selectedDistrict, sortBy, verifiedOnly]);

  if (loading) {
    return <CommerceListSkeleton />;
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <h3 className="text-lg font-semibold mb-2">Erreur de chargement</h3>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (businesses.length === 0) {
    return (
      <div className="p-8 text-center">
        <Building className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Aucune entreprise</h3>
        <p className="text-muted-foreground">Aucune entreprise n'est encore enregistrée.</p>
        <Button onClick={() => navigate('/business/create')} className="mt-4">
          Créer mon entreprise
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Contrôles de recherche */}
      <div className="bg-card/95 backdrop-blur-sm border-b border-border/50 p-4 space-y-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une entreprise..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
          <Button
            variant={showFilters ? "default" : "outline"}
            onClick={() => setShowFilters(!showFilters)}
            className="px-4"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtres
          </Button>
        </div>

        {/* Filtres rapides */}
        <div className="flex gap-2 flex-wrap">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes catégories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Ville" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes villes</SelectItem>
              {districts.map(district => (
                <SelectItem key={district} value={district}>
                  {district}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center space-x-2">
            <Switch
              id="verified-only"
              checked={verifiedOnly}
              onCheckedChange={setVerifiedOnly}
            />
            <Label htmlFor="verified-only" className="text-sm">
              Vérifiées uniquement
            </Label>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">
            Entreprises trouvées ({filteredAndSortedCommerces.length})
          </h2>
        </div>

        {filteredAndSortedCommerces.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Aucune entreprise trouvée avec ces critères.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAndSortedCommerces.map((business) => (
              <div 
                key={business.id}
                className="bg-card rounded-lg p-4 border cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/business/${business.id}`)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{business.name}</h3>
                    <p className="text-sm text-muted-foreground">{business.category}</p>
                  </div>
                  {business.is_verified && (
                    <Badge variant="secondary" className="text-xs">✓ Vérifié</Badge>
                  )}
                </div>
                
                {business.description && (
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                    {business.description}
                  </p>
                )}
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{business.city || 'Localisation non précisée'}</span>
                  <span>{new Date(business.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};