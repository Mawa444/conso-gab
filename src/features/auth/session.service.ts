/**
 * ============================================
 * SESSION SERVICE - localStorage management
 * ============================================
 * Gestion centralisée des sessions utilisateur
 */

export class SessionService {
  private static readonly SESSION_ID_KEY = 'gb_session_id';
  private static readonly SESSION_STARTED_KEY = 'gb_session_started_at';
  private static readonly WELCOME_SHOWN_KEY = 'gb_welcome_shown';
  private static readonly LAST_LOGOUT_KEY = 'gb_last_logout_at';

  /**
   * Initialise une nouvelle session utilisateur
   */
  static initSession(userId: string): void {
    try {
      const sessionId = `${userId}-${Date.now()}`;
      localStorage.setItem(this.SESSION_ID_KEY, sessionId);
      localStorage.setItem(this.SESSION_STARTED_KEY, String(Date.now()));
      localStorage.setItem(this.WELCOME_SHOWN_KEY, 'false');
    } catch (error) {
      console.warn('Failed to initialize session in localStorage:', error);
      // Ignore localStorage errors (Safari private mode, etc.)
    }
  }

  /**
   * Nettoie les données de session
   */
  static clearSession(): void {
    try {
      localStorage.setItem(this.LAST_LOGOUT_KEY, String(Date.now()));
      localStorage.removeItem(this.SESSION_ID_KEY);
      localStorage.removeItem(this.WELCOME_SHOWN_KEY);
    } catch (error) {
      console.warn('Failed to clear session in localStorage:', error);
    }
  }

  /**
   * Récupère les informations de session
   */
  static getSessionInfo(): {
    sessionId: string | null;
    sessionStartedAt: number | null;
    welcomeShown: boolean;
    lastLogoutAt: number | null;
  } {
    try {
      return {
        sessionId: localStorage.getItem(this.SESSION_ID_KEY),
        sessionStartedAt: Number(localStorage.getItem(this.SESSION_STARTED_KEY)) || null,
        welcomeShown: localStorage.getItem(this.WELCOME_SHOWN_KEY) === 'true',
        lastLogoutAt: Number(localStorage.getItem(this.LAST_LOGOUT_KEY)) || null,
      };
    } catch (error) {
      console.warn('Failed to get session info from localStorage:', error);
      return {
        sessionId: null,
        sessionStartedAt: null,
        welcomeShown: false,
        lastLogoutAt: null,
      };
    }
  }

  /**
   * Marque le message de bienvenue comme affiché
   */
  static markWelcomeAsShown(): void {
    try {
      localStorage.setItem(this.WELCOME_SHOWN_KEY, 'true');
    } catch (error) {
      console.warn('Failed to mark welcome as shown:', error);
    }
  }
}
