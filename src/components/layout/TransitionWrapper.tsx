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
      
      // Délai minimum pour la transition
      const timer = setTimeout(() => {
        setShowTransition(false);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isChanging]);

  if (showTransition) {
    return (
      <div className={cn("relative min-h-screen", className)}>
        <div className="fixed inset-0 bg-background/90 backdrop-blur-sm z-[9999] flex items-center justify-center">
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-card p-6 rounded-2xl shadow-xl border border-border/50">
            <GabonLoading 
              size="md"
              text={loadingText}
            />
          </div>
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