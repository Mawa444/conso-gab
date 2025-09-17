import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Navigation, 
  MapPin, 
  Clock, 
  Route, 
  Car, 
  Bike, 
  Users,
  AlertTriangle,
  Zap
} from 'lucide-react';

interface RouteMapModalProps {
  open: boolean;
  onClose: () => void;
  destination: {
    name: string;
    address: string;
    coordinates?: { lat: number; lng: number };
  };
  userLocation?: { lat: number; lng: number };
}

export const RouteMapModal = ({ open, onClose, destination, userLocation }: RouteMapModalProps) => {
  const [selectedRoute, setSelectedRoute] = useState<'fastest' | 'safest' | 'shortest'>('fastest');
  const [transportMode, setTransportMode] = useState<'car' | 'bike' | 'walk'>('car');

  // Données simulées pour les routes
  const routes = {
    fastest: {
      duration: '12 min',
      distance: '5.2 km',
      traffic: 'Fluide',
      cost: '850 FCFA',
      color: 'from-green-500 to-green-600'
    },
    safest: {
      duration: '16 min', 
      distance: '6.1 km',
      traffic: 'Très fluide',
      cost: '920 FCFA',
      color: 'from-blue-500 to-blue-600'
    },
    shortest: {
      duration: '14 min',
      distance: '4.8 km', 
      traffic: 'Modéré',
      cost: '750 FCFA',
      color: 'from-purple-500 to-purple-600'
    }
  };

  const transportModes = {
    car: { icon: Car, label: 'Voiture', time: routes[selectedRoute].duration },
    bike: { icon: Bike, label: 'Moto', time: '8 min' },
    walk: { icon: Users, label: 'À pied', time: '45 min' }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Navigation className="w-5 h-5 text-primary" />
            Itinéraire vers {destination.name}
          </DialogTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{destination.address}</span>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 h-[calc(90vh-120px)]">
          {/* Panneau gauche - Options et informations */}
          <div className="lg:col-span-1 border-r border-border bg-muted/30 p-4 overflow-y-auto">
            {/* Mode de transport */}
            <div className="mb-6">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Mode de transport
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {Object.entries(transportModes).map(([mode, { icon: Icon, label, time }]) => (
                  <Button
                    key={mode}
                    variant={transportMode === mode ? "default" : "outline"}
                    className="w-full justify-start h-12"
                    onClick={() => setTransportMode(mode as any)}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    <div className="text-left">
                      <div className="font-medium">{label}</div>
                      <div className="text-xs opacity-70">{time}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Options de route */}
            <div className="mb-6">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Route className="w-4 h-4" />
                Type de route
              </h4>
              <div className="space-y-2">
                {Object.entries(routes).map(([routeType, info]) => (
                  <Button
                    key={routeType}
                    variant={selectedRoute === routeType ? "default" : "outline"}
                    className="w-full justify-start p-3 h-auto"
                    onClick={() => setSelectedRoute(routeType as any)}
                  >
                    <div className="text-left w-full">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium capitalize">
                          {routeType === 'fastest' && 'Plus rapide'}
                          {routeType === 'safest' && 'Plus sûr'} 
                          {routeType === 'shortest' && 'Plus court'}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {info.duration}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {info.distance} • Trafic {info.traffic}
                      </div>
                      {transportMode === 'car' && (
                        <div className="text-xs font-medium text-primary mt-1">
                          Coût estimé: {info.cost}
                        </div>
                      )}
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Informations détaillées */}
            <div className="space-y-4">
              <div className="p-3 bg-card rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="font-medium text-sm">Temps estimé</span>
                </div>
                <div className="text-2xl font-bold text-primary">
                  {transportModes[transportMode].time}
                </div>
                <div className="text-xs text-muted-foreground">
                  Arrivée prévue: {new Date(Date.now() + 12 * 60 * 1000).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              <div className="p-3 bg-card rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  <span className="font-medium text-sm">Conditions actuelles</span>
                </div>
                <div className="space-y-1 text-xs">
                  <div>• Trafic normal sur l'axe principal</div>
                  <div>• Pas de travaux signalés</div>
                  <div>• Météo favorable</div>
                </div>
              </div>
            </div>
          </div>

          {/* Panneau central et droite - Carte interactive */}
          <div className="lg:col-span-2 relative bg-gradient-to-br from-blue-50 via-green-50 to-purple-50 dark:from-blue-950/20 dark:via-green-950/20 dark:to-purple-950/20">
            {/* Fond de carte stylisé */}
            <div className="absolute inset-0">
              {/* Grille géographique */}
              <div className="absolute inset-0 opacity-10">
                <div className="grid grid-cols-8 grid-rows-8 h-full w-full">
                  {Array.from({ length: 64 }).map((_, i) => (
                    <div key={i} className="border border-muted/20" />
                  ))}
                </div>
              </div>

              {/* Routes stylisées */}
              <svg className="absolute inset-0 w-full h-full">
                {/* Route principale */}
                <path 
                  d="M10%,80% Q30%,60% 50%,50% Q70%,40% 90%,20%" 
                  stroke="currentColor" 
                  strokeWidth="8" 
                  fill="none" 
                  className={`bg-gradient-to-r ${routes[selectedRoute].color} opacity-60`}
                  strokeDasharray="5,5"
                />
                {/* Routes alternatives */}
                {selectedRoute !== 'safest' && (
                  <path 
                    d="M10%,80% Q20%,70% 40%,60% Q60%,50% 90%,20%" 
                    stroke="currentColor" 
                    strokeWidth="4" 
                    fill="none" 
                    className="text-gray-400 opacity-40"
                    strokeDasharray="3,3"
                  />
                )}
                {selectedRoute !== 'shortest' && (
                  <path 
                    d="M10%,80% Q50%,30% 90%,20%" 
                    stroke="currentColor" 
                    strokeWidth="4" 
                    fill="none" 
                    className="text-gray-400 opacity-40"
                    strokeDasharray="3,3"
                  />
                )}
              </svg>
            </div>

            {/* Point de départ (utilisateur) */}
            <div className="absolute bottom-[20%] left-[10%] flex flex-col items-center">
              <div className="w-6 h-6 bg-blue-500 rounded-full border-4 border-white shadow-lg animate-pulse">
                <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-30 -m-1"></div>
              </div>
              <div className="mt-2 px-2 py-1 bg-white/90 rounded-full text-xs font-medium shadow-md">
                Votre position
              </div>
            </div>

            {/* Point d'arrivée (destination) */}
            <div className="absolute top-[20%] right-[10%] flex flex-col items-center">
              <div className="w-8 h-8 bg-red-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <div className="mt-2 px-3 py-1 bg-white/90 rounded-full text-xs font-medium shadow-md max-w-32 text-center truncate">
                {destination.name}
              </div>
            </div>

            {/* Points d'intérêt sur la route */}
            <div className="absolute top-[45%] left-[35%] w-3 h-3 bg-yellow-400 rounded-full border-2 border-white shadow-md"></div>
            <div className="absolute top-[35%] right-[35%] w-3 h-3 bg-green-400 rounded-full border-2 border-white shadow-md"></div>

            {/* Indicateurs de trafic */}
            <div className="absolute top-4 right-4 space-y-2">
              <div className="bg-white/90 p-2 rounded-lg shadow-md text-xs">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Trafic fluide</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span>Trafic modéré</span>
                </div>
              </div>
            </div>

            {/* Informations sur la route sélectionnée */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-lg border">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${routes[selectedRoute].color}`}></div>
                    <span className="font-medium">
                      Route {selectedRoute === 'fastest' && 'la plus rapide'}
                      {selectedRoute === 'safest' && 'la plus sûre'}
                      {selectedRoute === 'shortest' && 'la plus courte'}
                    </span>
                  </div>
                  <Badge className="bg-primary/10 text-primary">
                    {routes[selectedRoute].duration}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div>Distance: {routes[selectedRoute].distance}</div>
                  <div>Trafic: {routes[selectedRoute].traffic}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t bg-muted/30 flex gap-3">
          <Button 
            className="flex-1 bg-primary hover:bg-primary/90"
            onClick={() => {
              // Logique pour démarrer la navigation
              onClose();
            }}
          >
            <Navigation className="w-4 h-4 mr-2" />
            Démarrer la navigation
          </Button>
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};