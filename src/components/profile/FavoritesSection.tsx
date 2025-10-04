import { EmptyState } from "@/components/ui/empty-state";
import { PackageX, Store, Heart } from "lucide-react";

const FavoritesSection = () => {
  return (
    <div className="space-y-6">
      <EmptyState
        icon={Heart}
        title="Aucun favori pour le moment"
        description="Commencez à ajouter des commerces et produits en favoris pour les retrouver facilement ici."
      />

      <EmptyState
        icon={Store}
        title="Aucun abonnement"
        description="Abonnez-vous à vos commerces préférés pour recevoir leurs actualités et promotions."
      />
    </div>
  );
};

export default FavoritesSection;