import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ContentContainerProps {
  children: ReactNode;
  className?: string;
  spacing?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  as?: 'div' | 'section' | 'article' | 'main';
}

const spacingClasses = {
  none: '',
  sm: 'space-y-2',
  md: 'space-y-4',
  lg: 'space-y-6',
  xl: 'space-y-8',
};

/**
 * ContentContainer - Wrapper pour contenu avec spacing cohérent
 * 
 * Gère:
 * - Marges internes cohérentes
 * - Spacing vertical entre éléments
 * - Sémantique HTML
 */
export const ContentContainer = ({ 
  children, 
  className,
  spacing = 'md',
  as: Component = 'div'
}: ContentContainerProps) => {
  return (
    <Component 
      className={cn(
        "w-full",
        spacingClasses[spacing],
        className
      )}
    >
      {children}
    </Component>
  );
};
