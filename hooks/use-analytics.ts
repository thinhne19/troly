// hooks/use-analytics.ts — Dashboard KPI and Aggregations
import { useQuery } from '@tanstack/react-query';
import { dataAdapter } from '@/lib/data-adapter';

export function useDashboardSummary(propertyId?: string, month?: string) {
  return useQuery({
    queryKey: ['dashboard-summary', { propertyId, month }],
    queryFn: () => dataAdapter.getDashboardSummary(propertyId, month),
  });
}

export function useRevenueTrend(propertyId?: string) {
  return useQuery({
    queryKey: ['revenue-trend', { propertyId }],
    queryFn: () => dataAdapter.getRevenueTrend(propertyId),
  });
}
