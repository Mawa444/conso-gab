import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { MimoTopBar } from './MimoTopBar';
import { MimoBottomNav } from './MimoBottomNav';
import { MimoFAB } from './MimoFAB';

interface MimoChatLayoutProps {
  children: ReactNode;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  showFAB?: boolean;
  onFABClick?: () => void;
  fabIcon?: ReactNode;
  rightElement?: ReactNode;
  className?: string;
}

export const MimoChatLayout: React.FC<MimoChatLayoutProps> = ({
  children,
  activeTab,
  onTabChange,
  title = 'MIMO Chat',
  subtitle,
  showBackButton = false,
  onBack,
  showFAB = false,
  onFABClick,
  fabIcon,
  rightElement,
  className
}) => {
  return (
    <div className={cn('flex flex-col h-screen bg-background overflow-hidden', className)}>
      {/* Top App Bar */}
      <MimoTopBar
        title={title}
        subtitle={subtitle}
        showBackButton={showBackButton}
        onBack={onBack}
        rightElement={rightElement}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative pt-top-bar pb-bottom-nav">
        {children}
      </main>

      {/* Floating Action Button */}
      {showFAB && (
        <MimoFAB 
          onClick={onFABClick}
          icon={fabIcon}
        />
      )}

      {/* Bottom Navigation */}
      <MimoBottomNav
        activeTab={activeTab}
        onTabChange={onTabChange}
      />
    </div>
  );
};