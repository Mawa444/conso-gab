/**
 * KPI Card Component
 * Affiche une métrique avec variation
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  iconColor?: string;
  loading?: boolean;
}

export const KPICard = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  iconColor = 'text-primary',
  loading = false 
}: KPICardProps) => {
  const isPositive = change !== undefined && change >= 0;
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={cn('h-4 w-4', iconColor)} />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-8 w-24 bg-muted animate-pulse rounded" />
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {change !== undefined && (
              <p className={cn(
                'text-xs',
                isPositive ? 'text-green-600' : 'text-red-600'
              )}>
                {isPositive ? '+' : ''}{change.toFixed(1)}% ce mois
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
