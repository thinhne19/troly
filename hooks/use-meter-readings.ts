// hooks/use-meter-readings.ts — Rapid Meter Entry Hooks
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dataAdapter } from '@/lib/data-adapter';
import { MeterReading } from '@/types/models';

export const METER_KEYS = {
  list: (propertyId: string, month: string) => ['meter-readings', propertyId, month] as const,
};

export function useMeterReadings(propertyId: string, month: string) {
  return useQuery({
    queryKey: METER_KEYS.list(propertyId, month),
    queryFn: () => dataAdapter.getMeterReadings(propertyId, month),
    enabled: Boolean(propertyId && month),
  });
}

export function useSaveMeterReadings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (readings: Array<Omit<MeterReading, 'id' | 'recordedAt'>>) =>
      dataAdapter.saveMeterReadings(readings),
    onSuccess: (_, readings) => {
      if (readings.length > 0) {
        const { propertyId, billingMonth } = readings[0];
        queryClient.invalidateQueries({
          queryKey: METER_KEYS.list(propertyId, billingMonth),
        });
      }
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
  });
}
