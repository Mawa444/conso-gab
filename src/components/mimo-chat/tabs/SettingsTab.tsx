import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { 
  User, 
  Bell, 
  Lock, 
  Palette, 
  Globe, 
  HelpCircle, 
  Shield,
  Database,
  ChevronRight,
  Moon,
  Volume2
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';

const settingsGroups = [
  {
    title: 'Compte',
    items: [
      {
        id: 'profile',
        label: 'Profil',
        description: 'Modifier votre nom et photo',
        icon: User,
        hasArrow: true
      }
    ]
  },
  {
    title: 'Notifications',
    items: [
      {
        id: 'notifications',
        label: 'Notifications',
        description: 'Messages, appels, groupes',
        icon: Bell,
        hasArrow: true
      },
      {
        id: 'sounds',
        label: 'Sons',
        description: 'Sonneries et alertes',
        icon: Volume2,
        hasArrow: true
      }
    ]
  },
  {
    title: 'Confidentialité',
    items: [
      {
        id: 'privacy',
        label: 'Confidentialité',
        description: 'Qui peut voir mes infos',
        icon: Lock,
        hasArrow: true
      },
      {
        id: 'security',
        label: 'Sécurité',
        description: 'Authentification à deux facteurs',
        icon: Shield,
        hasArrow: true
      }
    ]
  },
  {
    title: 'Apparence',
    items: [
      {
        id: 'theme',
        label: 'Thème sombre',
        description: 'Mode sombre activé',
        icon: Moon,
        hasToggle: true,
        value: false
      },
      {
        id: 'language',
        label: 'Langue',
        description: 'Français',
        icon: Globe,
        hasArrow: true
      }
    ]
  },
  {
    title: 'Données et stockage',
    items: [
      {
        id: 'storage',
        label: 'Utilisation des données',
        description: 'Réseau, téléchargement automatique',
        icon: Database,
        hasArrow: true
      }
    ]
  },
  {
    title: 'Support',
    items: [
      {
        id: 'help',
        label: 'Aide',
        description: 'FAQ, nous contacter',
        icon: HelpCircle,
        hasArrow: true
      }
    ]
  }
];

export const SettingsTab: React.FC = () => {
  const { user } = useAuth();

  const displayName = user?.user_metadata?.display_name || user?.email || 'Utilisateur';
  const avatarUrl = user?.user_metadata?.avatar_url;

  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1">
        {/* Profile Header */}
        <div className="p-6 bg-gradient-to-br from-primary-500 to-primary-600">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={avatarUrl} alt={displayName} />
              <AvatarFallback className="bg-white text-primary-600 text-xl font-semibold">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-semibold text-white truncate">
                {displayName}
              </h2>
              <p className="text-primary-100 text-sm">
                {user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Settings Groups */}
        <div className="pb-6">
          {settingsGroups.map((group, groupIndex) => (
            <div key={group.title}>
              <div className="px-6 py-4 bg-mimo-gray-50">
                <h3 className="text-sm font-semibold text-mimo-gray-700 uppercase tracking-wide">
                  {group.title}
                </h3>
              </div>
              
              <div className="divide-y divide-mimo-gray-100">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-4 hover:bg-mimo-gray-50 active:bg-mimo-gray-100 transition-colors"
                    >
                      {/* Icon */}
                      <div className="w-10 h-10 bg-mimo-gray-100 rounded-full flex items-center justify-center">
                        <Icon className="w-5 h-5 text-mimo-gray-600" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-mimo-gray-900">
                          {item.label}
                        </h4>
                        {item.description && (
                          <p className="text-sm text-mimo-gray-500">
                            {item.description}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      {item.hasToggle && (
                        <Switch 
                          checked={item.value} 
                          onCheckedChange={() => {}}
                        />
                      )}
                      
                      {item.hasArrow && (
                        <ChevronRight className="w-5 h-5 text-mimo-gray-400" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* App Info */}
        <div className="px-6 py-4 text-center border-t border-mimo-gray-200">
          <p className="text-sm text-mimo-gray-500">
            MIMO Chat v1.0.0
          </p>
          <p className="text-xs text-mimo-gray-400 mt-1">
            Système de messagerie Consogab
          </p>
        </div>
      </ScrollArea>
    </div>
  );
};