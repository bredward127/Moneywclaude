create table public.leads (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('seller', 'buyer')),
  status text not null default 'draft' check (status in ('draft', 'submitted')),
  contact_name text not null default '',
  contact_email text not null default '',
  contact_phone text not null default '',
  contact_preferred_method text not null default '',
  consent boolean not null default false,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.lead_media (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  file_path text not null,
  category text not null,
  original_filename text not null,
  mime_type text not null,
  file_size bigint not null,
  created_at timestamptz not null default now()
);
create index lead_media_lead_id_idx on public.lead_media (lead_id);

create table public.upload_tokens (
  token text primary key,
  lead_id uuid not null references public.leads(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index upload_tokens_lead_id_idx on public.upload_tokens (lead_id);

alter table public.leads enable row level security;
alter table public.lead_media enable row level security;
alter table public.upload_tokens enable row level security;
