-- ==============================================================================
-- TROLY MASTER PRODUCTION MIGRATION SCRIPT (001 - 012)
-- Database: Supabase PostgreSQL (Postgres 15+)
-- Target Project: https://biyhwffkasfsyodqgmno.supabase.co
-- Description: Sets up all core rental tables, indexes, triggers,
--              Row-Level Security (RLS) policies, and Supabase Storage buckets.
-- ==============================================================================

-- ==============================================================================
-- 001_profiles.sql: Landlord profiles linked to Supabase Auth
-- ==============================================================================
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  phone varchar(20) not null unique,
  full_name varchar(100) not null,
  avatar_url text,
  bank_name varchar(100) default 'MBBank',
  bank_account_number varchar(50) default '999908123456',
  bank_account_holder varchar(100) default 'NGUYEN VAN THIN',
  vietqr_syntax_template varchar(50) default 'TROLY [ROOM] [MONTH]',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists idx_profiles_phone on public.profiles(phone);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, phone, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.phone, new.raw_user_meta_data->>'phone', '0908123456'),
    coalesce(new.raw_user_meta_data->>'full_name', 'Chủ nhà Troly'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update set
    phone = coalesce(excluded.phone, profiles.phone),
    updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ==============================================================================
-- 002_properties.sql: Properties (Boarding houses, mini-apartments, serviced apartments)
-- ==============================================================================
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

-- ==============================================================================
-- 004_tenants.sql: Tenant registry with CCCD identification
-- ==============================================================================
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

-- ==============================================================================
-- 005_leases.sql: Lease contracts connecting tenants and rooms
-- ==============================================================================
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

-- ==============================================================================
-- 006_utility_rates.sql: Utility and service rates configuration per property
-- ==============================================================================
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

-- ==============================================================================
-- 008_invoices.sql: Monthly invoices generated for each room
-- ==============================================================================
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

-- ==============================================================================
-- 009_invoice_items.sql: Line items for invoices (Rent, Utilities, Services)
-- ==============================================================================
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

-- ==============================================================================
-- 010_payments.sql: Payment ledger for settlements
-- ==============================================================================
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

-- ==============================================================================
-- 011_notifications.sql: Zalo/SMS notifications & audit log ledger
-- ==============================================================================
do $$ begin
  create type notif_channel as enum ('zalo', 'sms', 'system');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type notif_status as enum ('queued', 'sent', 'failed');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  tenant_id uuid references public.tenants(id) on delete cascade,
  invoice_id uuid references public.invoices(id) on delete set null,
  channel notif_channel default 'zalo' not null,
  message_content text not null,
  delivery_status notif_status default 'sent' not null,
  sent_at timestamptz default now() not null,
  created_at timestamptz default now() not null
);

create index if not exists idx_notifications_user on public.notifications(user_id);
create index if not exists idx_notifications_tenant on public.notifications(tenant_id);
create index if not exists idx_notifications_invoice on public.notifications(invoice_id);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  action varchar(100) not null,
  entity_type varchar(50) not null,
  entity_id text,
  details jsonb default '{}'::jsonb,
  ip_address varchar(45),
  created_at timestamptz default now() not null
);

create index if not exists idx_audit_logs_user on public.audit_logs(user_id);
create index if not exists idx_audit_logs_entity on public.audit_logs(entity_type, entity_id);
create index if not exists idx_audit_logs_created on public.audit_logs(created_at desc);

-- ==============================================================================
-- 012_rls.sql: Row Level Security (RLS) & Supabase Storage Policies
-- ==============================================================================
-- 1. Profiles
alter table public.profiles enable row level security;
drop policy if exists "Users manage own profile" on public.profiles;
create policy "Users manage own profile"
  on public.profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- 2. Properties
alter table public.properties enable row level security;
drop policy if exists "Landlords manage properties" on public.properties;
create policy "Landlords manage properties"
  on public.properties for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 3. Rooms
alter table public.rooms enable row level security;
drop policy if exists "Landlords manage rooms" on public.rooms;
create policy "Landlords manage rooms"
  on public.rooms for all
  using (
    exists (
      select 1 from public.properties
      where properties.id = rooms.property_id
      and properties.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.properties
      where properties.id = rooms.property_id
      and properties.user_id = auth.uid()
    )
  );

-- 4. Tenants
alter table public.tenants enable row level security;
drop policy if exists "Landlords manage tenants" on public.tenants;
create policy "Landlords manage tenants"
  on public.tenants for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 5. Leases
alter table public.leases enable row level security;
drop policy if exists "Landlords manage leases" on public.leases;
create policy "Landlords manage leases"
  on public.leases for all
  using (
    exists (
      select 1 from public.rooms
      join public.properties on properties.id = rooms.property_id
      where rooms.id = leases.room_id
      and properties.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.rooms
      join public.properties on properties.id = rooms.property_id
      where rooms.id = leases.room_id
      and properties.user_id = auth.uid()
    )
  );

-- 6. Utility Rates
alter table public.utility_rates enable row level security;
drop policy if exists "Landlords manage utility rates" on public.utility_rates;
create policy "Landlords manage utility rates"
  on public.utility_rates for all
  using (
    exists (
      select 1 from public.properties
      where properties.id = utility_rates.property_id
      and properties.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.properties
      where properties.id = utility_rates.property_id
      and properties.user_id = auth.uid()
    )
  );

