import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, BellRing, Settings } from 'lucide-react';
import { useBusinessSubscriptions } from '@/hooks/use-business-subscriptions';
import { useAuth } from '@/components/auth/AuthProvider';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface SubscribeButtonProps {
  businessId: string;
  businessName?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

export const SubscribeButton: React.FC<SubscribeButtonProps> = ({
  businessId,
  businessName = 'ce business',
  variant = 'default',
  size = 'default',
  className
}) => {
  const { user } = useAuth();
  const { 
    subscribe, 
    unsubscribe, 
    isSubscribed, 
    getSubscription,
    updateNotificationSettings,
    loading 
  } = useBusinessSubscriptions();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  if (!user) return null;

  const subscribed = isSubscribed(businessId);
  const subscription = getSubscription(businessId);

  const handleSubscribe = async () => {
    setIsProcessing(true);
    if (subscribed) {
      await unsubscribe(businessId);
    } else {
      await subscribe(businessId);
    }
    setIsProcessing(false);
  };

  const handleNotificationChange = async (type: string, enabled: boolean) => {
    if (!subscription) return;

    const updatedNotifications = {
      ...subscription.notification_types,
      [type]: enabled
    };

    await updateNotificationSettings(businessId, updatedNotifications);
  };

  const notificationLabels = {
    new_catalog: 'Nouveaux catalogues',
    new_comment: 'Nouveaux commentaires',
    new_message: 'Nouveaux messages',
    new_order: 'Nouvelles commandes',
    business_update: 'Mises à jour business'
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={handleSubscribe}
        disabled={loading || isProcessing}
        variant={subscribed ? 'outline' : variant}
        size={size}
        className={cn(
          "flex items-center gap-2 transition-all duration-200",
          subscribed && "border-primary text-primary hover:bg-primary/10",
          className
        )}
      >
        {subscribed ? (
          <>
            <BellRing className="h-4 w-4" />
            Favori
          </>
        ) : (
          <>
            <Bell className="h-4 w-4" />
            Favoris
          </>
        )}
      </Button>

      {subscribed && subscription && (
        <Popover open={showSettings} onOpenChange={setShowSettings}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-muted"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Notifications pour {businessName}</h4>
                <p className="text-xs text-muted-foreground">
                  Choisissez les types de notifications que vous souhaitez recevoir
                </p>
              </div>
              
              <div className="space-y-3">
                {Object.entries(notificationLabels).map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between">
                    <Label htmlFor={key} className="text-sm font-normal cursor-pointer">
                      {label}
                    </Label>
                    <Switch
                      id={key}
                      checked={subscription.notification_types[key as keyof typeof subscription.notification_types]}
                      onCheckedChange={(checked) => handleNotificationChange(key, checked)}
                    />
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSubscribe()}
                  className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  Se retirer des favoris
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};