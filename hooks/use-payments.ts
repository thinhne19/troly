// hooks/use-payments.ts — Payment, VietQR Reconciliation, and Audit Log Hooks
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dataAdapter } from '@/lib/data-adapter';
import { Payment } from '@/types/models';
import { INVOICE_KEYS } from './use-invoices';

export const PAYMENT_KEYS = {
  all: (propertyId?: string, month?: string) => ['payments', { propertyId, month }] as const,
  auditLogs: (limit?: number) => ['audit-logs', { limit }] as const,
};

export function usePayments(propertyId?: string, month?: string) {
  return useQuery({
    queryKey: PAYMENT_KEYS.all(propertyId, month),
    queryFn: () => dataAdapter.getPayments(propertyId, month),
  });
}

export function useAuditLogs(limit: number = 50) {
  return useQuery({
    queryKey: PAYMENT_KEYS.auditLogs(limit),
    queryFn: () => dataAdapter.getAuditLogs(limit),
  });
}

export function useReconcileVietQr() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (transaction: {
      transactionRef: string;
      memo: string;
      amount: number;
      paymentDate?: string;
    }) => dataAdapter.reconcileVietQrPayment(transaction),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      queryClient.invalidateQueries({ queryKey: ['revenue-trend'] });
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
      if (res.invoice?.id) {
        queryClient.invalidateQueries({ queryKey: INVOICE_KEYS.detail(res.invoice.id) });
      }
    },
  });
}

export function useRecordPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payment: {
      invoiceId: string;
      amount: number;
      paymentMethod: Payment['paymentMethod'];
      transactionRef?: string;
      note?: string;
    }) => dataAdapter.recordPayment(payment),
    onSuccess: (_, { invoiceId }) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: INVOICE_KEYS.detail(invoiceId) });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      queryClient.invalidateQueries({ queryKey: ['revenue-trend'] });
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
    },
  });
}
