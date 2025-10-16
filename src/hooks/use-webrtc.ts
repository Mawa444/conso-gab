import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { createDomainLogger } from '@/lib/logger';

const logger = createDomainLogger('WebRTC');

interface WebRTCConfig {
  conversationId: string;
  userId: string;
  isInitiator: boolean;
  mediaType: 'audio' | 'video';
}

/**
 * Hook WebRTC pour les appels audio/vidéo
 * Utilise Supabase Realtime pour le signaling
 */
export const useWebRTC = (config: WebRTCConfig) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const channel = useRef<RealtimeChannel | null>(null);

  const ICE_SERVERS = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  useEffect(() => {
    if (!config.conversationId || !config.userId) return;

    initializeWebRTC();

    return () => {
      cleanup();
    };
  }, [config.conversationId, config.userId]);

  const initializeWebRTC = async () => {
    try {
      setIsConnecting(true);

      // Obtenir le stream local
      const constraints: MediaStreamConstraints = {
        audio: true,
        video: config.mediaType === 'video'
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);

      // Créer la connexion peer
      peerConnection.current = new RTCPeerConnection(ICE_SERVERS);

      // Ajouter les tracks locaux
      stream.getTracks().forEach(track => {
        peerConnection.current?.addTrack(track, stream);
      });

      // Gérer le stream distant
      peerConnection.current.ontrack = (event) => {
        logger.info('Remote track received', { streamId: event.streams[0]?.id });
        setRemoteStream(event.streams[0]);
        setIsConnected(true);
        setIsConnecting(false);
      };

      // Gérer ICE candidates
      peerConnection.current.onicecandidate = (event) => {
        if (event.candidate) {
          sendSignal('ice-candidate', event.candidate);
        }
      };

      // Gérer la déconnexion
      peerConnection.current.oniceconnectionstatechange = () => {
        const state = peerConnection.current?.iceConnectionState;
        logger.info('ICE connection state changed', { state });
        
        if (state === 'disconnected' || state === 'failed' || state === 'closed') {
          setIsConnected(false);
          cleanup();
        }
      };

      // Configurer le signaling via Supabase Realtime
      setupSignaling();

      // Si initiateur, créer l'offre
      if (config.isInitiator) {
        createOffer();
      }
    } catch (error) {
      console.error('Error initializing WebRTC:', error);
      setIsConnecting(false);
    }
  };

  const setupSignaling = () => {
    const channelName = `webrtc:${config.conversationId}`;
    
    channel.current = supabase.channel(channelName);

    channel.current
      .on('broadcast', { event: 'signal' }, async ({ payload }) => {
        await handleSignal(payload);
      })
      .subscribe((status) => {
        logger.info('Signaling channel status', { status });
      });
  };

  const sendSignal = (type: string, data: any) => {
    if (!channel.current) return;

    channel.current.send({
      type: 'broadcast',
      event: 'signal',
      payload: {
        type,
        data,
        from: config.userId
      }
    });
  };

  const handleSignal = async (payload: any) => {
    if (!peerConnection.current || payload.from === config.userId) return;

    const { type, data } = payload;

    try {
      switch (type) {
        case 'offer':
          await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data));
          const answer = await peerConnection.current.createAnswer();
          await peerConnection.current.setLocalDescription(answer);
          sendSignal('answer', answer);
          break;

        case 'answer':
          await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data));
          break;

        case 'ice-candidate':
          await peerConnection.current.addIceCandidate(new RTCIceCandidate(data));
          break;
      }
    } catch (error) {
      console.error('Error handling signal:', error);
    }
  };

  const createOffer = async () => {
    if (!peerConnection.current) return;

    try {
      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);
      sendSignal('offer', offer);
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  };

  const toggleAudio = () => {
    if (!localStream) return;
    const audioTrack = localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
    }
  };

  const toggleVideo = () => {
    if (!localStream) return;
    const videoTrack = localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
    }
  };

  const cleanup = () => {
    // Arrêter tous les tracks
    localStream?.getTracks().forEach(track => track.stop());
    remoteStream?.getTracks().forEach(track => track.stop());

    // Fermer la connexion peer
    peerConnection.current?.close();
    peerConnection.current = null;

    // Fermer le canal
    channel.current?.unsubscribe();
    channel.current = null;

    setLocalStream(null);
    setRemoteStream(null);
    setIsConnected(false);
    setIsConnecting(false);
  };

  return {
    localStream,
    remoteStream,
    isConnected,
    isConnecting,
    toggleAudio,
    toggleVideo,
    endCall: cleanup
  };
};
