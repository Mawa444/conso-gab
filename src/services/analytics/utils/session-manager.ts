/**
 * Session Manager
 * Gère les sessions utilisateur pour le tracking analytics
 */

const SESSION_KEY = 'analytics_session_id';
const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes

export class SessionManager {
  private static currentSessionId: string | null = null;
  private static lastActivityTime: number = Date.now();

  /**
   * Obtient ou crée un ID de session
   */
  static getSessionId(): string {
    const now = Date.now();
    const timeSinceLastActivity = now - this.lastActivityTime;

    // Si la session a expiré, créer une nouvelle
    if (timeSinceLastActivity > SESSION_DURATION) {
      this.createNewSession();
    }

    // Si pas de session en mémoire, essayer de récupérer depuis sessionStorage
    if (!this.currentSessionId) {
      this.currentSessionId = sessionStorage.getItem(SESSION_KEY);
      
      // Si toujours pas de session, en créer une nouvelle
      if (!this.currentSessionId) {
        this.createNewSession();
      }
    }

    this.lastActivityTime = now;
    return this.currentSessionId!;
  }

  /**
   * Crée une nouvelle session
   */
  private static createNewSession(): void {
    this.currentSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem(SESSION_KEY, this.currentSessionId);
    this.lastActivityTime = Date.now();
  }

  /**
   * Termine la session actuelle
   */
  static endSession(): void {
    sessionStorage.removeItem(SESSION_KEY);
    this.currentSessionId = null;
  }

  /**
   * Rafraîchit l'activité de la session
   */
  static refreshActivity(): void {
    this.lastActivityTime = Date.now();
  }
}
