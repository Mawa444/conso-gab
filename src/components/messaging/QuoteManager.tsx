import { useState } from "react";
import { FileText, Plus, Eye, Edit, Send, Check, X, Clock, Calculator } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface Quote {
  id: string;
  quoteNumber: string;
  customerName: string;
  customerAvatar?: string;
  businessName: string;
  status: "draft" | "sent" | "viewed" | "accepted" | "rejected" | "expired";
  total: number;
  validUntil: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  createdAt: string;
  notes?: string;
}

const MOCK_QUOTES: Quote[] = [
  {
    id: "1",
    quoteNumber: "DEV-2024-001",
    customerName: "Restaurant Le Palmier",
    businessName: "ConsoGab Services",
    status: "sent",
    total: 75000,
    validUntil: "2024-02-15T23:59:59Z",
    items: [
      { description: "Site web vitrine", quantity: 1, unitPrice: 50000, total: 50000 },
      { description: "Formation équipe", quantity: 2, unitPrice: 12500, total: 25000 }
    ],
    createdAt: "2024-01-20T09:00:00Z",
    notes: "Formation incluse pour 2 personnes"
  },
  {
    id: "2",
    quoteNumber: "DEV-2024-002", 
    customerName: "Marie Nkoghe",
    businessName: "Boutique Mode & Style",
    status: "accepted",
    total: 125000,
    validUntil: "2024-02-10T23:59:59Z",
    items: [
      { description: "Système de gestion stock", quantity: 1, unitPrice: 100000, total: 100000 },
      { description: "Installation et paramétrage", quantity: 1, unitPrice: 25000, total: 25000 }
    ],
    createdAt: "2024-01-18T14:30:00Z"
  },
  {
    id: "3",
    quoteNumber: "DEV-2024-003",
    customerName: "Paul Ondo",
    businessName: "Tech Solutions",
    status: "draft",
    total: 200000,
    validUntil: "2024-03-01T23:59:59Z",
    items: [
      { description: "Application mobile e-commerce", quantity: 1, unitPrice: 150000, total: 150000 },
      { description: "Interface d'administration", quantity: 1, unitPrice: 50000, total: 50000 }
    ],
    createdAt: "2024-01-19T16:20:00Z",
    notes: "Application iOS et Android natives"
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "draft":
      return "bg-gray-100 text-gray-700 border-gray-200";
    case "sent":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "viewed":
      return "bg-purple-100 text-purple-700 border-purple-200";
    case "accepted":
      return "bg-green-100 text-green-700 border-green-200";
    case "rejected":
      return "bg-red-100 text-red-700 border-red-200";
    case "expired":
      return "bg-orange-100 text-orange-700 border-orange-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "draft":
      return <Edit className="w-4 h-4" />;
    case "sent":
      return <Send className="w-4 h-4" />;
    case "viewed":
      return <Eye className="w-4 h-4" />;
    case "accepted":
      return <Check className="w-4 h-4" />;
    case "rejected":
      return <X className="w-4 h-4" />;
    case "expired":
      return <Clock className="w-4 h-4" />;
    default:
      return <FileText className="w-4 h-4" />;
  }
};

interface QuoteManagerProps {
  searchQuery: string;
}

