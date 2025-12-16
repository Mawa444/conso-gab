/**
 * Event Queue
 * File d'attente pour batching des événements analytics
 */

export interface QueuedEvent {
  id: string;
  data: any;
  timestamp: number;
  retries: number;
}

export class EventQueue {
  private queue: QueuedEvent[] = [];
  private isProcessing = false;
  private readonly maxQueueSize = 50;
  private readonly flushInterval = 5000; // 5 secondes
  private readonly maxRetries = 3;
  private flushTimer: NodeJS.Timeout | null = null;

  constructor(
    private onFlush: (events: QueuedEvent[]) => Promise<void>
  ) {
    this.startAutoFlush();
  }

  /**
   * Ajoute un événement à la queue
   */
  enqueue(data: any): void {
    const event: QueuedEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      data,
      timestamp: Date.now(),
      retries: 0
    };

    this.queue.push(event);

    // Flush automatique si la queue est pleine
    if (this.queue.length >= this.maxQueueSize) {
      this.flush();
    }
  }

  /**
   * Vide la queue et envoie les événements
   */
  async flush(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;
    const eventsToSend = [...this.queue];
    this.queue = [];

    try {
      await this.onFlush(eventsToSend);
    } catch (error) {
      console.error('Error flushing events:', error);
      
      // Remettre les événements en queue avec retry
      const retriableEvents = eventsToSend
        .filter(e => e.retries < this.maxRetries)
        .map(e => ({ ...e, retries: e.retries + 1 }));
      
      this.queue.unshift(...retriableEvents);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Démarre le flush automatique
   */
  private startAutoFlush(): void {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  /**
   * Arrête le flush automatique
   */
  stop(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }

  /**
   * Obtient la taille de la queue
   */
  size(): number {
    return this.queue.length;
  }
}
