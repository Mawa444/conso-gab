import React from 'react';
import { ChatLayout } from '@/features/chat/components/ChatLayout';
import { BottomNavigationWithMode } from '@/components/layout/BottomNavigationWithMode';

export const MessagingPage: React.FC = () => {
  return (
    <div className="h-dvh flex flex-col">
      <div className="flex-1 min-h-0 relative">
        <ChatLayout />
      </div>
      <BottomNavigationWithMode />
    </div>
  );
};

export default MessagingPage;