export const QuoteManager = ({ searchQuery }: QuoteManagerProps) => {
  const [selectedQuote, setSelectedQuote] = useState<string | null>("1");

  const filteredQuotes = MOCK_QUOTES.filter(quote =>
    quote.quoteNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    quote.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    quote.businessName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedQuoteData = MOCK_QUOTES.find(q => q.id === selectedQuote);

  const isExpired = (validUntil: string) => {
    return new Date(validUntil) < new Date();
  };

  return (
    <div className="flex h-full">
      {/* Quotes List */}
      <div className="w-1/3 border-r border-border/50 flex flex-col bg-background/50">
        {/* Header */}
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Devis</h3>
            <Button size="sm" className="gap-2 bg-gradient-to-r from-primary to-accent text-white">
              <Plus className="w-4 h-4" />
              Nouveau
            </Button>
          </div>
        </div>

        {/* Quotes */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {filteredQuotes.map((quote) => (
              <Card
                key={quote.id}
                className={cn(
                  "cursor-pointer transition-all duration-200 hover:shadow-md border-0",
                  selectedQuote === quote.id 
                    ? "bg-gradient-to-r from-primary/10 to-accent/10 shadow-md" 
                    : "hover:bg-accent/5"
                )}
                onClick={() => setSelectedQuote(quote.id)}
              >
                <CardContent className="p-3">
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-sm">{quote.quoteNumber}</h4>
                        <p className="text-xs text-muted-foreground">{quote.businessName}</p>
                      </div>
                      <Badge className={cn("text-xs px-2 py-1 gap-1", getStatusColor(quote.status))}>
                        {getStatusIcon(quote.status)}
                        {quote.status}
                      </Badge>
                    </div>

                    {/* Customer */}
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={quote.customerAvatar} />
                        <AvatarFallback className="text-xs">
                          {quote.customerName.split(" ").map(n => n[0]).slice(0, 2).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{quote.customerName}</p>
                      </div>
                    </div>

                    {/* Amount & Validity */}
                    <div className="flex justify-between items-center">
                      <div className="text-sm font-semibold text-primary">
                        {quote.total.toLocaleString()} FCFA
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {isExpired(quote.validUntil) ? (
                          <span className="text-red-600 font-medium">Expiré</span>
                        ) : (
                          <span>
                            Valide jusqu'au {new Date(quote.validUntil).toLocaleDateString('fr-FR')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Date */}
                    <div className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(quote.createdAt), { addSuffix: true, locale: fr })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Quote Details */}
      <div className="flex-1 flex flex-col">
        {selectedQuoteData ? (
          <>
            {/* Quote Header */}
            <div className="p-4 border-b border-border/50 bg-background/80 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{selectedQuoteData.quoteNumber}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge className={cn("text-xs px-2 py-1 gap-1", getStatusColor(selectedQuoteData.status))}>
                      {getStatusIcon(selectedQuoteData.status)}
                      {selectedQuoteData.status}
                    </Badge>
                    <span>•</span>
                    <span>{selectedQuoteData.businessName}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {selectedQuoteData.status === "draft" && (
                    <Button size="sm" className="gap-2">
                      <Send className="w-4 h-4" />
                      Envoyer
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Client Info */}
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={selectedQuoteData.customerAvatar} />
                  <AvatarFallback>
                    {selectedQuoteData.customerName.split(" ").map(n => n[0]).slice(0, 2).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{selectedQuoteData.customerName}</p>
                  <p className="text-sm text-muted-foreground">Client</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    Valide jusqu'au {new Date(selectedQuoteData.validUntil).toLocaleDateString('fr-FR')}
                  </p>
                  {isExpired(selectedQuoteData.validUntil) && (
                    <Badge className="text-xs bg-red-100 text-red-700">Expiré</Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Quote Content */}
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="max-w-4xl mx-auto space-y-6">
                {/* Quote Items */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="w-5 h-5" />
                      Détail du devis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Items Table */}
                      <div className="border rounded-lg overflow-hidden">
                        <div className="bg-muted/50 p-3 grid grid-cols-6 gap-4 text-sm font-medium">
                          <div className="col-span-3">Description</div>
                          <div className="text-center">Qté</div>
                          <div className="text-right">Prix unitaire</div>
                          <div className="text-right">Total</div>
                        </div>
                        
                        {selectedQuoteData.items.map((item, index) => (
                          <div key={index} className="p-3 grid grid-cols-6 gap-4 text-sm border-t">
                            <div className="col-span-3 font-medium">{item.description}</div>
                            <div className="text-center">{item.quantity}</div>
                            <div className="text-right">{item.unitPrice.toLocaleString()} FCFA</div>
                            <div className="text-right font-medium">{item.total.toLocaleString()} FCFA</div>
                          </div>
                        ))}
                        
                        {/* Total */}
                        <div className="bg-muted/30 p-3 border-t">
                          <div className="grid grid-cols-6 gap-4">
                            <div className="col-span-5 text-right font-semibold">TOTAL HT</div>
                            <div className="text-right font-bold text-lg text-primary">
                              {selectedQuoteData.total.toLocaleString()} FCFA
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Notes */}
                      {selectedQuoteData.notes && (
                        <div className="mt-6">
                          <h4 className="font-medium mb-2">Notes</h4>
                          <div className="p-3 bg-muted/50 rounded-lg">
                            <p className="text-sm">{selectedQuoteData.notes}</p>
                          </div>
                        </div>
                      )}

                      {/* Terms */}
                      <div className="mt-6">
                        <h4 className="font-medium mb-2">Conditions</h4>
                        <div className="p-3 bg-muted/50 rounded-lg text-sm space-y-2">
                          <p>• Ce devis est valable jusqu'au {new Date(selectedQuoteData.validUntil).toLocaleDateString('fr-FR')}</p>
                          <p>• Les prix sont exprimés en FCFA HT</p>
                          <p>• Délai de réalisation : À définir selon acceptation</p>
                          <p>• Modalités de paiement : 50% à la commande, 50% à la livraison</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quote Actions */}
                {selectedQuoteData.status === "sent" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Actions disponibles</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-4">
                        <Button className="flex-1 gap-2 bg-green-600 hover:bg-green-700">
                          <Check className="w-4 h-4" />
                          Marquer comme accepté
                        </Button>
                        <Button variant="outline" className="flex-1 gap-2 text-red-600 hover:text-red-700">
                          <X className="w-4 h-4" />
                          Marquer comme refusé
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Status History */}
                <Card>
                  <CardHeader>
                    <CardTitle>Historique</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-2 bg-muted/30 rounded">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Devis créé</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(selectedQuoteData.createdAt).toLocaleString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      
                      {selectedQuoteData.status !== "draft" && (
                        <div className="flex items-center gap-3 p-2 bg-muted/30 rounded">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">Devis envoyé</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(selectedQuoteData.createdAt), { addSuffix: true, locale: fr })}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <FileText className="w-16 h-16 mx-auto text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold">Sélectionnez un devis</h3>
                <p className="text-muted-foreground">
                  Choisissez un devis pour voir les détails et gérer le suivi
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};