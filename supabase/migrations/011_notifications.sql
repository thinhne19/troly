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

-- System Audit Logs table
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
