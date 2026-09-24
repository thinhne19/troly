// hooks/use-leases.ts — TanStack Query Hooks for Lease Contracts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dataAdapter } from '@/lib/data-adapter';
import { Lease } from '@/types/models';

export const LEASE_KEYS = {
  all: (propertyId?: string, status?: string) => ['leases', { propertyId, status }] as const,
  detail: (id: string) => ['leases', id] as const,
};

export function useLeases(propertyId?: string, status?: Lease['status']) {
  return useQuery({
    queryKey: LEASE_KEYS.all(propertyId, status),
    queryFn: () => dataAdapter.getLeases(propertyId, status),
  });
}

export function useLease(id: string) {
  return useQuery({
    queryKey: LEASE_KEYS.detail(id),
    queryFn: () => dataAdapter.getLeaseById(id),
    enabled: Boolean(id),
  });
}

export function useCreateLease() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Lease, 'id' | 'createdAt' | 'updatedAt'>) =>
      dataAdapter.createLease(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leases'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      queryClient.invalidateQueries({ queryKey: ['revenue-trend'] });
    },
  });
}

export function useUpdateLease() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Lease> }) =>
      dataAdapter.updateLease(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['leases'] });
      queryClient.invalidateQueries({ queryKey: LEASE_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
  });
}

export function useTerminateLease() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      depositStatus,
      notes,
    }: {
      id: string;
      depositStatus?: Lease['depositStatus'];
      notes?: string;
    }) => dataAdapter.terminateLease(id, depositStatus, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leases'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      queryClient.invalidateQueries({ queryKey: ['revenue-trend'] });
    },
  });
}

export function useExtendLease() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      newEndDate,
      newRent,
      notes,
    }: {
      id: string;
      newEndDate: string;
      newRent?: number;
      notes?: string;
    }) => dataAdapter.extendLease(id, newEndDate, newRent, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leases'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      queryClient.invalidateQueries({ queryKey: ['revenue-trend'] });
    },
  });
}
