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
  return (
    <div className={className}>
      {/* Skeleton persistant pendant le chargement - transition douce */}
      <div className={`transition-opacity duration-300 ${isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none absolute inset-0'}`}>
        {skeleton}
      </div>
      <div className={`transition-opacity duration-300 ${isLoading ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        {children}
      </div>
    </div>
  );
};