// hooks/use-properties.ts — TanStack Query Hooks for Properties
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dataAdapter } from '@/lib/data-adapter';
import { Property, UtilityRates } from '@/types/models';

export const PROPERTY_KEYS = {
  all: ['properties'] as const,
  detail: (id: string) => ['properties', id] as const,
  rates: (id: string) => ['properties', id, 'rates'] as const,
};

export function useProperties() {
  return useQuery({
    queryKey: PROPERTY_KEYS.all,
    queryFn: () => dataAdapter.getProperties(),
  });
}

export function useProperty(id: string) {
  return useQuery({
    queryKey: PROPERTY_KEYS.detail(id),
    queryFn: () => dataAdapter.getPropertyById(id),
    enabled: Boolean(id),
  });
}

export function useUtilityRates(propertyId: string) {
  return useQuery({
    queryKey: PROPERTY_KEYS.rates(propertyId),
    queryFn: () => dataAdapter.getUtilityRates(propertyId),
    enabled: Boolean(propertyId),
  });
}

export function useCreateProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      property,
      rates,
    }: {
      property: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>;
      rates?: Partial<UtilityRates>;
    }) => dataAdapter.createProperty(property, rates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROPERTY_KEYS.all });
    },
  });
}

export function useUpdateProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Property> }) =>
      dataAdapter.updateProperty(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: PROPERTY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: PROPERTY_KEYS.detail(id) });
    },
  });
}
