import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorBannerProps {
  type: 'network' | 'upload' | 'general';
  message?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({
  type,
  message,
  onRetry,
  onDismiss,
  className
}) => {
  const getErrorConfig = () => {
    switch (type) {
      case 'network':
        return {
          icon: WifiOff,
          title: "Hors ligne",
          message: "Vérifiez votre connexion internet",
          bgColor: "bg-red-50 border-red-200",
          textColor: "text-red-800",
          iconColor: "text-red-500"
        };
      
      case 'upload':
        return {
          icon: AlertCircle,
          title: "Échec de l'envoi",
          message: "Toucher pour réessayer",
          bgColor: "bg-yellow-50 border-yellow-200",
          textColor: "text-yellow-800",
          iconColor: "text-yellow-500"
        };
      
      default:
        return {
          icon: AlertCircle,
          title: "Erreur",
          message: message || "Une erreur s'est produite",
          bgColor: "bg-red-50 border-red-200",
          textColor: "text-red-800",
          iconColor: "text-red-500"
        };
    }
  };

  const config = getErrorConfig();
  const IconComponent = config.icon;

  return (
    <div className={cn(
      "border rounded-lg p-3 mb-4",
      config.bgColor,
      className
    )}>
      <div className="flex items-center gap-3">
        <IconComponent className={cn("w-5 h-5 flex-shrink-0", config.iconColor)} />
        
        <div className="flex-1 min-w-0">
          <h4 className={cn("font-medium text-sm", config.textColor)}>
            {config.title}
          </h4>
          <p className={cn("text-sm", config.textColor, "opacity-80")}>
            {config.message}
          </p>
        </div>
        
        {onRetry && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onRetry}
            className={cn("flex-shrink-0", config.textColor)}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        )}
        
        {onDismiss && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onDismiss}
            className={cn("flex-shrink-0", config.textColor)}
          >
            ✕
          </Button>
        )}
      </div>
    </div>
  );
};

// Indicateur de connexion
export const ConnectionIndicator: React.FC<{ isConnected: boolean }> = ({ isConnected }) => {
  const [showReconnecting, setShowReconnecting] = React.useState(false);

  React.useEffect(() => {
    if (!isConnected) {
      setShowReconnecting(true);
    } else {
      const timer = setTimeout(() => setShowReconnecting(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isConnected]);

  if (!showReconnecting) return null;

  return (
    <div className={cn(
      "fixed top-0 left-0 right-0 z-50 p-2 text-center text-sm font-medium transition-colors",
      isConnected 
        ? "bg-green-500 text-white" 
        : "bg-red-500 text-white"
    )}>
      <div className="flex items-center justify-center gap-2">
        {isConnected ? (
          <>
            <Wifi className="w-4 h-4" />
            <span>Connecté</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4" />
            <span>Connexion...</span>
          </>
        )}
      </div>
    </div>
  );
};

// Message d'erreur inline pour les messages
export const MessageError: React.FC<{
  message: string;
  onRetry: () => void;
  onDelete?: () => void;
}> = ({ message, onRetry, onDelete }) => (
  <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
    <span className="flex-1">{message}</span>
    <Button size="sm" variant="ghost" onClick={onRetry} className="text-red-600 hover:text-red-700">
      <RefreshCw className="w-3 h-3" />
    </Button>
    {onDelete && (
      <Button size="sm" variant="ghost" onClick={onDelete} className="text-red-600 hover:text-red-700">
        ✕
      </Button>
    )}
  </div>
);

// Page d'erreur complète
export const ErrorPage: React.FC<{
  title?: string;
  message?: string;
  onRetry?: () => void;
  onGoBack?: () => void;
}> = ({ 
  title = "Oups ! Quelque chose s'est mal passé",
  message = "Une erreur inattendue s'est produite. Veuillez réessayer.",
  onRetry,
  onGoBack
}) => (
  <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
    <div className="text-6xl mb-4">😕</div>
    
    <h2 className="text-xl font-semibold text-mimo-gray-900 mb-2">
      {title}
    </h2>
    
    <p className="text-mimo-gray-600 mb-6 max-w-md">
      {message}
    </p>
    
    <div className="flex gap-3">
      {onRetry && (
        <Button onClick={onRetry} className="bg-primary-500 text-white hover:bg-primary-600">
          <RefreshCw className="w-4 h-4 mr-2" />
          Réessayer
        </Button>
      )}
      
      {onGoBack && (
        <Button variant="outline" onClick={onGoBack}>
          Retour
        </Button>
      )}
    </div>
  </div>
);