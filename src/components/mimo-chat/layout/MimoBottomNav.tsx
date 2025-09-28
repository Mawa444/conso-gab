import React from 'react';
import { MessageCircle, Users, Phone, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const navItems: NavItem[] = [
  {
    id: 'chats',
    label: 'Discussions',
    icon: MessageCircle
  },
  {
    id: 'contacts',
    label: 'Contacts',
    icon: Users
  },
  {
    id: 'calls',
    label: 'Appels',
    icon: Phone
  },
  {
    id: 'settings',
    label: 'Réglages',
    icon: Settings
  }
];

interface MimoBottomNavProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  className?: string;
}

export const MimoBottomNav: React.FC<MimoBottomNavProps> = ({
  activeTab = 'chats',
  onTabChange,
  className
}) => {
  return (
    <nav className={cn(
      'fixed bottom-0 left-0 right-0 z-50',
      'h-bottom-nav bg-white border-t border-mimo-gray-200',
      'flex items-center justify-around px-2',
      'shadow-mimo-4',
      className
    )}>
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        const Icon = item.icon;
        
        return (
          <button
            key={item.id}
            onClick={() => onTabChange?.(item.id)}
            className={cn(
              'flex flex-col items-center justify-center',
              'py-2 px-3 rounded-lg transition-all duration-200',
              'min-w-0 flex-1 max-w-[80px]',
              isActive
                ? 'text-mimo-green'
                : 'text-mimo-gray-500 hover:text-mimo-gray-700 active:bg-mimo-gray-100'
            )}
          >
            <div className="relative">
              <Icon className={cn(
                'w-6 h-6 mb-1',
                isActive && 'animate-bounce-soft'
              )} />
              
              {item.badge && item.badge > 0 && (
                <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-mimo-error text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {item.badge > 99 ? '99+' : item.badge}
                </div>
              )}
            </div>
            
            <span className="text-xs font-medium truncate">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};