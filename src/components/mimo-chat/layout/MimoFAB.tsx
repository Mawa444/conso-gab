import React from 'react';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface MimoFABProps {
  onClick?: () => void;
  icon?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export const MimoFAB: React.FC<MimoFABProps> = ({
  onClick,
  icon = <Plus className="w-6 h-6" />,
  className,
  disabled = false
}) => {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'fixed bottom-20 right-4 z-40',
        'w-fab h-fab rounded-full',
        'bg-primary hover:bg-primary/90 active:bg-primary/80',
        'text-primary-foreground shadow-lg',
        'flex items-center justify-center',
        'transition-all duration-200 hover:scale-105 active:scale-95',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {icon}
    </Button>
  );
};