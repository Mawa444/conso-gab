import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/layout/Header";
import { UserLocationManager } from "@/components/location/UserLocationManager";
import { LocationRequestsManager } from "@/components/location/LocationRequestsManager";
import { MapPin, MessageSquare, Shield, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const LocationSettingsPage = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-background">
      <Header 
        title="Géolocalisation" 
        showBack 
        onBack={() => navigate(-1)}
      />
      
      <div className="container mx-auto px-4 pt-24 pb-8 max-w-6xl">
        <div className="space-y-8">
          {/* En-tête */}
          <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-primary/10 rounded-full">
              <MapPin className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Centre de Géolocalisation</h1>
              <p className="text-muted-foreground">
                Gérez vos positions et les demandes de localisation de manière sécurisée
              </p>
            </div>
          </div>
        </div>

        {/* Informations de sécurité */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Shield className="w-6 h-6 text-green-600 mt-1" />
              <div className="space-y-2">
                <h3 className="font-semibold text-green-800">Sécurité et Confidentialité</h3>
                <div className="text-sm text-green-700 space-y-1">
                  <p>🔒 <strong>Chiffrement bout-en-bout</strong> - Vos coordonnées sont chiffrées avant stockage</p>
                  <p>⏱️ <strong>Partage temporaire</strong> - Les positions partagées expirent automatiquement</p>
                  <p>🛡️ <strong>Contrôle total</strong> - Vous decidez quand, comment et avec qui partager</p>
                  <p>🚫 <strong>Aucun tracking</strong> - Aucun suivi permanent de vos déplacements</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Onglets principaux */}
        <Tabs defaultValue="settings" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Mes Positions
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Demandes de Position
            </TabsTrigger>
          </TabsList>

          {/* Gestion des positions personnelles */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Configuration de vos positions
                </CardTitle>
                <p className="text-muted-foreground">
                  Définissez vos positions de base (domicile/bureau) et gérez leur confidentialité
                </p>
              </CardHeader>
              <CardContent>
                <UserLocationManager />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gestion des demandes */}
          <TabsContent value="requests" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Demandes de position
                </CardTitle>
                <p className="text-muted-foreground">
                  Gérez les demandes de position reçues et consultez celles que vous avez envoyées
                </p>
              </CardHeader>
              <CardContent>
                <LocationRequestsManager />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Guide d'utilisation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Comment ça marche ?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6 text-sm">
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl mb-2">1️⃣</div>
                  <h4 className="font-medium text-blue-800">Configuration initiale</h4>
                  <p className="text-blue-700">
                    Définissez vos positions de base (domicile/bureau) de manière sécurisée
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl mb-2">2️⃣</div>
                  <h4 className="font-medium text-green-800">Demandes via messagerie</h4>
                  <p className="text-green-700">
                    Recevez et envoyez des demandes de position directement dans vos conversations
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl mb-2">3️⃣</div>
                  <h4 className="font-medium text-purple-800">Partage contrôlé</h4>
                  <p className="text-purple-700">
                    Acceptez, refusez ou partagez temporairement selon vos besoins
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cas d'usage */}
        <Card>
          <CardHeader>
            <CardTitle>Cas d'usage courants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="text-lg">🚚</span>
                  <div>
                    <h4 className="font-medium">Livraisons</h4>
                    <p className="text-muted-foreground">
                      Le livreur demande votre position pour confirmer l'adresse de livraison
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-lg">🤝</span>
                  <div>
                    <h4 className="font-medium">Rencontres</h4>
                    <p className="text-muted-foreground">
                      Partagez temporairement votre position pour faciliter une rencontre
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="text-lg">🏠</span>
                  <div>
                    <h4 className="font-medium">Services à domicile</h4>
                    <p className="text-muted-foreground">
                      Partagez votre adresse avec des prestataires de services
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-lg">🏢</span>
                  <div>
                    <h4 className="font-medium">Visites professionnelles</h4>
                    <p className="text-muted-foreground">
                      Les entreprises peuvent partager leur position de bureau avec les clients
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
};