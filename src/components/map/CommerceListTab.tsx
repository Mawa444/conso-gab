import { useState, useMemo } from "react";
import { Search, Filter, Building, TrendingUp, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RealBusinessCard } from "@/components/commerce/RealBusinessCard";
import { useRealBusinesses } from "@/hooks/use-real-businesses";
import { businessCategories } from "@/data/businessCategories";
import { useNavigate } from "react-router-dom";
import { CommerceListSkeleton } from "@/components/ui/skeleton-screens";
export const CommerceListTab = () => {
  const navigate = useNavigate();
  const {
    businesses,
    loading,
    error
  } = useRealBusinesses();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("relevance");
  const [activeOnly, setActiveOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filtrage et tri des entreprises
  const filteredAndSortedBusinesses = useMemo(() => {
    let filtered = businesses.filter(business => {
      // Recherche textuelle
      const searchMatch = searchQuery === "" || business.name.toLowerCase().includes(searchQuery.toLowerCase()) || business.category.toLowerCase().includes(searchQuery.toLowerCase()) || business.description?.toLowerCase().includes(searchQuery.toLowerCase());

      // Filtre catégorie
      const categoryMatch = selectedCategory === "all" || business.category === selectedCategory;

      // Filtre actif
      const activeMatch = !activeOnly || business.is_active;
      return searchMatch && categoryMatch && activeMatch;
    });

    // Tri
    switch (sortBy) {
      case "relevance":
        filtered.sort((a, b) => {
          let scoreA = 0,
            scoreB = 0;
          if (a.is_active) scoreA += 2;
          if (b.is_active) scoreB += 2;
          return scoreB - scoreA;
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
  }, [businesses, searchQuery, selectedCategory, sortBy, activeOnly]);

  // Statistiques par catégorie
  const categoryStats = useMemo(() => {
    const stats = businessCategories.map(category => {
      const categoryBusinesses = filteredAndSortedBusinesses.filter(b => b.category === category.id);
      return {
        id: category.id,
        nom: category.nom,
        count: categoryBusinesses.length,
        verifiedCount: categoryBusinesses.filter(b => b.is_verified).length
      };
    }).filter(stat => stat.count > 0).sort((a, b) => b.count - a.count);
    return stats;
  }, [filteredAndSortedBusinesses]);
  if (loading) {
    return <CommerceListSkeleton />;
  }
  if (error) {
    return <div className="flex items-center justify-center h-64">
        <p className="text-destructive">Erreur lors du chargement des entreprises</p>
      </div>;
  }
  return <div className="h-full flex flex-col">
      {/* Barre de recherche et contrôles */}
      <div className="bg-card/95 backdrop-blur-sm border-b border-border/50 p-4 space-y-4">
        {/* Recherche principale */}
        <div className="flex gap-3">
          <div className="relative flex-1 rounded-3xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Rechercher par nom, catégorie, description..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 h-11" />
          </div>
          <Button variant={showFilters ? "default" : "outline"} onClick={() => setShowFilters(!showFilters)} className="px-4 bg-[3a75c4] bg-[#3a75c4]/[0.97] text-white">
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
              {businessCategories.map(cat => <SelectItem key={cat.id} value={cat.id}>
                  {cat.icon} {cat.nom}
                </SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">🎯 Pertinence</SelectItem>
              <SelectItem value="alphabetical">🔤 Alphabétique</SelectItem>
              <SelectItem value="newest">🆕 Plus récent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filtres avancés */}
        {showFilters && <Card className="bg-muted/30">
            <CardContent className="p-4 space-y-6">
              <div className="flex items-center space-x-2">
                <Switch id="active-only" checked={activeOnly} onCheckedChange={setActiveOnly} />
                <Label htmlFor="active-only" className="flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  Entreprises actives uniquement
                </Label>
              </div>

              {/* Reset filters */}
              <Button variant="ghost" onClick={() => {
            setSearchQuery("");
            setSelectedCategory("all");
            setSortBy("relevance");
            setActiveOnly(false);
          }} className="w-full">
                Réinitialiser tous les filtres
              </Button>
            </CardContent>
          </Card>}
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-4 px-0">
          {/* Panneau latéral - Statistiques par catégorie */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardContent className="p-4 rounded-3xl">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  Répartition par catégorie
                </h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {categoryStats.slice(0, 10).map(stat => <div key={stat.id} className={`p-2 rounded-lg cursor-pointer transition-colors border ${selectedCategory === stat.id ? 'bg-primary/10 border-primary/30' : 'hover:bg-muted/50 border-transparent'}`} onClick={() => setSelectedCategory(selectedCategory === stat.id ? "all" : stat.id)}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{stat.nom}</div>
                          <div className="text-xs text-muted-foreground">
                            {stat.count} entreprise{stat.count > 1 ? 's' : ''}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-green-600">{stat.verifiedCount} vérifiée{stat.verifiedCount > 1 ? 's' : ''}</div>
                        </div>
                      </div>
                    </div>)}
                </div>
              </CardContent>
            </Card>

            {/* Statistiques globales */}
            <Card>
              <CardContent className="p-4 rounded-3xl">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Statistiques
                </h3>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-primary/5 rounded-md">
                    <div className="text-lg font-bold text-primary">{filteredAndSortedBusinesses.length}</div>
                    <div className="text-xs text-muted-foreground">Total</div>
                  </div>
                  <div className="p-3 bg-green-500/5 rounded-lg">
                    <div className="text-lg font-bold text-green-600">
                      {filteredAndSortedBusinesses.filter(b => b.is_active).length}
                    </div>
                    <div className="text-xs text-muted-foreground">Actives</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Liste des entreprises */}
          <div className="lg:col-span-3">
            {/* Header des résultats */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">
                  {filteredAndSortedBusinesses.length} entreprise{filteredAndSortedBusinesses.length > 1 ? 's' : ''} trouvée{filteredAndSortedBusinesses.length > 1 ? 's' : ''}
                </h2>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {selectedCategory !== "all" && <Badge variant="secondary">
                      {businessCategories.find(c => c.id === selectedCategory)?.nom}
                    </Badge>}
                  {activeOnly && <Badge variant="secondary">Actives uniquement</Badge>}
                </div>
              </div>
            </div>

            {/* Liste */}
            <div className="grid gap-4">
              {filteredAndSortedBusinesses.map(business => <RealBusinessCard key={business.id} business={business} onSelect={() => navigate(`/business/${business.id}`)} onMessage={() => console.log("Message to", business.name)} variant="default" />)}
              
              {filteredAndSortedBusinesses.length === 0 && <div className="text-center py-12 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">Aucune entreprise trouvée</p>
                  <p className="text-sm">Essayez de modifier vos filtres de recherche</p>
                </div>}
            </div>
          </div>
        </div>
      </div>
    </div>;
};