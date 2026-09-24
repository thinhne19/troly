'use client';

// hooks/use-auth.ts — Authentication & Session State Hook
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dataAdapter } from '@/lib/data-adapter';

export const AUTH_KEYS = {
  session: ['auth-session'] as const,
  profile: ['auth-profile'] as const,
};

export function useAuthSession() {
  return useQuery({
    queryKey: AUTH_KEYS.session,
    queryFn: () => dataAdapter.getSession(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAuthProfile() {
  return useQuery({
    queryKey: AUTH_KEYS.profile,
    queryFn: () => dataAdapter.getProfile(),
  });
}

export function useSendOtp() {
  return useMutation({
    mutationFn: (phone: string) => dataAdapter.sendOtp(phone),
  });
}

export function useVerifyOtp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ phone, otp }: { phone: string; otp: string }) =>
      dataAdapter.verifyOtp(phone, otp),
    onSuccess: (data) => {
      if (data.success) {
        if (typeof document !== 'undefined') {
          document.cookie = `troly_session_token=${data.token || 'session_token'}; path=/; max-age=2592000; SameSite=Lax`;
          document.cookie = 'troly_logged_out=false; path=/; max-age=0';
        }
        queryClient.invalidateQueries({ queryKey: AUTH_KEYS.session });
        queryClient.invalidateQueries({ queryKey: AUTH_KEYS.profile });
      }
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => dataAdapter.logout(),
    onSuccess: () => {
      if (typeof document !== 'undefined') {
        document.cookie = 'troly_logged_out=true; path=/; max-age=2592000; SameSite=Lax';
        document.cookie = 'troly_session_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax';
      }
      queryClient.invalidateQueries({ queryKey: AUTH_KEYS.session });
      queryClient.invalidateQueries({ queryKey: AUTH_KEYS.profile });
    },
  });
}

