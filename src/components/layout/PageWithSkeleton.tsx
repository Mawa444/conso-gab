import { ReactNode } from 'react';
import { useLoadingDetection } from '@/hooks/use-loading-detection';
import { GabonLoading } from '@/components/ui/gabon-loading';

interface PageWithSkeletonProps {
  isLoading: boolean;
  skeleton: ReactNode;
  children: ReactNode;
  loadingText?: string;
  className?: string;
}

export const PageWithSkeleton = ({ 
  isLoading, 
  skeleton, 
  children, 
  loadingText,
  className = ""
}: PageWithSkeletonProps) => {
  const { showSlowLoadingUI } = useLoadingDetection(isLoading);

  return (
    <div className={className}>
      {/* Animation de chargement fixe au centre */}
      {showSlowLoadingUI && (
        <div className="fixed inset-0 bg-background/90 backdrop-blur-sm z-[9999] flex items-center justify-center">
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-card p-6 rounded-2xl shadow-xl border border-border/50">
            <GabonLoading 
              size="md" 
              text={loadingText || "Chargement..."} 
            />
          </div>
        </div>
      )}
      
      {/* Skeleton persistant pendant le chargement */}
      {isLoading ? skeleton : children}
    </div>
  );
};