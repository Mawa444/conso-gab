import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Phone, PhoneCall, PhoneIncoming, PhoneMissed, Video } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

// Mock calls data
const calls = [
  {
    id: '1',
    contact: {
      name: 'Alice Martin',
      avatar: ''
    },
    type: 'outgoing',
    callType: 'voice',
    duration: '5:32',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    missed: false
  },
  {
    id: '2',
    contact: {
      name: 'Bob Dupont',
      avatar: ''
    },
    type: 'incoming',
    callType: 'video',
    duration: '12:45',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    missed: false
  },
  {
    id: '3',
    contact: {
      name: 'Claire Bernard',
      avatar: ''
    },
    type: 'incoming',
    callType: 'voice',
    duration: null,
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    missed: true
  }
];

const getCallIcon = (type: string, callType: string, missed: boolean) => {
  if (missed) {
    return <PhoneMissed className="w-4 h-4 text-mimo-error" />;
  }
  
  if (callType === 'video') {
    return <Video className="w-4 h-4 text-mimo-success" />;
  }
  
  if (type === 'outgoing') {
    return <PhoneCall className="w-4 h-4 text-mimo-success rotate-12" />;
  }
  
  return <PhoneIncoming className="w-4 h-4 text-mimo-success" />;
};

export const CallsTab: React.FC = () => {
  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1">
        <div className="divide-y divide-mimo-gray-100">
          {calls.map((call) => {
            const timeAgo = formatDistanceToNow(call.timestamp, { 
              locale: fr, 
              addSuffix: true 
            });

            return (
              <div
                key={call.id}
                className="flex items-center gap-3 p-4 hover:bg-mimo-gray-50 active:bg-mimo-gray-100 transition-colors"
              >
                {/* Avatar */}
                <Avatar className="w-12 h-12">
                  <AvatarImage src={call.contact.avatar} alt={call.contact.name} />
                  <AvatarFallback className="bg-mimo-gray-200 text-mimo-gray-700 font-semibold">
                    {call.contact.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>

                {/* Call Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`font-semibold truncate ${
                      call.missed ? 'text-mimo-error' : 'text-mimo-gray-900'
                    }`}>
                      {call.contact.name}
                    </h3>
                    {getCallIcon(call.type, call.callType, call.missed)}
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-mimo-gray-500">
                    <span>{timeAgo}</span>
                    {call.duration && (
                      <>
                        <span>•</span>
                        <span>{call.duration}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Call Action */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2 h-10 w-10 text-mimo-success hover:bg-mimo-success/10"
                >
                  <Phone className="w-5 h-5" />
                </Button>
              </div>
            );
          })}
        </div>

        {/* Empty state for no calls */}
        {calls.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="w-24 h-24 bg-mimo-gray-100 rounded-full flex items-center justify-center mb-4">
              <Phone className="w-12 h-12 text-mimo-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-mimo-gray-900 mb-2">
              Aucun appel récent
            </h3>
            <p className="text-mimo-gray-500 max-w-sm">
              Vos appels récents apparaîtront ici
            </p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};