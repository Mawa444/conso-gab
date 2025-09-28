import React from 'react';
import { useMimoChat } from '@/contexts/MimoChatContext';
import { ConversationList } from '../components/ConversationList';
import { useNavigate } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';

export const ChatsTab: React.FC = () => {
  const { conversations, loading, setActiveConversation } = useMimoChat();
  const navigate = useNavigate();

  const handleConversationSelect = (conversation: any) => {
    setActiveConversation(conversation);
    navigate(`/mimo-chat/conversation/${conversation.id}`);
  };

  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1">
        <ConversationList
          conversations={conversations}
          onConversationSelect={handleConversationSelect}
          loading={loading}
        />
      </ScrollArea>
    </div>
  );
};