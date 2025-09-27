import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Section des favoris - utilise les vraies données de la base de données
const FavoritesSection = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Mes Favoris</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Vos commerces et produits favoris apparaîtront ici.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mes Abonnements</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Vos abonnements aux commerces apparaîtront ici.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default FavoritesSection;