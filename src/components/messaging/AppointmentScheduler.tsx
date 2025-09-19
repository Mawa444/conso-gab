import { useState } from "react";
import { Calendar, Plus, Clock, User, MapPin, Phone, Video, Check, X, Edit } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface Appointment {
  id: string;
  title: string;
  customerName: string;
  customerAvatar?: string;
  customerPhone: string;
  date: string;
  startTime: string;
  endTime: string;
  status: "scheduled" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show";
  type: "consultation" | "meeting" | "service" | "support";
  location?: string;
  isVideoCall: boolean;
  notes?: string;
  businessName: string;
  createdAt: string;
}

const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: "1",
    title: "Consultation stratégie marketing",
    customerName: "Marie Nkoghe",
    customerPhone: "+241 06 12 34 56",
    date: "2024-01-22",
    startTime: "09:00",
    endTime: "10:00",
    status: "confirmed",
    type: "consultation",
    location: "Bureau ConsoGab",
    isVideoCall: false,
    businessName: "ConsoGab Conseil",
    createdAt: "2024-01-20T10:30:00Z",
    notes: "Discussion sur la stratégie digitale pour restaurant"
  },
  {
    id: "2",
    title: "Réunion équipe projet",
    customerName: "Jean Obiang",
    customerPhone: "+241 07 98 76 54",
    date: "2024-01-22",
    startTime: "14:30",
    endTime: "15:30",
    status: "scheduled",
    type: "meeting",
    isVideoCall: true,
    businessName: "Tech Solutions",
    createdAt: "2024-01-19T14:20:00Z"
  },
  {
    id: "3",
    title: "Formation e-commerce",
    customerName: "Alice Ndoume",
    customerPhone: "+241 05 11 22 33",
    date: "2024-01-23",
    startTime: "10:00",
    endTime: "12:00",
    status: "confirmed",
    type: "service",
    location: "Centre de formation Libreville",
    isVideoCall: false,
    businessName: "Formation Digital",
    createdAt: "2024-01-18T16:45:00Z",
    notes: "Formation pour 3 personnes sur WooCommerce"
  },
  {
    id: "4",
    title: "Support technique",
    customerName: "Paul Mba",
    customerPhone: "+241 06 44 55 66",
    date: "2024-01-21",
    startTime: "16:00",
    endTime: "17:00",
    status: "completed",
    type: "support",
    isVideoCall: true,
    businessName: "Support ConsoGab",
    createdAt: "2024-01-20T09:15:00Z"
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "scheduled":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "confirmed":
      return "bg-green-100 text-green-700 border-green-200";
    case "in_progress":
      return "bg-orange-100 text-orange-700 border-orange-200";
    case "completed":
      return "bg-gray-100 text-gray-700 border-gray-200";
    case "cancelled":
      return "bg-red-100 text-red-700 border-red-200";
    case "no_show":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "scheduled":
      return <Clock className="w-4 h-4" />;
    case "confirmed":
      return <Check className="w-4 h-4" />;
    case "in_progress":
      return <Clock className="w-4 h-4" />;
    case "completed":
      return <Check className="w-4 h-4" />;
    case "cancelled":
      return <X className="w-4 h-4" />;
    case "no_show":
      return <X className="w-4 h-4" />;
    default:
      return <Clock className="w-4 h-4" />;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case "consultation":
      return "bg-purple-100 text-purple-700";
    case "meeting":
      return "bg-blue-100 text-blue-700";
    case "service":
      return "bg-green-100 text-green-700";
    case "support":
      return "bg-orange-100 text-orange-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

interface AppointmentSchedulerProps {
  searchQuery: string;
}

export const AppointmentScheduler = ({ searchQuery }: AppointmentSchedulerProps) => {
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>("1");
  const [dateFilter, setDateFilter] = useState<string>("all");

  const filteredAppointments = MOCK_APPOINTMENTS.filter(appointment => {
    const matchesSearch = appointment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         appointment.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         appointment.businessName.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesDate = true;
    if (dateFilter === "today") {
      matchesDate = appointment.date === new Date().toISOString().split('T')[0];
    } else if (dateFilter === "upcoming") {
      matchesDate = new Date(appointment.date) >= new Date();
    }
    
    return matchesSearch && matchesDate;
  });

  const selectedAppointmentData = MOCK_APPOINTMENTS.find(a => a.id === selectedAppointment);

  const getAppointmentTime = (appointment: Appointment) => {
    return `${appointment.startTime} - ${appointment.endTime}`;
  };

  const isToday = (date: string) => {
    return date === new Date().toISOString().split('T')[0];
  };

  const isTomorrow = (date: string) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return date === tomorrow.toISOString().split('T')[0];
  };

  const getDateLabel = (date: string) => {
    if (isToday(date)) return "Aujourd'hui";
    if (isTomorrow(date)) return "Demain";
    return new Date(date).toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });
  };

  return (
    <div className="flex h-full">
      {/* Appointments List */}
      <div className="w-1/3 border-r border-border/50 flex flex-col bg-background/50">
        {/* Header */}
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Rendez-vous</h3>
            <Button size="sm" className="gap-2 bg-gradient-to-r from-primary to-accent text-white">
              <Plus className="w-4 h-4" />
              Nouveau
            </Button>
          </div>

          {/* Date Filters */}
          <div className="flex gap-1">
            <Button
              size="sm"
              variant={dateFilter === "all" ? "default" : "outline"}
              onClick={() => setDateFilter("all")}
              className="text-xs"
            >
              Tous
            </Button>
            <Button
              size="sm"
              variant={dateFilter === "today" ? "default" : "outline"}
              onClick={() => setDateFilter("today")}
              className="text-xs"
            >
              Aujourd'hui
            </Button>
            <Button
              size="sm"
              variant={dateFilter === "upcoming" ? "default" : "outline"}
              onClick={() => setDateFilter("upcoming")}
              className="text-xs"
            >
              À venir
            </Button>
          </div>
        </div>

        {/* Appointments */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {filteredAppointments.map((appointment) => (
              <Card
                key={appointment.id}
                className={cn(
                  "cursor-pointer transition-all duration-200 hover:shadow-md border-0",
                  selectedAppointment === appointment.id 
                    ? "bg-gradient-to-r from-primary/10 to-accent/10 shadow-md" 
                    : "hover:bg-accent/5"
                )}
                onClick={() => setSelectedAppointment(appointment.id)}
              >
                <CardContent className="p-3">
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm truncate">{appointment.title}</h4>
                        <p className="text-xs text-muted-foreground">{appointment.businessName}</p>
                      </div>
                      <Badge className={cn("text-xs px-2 py-1 gap-1", getStatusColor(appointment.status))}>
                        {getStatusIcon(appointment.status)}
                        {appointment.status}
                      </Badge>
                    </div>

                    {/* Customer */}
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={appointment.customerAvatar} />
                        <AvatarFallback className="text-xs">
                          {appointment.customerName.split(" ").map(n => n[0]).slice(0, 2).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{appointment.customerName}</p>
                        <p className="text-xs text-muted-foreground">{appointment.customerPhone}</p>
                      </div>
                    </div>

                    {/* Date & Time */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                        <span className={cn(
                          "font-medium",
                          isToday(appointment.date) && "text-primary"
                        )}>
                          {getDateLabel(appointment.date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span>{getAppointmentTime(appointment)}</span>
                      </div>
                    </div>

                    {/* Type & Location */}
                    <div className="flex items-center justify-between">
                      <Badge className={cn("text-xs px-2 py-0 h-5 capitalize", getTypeColor(appointment.type))}>
                        {appointment.type}
                      </Badge>
                      <div className="flex items-center gap-1">
                        {appointment.isVideoCall ? (
                          <Video className="w-3 h-3 text-blue-600" />
                        ) : appointment.location && (
                          <MapPin className="w-3 h-3 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Appointment Details */}
      <div className="flex-1 flex flex-col">
        {selectedAppointmentData ? (
          <>
            {/* Appointment Header */}
            <div className="p-4 border-b border-border/50 bg-background/80 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{selectedAppointmentData.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Badge className={cn("text-xs px-2 py-1 gap-1", getStatusColor(selectedAppointmentData.status))}>
                      {getStatusIcon(selectedAppointmentData.status)}
                      {selectedAppointmentData.status}
                    </Badge>
                    <span>•</span>
                    <Badge className={cn("text-xs px-2 py-1 capitalize", getTypeColor(selectedAppointmentData.type))}>
                      {selectedAppointmentData.type}
                    </Badge>
                    <span>•</span>
                    <span>{selectedAppointmentData.businessName}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {selectedAppointmentData.status === "scheduled" && (
                    <Button size="sm" className="gap-2 bg-green-600 hover:bg-green-700">
                      <Check className="w-4 h-4" />
                      Confirmer
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Date/Time Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{getDateLabel(selectedAppointmentData.date)}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(selectedAppointmentData.date).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{getAppointmentTime(selectedAppointmentData)}</p>
                    <p className="text-xs text-muted-foreground">
                      Durée: {parseInt(selectedAppointmentData.endTime) - parseInt(selectedAppointmentData.startTime)}h
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {selectedAppointmentData.isVideoCall ? (
                    <Video className="w-4 h-4 text-blue-600" />
                  ) : (
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                  )}
                  <div>
                    <p className="text-sm font-medium">
                      {selectedAppointmentData.isVideoCall ? "Visioconférence" : "Présentiel"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selectedAppointmentData.location || "Lien envoyé par email"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Appointment Content */}
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Participant Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Participant
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-3 mb-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={selectedAppointmentData.customerAvatar} />
                          <AvatarFallback>
                            {selectedAppointmentData.customerName.split(" ").map(n => n[0]).slice(0, 2).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{selectedAppointmentData.customerName}</p>
                          <p className="text-sm text-muted-foreground">{selectedAppointmentData.customerPhone}</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="gap-2">
                          <Phone className="w-4 h-4" />
                          Appeler
                        </Button>
                        {selectedAppointmentData.isVideoCall && (
                          <Button variant="outline" size="sm" className="gap-2">
                            <Video className="w-4 h-4" />
                            Rejoindre
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Notes */}
                  {selectedAppointmentData.notes && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Notes</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <p className="text-sm">{selectedAppointmentData.notes}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Status Actions */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedAppointmentData.status === "scheduled" && (
                          <>
                            <Button className="gap-2 bg-green-600 hover:bg-green-700" size="sm">
                              <Check className="w-4 h-4" />
                              Confirmer
                            </Button>
                            <Button variant="outline" className="gap-2 text-red-600" size="sm">
                              <X className="w-4 h-4" />
                              Annuler
                            </Button>
                          </>
                        )}
                        
                        {selectedAppointmentData.status === "confirmed" && (
                          <>
                            <Button className="gap-2 bg-orange-600 hover:bg-orange-700" size="sm">
                              <Clock className="w-4 h-4" />
                              Démarrer
                            </Button>
                            <Button variant="outline" className="gap-2" size="sm">
                              <Edit className="w-4 h-4" />
                              Reprogrammer
                            </Button>
                          </>
                        )}
                        
                        {selectedAppointmentData.status === "in_progress" && (
                          <Button className="gap-2 bg-gray-600 hover:bg-gray-700 col-span-2" size="sm">
                            <Check className="w-4 h-4" />
                            Terminer
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                  {/* Quick Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Informations</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Type</span>
                        <Badge className={cn("text-xs px-2 py-1 capitalize", getTypeColor(selectedAppointmentData.type))}>
                          {selectedAppointmentData.type}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Durée</span>
                        <span className="text-sm font-medium">
                          {parseInt(selectedAppointmentData.endTime) - parseInt(selectedAppointmentData.startTime)}h
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Mode</span>
                        <span className="text-sm font-medium">
                          {selectedAppointmentData.isVideoCall ? "Visioconférence" : "Présentiel"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Créé le</span>
                        <span className="text-sm font-medium">
                          {new Date(selectedAppointmentData.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Reminders */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Rappels</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>SMS envoyé 24h avant</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span>Email envoyé 2h avant</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          <span>Notification 15min avant</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <Calendar className="w-16 h-16 mx-auto text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold">Sélectionnez un rendez-vous</h3>
                <p className="text-muted-foreground">
                  Choisissez un rendez-vous pour voir les détails et gérer le planning
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};