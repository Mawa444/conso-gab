import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

interface WhatsAppRedirectButtonProps {
  phoneNumber: string;
  businessName?: string;
}

export const WhatsAppRedirectButton: React.FC<WhatsAppRedirectButtonProps> = ({
  phoneNumber,
  businessName
}) => {
  const handleRedirect = () => {
    // Nettoyer le numéro (enlever espaces, tirets, etc.)
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    
    // Message pré-rempli optionnel
    const message = businessName 
      ? `Bonjour ${businessName}, je vous contacte via ConsoGab.`
      : 'Bonjour, je vous contacte via ConsoGab.';
    
    // Encoder le message pour l'URL
    const encodedMessage = encodeURIComponent(message);
    
    // Créer le lien WhatsApp
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
    
    // Ouvrir dans un nouvel onglet
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Button
      onClick={handleRedirect}
      className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white gap-2"
      size="sm"
    >
      <MessageCircle className="w-4 h-4" />
      Continuer sur WhatsApp
    </Button>
  );
};
