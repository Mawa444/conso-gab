import { useState, useEffect } from "react";
import { Plus, Building2, Settings, Users, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/features/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useProfileMode } from "@/hooks/use-profile-mode";

interface BusinessProfile {
  id: string;
  business_name: string;
  business_category: string;
  description?: string;
  logo_url?: string;
  is_primary: boolean;
  is_active: boolean;
  created_at: string;
  collaborators_count: number;
  role: string; // Role de l'utilisateur actuel pour ce business
}

interface BusinessCollaborator {
  id: string;
  user_id: string;
  role: string;
  status: string;
  created_at: string;
  user_profiles: {
    pseudo: string;
    profile_picture_url?: string;
  };
}

export const MultiBusinessManager = () => {
  const { user } = useAuth();
  const { businessProfiles, refreshBusinessProfiles } = useProfileMode();
  const [businesses, setBusinesses] = useState<BusinessProfile[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<string | null>(null);
  const [collaborators, setCollaborators] = useState<BusinessCollaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (user) {
      fetchBusinessDetails();
    }
  }, [user, businessProfiles]);

  const fetchBusinessDetails = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Récupérer les collaborations
      const { data: collaborators, error: collabError } = await supabase
        .from('business_collaborators')
        .select('business_id, role')
        .eq('user_id', user.id)
        .eq('status', 'accepted');

      if (collabError) {
        console.error('Erreur récupération businesses:', collabError);
        return;
      }

      if (collaborators && collaborators.length > 0) {
        // Récupérer les détails des businesses
        const businessIds = collaborators.map(c => c.business_id);
        const { data: businessData, error: businessError } = await supabase
          .from('business_profiles')
          .select('id, business_name, business_category, description, logo_url, is_primary, is_active, created_at')
          .in('id', businessIds);

        if (businessError) {
          console.error('Erreur récupération business details:', businessError);
          return;
        }

        if (businessData) {
          // Compter les collaborateurs pour chaque business
          const businessesWithCounts = await Promise.all(
            businessData.map(async (business) => {
              const { count } = await supabase
                .from('business_collaborators')
                .select('*', { count: 'exact', head: true })
                .eq('business_id', business.id)
                .eq('status', 'accepted');

              const collab = collaborators.find(c => c.business_id === business.id);

              return {
                id: business.id,
                business_name: business.business_name,
                business_category: business.business_category,
                description: business.description,
                logo_url: business.logo_url,
                is_primary: business.is_primary,
                is_active: business.is_active,
                created_at: business.created_at,
                collaborators_count: count || 0,
                role: collab?.role || 'viewer'
              };
            })
          );

          setBusinesses(businessesWithCounts);
        }
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger vos entreprises",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCollaborators = async (businessId: string) => {
    try {
      const { data: collabData, error: collabError } = await supabase
        .from('business_collaborators')
        .select('id, user_id, role, status, created_at')
        .eq('business_id', businessId)
        .eq('status', 'accepted');

      if (collabError) {
        console.error('Erreur récupération collaborateurs:', collabError);
        return;
      }

      if (collabData && collabData.length > 0) {
        // Récupérer les profils utilisateurs
        const userIds = collabData.map(c => c.user_id);
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('user_id, pseudo, profile_picture_url')
          .in('user_id', userIds);

        if (profileError) {
          console.error('Erreur récupération profils:', profileError);
          return;
        }

        if (profileData) {
          const collaboratorsWithProfiles = collabData.map(collab => {
            const profile = profileData.find(p => p.user_id === collab.user_id);
            return {
              id: collab.id,
              user_id: collab.user_id,
              role: collab.role,
              status: collab.status,
              created_at: collab.created_at,
              user_profiles: {
                pseudo: profile?.pseudo || 'Utilisateur',
                profile_picture_url: profile?.profile_picture_url
              }
            };
          });
          
          setCollaborators(collaboratorsWithProfiles);
        }
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleBusinessSelect = (businessId: string) => {
    setSelectedBusiness(businessId);
    fetchCollaborators(businessId);
    setActiveTab("overview");
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-red-100 text-red-800';
      case 'admin': return 'bg-blue-100 text-blue-800';
      case 'editor': return 'bg-green-100 text-green-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'owner': return 'Propriétaire';
      case 'admin': return 'Administrateur';
      case 'editor': return 'Éditeur';
      case 'viewer': return 'Visualiseur';
      default: return role;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-muted rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/3" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const selectedBusinessData = businesses.find(b => b.id === selectedBusiness);

  return (
    <div className="space-y-6">
      {/* En-tête avec bouton création */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Mes Entreprises</h2>
          <p className="text-muted-foreground">
            Gérez tous vos profils professionnels depuis un seul endroit
          </p>
        </div>
        <Button className="bg-gradient-to-r from-primary to-accent">
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle entreprise
        </Button>
      </div>

      {/* Liste des entreprises */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {businesses.map((business) => (
          <Card 
            key={business.id}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedBusiness === business.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => handleBusinessSelect(business.id)}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={business.logo_url} />
                  <AvatarFallback className="bg-primary/10">
                    <Building2 className="w-6 h-6 text-primary" />
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold truncate">{business.business_name}</h3>
                    {business.is_primary && (
                      <Badge variant="secondary" className="text-xs">Principal</Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2">
                    {business.business_category}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <Badge className={getRoleColor(business.role)}>
                      {getRoleLabel(business.role)}
                    </Badge>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {business.collaborators_count}
                      </div>
                      <div className={`w-2 h-2 rounded-full ${
                        business.is_active ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Détails de l'entreprise sélectionnée */}
      {selectedBusinessData && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={selectedBusinessData.logo_url} />
                <AvatarFallback className="bg-primary/10">
                  <Building2 className="w-8 h-8 text-primary" />
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <CardTitle className="text-xl">{selectedBusinessData.business_name}</CardTitle>
                <p className="text-muted-foreground">{selectedBusinessData.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={getRoleColor(selectedBusinessData.role)}>
                    {getRoleLabel(selectedBusinessData.role)}
                  </Badge>
                  {selectedBusinessData.is_primary && (
                    <Badge variant="secondary">Entreprise principale</Badge>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon">
                  <Eye className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Settings className="w-4 h-4" />
                </Button>
                {selectedBusinessData.role === 'owner' && (
                  <Button variant="outline" size="icon" className="text-red-600 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Aperçu</TabsTrigger>
                <TabsTrigger value="collaborators">Collaborateurs</TabsTrigger>
                <TabsTrigger value="settings">Paramètres</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold">12</div>
                      <div className="text-sm text-muted-foreground">Produits</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold">48</div>
                      <div className="text-sm text-muted-foreground">Commandes</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold">4.8</div>
                      <div className="text-sm text-muted-foreground">Note moyenne</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold">{selectedBusinessData.collaborators_count}</div>
                      <div className="text-sm text-muted-foreground">Collaborateurs</div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="collaborators" className="space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Équipe</h4>
                  {selectedBusinessData.role === 'owner' && (
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Inviter
                    </Button>
                  )}
                </div>
                
                <div className="space-y-3">
                  {collaborators.map((collaborator) => (
                    <div key={collaborator.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={collaborator.user_profiles.profile_picture_url} />
                          <AvatarFallback>
                            {collaborator.user_profiles.pseudo.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{collaborator.user_profiles.pseudo}</p>
                          <p className="text-sm text-muted-foreground">
                            Depuis {new Date(collaborator.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <Badge className={getRoleColor(collaborator.role)}>
                        {getRoleLabel(collaborator.role)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="settings" className="space-y-4 mt-4">
                <p className="text-muted-foreground">
                  Paramètres de l'entreprise à venir...
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
