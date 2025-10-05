import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { prefetchQueries, queryKeys } from '@/lib/query-client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useProfileMode } from '@/hooks/use-profile-mode';

/**
 * Hook to prefetch critical data on app startup
 * Improves perceived performance by loading data in background
 */
export const usePrefetch = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { currentMode, currentBusinessId } = useProfileMode();

  useEffect(() => {
    // Only prefetch if user is authenticated
    if (!user) return;

    const prefetchCriticalData = async () => {
      try {
        // Prefetch user profile data
        await prefetchQueries.prefetchUserProfile();

        // Prefetch business data if in business mode
        if (currentMode === 'business' && currentBusinessId) {
          await queryClient.prefetchQuery({
            queryKey: queryKeys.business.detail(currentBusinessId),
            staleTime: 5 * 60 * 1000, // 5 minutes
          });
        }

        // Prefetch recent conversations
        await prefetchQueries.prefetchRecentConversations();

        // Prefetch user location for geolocation features
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;

              // Prefetch nearby businesses
              await prefetchQueries.prefetchNearbyBusinesses({ lat: latitude, lng: longitude });
            },
            (error) => {
              console.warn('[Prefetch] Geolocation error:', error);
              // Fallback: prefetch businesses around Libreville
              prefetchQueries.prefetchNearbyBusinesses({
                lat: 0.4162,
                lng: 9.4673
              });
            },
            {
              enableHighAccuracy: false,
              timeout: 5000,
              maximumAge: 10 * 60 * 1000 // 10 minutes
            }
          );
        }

        console.log('[Prefetch] Critical data prefetched successfully');
      } catch (error) {
        console.warn('[Prefetch] Error prefetching data:', error);
      }
    };

    // Small delay to not interfere with initial render
    const timeoutId = setTimeout(prefetchCriticalData, 1000);

    return () => clearTimeout(timeoutId);
  }, [user, currentMode, currentBusinessId, queryClient]);
};

/**
 * Hook to prefetch data for specific routes
 * Call this when navigating to routes that need data
 */
export const useRoutePrefetch = () => {
  const queryClient = useQueryClient();

  const prefetchHomeData = async () => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.business.list(),
      staleTime: 2 * 60 * 1000, // 2 minutes
    });
  };

  const prefetchBusinessData = async (businessId: string) => {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: queryKeys.business.detail(businessId),
        staleTime: 5 * 60 * 1000,
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.catalog.list(businessId),
        staleTime: 2 * 60 * 1000,
      }),
    ]);
  };

  const prefetchCatalogData = async (catalogId: string) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.catalog.detail(catalogId),
      staleTime: 5 * 60 * 1000,
    });
  };

  const prefetchMessagingData = async () => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.messaging.conversations,
      staleTime: 1 * 60 * 1000, // 1 minute for real-time data
    });
  };

  return {
    prefetchHomeData,
    prefetchBusinessData,
    prefetchCatalogData,
    prefetchMessagingData,
  };
};

/**
 * Hook to prefetch data on hover/link focus for instant navigation
 * Implements "prefetch on hover" pattern
 */
export const useHoverPrefetch = () => {
  const queryClient = useQueryClient();

  const prefetchOnHover = async (
    queryKey: readonly unknown[],
    prefetchFn: () => Promise<void>,
    delay = 100
  ) => {
    let timeoutId: NodeJS.Timeout;

    const startPrefetch = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(async () => {
        try {
          // Check if data is already cached
          const existingData = queryClient.getQueryData(queryKey);
          if (!existingData) {
            await prefetchFn();
          }
        } catch (error) {
          console.warn('[HoverPrefetch] Error:', error);
        }
      }, delay);
    };

    const cancelPrefetch = () => {
      clearTimeout(timeoutId);
    };

    return { startPrefetch, cancelPrefetch };
  };

  return { prefetchOnHover };
};