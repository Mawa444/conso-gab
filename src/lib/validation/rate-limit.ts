/**
 * ============================================
 * RATE LIMITING
 * ============================================
 * Protection contre les abus et attaques DDoS
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

class RateLimiter {
  private storage: Map<string, RateLimitEntry>;
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number, windowMs: number) {
    this.storage = new Map();
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    
    // Cleanup ancien entries toutes les 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  /**
   * Vérifie si une requête est autorisée
   * @param identifier Identifiant unique (user_id, IP, etc.)
   * @returns true si autorisé, false si rate limit dépassé
   */
  check(identifier: string): boolean {
    const now = Date.now();
    const entry = this.storage.get(identifier);

    if (!entry || now > entry.resetAt) {
      // Nouveau compteur ou fenêtre expirée
      this.storage.set(identifier, {
        count: 1,
        resetAt: now + this.windowMs
      });
      return true;
    }

    if (entry.count >= this.maxRequests) {
      // Rate limit dépassé
      return false;
    }

    // Incrémenter le compteur
    entry.count++;
    return true;
  }

  /**
   * Obtient le temps restant avant reset (en ms)
   */
  getResetTime(identifier: string): number {
    const entry = this.storage.get(identifier);
    if (!entry) return 0;
    
    const remaining = entry.resetAt - Date.now();
    return Math.max(0, remaining);
  }

  /**
   * Nettoie les entrées expirées
   */
  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.storage.entries()) {
      if (now > entry.resetAt) {
        this.storage.delete(key);
      }
    }
  }

  /**
   * Reset manuel d'un identifier
   */
  reset(identifier: string) {
    this.storage.delete(identifier);
  }
}

/**
 * ============================================
 * INSTANCES PRÉ-CONFIGURÉES
 * ============================================
 */

// Business creation: 5 créations par heure
export const businessCreationLimiter = new RateLimiter(5, 60 * 60 * 1000);

// Catalog creation: 20 créations par heure
export const catalogCreationLimiter = new RateLimiter(20, 60 * 60 * 1000);

// Product creation: 50 créations par heure
export const productCreationLimiter = new RateLimiter(50, 60 * 60 * 1000);

// API calls: 100 requêtes par minute
export const apiCallLimiter = new RateLimiter(100, 60 * 1000);

// Messages: 30 messages par minute
export const messageLimiter = new RateLimiter(30, 60 * 1000);

/**
 * Helper pour vérifier et gérer le rate limit
 */
export function checkRateLimit(
  limiter: RateLimiter,
  identifier: string
): { allowed: true } | { allowed: false; retryAfter: number } {
  const allowed = limiter.check(identifier);
  
  if (!allowed) {
    const retryAfter = Math.ceil(limiter.getResetTime(identifier) / 1000);
    return { allowed: false, retryAfter };
  }
  
  return { allowed: true };
}