-- Recreates leads/lead_media for a multi-tenant model and adds
-- organizations, users, consent_records, partner_routes, contract_packets.
-- leads, lead_media, and upload_tokens all had zero rows in production at
-- the time of this migration, so leads/lead_media were safely dropped and
-- recreated rather than altered in place.

drop table if exists public.lead_media cascade;
drop table if exists public.leads cascade;

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);
comment on table public.organizations is 'Tenant boundary. Every user and lead belongs to exactly one organization.';

create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  org_id uuid not null references public.organizations (id) on delete cascade,
  email text not null,
  role text not null check (role in ('admin', 'reviewer', 'acquisitions', 'partner')),
  created_at timestamptz not null default now()
);
comment on table public.users is 'App-level profile for a Supabase Auth identity: which organization they belong to and their role within it.';
create index users_org_id_idx on public.users (org_id);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  type text not null check (type in ('seller', 'buyer')),
  status text not null default 'draft',
  contact_name text not null default '',
  phone text not null default '',
  email text not null default '',
  contact_pref text not null default '',
  property_details jsonb not null default '{}'::jsonb,
  buyer_criteria jsonb not null default '{}'::jsonb,
  transcript_raw text,
  human_review_flag boolean not null default false,
  created_at timestamptz not null default now()
);
comment on table public.leads is 'Seller/buyer intake submissions, scoped to an organization. Written only by server-side code using the service role key.';
create index leads_org_id_idx on public.leads (org_id);

create table public.lead_media (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  file_path text not null,
  category text not null,
  original_filename text not null default '',
  mime_type text not null,
  size_bytes bigint not null,
  created_at timestamptz not null default now()
);
comment on table public.lead_media is 'Metadata for files in the private property-photos storage bucket. file_path is the object key within that bucket.';
create index lead_media_lead_id_idx on public.lead_media (lead_id);

alter table public.upload_tokens
  add constraint upload_tokens_lead_id_fkey foreign key (lead_id) references public.leads (id) on delete cascade;

create table public.consent_records (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  disclosure_version text not null,
  privacy_agreed boolean not null default false,
  marketing_opt_in boolean not null default false,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now()
);
comment on table public.consent_records is 'Immutable audit record of the exact disclosure version and consent choices captured at intake time. Never updated after insert.';
create index consent_records_lead_id_idx on public.consent_records (lead_id);

create table public.partner_routes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  partner_id uuid not null references public.users (id) on delete cascade,
  status text not null default 'assigned' check (status in ('assigned', 'contacted', 'closed')),
  notes text,
  routed_at timestamptz not null default now()
);
comment on table public.partner_routes is 'Assigns a lead to a partner user for follow-up. A partner may only ever see leads that have a row here naming them.';
create index partner_routes_lead_id_idx on public.partner_routes (lead_id);
create index partner_routes_partner_id_idx on public.partner_routes (partner_id);

create table public.contract_packets (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  status text not null default 'draft' check (status in ('draft', 'prepared', 'sent', 'signed', 'under_contract')),
  template_id text,
  envelope_id text,
  executed_doc_path text,
  created_at timestamptz not null default now()
);
comment on table public.contract_packets is 'Tracks a contract document through preparation and e-signature to execution for a given lead.';
create index contract_packets_lead_id_idx on public.contract_packets (lead_id);

-- Single seeded tenant: this product is currently single-org in practice.
-- Set DEFAULT_ORG_ID in the app's environment to this row's id.
insert into public.organizations (id, name) values
  ('566254e3-df08-4fd2-928a-52ed05b14d77', 'Default Organization');
