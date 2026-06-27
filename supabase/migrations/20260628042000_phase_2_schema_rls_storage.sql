-- DesignBook Supabase Phase 2: schema, RLS, and storage setup only.

create extension if not exists pgcrypto;

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  owner_name text not null,
  business_name text not null,
  email text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  company_name text not null,
  company_number text not null,
  contact_person text,
  phone text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.dyes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  dye_name text not null,
  dye_number text not null,
  description text,
  cover_image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.dye_images (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  dye_id uuid not null references public.dyes(id) on delete cascade,
  image_url text not null,
  storage_path text not null,
  is_cover boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.designs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  design_name text not null,
  design_number text not null,
  company_id uuid not null references public.companies(id) on delete restrict,
  dye_id uuid not null references public.dyes(id) on delete restrict,
  description text,
  cover_image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.design_images (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  design_id uuid not null references public.designs(id) on delete cascade,
  image_url text not null,
  storage_path text not null,
  is_cover boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- Case-insensitive unique numbers scoped per owner.
create unique index if not exists companies_owner_company_number_unique
  on public.companies(owner_id, lower(company_number));

create unique index if not exists dyes_owner_dye_number_unique
  on public.dyes(owner_id, lower(dye_number));

create unique index if not exists designs_owner_design_number_unique
  on public.designs(owner_id, lower(design_number));

-- Supporting indexes for owner-scoped queries and joins.
create index if not exists companies_owner_id_idx on public.companies(owner_id);
create index if not exists dyes_owner_id_idx on public.dyes(owner_id);
create index if not exists designs_owner_id_idx on public.designs(owner_id);
create index if not exists designs_company_id_idx on public.designs(company_id);
create index if not exists designs_dye_id_idx on public.designs(dye_id);
create index if not exists dye_images_dye_id_idx on public.dye_images(dye_id);
create index if not exists design_images_design_id_idx on public.design_images(design_id);

-- Composite uniqueness lets child rows enforce same-owner relationships.
create unique index if not exists companies_id_owner_id_unique on public.companies(id, owner_id);
create unique index if not exists dyes_id_owner_id_unique on public.dyes(id, owner_id);
create unique index if not exists designs_id_owner_id_unique on public.designs(id, owner_id);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'designs_company_owner_fk'
  ) then
    alter table public.designs
      add constraint designs_company_owner_fk
      foreign key (company_id, owner_id)
      references public.companies(id, owner_id)
      on delete restrict;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'designs_dye_owner_fk'
  ) then
    alter table public.designs
      add constraint designs_dye_owner_fk
      foreign key (dye_id, owner_id)
      references public.dyes(id, owner_id)
      on delete restrict;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'dye_images_dye_owner_fk'
  ) then
    alter table public.dye_images
      add constraint dye_images_dye_owner_fk
      foreign key (dye_id, owner_id)
      references public.dyes(id, owner_id)
      on delete cascade;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'design_images_design_owner_fk'
  ) then
    alter table public.design_images
      add constraint design_images_design_owner_fk
      foreign key (design_id, owner_id)
      references public.designs(id, owner_id)
      on delete cascade;
  end if;
end;
$$;

drop trigger if exists profiles_handle_updated_at on public.profiles;
create trigger profiles_handle_updated_at
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();

drop trigger if exists companies_handle_updated_at on public.companies;
create trigger companies_handle_updated_at
  before update on public.companies
  for each row
  execute function public.handle_updated_at();

drop trigger if exists dyes_handle_updated_at on public.dyes;
create trigger dyes_handle_updated_at
  before update on public.dyes
  for each row
  execute function public.handle_updated_at();

drop trigger if exists designs_handle_updated_at on public.designs;
create trigger designs_handle_updated_at
  before update on public.designs
  for each row
  execute function public.handle_updated_at();

alter table public.profiles enable row level security;
alter table public.companies enable row level security;
alter table public.dyes enable row level security;
alter table public.dye_images enable row level security;
alter table public.designs enable row level security;
alter table public.design_images enable row level security;

drop policy if exists "Owners can view own profile" on public.profiles;
create policy "Owners can view own profile"
on public.profiles
for select
using (auth.uid() = user_id);

