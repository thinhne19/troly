-- ==============================================================================
-- 007_meter_readings.sql: Monthly electricity and water counter logs
-- ==============================================================================

create table if not exists public.meter_readings (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  room_id uuid not null references public.rooms(id) on delete cascade,
  billing_month varchar(7) not null, -- 'YYYY-MM'
  electric_previous numeric(10, 2) not null,
  electric_current numeric(10, 2) not null,
  electric_usage numeric(10, 2) default 0 not null,
  water_previous numeric(10, 2) not null,
  water_current numeric(10, 2) not null,
  water_usage numeric(10, 2) default 0 not null,
  is_meter_reset boolean default false not null,
  reset_reason text,
  recorded_at timestamptz default now() not null,
  notes text,
  unique (room_id, billing_month)
);

create index if not exists idx_meter_readings_property_month on public.meter_readings(property_id, billing_month);
create index if not exists idx_meter_readings_room on public.meter_readings(room_id);
