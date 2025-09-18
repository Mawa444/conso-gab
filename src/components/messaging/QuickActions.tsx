import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ShoppingCart,
  Calendar,
  CreditCard,
  Package,
  FileText,
  QrCode,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  Archive,
  User,
  MapPin,
  Phone,
  Mail,
  Printer
} from "lucide-react";
import { ConversationData } from "./ConversationDetails";

interface QuickActionsProps {
  conversationId: string;
  conversation: ConversationData;
  onAction: (action: QuickActionData) => void;
}

interface QuickActionData {
  type: "order" | "reservation" | "payment" | "delivery" | "stock_update" | "generate_qr" | "archive" | "export";
  data: Record<string, any>;
}

export const QuickActions = ({ conversationId, conversation, onAction }: QuickActionsProps) => {
  const [activeTab, setActiveTab] = useState("order");
  const [formData, setFormData] = useState<Record<string, any>>({});

  // Actions for customers
  const customerActions = [
    {
      id: "order",
      label: "Passer commande",
      icon: ShoppingCart,
      description: "Créer une nouvelle commande"
    },
    {
      id: "reservation",
      label: "Réserver",
      icon: Calendar,
      description: "Réserver un service ou rendez-vous"
    },
    {
      id: "payment",
      label: "Payer",
      icon: CreditCard,
      description: "Effectuer un paiement"
    },
    {
      id: "reschedule",
      label: "Reprogrammer",
      icon: Clock,
      description: "Modifier livraison/rendez-vous"
    },
    {
      id: "cancel",
      label: "Annuler",
      icon: XCircle,
      description: "Annuler commande/réservation"
    },
    {
      id: "invoice",
      label: "Demander facture",
      icon: FileText,
      description: "Obtenir une facture"
    }
  ];

  // Actions for vendors/businesses
  const vendorActions = [
    {
      id: "confirm_order",
      label: "Confirmer commande",
      icon: CheckCircle,
      description: "Valider la commande"
    },
    {
      id: "schedule_appointment",
      label: "Planifier RDV",
      icon: Calendar,
      description: "Programmer un rendez-vous"
    },
    {
      id: "confirm_payment",
      label: "Confirmer paiement",
      icon: CreditCard,
      description: "Valider réception paiement"
    },
    {
      id: "update_stock",
      label: "Mettre à jour stock",
      icon: Package,
      description: "Modifier disponibilité"
    },
    {
      id: "generate_qr",
      label: "Générer QR",
      icon: QrCode,
      description: "Code de validation/livraison"
    },
    {
      id: "ready_notification",
      label: "Produit prêt",
      icon: CheckCircle,
      description: "Notifier disponibilité"
    },
    {
      id: "archive",
      label: "Archiver",
      icon: Archive,
      description: "Archiver conversation"
    }
  ];

  const handleSubmit = (actionType: string) => {
    onAction({
      type: actionType as any,
      data: {
        conversation_id: conversationId,
        ...formData
      }
    });
  };

  const updateFormData = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  // Determine if current user is customer or vendor
  const isVendor = true; // This should come from auth context
  const actions = isVendor ? vendorActions : customerActions;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Actions rapides</h3>
          <p className="text-sm text-muted-foreground">
            {isVendor ? "Actions pour le vendeur" : "Actions pour le client"}
          </p>
        </div>
        <Badge variant={isVendor ? "default" : "secondary"}>
          {isVendor ? "Vendeur" : "Client"}
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="order">Commandes</TabsTrigger>
          <TabsTrigger value="service">Services</TabsTrigger>
          <TabsTrigger value="other">Autres</TabsTrigger>
        </TabsList>

        {/* Order Actions */}
        <TabsContent value="order" className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {actions.filter(a => ["order", "confirm_order", "payment", "confirm_payment"].includes(a.id)).map((action) => (
              <Card key={action.id} className="cursor-pointer hover:bg-accent transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <action.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{action.label}</p>
                      <p className="text-xs text-muted-foreground">{action.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Form */}
          {activeTab === "order" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Nouvelle commande</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Produit</label>
                    <Select onValueChange={(value) => updateFormData("product_id", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner produit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="prod1">Produit A - 5000 FCFA</SelectItem>
                        <SelectItem value="prod2">Produit B - 8000 FCFA</SelectItem>
                        <SelectItem value="prod3">Service C - 12000 FCFA</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Quantité</label>
                    <Input
                      type="number"
                      placeholder="1"
                      onChange={(e) => updateFormData("quantity", parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Adresse de livraison</label>
                  <Textarea
                    placeholder="Adresse complète..."
                    onChange={(e) => updateFormData("delivery_address", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Notes spéciales</label>
                  <Textarea
                    placeholder="Instructions particulières..."
                    onChange={(e) => updateFormData("notes", e.target.value)}
                  />
                </div>

                <Button onClick={() => handleSubmit("order")} className="w-full">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Créer la commande
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Service Actions */}
        <TabsContent value="service" className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {actions.filter(a => ["reservation", "schedule_appointment", "reschedule", "cancel"].includes(a.id)).map((action) => (
              <Card key={action.id} className="cursor-pointer hover:bg-accent transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-accent/10 rounded-lg">
                      <action.icon className="w-4 h-4 text-accent-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{action.label}</p>
                      <p className="text-xs text-muted-foreground">{action.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Appointment Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Programmer un rendez-vous</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date</label>
                  <Input
                    type="date"
                    onChange={(e) => updateFormData("appointment_date", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Heure</label>
                  <Select onValueChange={(value) => updateFormData("appointment_time", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Heure" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="09:00">09:00</SelectItem>
                      <SelectItem value="10:00">10:00</SelectItem>
                      <SelectItem value="11:00">11:00</SelectItem>
                      <SelectItem value="14:00">14:00</SelectItem>
                      <SelectItem value="15:00">15:00</SelectItem>
                      <SelectItem value="16:00">16:00</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Type de service</label>
                <Select onValueChange={(value) => updateFormData("service_type", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Type de service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consultation">Consultation</SelectItem>
                    <SelectItem value="installation">Installation</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="formation">Formation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={() => handleSubmit("reservation")} className="w-full">
                <Calendar className="w-4 h-4 mr-2" />
                Programmer le rendez-vous
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other Actions */}
        <TabsContent value="other" className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {actions.filter(a => !["order", "confirm_order", "payment", "confirm_payment", "reservation", "schedule_appointment", "reschedule", "cancel"].includes(a.id)).map((action) => (
              <Card 
                key={action.id} 
                className="cursor-pointer hover:bg-accent transition-colors"
                onClick={() => handleSubmit(action.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-secondary/10 rounded-lg">
                      <action.icon className="w-4 h-4 text-secondary-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{action.label}</p>
                      <p className="text-xs text-muted-foreground">{action.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Export/Print Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Printer className="w-4 h-4" />
                Exporter historique
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <FileText className="w-4 h-4 mr-2" />
                  PDF
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Imprimer
                </Button>
              </div>
              
              <div className="text-xs text-muted-foreground">
                Exporter tout l'historique de la conversation comme justificatif
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