drop policy if exists "Owners can insert own profile" on public.profiles;
create policy "Owners can insert own profile"
on public.profiles
for insert
with check (auth.uid() = user_id);

drop policy if exists "Owners can update own profile" on public.profiles;
create policy "Owners can update own profile"
on public.profiles
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Owners can view own companies" on public.companies;
create policy "Owners can view own companies"
on public.companies
for select
using (auth.uid() = owner_id);

drop policy if exists "Owners can insert own companies" on public.companies;
create policy "Owners can insert own companies"
on public.companies
for insert
with check (auth.uid() = owner_id);

drop policy if exists "Owners can update own companies" on public.companies;
create policy "Owners can update own companies"
on public.companies
for update
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "Owners can delete own companies" on public.companies;
create policy "Owners can delete own companies"
on public.companies
for delete
using (auth.uid() = owner_id);

drop policy if exists "Owners can view own dyes" on public.dyes;
create policy "Owners can view own dyes"
on public.dyes
for select
using (auth.uid() = owner_id);

drop policy if exists "Owners can insert own dyes" on public.dyes;
create policy "Owners can insert own dyes"
on public.dyes
for insert
with check (auth.uid() = owner_id);

drop policy if exists "Owners can update own dyes" on public.dyes;
create policy "Owners can update own dyes"
on public.dyes
for update
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "Owners can delete own dyes" on public.dyes;
create policy "Owners can delete own dyes"
on public.dyes
for delete
using (auth.uid() = owner_id);

drop policy if exists "Owners can view own designs" on public.designs;
create policy "Owners can view own designs"
on public.designs
for select
using (auth.uid() = owner_id);

drop policy if exists "Owners can insert own designs" on public.designs;
create policy "Owners can insert own designs"
on public.designs
for insert
with check (auth.uid() = owner_id);

drop policy if exists "Owners can update own designs" on public.designs;
create policy "Owners can update own designs"
on public.designs
for update
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "Owners can delete own designs" on public.designs;
create policy "Owners can delete own designs"
on public.designs
for delete
using (auth.uid() = owner_id);

drop policy if exists "Owners can view own dye images" on public.dye_images;
create policy "Owners can view own dye images"
on public.dye_images
for select
using (auth.uid() = owner_id);

drop policy if exists "Owners can insert own dye images" on public.dye_images;
create policy "Owners can insert own dye images"
on public.dye_images
for insert
with check (auth.uid() = owner_id);

drop policy if exists "Owners can update own dye images" on public.dye_images;
create policy "Owners can update own dye images"
on public.dye_images
for update
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "Owners can delete own dye images" on public.dye_images;
create policy "Owners can delete own dye images"
on public.dye_images
for delete
using (auth.uid() = owner_id);

drop policy if exists "Owners can view own design images" on public.design_images;
create policy "Owners can view own design images"
on public.design_images
for select
using (auth.uid() = owner_id);

drop policy if exists "Owners can insert own design images" on public.design_images;
create policy "Owners can insert own design images"
on public.design_images
for insert
with check (auth.uid() = owner_id);

drop policy if exists "Owners can update own design images" on public.design_images;
create policy "Owners can update own design images"
on public.design_images
for update
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "Owners can delete own design images" on public.design_images;
create policy "Owners can delete own design images"
on public.design_images
for delete
using (auth.uid() = owner_id);

-- Supabase Storage bucket and owner-scoped object policies.
insert into storage.buckets (id, name, public)
values ('designbook-images', 'designbook-images', false)
on conflict (id) do nothing;

drop policy if exists "Owners can read own designbook images" on storage.objects;
create policy "Owners can read own designbook images"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'designbook-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Owners can upload own designbook images" on storage.objects;
create policy "Owners can upload own designbook images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'designbook-images'
  and (storage.foldername(name))[1] = auth.uid()::text
  and (storage.foldername(name))[2] in ('designs', 'dyes')
);

drop policy if exists "Owners can update own designbook images" on storage.objects;
create policy "Owners can update own designbook images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'designbook-images'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'designbook-images'
  and (storage.foldername(name))[1] = auth.uid()::text
  and (storage.foldername(name))[2] in ('designs', 'dyes')
);

drop policy if exists "Owners can delete own designbook images" on storage.objects;
create policy "Owners can delete own designbook images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'designbook-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);
