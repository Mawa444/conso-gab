import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { z } from 'zod';
import { toast } from 'sonner';

/**
 * Hook pour créer des mutations validées avec Zod
 * Empêche l'envoi de données invalides à Supabase
 */
export function useValidatedMutation<TSchema extends z.ZodType, TData, TVariables extends z.infer<TSchema>>(
  schema: TSchema,
  mutationFn: (validatedData: z.infer<TSchema>) => Promise<TData>,
  options?: Omit<UseMutationOptions<TData, Error, TVariables>, 'mutationFn'>
) {
  return useMutation<TData, Error, TVariables>({
    ...options,
    mutationFn: async (variables: TVariables) => {
      // Validation des données avec Zod
      const validation = schema.safeParse(variables);
      
      if (!validation.success) {
        const errors = validation.error.errors.map(e => e.message).join(', ');
        toast.error('Données invalides', {
          description: errors
        });
        throw new Error(`Validation failed: ${errors}`);
      }
      
      // Exécuter la mutation avec les données validées
      return mutationFn(validation.data);
    }
  });
}

/**
 * Valider des données sans mutation
 * Utile pour validation côté client uniquement
 */
export function validateData<TSchema extends z.ZodType>(
  schema: TSchema,
  data: unknown
): { success: true; data: z.infer<TSchema> } | { success: false; errors: string[] } {
  const validation = schema.safeParse(data);
  
  if (!validation.success) {
    return {
      success: false,
      errors: validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
    };
  }
  
  return {
    success: true,
    data: validation.data
  };
}
