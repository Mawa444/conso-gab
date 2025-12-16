/**
 * Event Tracker
 * Service principal de tracking analytics (modulaire)
 */

import { supabase } from '@/integrations/supabase/client';
import { DeviceDetector } from './utils/device-detector';
import { SessionManager } from './utils/session-manager';
import { EventQueue } from './utils/event-queue';
import { AnalyticsRepository, type AnalyticsEventData } from './repository/analytics.repository';

export type EventType = 'VIEW' | 'LIKE' | 'COMMENT' | 'SHARE' | 'CLICK' | 'CONVERSION';
export type EventCategory = 'PROFILE' | 'CATALOG' | 'IMAGE' | 'CONTACT';

export interface TrackEventOptions {
  business_id: string;
  event_type: EventType;
  event_category?: EventCategory;
  target_id?: string;
  metadata?: Record<string, any>;
}

export class EventTracker {
  private static queue: EventQueue | null = null;
  private static isInitialized = false;

  /**
   * Initialise le tracker
   */
  static initialize(): void {
    if (this.isInitialized) return;

    this.queue = new EventQueue(async (events) => {
      const analyticsEvents = events.map(e => e.data);
      await AnalyticsRepository.insertEvents(analyticsEvents);
    });

    this.isInitialized = true;
  }

  /**
   * Track un événement
   */
  static async track(options: TrackEventOptions): Promise<void> {
    try {
      // Initialiser si nécessaire
      if (!this.isInitialized) {
        this.initialize();
      }

      // Obtenir l'utilisateur actuel
      const { data: { user } } = await supabase.auth.getUser();

      // Construire l'événement
      const event: AnalyticsEventData = {
        ...options,
        user_id: user?.id,
        device_type: DeviceDetector.detect(),
        session_id: SessionManager.getSessionId(),
        user_agent: DeviceDetector.getUserAgent(),
      };

      // Ajouter à la queue
      this.queue!.enqueue(event);

      // Rafraîchir l'activité de session
      SessionManager.refreshActivity();
    } catch (error) {
      // Ne jamais faire crasher l'app à cause d'analytics
      console.error('Analytics tracking error:', error);
    }
  }

  /**
   * Force le flush de la queue
   */
  static async flush(): Promise<void> {
    if (this.queue) {
      await this.queue.flush();
    }
  }

  /**
   * Arrête le tracker
   */
  static stop(): void {
    if (this.queue) {
      this.queue.stop();
      this.queue = null;
    }
    this.isInitialized = false;
  }
}

// Auto-initialize
if (typeof window !== 'undefined') {
  EventTracker.initialize();
}
