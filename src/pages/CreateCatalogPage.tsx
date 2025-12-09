import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CatalogList } from "@/features/catalog/components/CatalogList";
import { CatalogForm } from "@/features/catalog/components/CatalogForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

export const CreateCatalogPage = () => {
  const { businessId } = useParams<{ businessId: string }>();
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);

  if (!businessId) return <div>Business ID manquant</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-40 bg-white border-b shadow-sm">
        <div className="flex items-center justify-between p-4 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-xl font-bold">Mes Catalogues</h1>
          </div>
          
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nouveau Catalogue
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <CatalogForm 
                businessId={businessId} 
                onSuccess={() => {
                  setIsCreating(false);
                  navigate(`/business/${businessId}`);
                }} 
                onCancel={() => setIsCreating(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        <CatalogList 
          businessId={businessId} 
          onCreateClick={() => setIsCreating(true)} 
        />
      </div>
    </div>
  );
};

export default CreateCatalogPage;

