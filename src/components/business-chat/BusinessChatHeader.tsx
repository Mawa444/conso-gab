import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Building2 } from 'lucide-react';

interface BusinessChatHeaderProps {
  businessName: string;
  businessLogoUrl?: string;
  isOnline?: boolean;
}

export const BusinessChatHeader: React.FC<BusinessChatHeaderProps> = ({
  businessName,
  businessLogoUrl,
  isOnline = false
}) => {
  const initials = businessName
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex items-center gap-3 p-4 border-b border-border bg-card">
      {/* Logo Business */}
      <Avatar className="w-12 h-12 ring-2 ring-primary/10">
        <AvatarImage src={businessLogoUrl} alt={businessName} />
        <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white">
          {businessLogoUrl ? initials : <Building2 className="w-6 h-6" />}
        </AvatarFallback>
      </Avatar>

      {/* Infos Business */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm truncate">
          {businessName}
        </h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {isOnline ? (
            <>
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>En ligne</span>
            </>
          ) : (
            <span>Hors ligne</span>
          )}
        </div>
      </div>

      {/* Badge Vérifié */}
      <Badge variant="outline" className="text-xs border-primary/20 text-primary">
        Vérifié
      </Badge>
    </div>
  );
};
