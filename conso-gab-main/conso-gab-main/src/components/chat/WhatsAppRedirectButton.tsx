import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

interface WhatsAppRedirectButtonProps {
  phoneNumber: string;
  businessName?: string;
  message?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

export const WhatsAppRedirectButton: React.FC<WhatsAppRedirectButtonProps> = ({
  phoneNumber,
  businessName,
  message,
  variant = 'default',
  size = 'sm',
  className
}) => {
  const handleWhatsAppRedirect = () => {
    // Nettoyer le numéro de téléphone
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    
    // Créer le message par défaut si non fourni
    const defaultMessage = businessName 
      ? `Bonjour ${businessName}, j'ai une question à vous poser.`
      : `Bonjour, j'ai une question à vous poser.`;
    
    const whatsappMessage = message || defaultMessage;
    const encodedMessage = encodeURIComponent(whatsappMessage);
    
    // Créer le lien WhatsApp
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
    
    // Ouvrir dans une nouvelle fenêtre
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleWhatsAppRedirect}
      className={className}
    >
      <MessageCircle className="w-4 h-4 mr-2" />
      WhatsApp
    </Button>
  );
};
