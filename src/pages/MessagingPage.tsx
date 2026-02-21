import React from 'react';
import { ChatLayout } from '@/features/chat/components/ChatLayout';

export const MessagingPage: React.FC = () => {
  return (
    <div className="h-[calc(100dvh-4rem)] relative">
      <ChatLayout />
    </div>
  );
};

export default MessagingPage;
