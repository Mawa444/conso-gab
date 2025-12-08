import { ReactNode } from 'react';

interface PageWithSkeletonProps {
  isLoading: boolean;
  skeleton: ReactNode;
  children: ReactNode;
  className?: string;
}

export const PageWithSkeleton = ({ 
  isLoading, 
  skeleton, 
  children, 
  className = ""
}: PageWithSkeletonProps) => {
  // Si loading est false, afficher directement le contenu
  if (!isLoading) {
    return <div className={className}>{children}</div>;
  }

  // Sinon afficher le skeleton
  return <div className={className}>{skeleton}</div>;
};