import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { MessageCircle, Phone, Users } from 'lucide-react';

// Mock contacts data
const contacts = [
  {
    id: '1',
    name: 'Alice Martin',
    phone: '+33 6 12 34 56 78',
    avatar: '',
    isOnline: true,
    lastSeen: 'En ligne'
  },
  {
    id: '2',
    name: 'Bob Dupont',
    phone: '+33 6 87 65 43 21',
    avatar: '',
    isOnline: false,
    lastSeen: 'Vu il y a 5 min'
  },
  {
    id: '3',
    name: 'Claire Bernard',
    phone: '+33 6 11 22 33 44',
    avatar: '',
    isOnline: true,
    lastSeen: 'En ligne'
  }
];

export const ContactsTab: React.FC = () => {
  return (
    <div className="h-full flex flex-col">
      {/* Header Actions */}
      <div className="p-4 space-y-3 border-b border-mimo-gray-200">
        <Button
          variant="ghost" 
          className="w-full justify-start h-12 px-4 hover:bg-mimo-gray-50"
        >
          <Users className="w-5 h-5 mr-3 text-mimo-gray-600" />
          <span className="font-medium">Nouveau groupe</span>
        </Button>
        
        <Button
          variant="ghost" 
          className="w-full justify-start h-12 px-4 hover:bg-mimo-gray-50"
        >
          <MessageCircle className="w-5 h-5 mr-3 text-mimo-gray-600" />
          <span className="font-medium">Nouveau contact</span>
        </Button>
      </div>

      {/* Contacts List */}
      <ScrollArea className="flex-1">
        <div className="divide-y divide-mimo-gray-100">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="flex items-center gap-3 p-4 hover:bg-mimo-gray-50 active:bg-mimo-gray-100 transition-colors"
            >
              {/* Avatar */}
              <div className="relative">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={contact.avatar} alt={contact.name} />
                  <AvatarFallback className="bg-mimo-gray-200 text-mimo-gray-700 font-semibold">
                    {contact.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                {contact.isOnline && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-mimo-success rounded-full border-2 border-white" />
                )}
              </div>

              {/* Contact Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-mimo-gray-900 truncate">
                  {contact.name}
                </h3>
                <p className="text-sm text-mimo-gray-500">
                  {contact.lastSeen}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2 h-8 w-8 text-mimo-gray-500 hover:text-mimo-green hover:bg-mimo-green/10"
                >
                  <MessageCircle className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2 h-8 w-8 text-mimo-gray-500 hover:text-mimo-blue hover:bg-mimo-blue/10"
                >
                  <Phone className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};