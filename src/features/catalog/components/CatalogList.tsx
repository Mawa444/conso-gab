import { useCatalogs } from "../hooks/useCatalog";
import { CatalogCard } from "./CatalogCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CatalogListProps {
  businessId: string;
  onCreateClick?: () => void;
}

export const CatalogList = ({ businessId, onCreateClick }: CatalogListProps) => {
  const { data: catalogs, isLoading, error } = useCatalogs(businessId);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[300px] w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Erreur</AlertTitle>
        <AlertDescription>Impossible de charger les catalogues.</AlertDescription>
      </Alert>
    );
  }

  if (!catalogs || catalogs.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <Info className="h-10 w-10 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Aucun catalogue trouvé</h3>
        <p className="text-gray-500 mb-6">Commencez par créer votre premier catalogue pour présenter vos produits ou services.</p>
        <Button onClick={onCreateClick}>Créer un catalogue</Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {catalogs.filter(c => c.visibility !== 'archived').map((catalog) => (
        <CatalogCard key={catalog.id} catalog={catalog} businessId={businessId} />
      ))}
    </div>
  );
};
