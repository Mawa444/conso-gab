import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertCircle, XCircle, TrendingUp, Target, MapPin } from 'lucide-react';

interface SEOScoreCoachProps {
  data: {
    name?: string;
    category?: string;
    subcategory?: string;
    keywords?: string[];
    synonyms?: string[];
    geo_city?: string;
    geo_district?: string;
    cover_url?: string;
    description?: string;
  };
  type?: 'catalog' | 'product';
  productData?: {
    title?: string;
    price_cents?: number;
    attributes?: Record<string, any>;
    images?: string[];
  };
}

interface ScoreItem {
  name: string;
  points: number;
  maxPoints: number;
  status: 'complete' | 'partial' | 'missing';
  suggestion?: string;
  icon: any;
}

export const SEOScoreCoach = ({ data, type = 'catalog', productData }: SEOScoreCoachProps) => {
  const scoreAnalysis = useMemo(() => {
    const items: ScoreItem[] = [];
    
    if (type === 'catalog') {
      // Analyse pour catalogues
      items.push({
        name: 'Nom du catalogue',
        points: data.name ? 10 : 0,
        maxPoints: 10,
        status: data.name ? 'complete' : 'missing',
        suggestion: !data.name ? 'Ajoutez un nom descriptif' : undefined,
        icon: Target
      });

      items.push({
        name: 'Image de couverture',
        points: data.cover_url ? 15 : 0,
        maxPoints: 15,
        status: data.cover_url ? 'complete' : 'missing',
        suggestion: !data.cover_url ? 'Ajoutez une image 1300×1300px' : undefined,
        icon: CheckCircle
      });

      items.push({
        name: 'Catégorisation',
        points: data.category && data.subcategory ? 10 : data.category ? 5 : 0,
        maxPoints: 10,
        status: data.category && data.subcategory ? 'complete' : data.category ? 'partial' : 'missing',
        suggestion: !data.category ? 'Sélectionnez une catégorie' : !data.subcategory ? 'Ajoutez une sous-catégorie' : undefined,
        icon: Target
      });

    } else {
      // Analyse pour produits
      items.push({
        name: 'Titre produit',
        points: productData?.title ? 10 : 0,
        maxPoints: 10,
        status: productData?.title ? 'complete' : 'missing',
        suggestion: !productData?.title ? 'Ajoutez un titre descriptif' : undefined,
        icon: Target
      });

      items.push({
        name: 'Prix',
        points: productData?.price_cents && productData.price_cents > 0 ? 10 : 0,
        maxPoints: 10,
        status: productData?.price_cents && productData.price_cents > 0 ? 'complete' : 'missing',
        suggestion: !productData?.price_cents ? 'Définissez un prix' : undefined,
        icon: Target
      });

      items.push({
        name: 'Photos produit',
        points: productData?.images && productData.images.length > 0 ? 15 : 0,
        maxPoints: 15,
        status: productData?.images && productData.images.length > 0 ? 'complete' : 'missing',
        suggestion: !productData?.images?.length ? 'Ajoutez au moins une photo 1300×1300px' : undefined,
        icon: CheckCircle
      });

      items.push({
        name: 'Attributs détaillés',
        points: productData?.attributes && Object.keys(productData.attributes).length >= 3 ? 20 : 
                productData?.attributes && Object.keys(productData.attributes).length > 0 ? 10 : 0,
        maxPoints: 20,
        status: productData?.attributes && Object.keys(productData.attributes).length >= 3 ? 'complete' : 
                productData?.attributes && Object.keys(productData.attributes).length > 0 ? 'partial' : 'missing',
        suggestion: !productData?.attributes || Object.keys(productData.attributes).length < 3 ? 
          'Ajoutez couleur, matière, taille, etc.' : undefined,
        icon: Target
      });
    }

    // Items communs
    items.push({
      name: 'Mots-clés',
      points: data.keywords && data.keywords.length >= 3 ? 10 : data.keywords && data.keywords.length > 0 ? 5 : 0,
      maxPoints: 10,
      status: data.keywords && data.keywords.length >= 3 ? 'complete' : data.keywords && data.keywords.length > 0 ? 'partial' : 'missing',
      suggestion: !data.keywords?.length ? 'Ajoutez des mots-clés de recherche' : 
                  data.keywords.length < 3 ? 'Ajoutez au moins 3 mots-clés' : undefined,
      icon: TrendingUp
    });

    items.push({
      name: 'Synonymes',
      points: data.synonyms && data.synonyms.length > 0 ? 10 : 0,
      maxPoints: 10,
      status: data.synonyms && data.synonyms.length > 0 ? 'complete' : 'missing',
      suggestion: !data.synonyms?.length ? 'Ajoutez des termes alternatifs' : undefined,
      icon: TrendingUp
    });

    items.push({
      name: 'Zone géographique',
      points: data.geo_city ? 10 : 0,
      maxPoints: 10,
      status: data.geo_city ? 'complete' : 'missing',
      suggestion: !data.geo_city ? 'Précisez votre zone de service' : undefined,
      icon: MapPin
    });

    const totalPoints = items.reduce((sum, item) => sum + item.points, 0);
    const maxTotalPoints = items.reduce((sum, item) => sum + item.maxPoints, 0);
    const percentage = Math.round((totalPoints / maxTotalPoints) * 100);

    let badge: { label: string; color: "default" | "secondary" | "destructive" | "outline" } = { label: 'Insuffisant', color: 'destructive' };
    if (percentage >= 90) badge = { label: 'Exemplaire', color: 'default' };
    else if (percentage >= 75) badge = { label: 'Très bon', color: 'secondary' };
    else if (percentage >= 50) badge = { label: 'À améliorer', color: 'outline' };

    return { items, totalPoints, maxTotalPoints, percentage, badge };
  }, [data, type, productData]);

  const { items, totalPoints, maxTotalPoints, percentage, badge } = scoreAnalysis;

  const suggestions = items.filter(item => item.suggestion);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Score SEO</CardTitle>
          <Badge variant={badge.color}>{badge.label}</Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Score global */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Score global</span>
            <span className="text-muted-foreground">{totalPoints}/{maxTotalPoints} points</span>
          </div>
          <Progress value={percentage} className="h-3" />
          <p className="text-xs text-muted-foreground">
            {percentage}% de complétude
          </p>
        </div>

        {/* Détail des critères */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Critères détaillés</h4>
          <div className="space-y-1">
            {items.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {item.status === 'complete' ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : item.status === 'partial' ? (
                      <AlertCircle className="w-4 h-4 text-yellow-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className={item.status === 'complete' ? 'text-foreground' : 'text-muted-foreground'}>
                      {item.name}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {item.points}/{item.maxPoints}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Suggestions d'amélioration */}
        {suggestions.length > 0 && (
          <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Suggestions d'amélioration
            </h4>
            <ul className="space-y-1">
              {suggestions.map((item, index) => (
                <li key={index} className="text-xs text-muted-foreground flex items-start gap-1">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{item.suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Conseils contextuels */}
        {type === 'product' && (
          <div className="text-xs text-muted-foreground p-2 bg-blue-50 dark:bg-blue-950/20 rounded">
            💡 <strong>Conseil :</strong> Ajoutez couleur et matière pour mieux apparaître dans les recherches 
            (ex: "chemise rose coton").
          </div>
        )}
      </CardContent>
    </Card>
  );
};