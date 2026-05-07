
create table public.site_settings (
  id text primary key default 'main',
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid
);

alter table public.site_settings enable row level security;

create policy "Public can read site settings"
  on public.site_settings for select
  to anon, authenticated
  using (true);

create policy "Authenticated can insert site settings"
  on public.site_settings for insert
  to authenticated
  with check (true);

create policy "Authenticated can update site settings"
  on public.site_settings for update
  to authenticated
  using (true)
  with check (true);

insert into public.site_settings (id, data) values ('main', '{}'::jsonb)
  on conflict (id) do nothing;

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger site_settings_touch
  before update on public.site_settings
  for each row execute function public.touch_updated_at();
