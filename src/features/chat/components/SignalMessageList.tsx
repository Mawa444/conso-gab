import React, { useRef, useEffect } from 'react';
import { Message } from '../types';
import { SignalMessageBubble } from './SignalMessageBubble';
import { useAuth } from '@/features/auth';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Loader2, Lock } from 'lucide-react';

interface Props {
  messages: Message[];
  isLoading: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  isFetchingMore?: boolean;
}

function formatDateSep(dateStr: string): string {
  const d = new Date(dateStr);
  if (isToday(d)) return "Aujourd'hui";
  if (isYesterday(d)) return 'Hier';
  return format(d, 'EEEE d MMMM yyyy', { locale: fr });
}

export const SignalMessageList: React.FC<Props> = ({ messages, isLoading, hasMore, onLoadMore, isFetchingMore }) => {
  const { user } = useAuth();
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevLengthRef = useRef(0);

  useEffect(() => {
    if (messages.length > prevLengthRef.current && messages.length - prevLengthRef.current < 5) {
      bottomRef.current?.scrollIntoView({ behavior: messages.length <= 50 ? 'auto' : 'smooth' });
    }
    prevLengthRef.current = messages.length;
  }, [messages.length]);

  const handleScroll = () => {
    if (!containerRef.current || !hasMore || isFetchingMore) return;
    if (containerRef.current.scrollTop < 80) onLoadMore?.();
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!messages.length) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        {/* Signal-style encryption notice */}
        <div className="bg-secondary/20 rounded-xl px-4 py-3 max-w-[280px] text-center">
          <Lock className="w-4 h-4 text-secondary-foreground/60 mx-auto mb-1.5" />
          <p className="text-[12px] text-secondary-foreground/70 leading-snug">
            Les messages envoyés dans cette conversation sont chiffrés de bout en bout.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto py-2">
      {isFetchingMore && (
        <div className="flex justify-center py-3">
          <Loader2 className="w-5 h-5 animate-spin text-primary/60" />
        </div>
      )}

      {/* Encryption notice at the top */}
      <div className="flex justify-center px-6 py-3 mb-1">
        <div className="bg-secondary/15 rounded-lg px-3 py-1.5 flex items-center gap-1.5">
          <Lock className="w-3 h-3 text-secondary-foreground/50" />
          <span className="text-[10px] text-secondary-foreground/50">Chiffrement de bout en bout</span>
        </div>
      </div>

      {messages.map((msg, i) => {
        const isMine = msg.sender_id === user?.id;
        const prev = messages[i - 1];
        const showDate = !prev || !isSameDay(new Date(msg.created_at), new Date(prev.created_at));
        const showTail = !prev || prev.sender_id !== msg.sender_id || showDate;

        return (
          <React.Fragment key={msg.id}>
            {showDate && (
              <div className="flex items-center justify-center py-2.5 px-3">
                <span className="text-[11px] bg-card/90 text-muted-foreground px-3.5 py-1 rounded-lg font-medium shadow-sm border border-border/30">
                  {formatDateSep(msg.created_at)}
                </span>
              </div>
            )}
            <SignalMessageBubble message={msg} isMine={isMine} showTail={showTail} />
          </React.Fragment>
        );
      })}
      <div ref={bottomRef} className="h-1" />
    </div>
  );
};
