
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ToolState {
  id: string;
  business_id: string;
  tool_id: string;
  is_active: boolean;
  config: any;
}

export const useBusinessTools = (businessId: string) => {
  const queryClient = useQueryClient();

  const { data: toolsState = [], isLoading } = useQuery({
    queryKey: ['business-tools', businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_tool_states')
        .select('*')
        .eq('business_id', businessId);
      
      if (error) throw error;
      return data as ToolState[];
    },
    enabled: !!businessId,
  });

  const toggleTool = useMutation({
    mutationFn: async ({ toolId, isActive }: { toolId: string; isActive: boolean }) => {
      // Upsert logic
      const { data, error } = await supabase
        .from('business_tool_states')
        .upsert({
          business_id: businessId,
          tool_id: toolId,
          is_active: isActive,
        }, { onConflict: 'business_id,tool_id' })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async ({ toolId, isActive }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['business-tools', businessId] });
      const previousTools = queryClient.getQueryData(['business-tools', businessId]);

      queryClient.setQueryData(['business-tools', businessId], (old: ToolState[] = []) => {
        const existing = old.find(t => t.tool_id === toolId);
        if (existing) {
          return old.map(t => t.tool_id === toolId ? { ...t, is_active: isActive } : t);
        }
        return [...old, { business_id: businessId, tool_id: toolId, is_active: isActive, config: {} }];
      });

      return { previousTools };
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(['business-tools', businessId], context?.previousTools);
      toast.error("Erreur lors de la mise à jour de l'outil");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-tools', businessId] });
      toast.success('Préférences enregistrées');
    },
  });

  const isToolActive = (toolId: string, defaultState = false) => {
    const tool = toolsState.find(t => t.tool_id === toolId);
    return tool ? tool.is_active : defaultState;
  };

  return {
    toolsState,
    isLoading,
    toggleTool,
    isToolActive,
  };
};
