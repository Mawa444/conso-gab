import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CatalogDashboard } from "@/components/catalog/CatalogDashboard";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export const CreateCatalogPage = () => {
  const { businessId } = useParams<{ businessId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [business, setBusiness] = useState<{ name: string; business_category: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBusiness = async () => {
      if (!businessId) return;

      try {
        const { data, error } = await supabase
          .from('business_profiles')
          .select('name, business_category')
          .eq('id', businessId)
          .single();

        if (error) throw error;
        setBusiness(data);
      } catch (error) {
        console.error('Error fetching business:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les informations de l'entreprise",
          variant: "destructive"
        });
        navigate("/entreprises");
      } finally {
        setLoading(false);
      }
    };

    fetchBusiness();
  }, [businessId, navigate, toast]);

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!business || !businessId) return null;

  return (
    <div className="container mx-auto py-8 px-4">
      <CatalogDashboard 
        businessId={businessId}
        businessName={business.name}
        businessCategory={business.business_category}
      />
    </div>
  );
};

export default CreateCatalogPage;
