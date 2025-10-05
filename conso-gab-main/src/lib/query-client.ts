import { QueryClient } from '@tanstack/react-query';

// Configuration optimisée pour ConsoGab
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache pendant 5 minutes (au lieu de 0)
      staleTime: 5 * 60 * 1000, // 5 minutes

      // Garde en cache pendant 10 minutes (au lieu de 5)
      cacheTime: 10 * 60 * 1000, // 10 minutes

      // Retry 2 fois au lieu de 3 (plus rapide)
      retry: 2,

      // Retry delay exponentiel
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Refetch en background quand fenêtre redevient active
      refetchOnWindowFocus: true,

      // Refetch quand reconnecté
      refetchOnReconnect: true,

      // Pas de refetch automatique en intervalle (trop coûteux)
      refetchInterval: false,

      // Refetch on stale seulement si pas d'erreur récente
      refetchOnMount: 'always',
    },

    mutations: {
      // Retry mutations 1 fois
      retry: 1,

      // Network mode: toujours online (pas de offline support pour mutations)
      networkMode: 'online',
    },
  },
});

// Configuration spécifique par domaine
export const queryConfig = {
  // Auth queries - très stables
  auth: {
    staleTime: 30 * 60 * 1000, // 30 minutes
    cacheTime: 60 * 60 * 1000, // 1 heure
  },

  // Business data - moyennement stable
  business: {
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
  },

  // Catalog data - change souvent
  catalog: {
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  },

  // Real-time data (messages, notifications) - très volatile
  realtime: {
    staleTime: 0, // Toujours stale
    cacheTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  },

  // User location - volatile mais coûteux
  location: {
    staleTime: 1 * 60 * 1000, // 1 minute
    cacheTime: 5 * 60 * 1000, // 5 minutes
  },
};

// Utilitaires pour les queries
export const queryKeys = {
  // Auth
  auth: {
    user: ['auth', 'user'] as const,
    session: ['auth', 'session'] as const,
    profile: ['auth', 'profile'] as const,
  },

  // Business
  business: {
    list: (filters?: any) => ['business', 'list', filters] as const,
    detail: (id: string) => ['business', 'detail', id] as const,
    search: (query: string) => ['business', 'search', query] as const,
  },

  // Catalog
  catalog: {
    list: (businessId: string, filters?: any) => ['catalog', 'list', businessId, filters] as const,
    detail: (id: string) => ['catalog', 'detail', id] as const,
    products: (catalogId: string) => ['catalog', 'products', catalogId] as const,
  },

  // Messaging
  messaging: {
    conversations: ['messaging', 'conversations'] as const,
    conversation: (id: string) => ['messaging', 'conversation', id] as const,
    messages: (conversationId: string, page?: number) =>
      ['messaging', 'messages', conversationId, page] as const,
  },

  // Location
  location: {
    user: ['location', 'user'] as const,
    businesses: (bounds?: any) => ['location', 'businesses', bounds] as const,
  },
};

// Prefetching strategies
export const prefetchQueries = {
  // Prefetch user profile après login
  async prefetchUserProfile() {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.auth.profile,
      staleTime: queryConfig.auth.staleTime,
    });
  },

  // Prefetch nearby businesses
  async prefetchNearbyBusinesses(userLocation?: { lat: number; lng: number }) {
    if (!userLocation) return;

    await queryClient.prefetchQuery({
      queryKey: queryKeys.location.businesses(),
      staleTime: queryConfig.location.staleTime,
    });
  },

  // Prefetch conversations récentes
  async prefetchRecentConversations() {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.messaging.conversations,
      staleTime: queryConfig.realtime.staleTime,
    });
  },
};

// Invalidation strategies
export const invalidateQueries = {
  // Invalider toutes les données utilisateur
  async invalidateUserData() {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.auth.user,
    });
    await queryClient.invalidateQueries({
      queryKey: queryKeys.auth.profile,
    });
  },

  // Invalider données business
  async invalidateBusinessData(businessId?: string) {
    if (businessId) {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.business.detail(businessId),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.catalog.list(businessId),
      });
    } else {
      await queryClient.invalidateQueries({
        queryKey: ['business'],
      });
    }
  },

  // Invalider données messaging
  async invalidateMessagingData() {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.messaging.conversations,
    });
  },
};

// Optimistic updates helpers
export const optimisticUpdates = {
  // Optimistic update pour likes
  async toggleBusinessLike(businessId: string, currentLiked: boolean) {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({
      queryKey: queryKeys.business.detail(businessId),
    });

    // Snapshot previous value
    const previousData = queryClient.getQueryData(queryKeys.business.detail(businessId));

    // Optimistically update
    queryClient.setQueryData(queryKeys.business.detail(businessId), (old: any) => ({
      ...old,
      isLiked: !currentLiked,
      likesCount: currentLiked ? old.likesCount - 1 : old.likesCount + 1,
    }));

    // Return rollback function
    return () => {
      queryClient.setQueryData(queryKeys.business.detail(businessId), previousData);
    };
  },

  // Optimistic update pour messages
  async addMessage(conversationId: string, message: any) {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({
      queryKey: queryKeys.messaging.messages(conversationId),
    });

    // Snapshot previous value
    const previousData = queryClient.getQueryData(queryKeys.messaging.messages(conversationId));

    // Optimistically add message
    queryClient.setQueryData(queryKeys.messaging.messages(conversationId), (old: any) => ({
      ...old,
      messages: [...(old?.messages || []), message],
    }));

    // Return rollback function
    return () => {
      queryClient.setQueryData(queryKeys.messaging.messages(conversationId), previousData);
    };
  },
};