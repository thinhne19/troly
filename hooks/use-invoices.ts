// hooks/use-invoices.ts — Invoice Generation & Payment Hooks
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dataAdapter } from '@/lib/data-adapter';
import { Invoice, Payment } from '@/types/models';

export const INVOICE_KEYS = {
  all: (propertyId?: string, month?: string) => ['invoices', { propertyId, month }] as const,
  detail: (id: string) => ['invoices', id] as const,
};

export function useInvoices(propertyId?: string, month?: string) {
  return useQuery({
    queryKey: INVOICE_KEYS.all(propertyId, month),
    queryFn: () => dataAdapter.getInvoices(propertyId, month),
  });
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: INVOICE_KEYS.detail(id),
    queryFn: () => dataAdapter.getInvoiceById(id),
    enabled: Boolean(id),
  });
}

export function useGenerateInvoices() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ propertyId, month }: { propertyId: string; month: string }) =>
      dataAdapter.generateInvoicesForMonth(propertyId, month),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Invoice> }) =>
      dataAdapter.updateInvoice(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: INVOICE_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      queryClient.invalidateQueries({ queryKey: ['revenue-trend'] });
    },
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => dataAdapter.deleteInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      queryClient.invalidateQueries({ queryKey: ['revenue-trend'] });
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
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: INVOICE_KEYS.detail(invoiceId) });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      queryClient.invalidateQueries({ queryKey: ['revenue-trend'] });
    },
  });
}

