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
  conversation_id?: string | null;
  requester_id: string;
  target_id: string;
  status: string;
  share_mode: string;
  purpose: string;
  expires_at: string;
  shared_location?: any;
  shared_at?: string | null;
  created_at: string;
  updated_at: string;
}

export const useLocationSecurity = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [requests, setRequests] = useState<LocationRequest[]>([]);

  // Chiffrement simple pour les coordonnées (en production, utiliser une bibliothèque crypto robuste)
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

      if (locationType === 'home') {
        const { error } = await supabase
          .from('user_profiles')
          .update({
            home_location: encryptedLocation,
            location_updated_at: new Date().toISOString()
          })
          .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('business_profiles')
          .update({
            office_location: encryptedLocation,
            office_location_updated_at: new Date().toISOString()
          })
          .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

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
    conversationId: string,
    purpose: LocationRequest['purpose'],
    shareMode: LocationRequest['share_mode'] = 'one_time'
  ) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('location_requests')
        .insert({
          conversation_id: conversationId,
          requester_id: (await supabase.auth.getUser()).data.user?.id,
          target_id: targetUserId,
          purpose,
          share_mode: shareMode,
          expires_at: new Date(Date.now() + (shareMode === 'one_time' ? 30 * 60 * 1000 : 2 * 60 * 60 * 1000)).toISOString()
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
      let updateData: any = {
        status: action === 'accept' ? 'accepted' : 'declined',
        shared_at: action === 'accept' ? new Date().toISOString() : null
      };

      if (action === 'accept' && userLocation) {
        updateData.shared_location = {
          encrypted_data: encryptLocation(userLocation),
          shared_at: new Date().toISOString()
        };

        // Ajouter à l'historique
        await supabase
          .from('location_share_history')
          .insert({
            request_id: requestId,
            shared_by: (await supabase.auth.getUser()).data.user?.id,
            shared_to: requests.find(r => r.id === requestId)?.requester_id,
            share_mode: requests.find(r => r.id === requestId)?.share_mode || 'one_time',
            purpose: requests.find(r => r.id === requestId)?.purpose || 'general',
            location_data: { encrypted_data: encryptLocation(userLocation) },
            expires_at: requests.find(r => r.id === requestId)?.expires_at || new Date().toISOString()
          });
      }

      const { error } = await supabase
        .from('location_requests')
        .update(updateData)
        .eq('id', requestId);

      if (error) throw error;

      toast.success(action === 'accept' ? 'Position partagée' : 'Demande refusée');
      loadLocationRequests(); // Recharger les demandes
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
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) return;

      const { data, error } = await supabase
        .from('location_requests')
        .select('*')
        .or(`requester_id.eq.${userId},target_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests((data || []) as LocationRequest[]);
    } catch (error: any) {
      console.error('Erreur chargement demandes:', error);
    }
  };

  // Obtenir la position déchiffrée d'une demande acceptée
  const getSharedLocation = (request: LocationRequest): LocationData | null => {
    if (request.status !== 'accepted' || !request.shared_location) return null;
    
    const encrypted = (request.shared_location as any).encrypted_data;
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