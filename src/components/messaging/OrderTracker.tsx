import { useState } from "react";
import { 
  ShoppingCart, 
  Plus, 
  Eye, 
  Edit, 
  Truck, 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertCircle,
  Package,
  MapPin,
  User,
  Phone,
  Calendar,
  DollarSign,
  MessageSquare
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerAvatar?: string;
  customerPhone: string;
  businessName: string;
  status: "pending" | "confirmed" | "preparing" | "ready" | "shipped" | "delivered" | "cancelled";
  total: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    image?: string;
  }>;
  createdAt: string;
  estimatedDelivery?: string;
  deliveryAddress: string;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  notes?: string;
}

const MOCK_ORDERS: Order[] = [
  {
    id: "1",
    orderNumber: "CMD-2024-001",
    customerName: "Marie Nkoghe",
    customerPhone: "+241 06 12 34 56",
    businessName: "Restaurant Le Palmier",
    status: "preparing",
    total: 15500,
    items: [
      { name: "Poulet braisé", quantity: 2, price: 5000 },
      { name: "Riz sauté", quantity: 1, price: 3000 },
      { name: "Salade verte", quantity: 2, price: 1250 }
    ],
    createdAt: "2024-01-20T10:30:00Z",
    estimatedDelivery: "2024-01-20T12:30:00Z",
    deliveryAddress: "Quartier Nombakélé, Libreville",
    paymentStatus: "paid",
    notes: "Pas trop épicé s'il vous plaît"
  },
  {
    id: "2", 
    orderNumber: "CMD-2024-002",
    customerName: "Jean Obiang",
    customerPhone: "+241 07 98 76 54",
    businessName: "Boutique Mode & Style",
    status: "shipped",
    total: 45000,
    items: [
      { name: "Chemise classique", quantity: 1, price: 25000 },
      { name: "Pantalon noir", quantity: 1, price: 20000 }
    ],
    createdAt: "2024-01-19T14:20:00Z",
    estimatedDelivery: "2024-01-21T16:00:00Z",
    deliveryAddress: "Centre-ville, Port-Gentil",
    paymentStatus: "paid"
  },
  {
    id: "3",
    orderNumber: "CMD-2024-003", 
    customerName: "Alice Ndoume",
    customerPhone: "+241 05 11 22 33",
    businessName: "Épicerie du Coin",
    status: "pending",
    total: 8750,
    items: [
      { name: "Riz 5kg", quantity: 1, price: 5000 },
      { name: "Huile de palme", quantity: 1, price: 2500 },
      { name: "Pâtes", quantity: 2, price: 625 }
    ],
    createdAt: "2024-01-20T16:45:00Z",
    deliveryAddress: "Akanda, Libreville",
    paymentStatus: "pending",
    notes: "Livraison en fin d'après-midi de préférence"
  },
  {
    id: "4",
    orderNumber: "CMD-2024-004",
    customerName: "Paul Mba",
    customerPhone: "+241 06 44 55 66",
    businessName: "Tech Store Gabon",
    status: "delivered",
    total: 125000,
    items: [
      { name: "Smartphone Samsung", quantity: 1, price: 125000 }
    ],
    createdAt: "2024-01-18T09:15:00Z",
    estimatedDelivery: "2024-01-19T17:00:00Z",
    deliveryAddress: "Cité de la Démocratie, Libreville",
    paymentStatus: "paid"
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "confirmed":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "preparing":
      return "bg-orange-100 text-orange-700 border-orange-200";
    case "ready":
      return "bg-purple-100 text-purple-700 border-purple-200";
    case "shipped":
      return "bg-indigo-100 text-indigo-700 border-indigo-200";
    case "delivered":
      return "bg-green-100 text-green-700 border-green-200";
    case "cancelled":
      return "bg-red-100 text-red-700 border-red-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "pending":
      return <Clock className="w-4 h-4" />;
    case "confirmed":
      return <CheckCircle className="w-4 h-4" />;
    case "preparing":
      return <Package className="w-4 h-4" />;
    case "ready":
      return <AlertCircle className="w-4 h-4" />;
    case "shipped":
      return <Truck className="w-4 h-4" />;
    case "delivered":
      return <CheckCircle className="w-4 h-4" />;
    case "cancelled":
      return <XCircle className="w-4 h-4" />;
    default:
      return <Clock className="w-4 h-4" />;
  }
};

