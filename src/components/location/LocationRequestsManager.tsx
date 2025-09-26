import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MapPin, 
  Clock, 
  User, 
  CheckCircle, 
  XCircle,
  ExternalLink,
  Navigation,
  AlertTriangle,
  Eye
} from "lucide-react";
import { useLocationSecurity } from "@/hooks/use-location-security";
import { useGeocoding } from "@/hooks/use-geocoding";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface LocationRequestsManagerProps {
  className?: string;
}

export const LocationRequestsManager = ({ className }: LocationRequestsManagerProps) => {
  const { 
    requests, 
    isLoading, 
    loadLocationRequests, 
    respondToLocationRequest, 
    getSharedLocation, 
    generateMapsLink 
  } = useLocationSecurity();
  const { getDetailedLocation } = useGeocoding();
  
  const [respondingTo, setRespondingTo] = useState<string | null>(null);

  useEffect(() => {
    loadLocationRequests();
  }, []);

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const sentRequests = requests.filter(r => r.target_id !== getCurrentUserId());
  const receivedRequests = requests.filter(r => r.target_id === getCurrentUserId());

  // Helper function - en production, obtenir depuis le contexte auth
  function getCurrentUserId() {
    return "current-user-id"; // À remplacer par l'ID utilisateur réel
  }

  const handleAcceptRequest = async (requestId: string) => {
    setRespondingTo(requestId);
    try {
      const location = await getDetailedLocation();
      if (location) {
        await respondToLocationRequest(requestId, 'accept', {
          latitude: location.latitude,
          longitude: location.longitude,
          address: location.road,
          formatted_address: location.formattedAddress
        });
        toast.success("Position partagée avec succès");
      } else {
        toast.error("Impossible d'obtenir votre position");
      }
    } catch (error) {
      console.error('Erreur acceptation demande:', error);
      toast.error("Erreur lors du partage de position");
    } finally {
      setRespondingTo(null);
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    setRespondingTo(requestId);
    try {
      await respondToLocationRequest(requestId, 'decline');
      toast.success("Demande refusée");
    } catch (error) {
      console.error('Erreur refus demande:', error);
      toast.error("Erreur lors du refus");
    } finally {
      setRespondingTo(null);
    }
  };

  const openInMaps = (request: any) => {
    const sharedLocation = getSharedLocation(request);
    if (sharedLocation) {
      const mapsUrl = generateMapsLink(sharedLocation);
      window.open(mapsUrl, '_blank');
    }
  };

  const getStatusBadge = (status: string, expiresAt: string) => {
    const isExpired = new Date(expiresAt) < new Date();
    
    switch (status) {
      case 'pending':
        return isExpired ? (
          <Badge variant="destructive">Expirée</Badge>
        ) : (
          <Badge variant="outline">En attente</Badge>
        );
      case 'accepted':
        return isExpired ? (
          <Badge variant="secondary">Expirée</Badge>
        ) : (
          <Badge variant="default" className="bg-green-500">Acceptée</Badge>
        );
      case 'declined':
        return <Badge variant="destructive">Refusée</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPurposeIcon = (purpose: string) => {
    switch (purpose) {
      case 'delivery': return '🚚';
      case 'meeting': return '🤝';
      case 'visit': return '🏠';
      default: return '📍';
    }
  };

  return (
    <div className={className}>
      <Tabs defaultValue="received" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="received" className="flex items-center gap-2">
            <Navigation className="w-4 h-4" />
            Reçues ({receivedRequests.length})
          </TabsTrigger>
          <TabsTrigger value="sent" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Envoyées ({sentRequests.length})
          </TabsTrigger>
        </TabsList>

        {/* Demandes reçues */}
        <TabsContent value="received" className="space-y-4">
          {receivedRequests.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Navigation className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucune demande de position reçue</p>
              </CardContent>
            </Card>
          ) : (
            receivedRequests.map((request) => {
              const isExpired = new Date(request.expires_at) < new Date();
              const isPending = request.status === 'pending' && !isExpired;
              
              return (
                <Card key={request.id} className={isPending ? "border-primary/50" : ""}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <span className="text-lg">{getPurposeIcon(request.purpose)}</span>
                          Demande de position
                          {getStatusBadge(request.status, request.expires_at)}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          De: {request.requester_id} • {format(new Date(request.created_at), 'dd MMM yyyy à HH:mm', { locale: fr })}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>Type: {request.share_mode === 'one_time' ? 'Unique' : 'En direct'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>Expire: {format(new Date(request.expires_at), 'HH:mm', { locale: fr })}</span>
                      </div>
                    </div>

                    {isPending && (
                      <div className="flex items-center gap-3 pt-2">
                        <Button 
                          onClick={() => handleAcceptRequest(request.id)}
                          disabled={respondingTo === request.id}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {respondingTo === request.id ? 'Partage...' : 'Partager ma position'}
                        </Button>
                        <Button 
                          onClick={() => handleDeclineRequest(request.id)}
                          disabled={respondingTo === request.id}
                          variant="outline"
                          size="sm"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Refuser
                        </Button>
                      </div>
                    )}

                    {request.status === 'accepted' && !isExpired && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-sm text-green-700 mb-2">
                          ✅ Position partagée avec succès
                        </p>
                        <p className="text-xs text-green-600">
                          La position restera accessible jusqu'à {format(new Date(request.expires_at), 'HH:mm', { locale: fr })}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        {/* Demandes envoyées */}
        <TabsContent value="sent" className="space-y-4">
          {sentRequests.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Eye className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucune demande de position envoyée</p>
              </CardContent>
            </Card>
          ) : (
            sentRequests.map((request) => {
              const isExpired = new Date(request.expires_at) < new Date();
              const sharedLocation = getSharedLocation(request);
              
              return (
                <Card key={request.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <span className="text-lg">{getPurposeIcon(request.purpose)}</span>
                          À: {request.target_id}
                          {getStatusBadge(request.status, request.expires_at)}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Envoyée le {format(new Date(request.created_at), 'dd MMM yyyy à HH:mm', { locale: fr })}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>Type: {request.share_mode === 'one_time' ? 'Unique' : 'En direct'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>Expire: {format(new Date(request.expires_at), 'HH:mm', { locale: fr })}</span>
                      </div>
                    </div>

                    {request.status === 'accepted' && sharedLocation && !isExpired && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-blue-700 mb-1">
                              📍 Position reçue
                            </p>
                            <p className="text-xs text-blue-600">
                              {sharedLocation.formatted_address || `${sharedLocation.latitude}, ${sharedLocation.longitude}`}
                            </p>
                          </div>
                          <Button 
                            onClick={() => openInMaps(request)}
                            size="sm"
                            variant="outline"
                            className="text-blue-600 border-blue-300"
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Ouvrir
                          </Button>
                        </div>
                      </div>
                    )}

                    {request.status === 'pending' && isExpired && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-orange-500" />
                          <p className="text-sm text-orange-700">Demande expirée</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};