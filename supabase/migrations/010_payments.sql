-- 010_payments.sql: Payment ledger for settlements
do $$ begin
  create type payment_method as enum ('vietqr', 'bank_transfer', 'cash', 'zalo_pay');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  amount numeric(14, 0) not null,
  payment_method payment_method default 'vietqr' not null,
  transaction_ref varchar(100),
  payment_date timestamptz default now() not null,
  note text,
  created_at timestamptz default now() not null
);

create index if not exists idx_payments_invoice on public.payments(invoice_id);
create index if not exists idx_payments_date on public.payments(payment_date);
