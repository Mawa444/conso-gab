// Définition de l'alias de type pour la clarté
type ActivityEventType = keyof WindowEventMap;

const activityEvents: ActivityEventType[] = ["mousemove", "keydown", "scroll", "click", "touchstart"];

/**
 * Service de suivi de l'activité utilisateur pour détecter l'inactivité.
 * Implémenté comme une classe pour encapsuler l'état et garantir les références
 * correctes pour l'ajout/suppression des event listeners.
 */
class ActivityTracker {
  // L'identifiant du timer
  private timer: NodeJS.Timeout | null = null;
  // La fonction de rappel à exécuter en cas d'inactivité
  private onInactiveCallback: (() => void) | null = null;
  // La durée d'inactivité avant le déclenchement
  private timeoutDuration: number = 40000;

  // Référence de la fonction de gestion d'événement (ESSENTIEL)
  // Utilisation d'une fonction fléchée pour lier 'this' à l'instance
  private handleActivity = () => {
    this.resetTimer();
  };

  /**
   * Démarre le suivi de l'activité.
   * @param onInactive La fonction à appeler après la période d'inactivité.
   * @param inactiveTimeout La durée en millisecondes (par défaut : 40s).
   */
  public start(onInactive: () => void, inactiveTimeout: number = 40000): void {
    // 1. Nettoyer tout suivi antérieur pour éviter les duplicatas
    this.stop();

    // 2. Sauvegarder les paramètres
    this.onInactiveCallback = onInactive;
    this.timeoutDuration = inactiveTimeout;

    // 3. Ajouter les listeners d'événements
    activityEvents.forEach((event) => {
      // Notez que nous utilisons 'this.handleActivity' comme référence
      window.addEventListener(event, this.handleActivity, { passive: true });
    });

    // 4. Démarrer le timer initial
    this.resetTimer();
  }

  /**
   * Arrête le suivi, retire tous les event listeners et nettoie le timer.
   */
  public stop(): void {
    // 1. Nettoyer le timer existant
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    // 2. Retirer les listeners d'événements
    activityEvents.forEach((event) => {
      // Il est crucial d'utiliser la MÊME référence de fonction pour removeEventListener
      window.removeEventListener(event, this.handleActivity);
    });

    // 3. Nettoyer les références
    this.onInactiveCallback = null;
  }

  /**
   * Réinitialise le timer d'inactivité.
   */
  private resetTimer(): void {
    if (this.timer) {
      clearTimeout(this.timer);
    }

    if (this.onInactiveCallback) {
      // Le timer appelle la fonction de rappel après le délai
      this.timer = setTimeout(() => {
        this.onInactiveCallback!();
        // Optionnel: Vous pouvez appeler 'this.stop()' ici si vous voulez que le suivi s'arrête après la première inactivité.
      }, this.timeoutDuration);
    }
  }
}

// Exporter une seule instance (Singleton) pour garantir que l'état est partagé
export const ActivityTrackerService = new ActivityTracker();
