-- 005_leases.sql: Lease contracts connecting tenants and rooms
do $$ begin
  create type lease_status as enum ('active', 'expired', 'terminated');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type deposit_status as enum ('held', 'partially_refunded', 'refunded', 'forfeited');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.leases (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  monthly_rent numeric(14, 0) not null,
  deposit_amount numeric(14, 0) default 0 not null,
  deposit_status deposit_status default 'held' not null,
  status lease_status default 'active' not null,
  contract_number varchar(100),
  notes text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists idx_leases_room on public.leases(room_id);
create index if not exists idx_leases_tenant on public.leases(tenant_id);
create index if not exists idx_leases_status on public.leases(status);
