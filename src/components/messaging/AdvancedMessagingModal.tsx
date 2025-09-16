import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Send, 
  Phone, 
  MapPin, 
  MessageCircle, 
  Calendar as CalendarIcon,
  FileText,
  Navigation,
  Clock,
  User,
  Mail,
  Star,
  Heart,
  Share2,
  Bookmark,
  Image as ImageIcon,
  Paperclip,
  Mic,
  Video,
  Gift,
  CreditCard,
  Truck,
  MapPin as Location
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface Catalog {
  id: string;
  name: string;
  description?: string;
  category?: string;
  subcategory?: string;
  catalog_type: 'products' | 'services';
  businessName?: string;
  contact_whatsapp?: string;
  contact_phone?: string;
  contact_email?: string;
  geo_city?: string;
  geo_district?: string;
  delivery_available?: boolean;
  delivery_zones?: string[];
  delivery_cost?: number;
}

interface AdvancedMessagingModalProps {
  open: boolean;
  onClose: () => void;
  catalog: Catalog;
}

export const AdvancedMessagingModal = ({ open, onClose, catalog }: AdvancedMessagingModalProps) => {
  const [activeTab, setActiveTab] = useState("message");
  const [message, setMessage] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [groupSize, setGroupSize] = useState("1");
  const [specialRequests, setSpecialRequests] = useState("");
  const [quotationDetails, setQuotationDetails] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [priority, setPriority] = useState("normal");

  const handleSend = () => {
    const requestData = {
      catalog_id: catalog.id,
      type: activeTab,
      message,
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_email: customerEmail,
      booking_date: selectedDate,
      booking_time: selectedTime,
      service_type: serviceType,
      group_size: parseInt(groupSize),
      special_requests: specialRequests,
      quotation_details: quotationDetails,
      delivery_address: deliveryAddress,
      priority
    };

    console.log("Envoi de la demande avancée:", requestData);
    
    // Here you would typically send this to your backend
    onClose();
    
    // Reset form
    setMessage("");
    setCustomerName("");
    setCustomerPhone("");
    setCustomerEmail("");
    setSelectedDate(undefined);
    setSelectedTime("");
    setServiceType("");
    setGroupSize("1");
    setSpecialRequests("");
    setQuotationDetails("");
    setDeliveryAddress("");
    setPriority("normal");
  };

  const quickMessages = {
    message: [
      "Bonjour, j'aimerais avoir plus d'informations sur vos services.",
      "Êtes-vous disponible aujourd'hui ?",
      "Quels sont vos tarifs actuels ?",
      "Acceptez-vous les paiements par mobile money ?"
    ],
    appointment: [
      "J'aimerais prendre un rendez-vous cette semaine.",
      "Avez-vous des créneaux libres demain ?",
      "Rendez-vous urgent possible ?",
      "Consultation à domicile possible ?"
    ],
    quote: [
      "Demande de devis pour un événement.",
      "Tarifs pour commande en gros.",
      "Devis personnalisé selon mes besoins.",
      "Prix pour livraison incluse."
    ],
    order: [
      "Commande à emporter.",
      "Livraison à domicile possible ?",
      "Stock disponible pour achat immédiat ?",
      "Paiement à la livraison accepté ?"
    ]
  };

  const timeSlots = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
    "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
    "17:00", "17:30", "18:00", "18:30", "19:00", "19:30"
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-primary to-accent rounded-lg">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Centre de Communication Avancé</h2>
              <p className="text-sm text-muted-foreground">
                Contactez {catalog.name} pour tous vos besoins
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="p-6">
          {/* Business Info Card */}
          <Card className="mb-6 bg-gradient-to-r from-primary/5 to-accent/5">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">{catalog.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="outline">{catalog.category}</Badge>
                    {catalog.subcategory && (
                      <Badge variant="outline">{catalog.subcategory}</Badge>
                    )}
                  </div>
                  {catalog.geo_city && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      {catalog.geo_district}, {catalog.geo_city}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Heart className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Bookmark className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="message" className="flex items-center gap-1 text-xs">
                <MessageCircle className="w-3 h-3" />
                Message
              </TabsTrigger>
              <TabsTrigger value="appointment" className="flex items-center gap-1 text-xs">
                <CalendarIcon className="w-3 h-3" />
                RDV
              </TabsTrigger>
              <TabsTrigger value="quote" className="flex items-center gap-1 text-xs">
                <FileText className="w-3 h-3" />
                Devis
              </TabsTrigger>
              <TabsTrigger value="order" className="flex items-center gap-1 text-xs">
                <Gift className="w-3 h-3" />
                Commande
              </TabsTrigger>
              <TabsTrigger value="advanced" className="flex items-center gap-1 text-xs">
                <Star className="w-3 h-3" />
                Plus
              </TabsTrigger>
            </TabsList>

            {/* Message Tab */}
            <TabsContent value="message" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    Envoyer un message
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Quick messages */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Messages rapides</label>
                    <div className="grid grid-cols-1 gap-2">
                      {quickMessages.message.map((msg, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="justify-start text-left h-auto p-3"
                          onClick={() => setMessage(msg)}
                        >
                          {msg}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Votre nom</label>
                      <Input
                        placeholder="Nom complet"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Téléphone</label>
                      <Input
                        placeholder="+241 01 23 45 67"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Votre message</label>
                    <Textarea
                      placeholder="Décrivez votre demande en détail..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Priorité</label>
                    <Select value={priority} onValueChange={setPriority}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner la priorité" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Basse - Réponse sous 24h</SelectItem>
                        <SelectItem value="normal">Normale - Réponse sous 4h</SelectItem>
                        <SelectItem value="high">Haute - Réponse sous 1h</SelectItem>
                        <SelectItem value="urgent">Urgente - Réponse immédiate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Attachment options */}
                  <div className="flex items-center gap-2 pt-2">
                    <Button variant="ghost" size="sm">
                      <Paperclip className="w-4 h-4 mr-2" />
                      Joindre un fichier
                    </Button>
                    <Button variant="ghost" size="sm">
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Photo
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Mic className="w-4 h-4 mr-2" />
                      Audio
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Location className="w-4 h-4 mr-2" />
                      Position
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Appointment Tab */}
            <TabsContent value="appointment" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5" />
                    Prendre un rendez-vous
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Votre nom</label>
                      <Input
                        placeholder="Nom complet"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Téléphone</label>
                      <Input
                        placeholder="+241 01 23 45 67"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Date souhaitée</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !selectedDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDate ? format(selectedDate, "PPP", { locale: fr }) : "Choisir une date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Heure préférée</label>
                      <Select value={selectedTime} onValueChange={setSelectedTime}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choisir l'heure" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={time} value={time}>{time}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Type de service</label>
                      <Select value={serviceType} onValueChange={setServiceType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Type de service" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="consultation">Consultation</SelectItem>
                          <SelectItem value="service">Prestation de service</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                          <SelectItem value="installation">Installation</SelectItem>
                          <SelectItem value="formation">Formation</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nombre de personnes</label>
                      <Select value={groupSize} onValueChange={setGroupSize}>
                        <SelectTrigger>
                          <SelectValue placeholder="Nombre" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                            <SelectItem key={num} value={num.toString()}>{num} personne{num > 1 ? 's' : ''}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Demandes spéciales</label>
                    <Textarea
                      placeholder="Précisez vos besoins particuliers..."
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Quote Tab */}
            <TabsContent value="quote" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Demander un devis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Votre nom</label>
                      <Input
                        placeholder="Nom complet"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email</label>
                      <Input
                        type="email"
                        placeholder="votre@email.com"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Détails du projet</label>
                    <Textarea
                      placeholder="Décrivez en détail votre projet, vos besoins, quantités, délais..."
                      value={quotationDetails}
                      onChange={(e) => setQuotationDetails(e.target.value)}
                      rows={6}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Budget indicatif</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Fourchette de budget" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0-50000">0 - 50 000 FCFA</SelectItem>
                          <SelectItem value="50000-100000">50 000 - 100 000 FCFA</SelectItem>
                          <SelectItem value="100000-500000">100 000 - 500 000 FCFA</SelectItem>
                          <SelectItem value="500000+">Plus de 500 000 FCFA</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Délai souhaité</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Quand en avez-vous besoin ?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="urgent">Urgent (moins d'une semaine)</SelectItem>
                          <SelectItem value="1-2weeks">1-2 semaines</SelectItem>
                          <SelectItem value="1month">Dans le mois</SelectItem>
                          <SelectItem value="flexible">Flexible</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Order Tab */}
            <TabsContent value="order" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="w-5 h-5" />
                    Passer une commande
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Votre nom</label>
                      <Input
                        placeholder="Nom complet"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Téléphone</label>
                      <Input
                        placeholder="+241 01 23 45 67"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Détails de la commande</label>
                    <Textarea
                      placeholder="Décrivez ce que vous souhaitez commander (produits, quantités, spécifications...)"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                    />
                  </div>

                  {catalog.delivery_available && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4" />
                        <span className="font-medium">Options de livraison</span>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Adresse de livraison</label>
                        <Textarea
                          placeholder="Adresse complète pour la livraison..."
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          rows={2}
                        />
                      </div>

                      {catalog.delivery_cost && (
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <p className="text-sm">
                            <strong>Frais de livraison :</strong> {catalog.delivery_cost} FCFA
                          </p>
                          {catalog.delivery_zones && catalog.delivery_zones.length > 0 && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Zones de livraison : {catalog.delivery_zones.join(", ")}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Mode de paiement préféré</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Comment souhaitez-vous payer ?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Espèces</SelectItem>
                        <SelectItem value="mobile">Mobile Money</SelectItem>
                        <SelectItem value="card">Carte bancaire</SelectItem>
                        <SelectItem value="transfer">Virement</SelectItem>
                        <SelectItem value="discuss">À discuter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Annuler
            </Button>
            <Button 
              onClick={handleSend} 
              disabled={!customerName.trim() || (!message.trim() && !quotationDetails.trim())}
              className="flex-1 bg-gradient-to-r from-primary to-accent text-white hover:opacity-90"
            >
              <Send className="w-4 h-4 mr-2" />
              Envoyer la demande
            </Button>
          </div>

          {/* Quick contact actions */}
          <div className="flex items-center justify-center gap-4 pt-4">
            {catalog.contact_whatsapp && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => window.open(`https://wa.me/${catalog.contact_whatsapp}`, '_blank')}
                className="flex items-center gap-2 text-green-600 hover:text-green-700"
              >
                <MessageCircle className="w-5 h-5" />
                WhatsApp
              </Button>
            )}
            {catalog.contact_phone && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => window.open(`tel:${catalog.contact_phone}`, '_blank')}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
              >
                <Phone className="w-5 h-5" />
                Appeler
              </Button>
            )}
            {catalog.contact_email && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => window.open(`mailto:${catalog.contact_email}`, '_blank')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-700"
              >
                <Mail className="w-5 h-5" />
                Email
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm"
              className="flex items-center gap-2 text-purple-600 hover:text-purple-700"
            >
              <Navigation className="w-5 h-5" />
              Itinéraire
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};