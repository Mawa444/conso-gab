import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TransitionWrapperProps {
  children: ReactNode;
  className?: string;
}

export const TransitionWrapper = ({ 
  children, 
  className
}: TransitionWrapperProps) => {
  return (
    <div className={cn("", className)}>
      {children}
    </div>
  );
};