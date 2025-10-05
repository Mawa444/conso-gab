import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
  withPadding?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

const maxWidthClasses = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-screen-2xl',
  full: 'max-w-full',
};

/**
 * PageLayout - Container principal pour toutes les pages
 * 
 * Gère:
 * - Max-width responsive
 * - Padding cohérent
 * - Safe areas pour mobile (notch, home indicator)
 * - Overflow control
 */
export const PageLayout = ({ 
  children, 
  className, 
  withPadding = true,
  maxWidth = 'xl'
}: PageLayoutProps) => {
  return (
    <div 
      className={cn(
        "min-h-screen w-full overflow-x-hidden",
        "bg-background text-foreground",
        className
      )}
    >
      <div 
        className={cn(
          "w-full mx-auto",
          maxWidthClasses[maxWidth],
          withPadding && "px-4 md:px-6 lg:px-8",
          "pb-safe" // Safe area pour iOS home indicator
        )}
      >
        {children}
      </div>
    </div>
  );
};
