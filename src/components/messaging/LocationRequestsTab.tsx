import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Clock, Check, X, Share } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LocationRequest {
  id: string;
  requester_id: string;
  target_id: string;
  share_mode: string;
  status: string;
  purpose: string;
  expires_at: string;
  created_at: string;
  conversation_id: string;
  shared_location?: any;
  shared_at?: string;
}

export const LocationRequestsTab = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<LocationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchLocationRequests();
    }
  }, [user]);

  const fetchLocationRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('location_requests')
        .select('*')
        .or(`requester_id.eq.${user?.id},target_id.eq.${user?.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching location requests:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les demandes de position",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    if (!user || !navigator.geolocation) return;

    setActionLoading(requestId);
    try {
      // Get current location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });

      const locationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: new Date().toISOString()
      };

      // Update location request
      const { error: updateError } = await supabase
        .from('location_requests')
        .update({
          status: 'accepted',
          shared_location: locationData,
          shared_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (updateError) throw updateError;

      // Create location share history record
      const request = requests.find(r => r.id === requestId);
      if (request) {
        await supabase
          .from('location_share_history')
          .insert({
            request_id: requestId,
            shared_by: user.id,
            shared_to: request.requester_id,
            location_data: locationData,
            share_mode: request.share_mode,
            purpose: request.purpose,
            expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes
          });
      }

      toast({
        title: "Position partagée",
        description: "Votre position a été partagée avec succès"
      });

      fetchLocationRequests();

    } catch (error) {
      console.error('Error accepting location request:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de partager la position",
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    setActionLoading(requestId);
    try {
      const { error } = await supabase
        .from('location_requests')
        .update({ status: 'declined' })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Demande refusée",
        description: "La demande de position a été refusée"
      });

      fetchLocationRequests();

    } catch (error) {
      console.error('Error declining location request:', error);
      toast({
        title: "Erreur",
        description: "Impossible de refuser la demande",
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 1) return 'À l\'instant';
    if (diffMinutes < 60) return `il y a ${diffMinutes}min`;
    if (diffMinutes < 1440) return `il y a ${Math.floor(diffMinutes / 60)}h`;
    return date.toLocaleDateString('fr-FR');
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  const getStatusBadge = (request: LocationRequest) => {
    if (isExpired(request.expires_at) && request.status === 'pending') {
      return <Badge variant="secondary">Expiré</Badge>;
    }
    
    switch (request.status) {
      case 'pending':
        return <Badge variant="default">En attente</Badge>;
      case 'accepted':
        return <Badge variant="secondary" className="bg-green-500/10 text-green-700">Accepté</Badge>;
      case 'declined':
        return <Badge variant="secondary" className="bg-red-500/10 text-red-700">Refusé</Badge>;
      default:
        return <Badge variant="outline">{request.status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <MapPin className="w-8 h-8 animate-pulse mx-auto text-primary" />
          <p className="text-muted-foreground">Chargement des demandes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Demandes de position</h3>
        <Badge variant="outline">
          {requests.filter(r => r.status === 'pending' && !isExpired(r.expires_at)).length} en attente
        </Badge>
      </div>

      <ScrollArea className="h-[calc(100vh-300px)]">
        {requests.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <MapPin className="w-12 h-12 mx-auto text-muted-foreground" />
            <div>
              <h3 className="text-lg font-medium">Aucune demande de position</h3>
              <p className="text-muted-foreground">
                Les demandes de partage de position apparaîtront ici
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((request) => {
              const isReceived = request.target_id === user?.id;
              const isPending = request.status === 'pending' && !isExpired(request.expires_at);
              
              return (
                <Card key={request.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          {isReceived ? <MapPin className="w-4 h-4 text-primary" /> : <Share className="w-4 h-4 text-primary" />}
                        </div>
                        <div>
                          <p className="font-medium">
                            {isReceived ? 'Demande reçue' : 'Demande envoyée'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Mode: {request.share_mode === 'one_time' ? 'Une fois' : 'Live'}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(request)}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(request.created_at)}
                      </div>
                      {request.purpose && (
                        <div>Raison: {request.purpose}</div>
                      )}
                    </div>

                    {isExpired(request.expires_at) && request.status === 'pending' && (
                      <div className="text-xs text-red-600 mb-3">
                        Expiré le {new Date(request.expires_at).toLocaleString('fr-FR')}
                      </div>
                    )}

                    {request.status === 'accepted' && request.shared_at && (
                      <div className="text-xs text-green-600 mb-3">
                        Position partagée le {new Date(request.shared_at).toLocaleString('fr-FR')}
                      </div>
                    )}

                    {/* Actions pour les demandes reçues en attente */}
                    {isReceived && isPending && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleAcceptRequest(request.id)}
                          disabled={actionLoading === request.id}
                          className="gap-2"
                        >
                          <Check className="w-3 h-3" />
                          Accepter
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeclineRequest(request.id)}
                          disabled={actionLoading === request.id}
                          className="gap-2"
                        >
                          <X className="w-3 h-3" />
                          Refuser
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default LocationRequestsTab;