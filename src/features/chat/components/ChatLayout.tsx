import React, { useState } from 'react';
import { useConversations } from '../hooks/useChatQueries';
import { ConversationList } from './ConversationList';
import { ChatWindow } from './ChatWindow';
import { cn } from '@/lib/utils';

export const ChatLayout: React.FC = () => {
  const { data: conversations = [], isLoading } = useConversations();
  const [activeId, setActiveId] = useState<string | null>(null);

  const activeConversation = conversations.find(c => c.id === activeId);

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-background border rounded-2xl shadow-sm m-4">
      {/* Sidebar List */}
      <div className={cn(
        "w-full md:w-80 border-r bg-card flex flex-col transition-all duration-300",
        activeId ? "hidden md:flex" : "flex"
      )}>
        <div className="p-4 border-b">
          <h2 className="font-bold text-xl">Messages</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <ConversationList 
            conversations={conversations} 
            activeId={activeId || undefined} 
            onSelect={setActiveId}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={cn(
        "flex-1 flex flex-col bg-background",
        !activeId ? "hidden md:flex" : "flex"
      )}>
        {activeConversation ? (
          <ChatWindow 
            conversation={activeConversation} 
            onBack={() => setActiveId(null)}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground bg-muted/10">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">💬</span>
            </div>
            <p className="font-medium">Sélectionnez une conversation</p>
            <p className="text-sm opacity-70">pour commencer à discuter</p>
          </div>
        )}
      </div>
    </div>
  );
};
