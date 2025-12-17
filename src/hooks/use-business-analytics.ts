/**
 * Hook pour récupérer les analytics d'un business
 */

import { useState, useEffect } from 'react';
import { Analytics } from '@/services/analytics';

export interface AnalyticsSummary {
  date: string;
  total_views: number;
  unique_visitors: number;
  total_likes: number;
  total_clicks: number;
  total_conversions: number;
  engagement_rate: number;
  conversion_rate: number;
}

export interface AnalyticsData {
  summary: AnalyticsSummary[];
  totalViews: number;
  totalConversions: number;
  totalClicks: number;
  conversionRate: number;
  loading: boolean;
  error: string | null;
}

export const useBusinessAnalytics = (
  businessId: string,
  startDate: string,
  endDate: string
): AnalyticsData => {
  const [data, setData] = useState<AnalyticsData>({
    summary: [],
    totalViews: 0,
    totalConversions: 0,
    totalClicks: 0,
    conversionRate: 0,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setData(prev => ({ ...prev, loading: true, error: null }));

        const summary = await Analytics.getSummary(businessId, startDate, endDate);

        // Calculer les totaux
        const totalViews = summary.reduce((sum, s) => sum + s.total_views, 0);
        const totalConversions = summary.reduce((sum, s) => sum + s.total_conversions, 0);
        const totalClicks = summary.reduce((sum, s) => sum + s.total_clicks, 0);
        const conversionRate = totalViews > 0 ? (totalConversions / totalViews) * 100 : 0;

        setData({
          summary,
          totalViews,
          totalConversions,
          totalClicks,
          conversionRate,
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error('Error fetching analytics:', error);
        setData(prev => ({
          ...prev,
          loading: false,
          error: 'Erreur lors du chargement des analytics',
        }));
      }
    };

    if (businessId) {
      fetchAnalytics();
    }
  }, [businessId, startDate, endDate]);

  return data;
};
