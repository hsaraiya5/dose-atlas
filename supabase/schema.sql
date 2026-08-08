-- Dose Atlas schema
-- Run this in the Supabase SQL Editor (Project -> SQL Editor -> New query)

-- Fuzzy text search support (used for description/notes search)
create extension if not exists pg_trgm;

-- ============================================================
-- meal_entries
-- ============================================================

create table meal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) default auth.uid(),
  date date not null,
  description text not null,
  place text[] not null default '{}',
  meal_tags text[] not null default '{}',
  insulin_dose numeric not null,
  pre_bolus_minutes int not null default 0,
  food_photo_path text,
  dexcom_screenshot_path text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table meal_entries enable row level security;

create policy "select own meal entries" on meal_entries
  for select using (auth.uid() = user_id);
create policy "insert own meal entries" on meal_entries
  for insert with check (auth.uid() = user_id);
create policy "update own meal entries" on meal_entries
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete own meal entries" on meal_entries
  for delete using (auth.uid() = user_id);

-- Fuzzy search index (trigram) on the two free-text fields
create index meal_entries_description_trgm on meal_entries using gin (description gin_trgm_ops);
create index meal_entries_notes_trgm on meal_entries using gin (notes gin_trgm_ops);

-- Array-containment filters on place/meal_tags
create index meal_entries_place_gin on meal_entries using gin (place);
create index meal_entries_meal_tags_gin on meal_entries using gin (meal_tags);

-- ============================================================
-- food_db
-- ============================================================

create table food_db (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) default auth.uid(),
  name text not null,
  carbs numeric,
  typical_dose numeric,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table food_db enable row level security;

create policy "select own food db" on food_db
  for select using (auth.uid() = user_id);
create policy "insert own food db" on food_db
  for insert with check (auth.uid() = user_id);
create policy "update own food db" on food_db
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete own food db" on food_db
  for delete using (auth.uid() = user_id);

create index food_db_name_trgm on food_db using gin (name gin_trgm_ops);

-- ============================================================
-- updated_at auto-maintenance
-- ============================================================

create function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger meal_entries_set_updated_at
  before update on meal_entries
  for each row execute function set_updated_at();

create trigger food_db_set_updated_at
  before update on food_db
  for each row execute function set_updated_at();

-- ============================================================
-- Storage: private bucket for food photos + Dexcom screenshots
-- ============================================================

insert into storage.buckets (id, name, public)
values ('meal-images', 'meal-images', false);

-- Files must be stored under a path prefixed with the owner's user id,
-- e.g. `{user_id}/{entry_id}/food.jpg` - these policies enforce that.
create policy "select own meal images" on storage.objects
  for select using (
    bucket_id = 'meal-images' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "insert own meal images" on storage.objects
  for insert with check (
    bucket_id = 'meal-images' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "update own meal images" on storage.objects
  for update using (
    bucket_id = 'meal-images' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "delete own meal images" on storage.objects
  for delete using (
    bucket_id = 'meal-images' and (storage.foldername(name))[1] = auth.uid()::text
  );
