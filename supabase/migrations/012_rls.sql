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

-- ==============================================================================
-- 13. Supabase Storage Buckets & Policies
-- ==============================================================================

-- Create buckets if they do not exist
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
