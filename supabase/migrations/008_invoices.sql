-- 008_invoices.sql: Monthly invoices generated for each room
do $$ begin
  create type invoice_status as enum ('unpaid', 'partially_paid', 'paid', 'overdue');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  room_id uuid not null references public.rooms(id) on delete cascade,
  tenant_id uuid references public.tenants(id) on delete set null,
  lease_id uuid references public.leases(id) on delete set null,
  invoice_code varchar(50) not null unique,
  billing_month varchar(7) not null,
  issue_date date default current_date not null,
  due_date date not null,
  total_amount numeric(14, 0) default 0 not null,
  amount_paid numeric(14, 0) default 0 not null,
  balance_due numeric(14, 0) default 0 not null,
  payment_status invoice_status default 'unpaid' not null,
  vietqr_payload text,
  paid_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists idx_invoices_property_month on public.invoices(property_id, billing_month);
create index if not exists idx_invoices_room on public.invoices(room_id);
create index if not exists idx_invoices_status on public.invoices(payment_status);
create index if not exists idx_invoices_code on public.invoices(invoice_code);
