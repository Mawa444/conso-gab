import React from 'react';
import { ArrowLeft, Search, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MimoTopBarProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  showSearch?: boolean;
  onSearchClick?: () => void;
  showMenu?: boolean;
  onMenuClick?: () => void;
  className?: string;
  rightElement?: React.ReactNode;
}

export const MimoTopBar: React.FC<MimoTopBarProps> = ({
  title,
  subtitle,
  showBackButton = false,
  onBack,
  showSearch = true,
  onSearchClick,
  showMenu = true,
  onMenuClick,
  className,
  rightElement
}) => {
  return (
    <header className={cn(
      'fixed top-0 left-0 right-0 z-50',
      'h-top-bar bg-card border-b border-border',
      'flex items-center justify-between px-4',
      'shadow-sm',
      className
    )}>
      {/* Left Section */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {showBackButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="p-2 hover:bg-muted rounded-full"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Button>
        )}
        
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold text-foreground truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {rightElement}
        
        {showSearch && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onSearchClick}
            className="p-2 hover:bg-muted rounded-full"
          >
            <Search className="w-5 h-5 text-muted-foreground" />
          </Button>
        )}
        
        {showMenu && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="p-2 hover:bg-muted rounded-full"
          >
            <MoreVertical className="w-5 h-5 text-muted-foreground" />
          </Button>
        )}
      </div>
    </header>
  );
};