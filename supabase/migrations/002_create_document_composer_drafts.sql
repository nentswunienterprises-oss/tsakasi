create table if not exists public.document_composer_drafts (
  id text primary key,
  updated_at timestamptz not null default now(),
  name text not null,
  state jsonb not null
);

alter table public.document_composer_drafts enable row level security;

create policy "Service role can manage document drafts"
  on public.document_composer_drafts
  for all
  to service_role
  using (true)
  with check (true);