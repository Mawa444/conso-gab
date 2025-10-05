import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useRealBusinesses } from "@/hooks/use-real-businesses";
import { businessCategories } from "@/data/businessCategories";
import { MapTabSkeleton } from "@/components/ui/skeleton-screens";

export const MapTab = () => {
  const navigate = useNavigate();
  const { businesses, loading, error } = useRealBusinesses();

  // Si chargement ou erreur, rediriger vers le nouveau composant
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Composant mis à jour</h3>
        <p className="text-muted-foreground">Utilisez RealMapTab pour la nouvelle version avec données réelles</p>
      </div>
    </div>
  );
};