const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case "paid":
      return "bg-green-100 text-green-700";
    case "pending":
      return "bg-yellow-100 text-yellow-700";
    case "failed":
      return "bg-red-100 text-red-700";
    case "refunded":
      return "bg-gray-100 text-gray-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const getOrderProgress = (status: string) => {
  switch (status) {
    case "pending":
      return 20;
    case "confirmed":
      return 40;
    case "preparing":
      return 60;
    case "ready":
      return 80;
    case "shipped":
      return 90;
    case "delivered":
      return 100;
    case "cancelled":
      return 0;
    default:
      return 20;
  }
};

interface OrderTrackerProps {
  searchQuery: string;
}

export const OrderTracker = ({ searchQuery }: OrderTrackerProps) => {
  const [selectedOrder, setSelectedOrder] = useState<string | null>("1");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const filteredOrders = MOCK_ORDERS.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.businessName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = !statusFilter || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const selectedOrderData = MOCK_ORDERS.find(o => o.id === selectedOrder);

  const statusCounts = MOCK_ORDERS.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex h-full">
      {/* Orders List */}
      <div className="w-1/3 border-r border-border/50 flex flex-col bg-background/50">
        {/* Header */}
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Commandes</h3>
            <Button size="sm" className="gap-2 bg-gradient-to-r from-primary to-accent text-white">
              <Plus className="w-4 h-4" />
              Nouvelle
            </Button>
          </div>

          {/* Status Filters */}
          <div className="flex flex-wrap gap-1">
            <Button
              size="sm"
              variant={statusFilter === null ? "default" : "outline"}
              onClick={() => setStatusFilter(null)}
              className="text-xs"
            >
              Toutes ({MOCK_ORDERS.length})
            </Button>
            {Object.entries(statusCounts).map(([status, count]) => (
              <Button
                key={status}
                size="sm"
                variant={statusFilter === status ? "default" : "outline"}
                onClick={() => setStatusFilter(status)}
                className="text-xs capitalize"
              >
                {status} ({count})
              </Button>
            ))}
          </div>
        </div>

        {/* Orders */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {filteredOrders.map((order) => (
              <Card
                key={order.id}
                className={cn(
                  "cursor-pointer transition-all duration-200 hover:shadow-md border-0",
                  selectedOrder === order.id 
                    ? "bg-gradient-to-r from-primary/10 to-accent/10 shadow-md" 
                    : "hover:bg-accent/5"
                )}
                onClick={() => setSelectedOrder(order.id)}
              >
                <CardContent className="p-3">
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-sm">{order.orderNumber}</h4>
                        <p className="text-xs text-muted-foreground">{order.businessName}</p>
                      </div>
                      <Badge className={cn("text-xs px-2 py-1 gap-1", getStatusColor(order.status))}>
                        {getStatusIcon(order.status)}
                        {order.status}
                      </Badge>
                    </div>

                    {/* Customer */}
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={order.customerAvatar} />
                        <AvatarFallback className="text-xs">
                          {order.customerName.split(" ").map(n => n[0]).slice(0, 2).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{order.customerName}</p>
                        <p className="text-xs text-muted-foreground">{order.customerPhone}</p>
                      </div>
                    </div>

                    {/* Items Summary */}
                    <div className="text-xs text-muted-foreground">
                      {order.items.length} article{order.items.length > 1 ? "s" : ""} • {order.total.toLocaleString()} FCFA
                    </div>

                    {/* Progress */}
                    <div className="space-y-1">
                      <Progress value={getOrderProgress(order.status)} className="h-1" />
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">
                          {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true, locale: fr })}
                        </span>
                        <Badge className={cn("text-xs px-2 py-0", getPaymentStatusColor(order.paymentStatus))}>
                          {order.paymentStatus}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Order Details */}
      <div className="flex-1 flex flex-col">
        {selectedOrderData ? (
          <>
            {/* Order Header */}
            <div className="p-4 border-b border-border/50 bg-background/80 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{selectedOrderData.orderNumber}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Badge className={cn("text-xs px-2 py-1 gap-1", getStatusColor(selectedOrderData.status))}>
                      {getStatusIcon(selectedOrderData.status)}
                      {selectedOrderData.status}
                    </Badge>
                    <span>•</span>
                    <span>{selectedOrderData.businessName}</span>
                    <span>•</span>
                    <span>{formatDistanceToNow(new Date(selectedOrderData.createdAt), { addSuffix: true, locale: fr })}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <Progress value={getOrderProgress(selectedOrderData.status)} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Commande passée</span>
                  <span>En cours de livraison</span>
                  <span>Livrée</span>
                </div>
              </div>
            </div>

            {/* Order Content */}
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Items */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Articles commandés</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedOrderData.items.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-background rounded border flex items-center justify-center">
                                {item.image ? (
                                  <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded" />
                                ) : (
                                  <Package className="w-4 h-4 text-muted-foreground" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-sm">{item.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {item.quantity} × {item.price.toLocaleString()} FCFA
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{(item.quantity * item.price).toLocaleString()} FCFA</p>
                            </div>
                          </div>
                        ))}
                        
                        <div className="border-t pt-3 mt-3">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold">Total</span>
                            <span className="font-bold text-lg">{selectedOrderData.total.toLocaleString()} FCFA</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Delivery Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        Informations de livraison
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium">Adresse de livraison</p>
                          <p className="text-sm text-muted-foreground">{selectedOrderData.deliveryAddress}</p>
                        </div>
                        
                        {selectedOrderData.estimatedDelivery && (
                          <div>
                            <p className="text-sm font-medium">Livraison estimée</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(selectedOrderData.estimatedDelivery).toLocaleString('fr-FR')}
                            </p>
                          </div>
                        )}
                        
                        {selectedOrderData.notes && (
                          <div>
                            <p className="text-sm font-medium">Notes spéciales</p>
                            <p className="text-sm text-muted-foreground">{selectedOrderData.notes}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                  {/* Customer Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Client
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={selectedOrderData.customerAvatar} />
                          <AvatarFallback>
                            {selectedOrderData.customerName.split(" ").map(n => n[0]).slice(0, 2).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{selectedOrderData.customerName}</p>
                          <p className="text-sm text-muted-foreground">{selectedOrderData.customerPhone}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Button className="w-full justify-start gap-2" variant="outline" size="sm">
                          <Phone className="w-4 h-4" />
                          Appeler
                        </Button>
                        <Button className="w-full justify-start gap-2" variant="outline" size="sm">
                          <MessageSquare className="w-4 h-4" />
                          Message
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Payment Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5" />
                        Paiement
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Statut</span>
                          <Badge className={cn("text-xs px-2 py-1", getPaymentStatusColor(selectedOrderData.paymentStatus))}>
                            {selectedOrderData.paymentStatus}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Montant</span>
                          <span className="font-medium">{selectedOrderData.total.toLocaleString()} FCFA</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Mode</span>
                          <span className="text-sm">Mobile Money</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Order Actions */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {selectedOrderData.status === "pending" && (
                        <>
                          <Button className="w-full justify-start gap-2 bg-green-600 hover:bg-green-700" size="sm">
                            <CheckCircle className="w-4 h-4" />
                            Confirmer
                          </Button>
                          <Button className="w-full justify-start gap-2 text-red-600 hover:text-red-700" variant="outline" size="sm">
                            <XCircle className="w-4 h-4" />
                            Annuler
                          </Button>
                        </>
                      )}
                      
                      {selectedOrderData.status === "confirmed" && (
                        <Button className="w-full justify-start gap-2 bg-orange-600 hover:bg-orange-700" size="sm">
                          <Package className="w-4 h-4" />
                          Marquer en préparation
                        </Button>
                      )}
                      
                      {selectedOrderData.status === "preparing" && (
                        <Button className="w-full justify-start gap-2 bg-purple-600 hover:bg-purple-700" size="sm">
                          <AlertCircle className="w-4 h-4" />
                          Marquer prêt
                        </Button>
                      )}
                      
                      {selectedOrderData.status === "ready" && (
                        <Button className="w-full justify-start gap-2 bg-indigo-600 hover:bg-indigo-700" size="sm">
                          <Truck className="w-4 h-4" />
                          Expédier
                        </Button>
                      )}
                      
                      {selectedOrderData.status === "shipped" && (
                        <Button className="w-full justify-start gap-2 bg-green-600 hover:bg-green-700" size="sm">
                          <CheckCircle className="w-4 h-4" />
                          Marquer livré
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold">Sélectionnez une commande</h3>
                <p className="text-muted-foreground">
                  Choisissez une commande pour voir les détails et gérer le suivi
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};