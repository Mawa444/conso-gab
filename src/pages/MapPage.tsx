import { useState } from "react";
import { ArrowLeft, Map, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CommerceListTab } from "@/components/map/CommerceListTab";
import { MapTab } from "@/components/map/MapTab";
import { PageWithSkeleton } from "@/components/layout/PageWithSkeleton";
import { MapPageSkeleton } from "@/components/ui/skeleton-screens";

interface MapPageProps {
  onBack?: () => void;
}

export const MapPage = ({ onBack }: MapPageProps) => {
  const [activeTab, setActiveTab] = useState("list");
  const [isLoading, setIsLoading] = useState(false);

  return (
    <PageWithSkeleton
      isLoading={isLoading}
      skeleton={<MapPageSkeleton />}
      loadingText="Chargement de la carte..."
    >
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex flex-col">
      {/* Header simplifié */}
      <div className="bg-card/95 backdrop-blur-sm border-b border-border/50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && (
              <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <div>
              <h1 className="text-2xl font-bold">Découvrir</h1>
              <p className="text-sm text-muted-foreground">
                Explorez les commerces de votre région
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Système d'onglets intelligent */}
      <div className="flex-1 flex flex-col">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="bg-card/50 border-b border-border/30 px-4">
            <TabsList className="bg-muted/50 p-1 h-12">
              <TabsTrigger 
                value="list" 
                className="flex items-center gap-2 px-6 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <List className="w-4 h-4" />
                <span className="font-medium">Liste détaillée</span>
              </TabsTrigger>
              <TabsTrigger 
                value="map" 
                className="flex items-center gap-2 px-6 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
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
            
            <TabsContent value="map" className="h-full m-0">
              <MapTab />
            </TabsContent>
          </div>
        </Tabs>
      </div>
      </div>
    </PageWithSkeleton>
  );
};