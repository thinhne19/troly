-- 006_utility_rates.sql: Utility and service rates configuration per property
do $$ begin
  create type rate_type as enum ('flat', 'tiered');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type water_rate_type as enum ('cubic_meter', 'per_head', 'fixed_room');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.utility_rates (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  electric_rate_type rate_type default 'flat' not null,
  electric_rate numeric(10, 0) default 3800 not null,
  water_rate_type water_rate_type default 'cubic_meter' not null,
  water_rate numeric(10, 0) default 18000 not null,
  internet_fee numeric(10, 0) default 100000 not null,
  garbage_fee numeric(10, 0) default 50000 not null,
  parking_fee_motorbike numeric(10, 0) default 100000 not null,
  elevator_fee numeric(10, 0) default 0 not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique (property_id)
);

create index if not exists idx_utility_rates_property on public.utility_rates(property_id);
