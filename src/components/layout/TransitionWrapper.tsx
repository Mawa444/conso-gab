import { ReactNode, useState, useEffect } from 'react';
import { GabonLoading } from '@/components/ui/gabon-loading';
import { cn } from '@/lib/utils';

interface TransitionWrapperProps {
  children: ReactNode;
  isChanging?: boolean;
  className?: string;
  loadingText?: string;
}

export const TransitionWrapper = ({ 
  children, 
  isChanging = false, 
  className,
  loadingText = "Transition..."
}: TransitionWrapperProps) => {
  const [showTransition, setShowTransition] = useState(false);

  useEffect(() => {
    if (isChanging) {
      setShowTransition(true);
      
      // Délai minimum pour éviter les flashs trop rapides
      const timer = setTimeout(() => {
        setShowTransition(false);
      }, 150);

      return () => clearTimeout(timer);
    }
  }, [isChanging]);

  if (showTransition) {
    return (
      <div className={cn("relative min-h-screen", className)}>
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <GabonLoading 
            size="md"
            text={loadingText}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("animate-fade-in", className)}>
      {children}
    </div>
  );
};