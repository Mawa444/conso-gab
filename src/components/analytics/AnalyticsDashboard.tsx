/**
 * Analytics Dashboard
 * Dashboard principal pour afficher les analytics business
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { KPICard } from './KPICard';
import { useBusinessAnalytics } from '@/hooks/use-business-analytics';
import { 
  Eye, 
  MousePointerClick, 
  Target, 
  TrendingUp,
  Calendar,
  BarChart3,
  Users
} from 'lucide-react';

interface AnalyticsDashboardProps {
  businessId: string;
  businessName: string;
}

export const AnalyticsDashboard = ({ businessId, businessName }: AnalyticsDashboardProps) => {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');

  // Calculer les dates
  const getDateRange = () => {
    const end = new Date();
    const start = new Date();
    
    switch (dateRange) {
      case '7d':
        start.setDate(start.getDate() - 7);
        break;
      case '30d':
        start.setDate(start.getDate() - 30);
        break;
      case '90d':
        start.setDate(start.getDate() - 90);
        break;
    }

    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    };
  };

  const { startDate, endDate } = getDateRange();
  const analytics = useBusinessAnalytics(businessId, startDate, endDate);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytics</h2>
          <p className="text-muted-foreground">{businessName}</p>
        </div>
        
        <Select value={dateRange} onValueChange={(v: any) => setDateRange(v)}>
          <SelectTrigger className="w-[180px]">
            <Calendar className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">7 derniers jours</SelectItem>
            <SelectItem value="30d">30 derniers jours</SelectItem>
            <SelectItem value="90d">90 derniers jours</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Vues du profil"
          value={analytics.totalViews}
          icon={Eye}
          iconColor="text-blue-600"
          loading={analytics.loading}
        />
        
        <KPICard
          title="Clics"
          value={analytics.totalClicks}
          icon={MousePointerClick}
          iconColor="text-green-600"
          loading={analytics.loading}
        />
        
        <KPICard
          title="Conversions"
          value={analytics.totalConversions}
          icon={Target}
          iconColor="text-purple-600"
          loading={analytics.loading}
        />
        
        <KPICard
          title="Taux de conversion"
          value={`${analytics.conversionRate.toFixed(1)}%`}
          icon={TrendingUp}
          iconColor="text-orange-600"
          loading={analytics.loading}
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="details">Détails</TabsTrigger>
          <TabsTrigger value="demographics">Démographie</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Graphique de tendance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Évolution des vues
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.loading ? (
                <div className="h-[300px] bg-muted animate-pulse rounded" />
              ) : analytics.summary.length > 0 ? (
                <div className="space-y-2">
                  {analytics.summary.map((day, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground w-24">
                        {new Date(day.date).toLocaleDateString('fr-FR', { 
                          day: 'numeric', 
                          month: 'short' 
                        })}
                      </span>
                      <div className="flex-1 bg-muted rounded-full h-8 overflow-hidden">
                        <div 
                          className="bg-primary h-full transition-all"
                          style={{ 
                            width: `${(day.total_views / Math.max(...analytics.summary.map(s => s.total_views))) * 100}%` 
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium w-12 text-right">
                        {day.total_views}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Aucune donnée disponible
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Détails des événements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.summary.map((day, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">
                        {new Date(day.date).toLocaleDateString('fr-FR', { 
                          weekday: 'long',
                          day: 'numeric', 
                          month: 'long' 
                        })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {day.total_views} vues • {day.total_clicks} clics • {day.total_conversions} conversions
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        Taux: {day.conversion_rate.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="demographics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Données démographiques
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Les données démographiques détaillées seront disponibles prochainement.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
