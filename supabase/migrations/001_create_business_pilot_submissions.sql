create table if not exists public.business_pilot_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  business_name text not null,
  contact_person text not null,
  business_type text not null,
  town text not null,
  currently_offer_delivery text not null,
  current_delivery_method text not null,
  average_deliveries_per_week text not null,
  main_delivery_pain text not null,
  local_delivery_partner_interest text not null,
  short_interview_interest text not null,
  whatsapp_number text not null,
  email text not null,
  source text not null default 'tsa-kasi-logistics-site'
);

alter table public.business_pilot_submissions enable row level security;

create policy "Service role can manage submissions"
  on public.business_pilot_submissions
  for all
  to service_role
  using (true)
  with check (true);
