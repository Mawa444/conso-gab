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

  if (isLoading) {
    return (
      <div className={className}>
        {showSlowLoadingUI && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-card p-6 rounded-2xl shadow-xl border border-border/50">
              <GabonLoading 
                size="md" 
                text={loadingText || "Chargement..."} 
              />
            </div>
          </div>
        )}
        {skeleton}
      </div>
    );
  }

  return <div className={className}>{children}</div>;
};