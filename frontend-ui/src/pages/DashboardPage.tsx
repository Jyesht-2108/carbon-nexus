import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { staggerContainer } from '@/lib/animations';
import { EmissionDonutCard } from '@/components/cards/EmissionDonutCard';
import { EmissionPulseCard } from '@/components/cards/EmissionPulseCard';
import { GaugeProgressCard } from '@/components/cards/GaugeProgressCard';
import { DataQualityBadge } from '@/components/cards/DataQualityBadge';
import { HotspotCard } from '@/components/cards/HotspotCard';
import { RecommendationCard } from '@/components/cards/RecommendationCard';
import { ForecastLineChart } from '@/components/charts/ForecastLineChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  emissionsApi,
  hotspotsApi,
  recommendationsApi,
  dataQualityApi,
  Recommendation,
} from '@/services/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useCallback } from 'react';

export function DashboardPage() {
  const queryClient = useQueryClient();

  // WebSocket subscriptions for real-time updates
  useWebSocket(
    'emissions',
    useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ['emissions'] });
    }, [queryClient])
  );

  useWebSocket(
    'hotspots',
    useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ['hotspots'] });
    }, [queryClient])
  );

  useWebSocket(
    'recommendations',
    useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
    }, [queryClient])
  );

  const { data: emissions } = useQuery({
    queryKey: ['emissions'],
    queryFn: () => emissionsApi.getCurrent().then((res) => res.data),
    refetchInterval: 5000,
  });

  const { data: forecast } = useQuery({
    queryKey: ['forecast'],
    queryFn: () => emissionsApi.getForecast().then((res) => res.data),
  });

  const { data: hotspots } = useQuery({
    queryKey: ['hotspots'],
    queryFn: () => hotspotsApi.getAll().then((res) => res.data),
    refetchInterval: 10000,
  });

  const { data: recommendations } = useQuery({
    queryKey: ['recommendations'],
    queryFn: () => recommendationsApi.getAll().then((res) => res.data),
  });

  const { data: dataQuality } = useQuery({
    queryKey: ['dataQuality'],
    queryFn: () => dataQualityApi.get().then((res) => res.data),
  });

  const approveMutation = useMutation({
    mutationFn: (id: number) => recommendationsApi.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
    },
  });

  const dismissMutation = useMutation({
    mutationFn: (id: number) => recommendationsApi.dismiss(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
    },
  });

  const forecastData = forecast
    ? forecast.dates.map((date, i) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        forecast: forecast.forecast[i],
        low: forecast.confidence_low?.[i],
        high: forecast.confidence_high?.[i],
      }))
    : [];

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {emissions && (
          <>
            <EmissionPulseCard
              currentRate={emissions.current_rate}
              trend={emissions.trend}
              target={emissions.target}
            />
            <GaugeProgressCard saved={emissions.total_today} goal={emissions.target * 24} />
          </>
        )}
        {dataQuality && (
          <DataQualityBadge
            completeness={dataQuality.completeness_pct}
            predicted={dataQuality.predicted_pct}
            anomalies={dataQuality.anomalies_count}
          />
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {emissions && <EmissionDonutCard categories={emissions.categories} />}
        <Card>
          <CardHeader>
            <CardTitle>7-Day Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <ForecastLineChart data={forecastData} />
          </CardContent>
        </Card>
      </div>

      {/* Hotspots & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Critical Hotspots</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {hotspots?.slice(0, 5).map((hotspot) => (
                <HotspotCard key={hotspot.id} hotspot={hotspot} />
              ))}
              {!hotspots?.length && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No hotspots detected
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendations
                ?.filter((r: Recommendation) => r.status === 'pending')
                .slice(0, 3)
                .map((rec: Recommendation) => (
                  <RecommendationCard
                    key={rec.id}
                    recommendation={rec}
                    onApprove={() => approveMutation.mutate(rec.id)}
                    onDismiss={() => dismissMutation.mutate(rec.id)}
                  />
                ))}
              {!recommendations?.filter((r: Recommendation) => r.status === 'pending')
                .length && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No pending recommendations
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
