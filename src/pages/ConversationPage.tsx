import React from 'react';
import { ChatLayout } from '@/features/chat/components/ChatLayout';

export const ConversationPage: React.FC = () => {
  return (
    <div className="h-[calc(100vh-4rem)]">
      <ChatLayout />
    </div>
  );
};

export default ConversationPage;
