import { ReactNode } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface SkeletonLayoutProps {
  isLoading: boolean;
  skeleton: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * Layout wrapper qui gère l'affichage des skeleton screens pendant le chargement
 * Transition fluide entre skeleton et contenu réel
 */
export const SkeletonLayout = ({ 
  isLoading, 
  skeleton, 
  children, 
  className = ""
}: SkeletonLayoutProps) => {
  return (
    <div className={`relative ${className}`}>
      {/* Skeleton visible pendant le chargement */}
      {isLoading && (
        <div className="animate-in fade-in duration-200">
          {skeleton}
        </div>
      )}
      
      {/* Contenu réel avec fade-in une fois chargé */}
      {!isLoading && (
        <div className="animate-in fade-in duration-300">
          {children}
        </div>
      )}
    </div>
  );
};

/**
 * Skeleton générique pour une page
 */
export const PageSkeleton = () => (
  <div className="min-h-screen p-6 space-y-6">
    <div className="space-y-2">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-96" />
    </div>
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Skeleton key={i} className="h-48 w-full" />
      ))}
    </div>
  </div>
);

/**
 * Skeleton pour un formulaire
 */
export const FormSkeleton = () => (
  <div className="space-y-4 p-6">
    <Skeleton className="h-6 w-32" />
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-6 w-32" />
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-6 w-32" />
    <Skeleton className="h-24 w-full" />
    <div className="flex gap-2 justify-end">
      <Skeleton className="h-10 w-24" />
      <Skeleton className="h-10 w-24" />
    </div>
  </div>
);

/**
 * Skeleton pour une liste
 */
export const ListSkeleton = ({ count = 5 }: { count?: number }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

/**
 * Skeleton pour une carte
 */
export const CardSkeleton = () => (
  <div className="border rounded-lg p-4 space-y-3">
    <Skeleton className="h-32 w-full rounded" />
    <Skeleton className="h-6 w-3/4" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-5/6" />
    <div className="flex gap-2 pt-2">
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-8 w-20" />
    </div>
  </div>
);
