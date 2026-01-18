import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Eye, 
  MousePointerClick, 
  TrendingUp, 
  Calendar,
  Zap,
  Target,
  BarChart3,
  Download,
  Share2
} from "lucide-react";
import { InteractiveBusinessCard } from "@/components/commerce/InteractiveBusinessCard";
import { CarouselImagesManager } from "./CarouselImagesManager";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

interface AdvertisingDashboardProps {
  businessId: string;
  businessName: string;
  currentImages: string[];
  onImagesUpdate: (images: string[]) => void;
  businessData: {
    logo_url?: string | null;
    cover_image_url?: string | null;
    business_category?: string;
    description?: string;
    is_verified?: boolean;
  };
}

export const AdvertisingDashboard = ({
  businessId,
  businessName,
  currentImages,
  onImagesUpdate,
  businessData
}: AdvertisingDashboardProps) => {
  const [showPreview, setShowPreview] = useState(true);

  // Mock analytics data
  const analytics = {
    impressions: 12847,
    clicks: 892,
    ctr: 6.9,
    engagement: 78,
    trend: "+23%"
  };

  return (
    <div className="space-y-6">
      {/* Header avec stats rapides */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <Target className="w-6 h-6 text-primary" />
            Gestion publicitaire
          </h3>
          <Badge variant="default" className="text-sm">
            {currentImages.length}/5 images actives
          </Badge>
        </div>
        <p className="text-muted-foreground">
          Gérez vos images publicitaires et suivez leurs performances en temps réel
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Eye className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analytics.impressions.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Impressions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <MousePointerClick className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analytics.clicks}</p>
                <p className="text-xs text-muted-foreground">Clics</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analytics.ctr}%</p>
                <p className="text-xs text-muted-foreground">CTR</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analytics.trend}</p>
                <p className="text-xs text-muted-foreground">Tendance</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Score */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Score d'engagement publicitaire</CardTitle>
          <CardDescription>
            Performance globale de vos publicités ce mois
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Engagement global</span>
              <span className="text-2xl font-bold text-primary">{analytics.engagement}%</span>
            </div>
            <Progress value={analytics.engagement} className="h-3" />
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <TrendingUp className="w-3 h-3 text-green-600" />
              <span>+12% par rapport au mois dernier</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Button variant="outline" className="w-full">
          <Zap className="w-4 h-4 mr-2" />
          Booster
        </Button>
        <Button variant="outline" className="w-full">
          <Calendar className="w-4 h-4 mr-2" />
          Planifier
        </Button>
        <Button variant="outline" className="w-full">
          <Download className="w-4 h-4 mr-2" />
          Rapport
        </Button>
        <Button variant="outline" className="w-full">
          <Share2 className="w-4 h-4 mr-2" />
          Partager
        </Button>
      </div>

      <Separator />

      {/* Preview Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold">Prévisualisation en direct</h4>
          <p className="text-sm text-muted-foreground">
            Voyez comment vos publicités apparaissent sur les cartes
          </p>
        </div>
        <Button 
          variant={showPreview ? "default" : "outline"} 
          onClick={() => setShowPreview(!showPreview)}
        >
          {showPreview ? "Masquer" : "Afficher"}
        </Button>
      </div>

      {/* Live Preview */}
      {showPreview && currentImages.length > 0 && (
        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle className="text-sm">Aperçu de votre carte avec publicités</CardTitle>
          </CardHeader>
          <CardContent>
             <InteractiveBusinessCard
                business={{
                  id: businessId,
                  name: businessName,
                  logo_url: businessData?.logo_url || undefined,
                  cover_image_url: businessData?.cover_image_url || undefined,
                  business_category: businessData?.business_category,
                  description: businessData?.description,
                  carousel_images: currentImages,
                  rating: 4.5,
                  verified: businessData?.is_verified
                }}
              />
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Images Manager */}
      <CarouselImagesManager
        businessId={businessId}
        currentImages={currentImages}
        onImagesUpdate={onImagesUpdate}
      />

      {/* Tips Section */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            💡 Conseils pour maximiser l'impact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Utilisez des images haute qualité en format 16:9</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Variez le contenu : promotions, produits, événements</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Mettez à jour régulièrement pour maintenir l'engagement</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Incluez un appel à l'action clair dans vos visuels</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
