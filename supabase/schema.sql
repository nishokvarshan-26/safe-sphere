create table if not exists public.watchlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  protocol_slug text not null,
  created_at timestamptz not null default now(),
  unique (user_id, protocol_slug)
);

create table if not exists public.investigation_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.watchlists enable row level security;
alter table public.investigation_reports enable row level security;

create policy "Users manage own watchlist" on public.watchlists for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own reports" on public.investigation_reports for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
