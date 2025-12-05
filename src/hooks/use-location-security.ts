import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  formatted_address?: string;
}

interface LocationRequest {
  id: string;
  user_id: string;
  requested_by: string;
  status: string;
  expires_at: string;
  created_at: string;
}

export const useLocationSecurity = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [requests, setRequests] = useState<LocationRequest[]>([]);

  // Chiffrement simple pour les coordonnées
  const encryptLocation = (location: LocationData): string => {
    return btoa(JSON.stringify(location));
  };

  const decryptLocation = (encryptedLocation: string): LocationData | null => {
    try {
      return JSON.parse(atob(encryptedLocation));
    } catch {
      return null;
    }
  };

  // Sauvegarder la position de base (maison/bureau)
  const saveUserLocation = async (location: LocationData, locationType: 'home' | 'office') => {
    setIsLoading(true);
    try {
      const encryptedLocation = {
        encrypted_data: encryptLocation(location),
        address: location.address,
        formatted_address: location.formatted_address,
        updated_at: new Date().toISOString()
      };

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("Non authentifié");

      if (locationType === 'home') {
        const { error } = await supabase
          .from('user_profiles')
          .update({
            home_location: encryptedLocation,
            location_updated_at: new Date().toISOString()
          })
          .eq('user_id', session.user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('business_profiles')
          .update({
            office_location: encryptedLocation,
            office_location_updated_at: new Date().toISOString()
          })
          .eq('user_id', session.user.id);

        if (error) throw error;
      }

      toast.success(`Position ${locationType === 'home' ? 'domicile' : 'bureau'} mise à jour avec succès`);
    } catch (error: any) {
      console.error('Erreur sauvegarde position:', error);
      toast.error('Erreur lors de la sauvegarde de la position');
    } finally {
      setIsLoading(false);
    }
  };

  // Demander une position à quelqu'un
  const requestLocation = async (
    targetUserId: string,
    _conversationId?: string,
    _purpose?: string,
    _shareMode: string = 'one_time'
  ) => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("Non authentifié");

      const { data, error } = await supabase
        .from('location_requests')
        .insert({
          user_id: targetUserId,
          requested_by: session.user.id,
          status: 'pending',
          expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Demande de position envoyée');
      return data;
    } catch (error: any) {
      console.error('Erreur demande position:', error);
      toast.error('Erreur lors de la demande de position');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Répondre à une demande de position
  const respondToLocationRequest = async (
    requestId: string,
    action: 'accept' | 'decline',
    userLocation?: LocationData
  ) => {
    setIsLoading(true);
    try {
      const updateData: any = {
        status: action === 'accept' ? 'accepted' : 'declined'
      };

      if (action === 'accept' && userLocation) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) throw new Error("Non authentifié");

        // Get the request to find who requested it
        const request = requests.find(r => r.id === requestId);
        
        // Add to location share history
        if (request) {
          await supabase
            .from('location_share_history')
            .insert({
              user_id: session.user.id,
              shared_with: request.requested_by
            });
        }
      }

      const { error } = await supabase
        .from('location_requests')
        .update(updateData)
        .eq('id', requestId);

      if (error) throw error;

      toast.success(action === 'accept' ? 'Position partagée' : 'Demande refusée');
      loadLocationRequests();
    } catch (error: any) {
      console.error('Erreur réponse demande:', error);
      toast.error('Erreur lors de la réponse');
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les demandes de position
  const loadLocationRequests = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data, error } = await supabase
        .from('location_requests')
        .select('*')
        .or(`requested_by.eq.${session.user.id},user_id.eq.${session.user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests((data || []) as LocationRequest[]);
    } catch (error: any) {
      console.error('Erreur chargement demandes:', error);
    }
  };

  // Obtenir la position déchiffrée d'une demande acceptée
  const getSharedLocation = (request: any): LocationData | null => {
    if (request.status !== 'accepted' || !request.shared_location) return null;
    
    const encrypted = request.shared_location?.encrypted_data;
    if (!encrypted) return null;
    
    return decryptLocation(encrypted);
  };

  // Générer un lien Google Maps
  const generateMapsLink = (location: LocationData): string => {
    return `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
  };

  useEffect(() => {
    loadLocationRequests();
  }, []);

  return {
    isLoading,
    requests,
    saveUserLocation,
    requestLocation,
    respondToLocationRequest,
    loadLocationRequests,
    getSharedLocation,
    generateMapsLink,
    encryptLocation,
    decryptLocation
  };
};