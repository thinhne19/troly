-- 009_invoice_items.sql: Line items for invoices (Rent, Utilities, Services)
do $$ begin
  create type invoice_item_type as enum (
    'rent', 'electricity', 'water', 'internet', 'garbage', 'parking', 'other'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  item_type invoice_item_type not null,
  description varchar(255) not null,
  previous_reading numeric(10, 2),
  current_reading numeric(10, 2),
  quantity numeric(10, 2) default 1 not null,
  unit_price numeric(14, 0) not null,
  amount numeric(14, 0) not null,
  created_at timestamptz default now() not null
);

create index if not exists idx_invoice_items_invoice on public.invoice_items(invoice_id);
create index if not exists idx_invoice_items_type on public.invoice_items(item_type);
