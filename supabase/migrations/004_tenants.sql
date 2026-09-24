-- 004_tenants.sql: Tenant registry with CCCD identification
do $$ begin
  create type tenant_status as enum ('active', 'moved_out');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.tenants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  full_name varchar(100) not null,
  phone varchar(20) not null,
  national_id varchar(20) not null, -- CCCD / CMND
  id_issue_date date,
  id_issue_place varchar(100),
  avatar_url text,
  id_front_image_url text,
  id_back_image_url text,
  emergency_contact_name varchar(100),
  emergency_contact_phone varchar(20),
  status tenant_status default 'active' not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists idx_tenants_user on public.tenants(user_id);
create index if not exists idx_tenants_phone on public.tenants(phone);
create index if not exists idx_tenants_national_id on public.tenants(national_id);
