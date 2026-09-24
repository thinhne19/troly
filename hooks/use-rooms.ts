// hooks/use-rooms.ts — TanStack Query Hooks for Rooms
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dataAdapter } from '@/lib/data-adapter';
import { Room } from '@/types/models';
import { PROPERTY_KEYS } from './use-properties';

export const ROOM_KEYS = {
  all: (propertyId?: string) => ['rooms', { propertyId }] as const,
  detail: (id: string) => ['rooms', id] as const,
};

export function useRooms(propertyId?: string) {
  return useQuery({
    queryKey: ROOM_KEYS.all(propertyId),
    queryFn: () => dataAdapter.getRooms(propertyId),
  });
}

export function useRoom(id: string) {
  return useQuery({
    queryKey: ROOM_KEYS.detail(id),
    queryFn: () => dataAdapter.getRoomById(id),
    enabled: Boolean(id),
  });
}

export function useCreateRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Room, 'id' | 'createdAt' | 'updatedAt'>) =>
      dataAdapter.createRoom(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: PROPERTY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      queryClient.invalidateQueries({ queryKey: ['revenue-trend'] });
    },
  });
}

export function useUpdateRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Room> }) =>
      dataAdapter.updateRoom(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ROOM_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: PROPERTY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      queryClient.invalidateQueries({ queryKey: ['revenue-trend'] });
    },
  });
}

export function useDeleteRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => dataAdapter.deleteRoom(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: PROPERTY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      queryClient.invalidateQueries({ queryKey: ['revenue-trend'] });
    },
  });
}

