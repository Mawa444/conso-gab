import { useCallback } from 'react';
import { toast } from 'sonner';
import { PostgrestError } from '@supabase/supabase-js';

interface ErrorHandlerOptions {
  showToast?: boolean;
  toastTitle?: string;
  logError?: boolean;
  customMessage?: string;
}

/**
 * Hook unifié pour gérer les erreurs de manière cohérente
 * Remplace les multiples façons de gérer les erreurs dans l'app
 */
export const useErrorHandler = () => {
  const handleError = useCallback((
    error: unknown,
    options: ErrorHandlerOptions = {}
  ): string => {
    const {
      showToast = true,
      toastTitle = 'Erreur',
      logError = true,
      customMessage
    } = options;

    // Log l'erreur pour debugging
    if (logError) {
      console.error('Application error:', error);
    }

    // Déterminer le message d'erreur
    let errorMessage = customMessage || 'Une erreur inattendue est survenue';

    if (error instanceof Error) {
      errorMessage = customMessage || error.message;
    } else if (isPostgrestError(error)) {
      errorMessage = customMessage || getPostgrestErrorMessage(error);
    } else if (typeof error === 'string') {
      errorMessage = customMessage || error;
    }

    // Afficher le toast si demandé
    if (showToast) {
      toast.error(toastTitle, {
        description: errorMessage
      });
    }

    return errorMessage;
  }, []);

  const handleSuccess = useCallback((
    message: string,
    title: string = 'Succès'
  ) => {
    toast.success(title, {
      description: message
    });
  }, []);

  const handleWarning = useCallback((
    message: string,
    title: string = 'Attention'
  ) => {
    toast.warning(title, {
      description: message
    });
  }, []);

  return {
    handleError,
    handleSuccess,
    handleWarning
  };
};

// Helpers

function isPostgrestError(error: unknown): error is PostgrestError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error
  );
}

function getPostgrestErrorMessage(error: PostgrestError): string {
  // Messages personnalisés pour codes d'erreur communs
  const errorMessages: Record<string, string> = {
    '23505': 'Cet élément existe déjà',
    '23503': 'Référence invalide à un élément inexistant',
    '23502': 'Champ obligatoire manquant',
    '42501': 'Vous n\'avez pas les permissions nécessaires',
    'PGRST116': 'Aucun résultat trouvé',
    'PGRST301': 'Limite de débit atteinte, veuillez réessayer'
  };

  return errorMessages[error.code] || error.message;
}

/**
 * Wrapper pour les try-catch async avec gestion d'erreur automatique
 */
export async function withErrorHandler<T>(
  fn: () => Promise<T>,
  options: ErrorHandlerOptions = {}
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    const handler = useErrorHandler();
    handler.handleError(error, options);
    return null;
  }
}
