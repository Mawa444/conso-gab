import { useState, useCallback } from "react";
import { ArrowLeft, Map, List } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CommerceListTab } from "@/components/map/CommerceListTab";
import { MapLibreView } from "@/components/map/MapLibreView";
import { BusinessMarkersLayer } from "@/components/map/BusinessMarkersLayer";
import { PageWithSkeleton } from "@/components/layout/PageWithSkeleton";
import { MapPageSkeleton } from "@/components/ui/skeleton-screens";
import { useMapBusinesses, type MapBusiness } from "@/hooks/use-map-businesses";
import type maplibregl from "maplibre-gl";
interface MapPageProps {
  onBack?: () => void;
}
export const MapPage = ({
  onBack
}: MapPageProps) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("map");
  const [map, setMap] = useState<maplibregl.Map | null>(null);
  
  const {
    businesses,
    loading,
    setCurrentBounds,
  } = useMapBusinesses({ autoFetch: false });

  const handleMapLoad = useCallback((loadedMap: maplibregl.Map) => {
    setMap(loadedMap);
    // Charger les entreprises du viewport initial
    setCurrentBounds(loadedMap.getBounds());
  }, [setCurrentBounds]);

  const handleMoveEnd = useCallback((bounds: maplibregl.LngLatBounds) => {
    setCurrentBounds(bounds);
  }, [setCurrentBounds]);

  const handleBusinessClick = useCallback((business: MapBusiness) => {
    navigate(`/business/${business.id}/profile`);
  }, [navigate]);
  return <PageWithSkeleton isLoading={loading} skeleton={<MapPageSkeleton />}>
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex flex-col">
      {/* Header simplifié */}
      <div className="backdrop-blur-sm border-b border-border/50 p-4 bg-[3a75c4] bg-[#3a75c4]/[0.96] rounded-none px-0 py-[12px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && <Button variant="ghost" size="sm" onClick={onBack} className="p-2 px-[21px] text-white font-bold text-xl">
                <ArrowLeft className="w-4 h-4" />
              </Button>}
            <div>
              <h1 className="text-2xl font-bold text-left text-white">Découvrir</h1>
              <p className="text-white text-xs">
                Explorez les commerces de votre région
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Système d'onglets intelligent */}
      <div className="flex-1 flex flex-col">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="bg-card/50 border-b border-border/30 rounded-3xl px-[34px] my-[20px]">
            <TabsList className="bg-muted/50 p-1 h-12 px-[177px]">
              <TabsTrigger value="list" className="flex items-center gap-2 px-6 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-3xl text-black">
                <List className="w-4 h-4" />
                <span className="font-medium">Liste détaillée</span>
              </TabsTrigger>
              <TabsTrigger value="map" className="flex items-center gap-2 px-6 py-2 data-[state=active]:shadow-sm rounded-3xl text-black bg-inherit">
                <Map className="w-4 h-4" />
                <span className="font-medium">Carte interactive</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Contenu des onglets */}
          <div className="flex-1">
            <TabsContent value="list" className="h-full m-0">
              <CommerceListTab />
            </TabsContent>
            
            <TabsContent value="map" className="h-full m-0 relative">
              <MapLibreView
                initialCenter={[9.4673, 0.4162]}
                initialZoom={12}
                onMapLoad={handleMapLoad}
                onMoveEnd={handleMoveEnd}
                className="h-full"
              >
                <BusinessMarkersLayer
                  map={map}
                  businesses={businesses}
                  onBusinessClick={handleBusinessClick}
                />
              </MapLibreView>
              
              {loading && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-background/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-border z-[1000]">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm font-medium">Chargement des entreprises...</span>
                  </div>
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  </PageWithSkeleton>;
};