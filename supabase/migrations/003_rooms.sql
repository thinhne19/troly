-- ==============================================================================
-- 003_rooms.sql: Rental rooms within properties
-- ==============================================================================

do $$ begin
  create type room_status as enum ('vacant', 'occupied', 'reserved', 'maintenance');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  room_code varchar(50) not null,
  floor int default 1 not null,
  base_rent numeric(14, 0) default 0 not null,
  status room_status default 'vacant' not null,
  area_m2 numeric(6, 2),
  max_occupants int default 2 not null,
  reserved_until date,
  notes text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique (property_id, room_code)
);

create index if not exists idx_rooms_property on public.rooms(property_id);
create index if not exists idx_rooms_status on public.rooms(status);
