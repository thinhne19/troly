-- 002_properties.sql: Properties (Boarding houses, mini-apartments, serviced apartments)
create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name varchar(255) not null,
  address text not null,
  total_floors int default 1 not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists idx_properties_user on public.properties(user_id);
