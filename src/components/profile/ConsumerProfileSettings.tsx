import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ProfileImageUploader } from "@/components/profile/ProfileImageUploader";
import { CoverImageUploader } from "@/components/profile/CoverImageUploader";
import { User, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/features/auth";

export const ConsumerProfileSettings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [data, setData] = useState({
    first_name: '',
    last_name: '',
    display_name: '',
    phone: '',
    avatar_url: '',
    cover_image_url: ''
  });

  useEffect(() => {
    fetchProfileData();
  }, [user?.id]);

  const fetchProfileData = async () => {
    if (!user?.id) return;
    
    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      
      if (profileData) {
        setData({
          first_name: profileData.first_name || '',
          last_name: profileData.last_name || '',
          display_name: profileData.display_name || '',
          phone: profileData.phone || '',
          avatar_url: profileData.avatar_url || '',
          cover_image_url: profileData.cover_image_url || ''
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoadingData(false);
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('user_id', user.id);

      if (error) throw error;
      toast.success("Profil mis à jour avec succès !");
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-6 h-6" />
          Mon profil consommateur
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Images Section */}
        <div className="space-y-6">
          <CoverImageUploader
            currentImageUrl={data.cover_image_url}
            onImageUploaded={(url) => setData(prev => ({ ...prev, cover_image_url: url }))}
            bucket="catalog-covers"
            folder="profile-covers"
            label="Image de couverture"
          />

          <ProfileImageUploader
            currentImageUrl={data.avatar_url}
            onImageUploaded={(url) => setData(prev => ({ ...prev, avatar_url: url }))}
            bucket="catalog-covers"
            folder="profile-avatars"
            label="Photo de profil"
          />
        </div>

        <Separator />

        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Informations personnelles</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">Prénom</Label>
              <Input
                id="firstName"
                value={data.first_name}
                onChange={e => setData(prev => ({ ...prev, first_name: e.target.value }))}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="lastName">Nom</Label>
              <Input
                id="lastName"
                value={data.last_name}
                onChange={e => setData(prev => ({ ...prev, last_name: e.target.value }))}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="displayName">Nom d'affichage</Label>
              <Input
                id="displayName"
                value={data.display_name}
                onChange={e => setData(prev => ({ ...prev, display_name: e.target.value }))}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                value={data.phone}
                onChange={e => setData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+241 xx xx xx xx"
                className="mt-1"
              />
            </div>
          </div>
        </div>

        <Separator />

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={loading} className="px-8">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sauvegarde...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder les modifications
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
