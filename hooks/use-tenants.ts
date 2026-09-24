// hooks/use-tenants.ts — TanStack Query Hooks for Tenants
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dataAdapter } from '@/lib/data-adapter';
import { Tenant } from '@/types/models';

export const TENANT_KEYS = {
  all: ['tenants'] as const,
  detail: (id: string) => ['tenants', id] as const,
};

export function useTenants() {
  return useQuery({
    queryKey: TENANT_KEYS.all,
    queryFn: () => dataAdapter.getTenants(),
  });
}

export function useTenant(id: string) {
  return useQuery({
    queryKey: TENANT_KEYS.detail(id),
    queryFn: () => dataAdapter.getTenantById(id),
    enabled: Boolean(id),
  });
}

export function useCreateTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      tenant,
      lease,
    }: {
      tenant: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>;
      lease?: {
        roomId: string;
        startDate: string;
        endDate: string;
        monthlyRent: number;
        depositAmount: number;
      };
    }) => dataAdapter.createTenant(tenant, lease),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TENANT_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['leases'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      queryClient.invalidateQueries({ queryKey: ['revenue-trend'] });
    },
  });
}

export function useUpdateTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Tenant> }) =>
      dataAdapter.updateTenant(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: TENANT_KEYS.all });
      queryClient.invalidateQueries({ queryKey: TENANT_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['leases'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
  });
}

export function useDeleteTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => dataAdapter.deleteTenant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TENANT_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['leases'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      queryClient.invalidateQueries({ queryKey: ['revenue-trend'] });
    },
  });
}

