import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Package, 
  Calendar, 
  CreditCard, 
  MessageCircle, 
  Archive,
  Download,
  Printer,
  Zap,
  Clock,
  User,
  MapPin,
  Phone
} from "lucide-react";
import { Conversation } from "@/types/messaging-advanced";

interface QuickActionsNewProps {
  conversationId: string;
  conversation: Conversation;
  onAction: (action: QuickActionData) => void;
}

interface QuickActionData {
  type: string;
  data: Record<string, any>;
}

export const QuickActionsNew: React.FC<QuickActionsNewProps> = ({
  conversationId,
  conversation,
  onAction
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});

  // Déterminer si l'utilisateur est un vendeur (business owner)
  const isVendor = true; // À implémenter avec la logique de rôle

  const updateFormData = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (actionType: string) => {
    onAction({
      type: actionType,
      data: { ...formData, conversationId }
    });
    setFormData({});
  };

  // Actions disponibles selon le rôle
  const customerActions = [
    { id: 'request_quote', label: 'Demander un devis', icon: FileText, description: 'Demander un devis personnalisé' },
    { id: 'book_service', label: 'Réserver un service', icon: Calendar, description: 'Prendre un rendez-vous' },
    { id: 'track_order', label: 'Suivre ma commande', icon: Package, description: 'Voir le statut de ma commande' },
    { id: 'support_ticket', label: 'Signaler un problème', icon: MessageCircle, description: 'Ouvrir un ticket de support' }
  ];

  const vendorActions = [
    { id: 'send_quote', label: 'Envoyer un devis', icon: FileText, description: 'Créer et envoyer un devis' },
    { id: 'create_invoice', label: 'Créer une facture', icon: CreditCard, description: 'Générer une facture' },
    { id: 'schedule_appointment', label: 'Programmer RDV', icon: Calendar, description: 'Proposer des créneaux' },
    { id: 'update_order', label: 'Mettre à jour commande', icon: Package, description: 'Changer le statut' },
    { id: 'send_reminder', label: 'Envoyer rappel', icon: Clock, description: 'Rappel de paiement ou RDV' },
    { id: 'archive_conversation', label: 'Archiver', icon: Archive, description: 'Archiver la conversation' }
  ];

  const actions = isVendor ? vendorActions : customerActions;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Actions rapides</h3>
        <Badge variant="outline">
          {isVendor ? 'Vendeur' : 'Client'}
        </Badge>
      </div>

      <Tabs defaultValue="business" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="business">Affaires</TabsTrigger>
          <TabsTrigger value="service">Services</TabsTrigger>
          <TabsTrigger value="other">Autres</TabsTrigger>
        </TabsList>

        <TabsContent value="business" className="space-y-4">
          {/* Actions rapides - Affaires */}
          <div className="grid grid-cols-2 gap-3">
            {actions.slice(0, 4).map((action) => (
              <Button
                key={action.id}
                variant="outline"
                className="h-auto p-3 flex flex-col items-center gap-2"
                onClick={() => handleSubmit(action.id)}
              >
                <action.icon className="h-5 w-5" />
                <div className="text-center">
                  <div className="text-xs font-medium">{action.label}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {action.description}
                  </div>
                </div>
              </Button>
            ))}
          </div>

          {/* Formulaire pour créer un devis */}
          {isVendor && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Créer un devis rapide</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label htmlFor="quote-product" className="text-xs">Produit/Service</Label>
                  <Input
                    id="quote-product"
                    placeholder="Nom du produit ou service"
                    value={formData.product || ''}
                    onChange={(e) => updateFormData('product', e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="quote-quantity" className="text-xs">Quantité</Label>
                    <Input
                      id="quote-quantity"
                      type="number"
                      placeholder="1"
                      value={formData.quantity || ''}
                      onChange={(e) => updateFormData('quantity', e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="quote-price" className="text-xs">Prix unitaire (FCFA)</Label>
                    <Input
                      id="quote-price"
                      type="number"
                      placeholder="0"
                      value={formData.price || ''}
                      onChange={(e) => updateFormData('price', e.target.value)}
                      className="text-sm"
                    />
                  </div>
                </div>
                <Button 
                  size="sm" 
                  className="w-full"
                  onClick={() => handleSubmit('send_quote')}
                >
                  Envoyer le devis
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="service" className="space-y-4">
          {/* Actions de service */}
          <div className="grid grid-cols-2 gap-3">
            {actions.slice(4, 8).map((action) => (
              <Button
                key={action.id}
                variant="outline"
                className="h-auto p-3 flex flex-col items-center gap-2"
                onClick={() => handleSubmit(action.id)}
              >
                <action.icon className="h-5 w-5" />
                <div className="text-center">
                  <div className="text-xs font-medium">{action.label}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {action.description}
                  </div>
                </div>
              </Button>
            ))}
          </div>

          {/* Formulaire de réservation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Programmer un rendez-vous</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="appointment-date" className="text-xs">Date</Label>
                  <Input
                    id="appointment-date"
                    type="date"
                    value={formData.date || ''}
                    onChange={(e) => updateFormData('date', e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="appointment-time" className="text-xs">Heure</Label>
                  <Input
                    id="appointment-time"
                    type="time"
                    value={formData.time || ''}
                    onChange={(e) => updateFormData('time', e.target.value)}
                    className="text-sm"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="service-type" className="text-xs">Type de service</Label>
                <Select 
                  value={formData.serviceType || ''} 
                  onValueChange={(value) => updateFormData('serviceType', value)}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Choisir un service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consultation">Consultation</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="installation">Installation</SelectItem>
                    <SelectItem value="formation">Formation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                size="sm" 
                className="w-full"
                onClick={() => handleSubmit('schedule_appointment')}
              >
                Programmer le RDV
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="other" className="space-y-4">
          {/* Autres actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-auto p-3 flex flex-col items-center gap-2"
              onClick={() => handleSubmit('archive_conversation')}
            >
              <Archive className="h-5 w-5" />
              <div className="text-center">
                <div className="text-xs font-medium">Archiver</div>
                <div className="text-[10px] text-muted-foreground">
                  Archiver la conversation
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-3 flex flex-col items-center gap-2"
              onClick={() => handleSubmit('mark_important')}
            >
              <Zap className="h-5 w-5" />
              <div className="text-center">
                <div className="text-xs font-medium">Prioritaire</div>
                <div className="text-[10px] text-muted-foreground">
                  Marquer comme important
                </div>
              </div>
            </Button>
          </div>

          {/* Export et impression */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Exporter l'historique</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => handleSubmit('export_pdf')}
              >
                <Download className="h-4 w-4 mr-2" />
                Télécharger en PDF
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => handleSubmit('print_conversation')}
              >
                <Printer className="h-4 w-4 mr-2" />
                Imprimer la conversation
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};