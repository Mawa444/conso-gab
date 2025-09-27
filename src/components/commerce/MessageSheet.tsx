import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Phone, MessageCircle as WhatsApp, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
interface Commerce {
  id: string;
  name: string;
  type: string;
  owner: string;
  category?: string;
  subcategory?: string;
}
interface MessageSheetProps {
  open: boolean;
  onClose: () => void;
  commerce: Commerce;
}
const getCustomizedTemplates = (category?: string, subcategory?: string) => {
  const baseTemplates = {
    reserve: ["Table pour 2 ce soir à 19h.", "Réserver 5 plateaux-repas pour demain midi.", "Table pour 4 personnes samedi soir.", "Réservation pour un groupe de 8 personnes."],
    quote: ["Devis pour 50 unités du produit X.", "Demande de tarifs pour mariage 100 personnes.", "Devis pour livraison hebdomadaire.", "Prix pour prestation complète."],
    appointment: ["Puis-je passer demain à 10h ?", "RDV disponible cette semaine ?", "Consultation possible cet après-midi ?", "Rendez-vous pour vendredi matin."]
  };

  // Personnalisation selon la catégorie
  if (category?.toLowerCase().includes('restaurant') || category?.toLowerCase().includes('alimentation')) {
    return {
      reserve: ["Table pour 2 ce soir à 19h.", "Réserver 5 plateaux-repas pour demain midi.", "Table pour 4 personnes samedi soir.", "Menu du jour disponible ?"],
      quote: ["Devis pour buffet 50 personnes.", "Tarifs pour traiteur mariage 100 invités.", "Prix menu groupe entreprise.", "Devis livraison repas hebdomadaire."],
      appointment: ["Puis-je réserver pour ce soir ?", "Table disponible demain midi ?", "Réservation possible ce weekend ?", "Horaires d'ouverture aujourd'hui ?"]
    };
  }
  if (category?.toLowerCase().includes('beauté') || category?.toLowerCase().includes('coiffure')) {
    return {
      reserve: ["RDV coiffure demain matin.", "Séance manucure cette semaine.", "Réserver soin visage samedi.", "RDV coloration vendredi."],
      quote: ["Tarifs coupe + coloration.", "Prix forfait mariage complète.", "Devis extension cheveux.", "Tarifs soins du visage."],
      appointment: ["Créneaux libres cette semaine ?", "RDV urgent possible ?", "Disponibilité samedi matin ?", "RDV coiffure ce soir ?"]
    };
  }
  if (category?.toLowerCase().includes('vêtement') || category?.toLowerCase().includes('mode')) {
    return {
      reserve: ["Réserver article en magasin.", "Garder la taille M disponible.", "Réserver collection arrivée.", "Mettre de côté cet article."],
      quote: ["Prix pour commande groupée.", "Tarifs personnalisation textile.", "Devis retouches vêtements.", "Prix broderie entreprise."],
      appointment: ["Essayage possible quand ?", "RDV retouches cette semaine.", "Consultation style personnel.", "Horaires d'ouverture ?"]
    };
  }
  return baseTemplates;
};
export const MessageSheet = ({
  open,
  onClose,
  commerce
}: MessageSheetProps) => {
  const [activeTab, setActiveTab] = useState<'reserve' | 'quote' | 'appointment' | 'message'>('reserve');
  const [customMessage, setCustomMessage] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const tabs = [{
    id: 'reserve',
    label: 'Réserver'
  }, {
    id: 'quote',
    label: 'Devis'
  }, {
    id: 'appointment',
    label: 'RDV'
  }, {
    id: 'message',
    label: 'Message'
  }];
  const handleSend = () => {
    const message = selectedTemplate || customMessage;
    if (!message.trim()) return;
    console.log('Envoi du message:', {
      commerce: commerce.id,
      message,
      type: activeTab
    });
    onClose();
    setSelectedTemplate('');
    setCustomMessage('');
  };
  const getCurrentTemplates = () => {
    if (activeTab === 'message') return [];
    const customizedTemplates = getCustomizedTemplates(commerce.category, commerce.subcategory);
    return customizedTemplates[activeTab] || [];
  };
  return <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[50vh] rounded-t-3xl p-0">
        <div className="p-4 px-[20px] my-0 py-[14px]">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-lg font-semibold">
              Message à {commerce.name}
            </SheetTitle>
          </SheetHeader>

          {/* Onglets */}
          <div className="flex gap-1 mb-6 p-1 bg-muted/50 rounded-xl">
            {tabs.map(tab => <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={cn("flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200", activeTab === tab.id ? "bg-[hsl(var(--gaboma-green))] text-white" : "text-muted-foreground hover:text-foreground")}>
                {tab.label}
              </button>)}
          </div>

          {/* Templates prédéfinis */}
          {activeTab !== 'message' && <div className="space-y-2 mb-4">
              {getCurrentTemplates().map((template, index) => <Button key={index} variant={selectedTemplate === template ? "default" : "outline"} className={cn("w-full justify-start text-left h-auto py-3 px-4", selectedTemplate === template && "bg-[hsl(var(--gaboma-green))] text-white")} onClick={() => setSelectedTemplate(template)}>
                  {template}
                </Button>)}
            </div>}

          {/* Message personnalisé */}
          <div className="space-y-4">
            <Textarea placeholder={activeTab === 'message' ? "Écrivez votre message..." : "Ou personnalisez votre message..."} value={customMessage} onChange={e => setCustomMessage(e.target.value)} className="min-h-[80px] resize-none" maxLength={140} />
            
            <div className="text-xs text-muted-foreground text-right">
              {customMessage.length}/140
            </div>

            {/* Bouton d'envoi principal */}
            <Button onClick={handleSend} disabled={!selectedTemplate && !customMessage.trim()} className="w-full h-12 bg-[hsl(var(--gaboma-green))] text-white hover:bg-[hsl(var(--gaboma-green))]/90 font-medium">
              Envoyer le message
            </Button>

            {/* Actions rapides */}
            <div className="flex items-center justify-center gap-6 pt-2">
              <Button variant="ghost" size="sm" className="flex flex-col gap-1 h-auto p-2">
                <WhatsApp className="w-6 h-6 text-green-600" />
                <span className="text-xs">WhatsApp</span>
              </Button>
              
              <Button variant="ghost" size="sm" className="flex flex-col gap-1 h-auto p-2">
                <Phone className="w-6 h-6 text-[hsl(var(--gaboma-blue))]" />
                <span className="text-xs">Appeler</span>
              </Button>
              
              <Button variant="ghost" size="sm" className="flex flex-col gap-1 h-auto p-2">
                <Mail className="w-6 h-6 text-muted-foreground" />
                <span className="text-xs">Email</span>
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>;
};