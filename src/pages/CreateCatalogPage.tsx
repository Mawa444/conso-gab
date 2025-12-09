import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CatalogForm } from "@/components/catalog/CatalogForm";

export const CreateCatalogPage = () => {
  const navigate = useNavigate();
  const { businessId } = useParams<{ businessId: string }>();

  if (!businessId) {
    return <div>Business ID missing</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/5 to-accent/5">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center gap-3 p-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-xl font-bold text-gaboma-gradient">Créer un Catalogue</h1>
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto">
        <CatalogForm 
          businessId={businessId}
          onSuccess={() => navigate(`/business/${businessId}/profile?tab=catalog`)}
          onCancel={() => navigate(-1)}
        />
      </div>
    </div>
  );
};

export default CreateCatalogPage;