-- 7. Meter Readings
alter table public.meter_readings enable row level security;
drop policy if exists "Landlords manage meter readings" on public.meter_readings;
create policy "Landlords manage meter readings"
  on public.meter_readings for all
  using (
    exists (
      select 1 from public.properties
      where properties.id = meter_readings.property_id
      and properties.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.properties
      where properties.id = meter_readings.property_id
      and properties.user_id = auth.uid()
    )
  );

-- 8. Invoices
alter table public.invoices enable row level security;
drop policy if exists "Landlords manage invoices" on public.invoices;
create policy "Landlords manage invoices"
  on public.invoices for all
  using (
    exists (
      select 1 from public.properties
      where properties.id = invoices.property_id
      and properties.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.properties
      where properties.id = invoices.property_id
      and properties.user_id = auth.uid()
    )
  );

-- 9. Invoice Items
alter table public.invoice_items enable row level security;
drop policy if exists "Landlords manage invoice items" on public.invoice_items;
create policy "Landlords manage invoice items"
  on public.invoice_items for all
  using (
    exists (
      select 1 from public.invoices
      join public.properties on properties.id = invoices.property_id
      where invoices.id = invoice_items.invoice_id
      and properties.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.invoices
      join public.properties on properties.id = invoices.property_id
      where invoices.id = invoice_items.invoice_id
      and properties.user_id = auth.uid()
    )
  );

-- 10. Payments
alter table public.payments enable row level security;
drop policy if exists "Landlords manage payments" on public.payments;
create policy "Landlords manage payments"
  on public.payments for all
  using (
    exists (
      select 1 from public.invoices
      join public.properties on properties.id = invoices.property_id
      where invoices.id = payments.invoice_id
      and properties.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.invoices
      join public.properties on properties.id = invoices.property_id
      where invoices.id = payments.invoice_id
      and properties.user_id = auth.uid()
    )
  );

-- 11. Notifications
alter table public.notifications enable row level security;
drop policy if exists "Landlords manage notifications" on public.notifications;
create policy "Landlords manage notifications"
  on public.notifications for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 12. Audit Logs
alter table public.audit_logs enable row level security;
drop policy if exists "Landlords manage audit logs" on public.audit_logs;
create policy "Landlords manage audit logs"
  on public.audit_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 13. Supabase Storage Buckets & Policies
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 5242880, array['image/png', 'image/jpeg', 'image/webp', 'image/gif']),
  ('documents', 'documents', false, 10485760, array['application/pdf', 'image/png', 'image/jpeg', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
  ('invoices', 'invoices', true, 10485760, array['application/pdf', 'image/png', 'image/jpeg'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Avatar Policies
drop policy if exists "Public can view avatar images" on storage.objects;
create policy "Public can view avatar images"
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "Authenticated users upload avatars" on storage.objects;
create policy "Authenticated users upload avatars"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.role() = 'authenticated');

drop policy if exists "Authenticated users update avatars" on storage.objects;
create policy "Authenticated users update avatars"
  on storage.objects for update
  using (bucket_id = 'avatars' and auth.role() = 'authenticated');

drop policy if exists "Authenticated users delete avatars" on storage.objects;
create policy "Authenticated users delete avatars"
  on storage.objects for delete
  using (bucket_id = 'avatars' and auth.role() = 'authenticated');

-- Documents Policies
drop policy if exists "Authenticated users view documents" on storage.objects;
create policy "Authenticated users view documents"
  on storage.objects for select
  using (bucket_id = 'documents' and auth.role() = 'authenticated');

drop policy if exists "Authenticated users upload documents" on storage.objects;
create policy "Authenticated users upload documents"
  on storage.objects for insert
  with check (bucket_id = 'documents' and auth.role() = 'authenticated');

drop policy if exists "Authenticated users update documents" on storage.objects;
create policy "Authenticated users update documents"
  on storage.objects for update
  using (bucket_id = 'documents' and auth.role() = 'authenticated');

drop policy if exists "Authenticated users delete documents" on storage.objects;
create policy "Authenticated users delete documents"
  on storage.objects for delete
  using (bucket_id = 'documents' and auth.role() = 'authenticated');

-- Invoices Policies
drop policy if exists "Public view invoice pdfs" on storage.objects;
create policy "Public view invoice pdfs"
  on storage.objects for select
  using (bucket_id = 'invoices');

drop policy if exists "Authenticated users upload invoice pdfs" on storage.objects;
create policy "Authenticated users upload invoice pdfs"
  on storage.objects for insert
  with check (bucket_id = 'invoices' and auth.role() = 'authenticated');

drop policy if exists "Authenticated users update invoice pdfs" on storage.objects;
create policy "Authenticated users update invoice pdfs"
  on storage.objects for update
  using (bucket_id = 'invoices' and auth.role() = 'authenticated');

drop policy if exists "Authenticated users delete invoice pdfs" on storage.objects;
create policy "Authenticated users delete invoice pdfs"
  on storage.objects for delete
  using (bucket_id = 'invoices' and auth.role() = 'authenticated');
