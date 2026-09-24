-- ==============================================================================
-- 001_profiles.sql: Landlord profiles linked to Supabase Auth
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Table: public.profiles
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

-- Auto-create profile trigger on auth.users insert
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

-- Trigger definition
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
