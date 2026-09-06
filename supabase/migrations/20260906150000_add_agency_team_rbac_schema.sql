-- Adds the agency/team access-control layer: platform-owner and
-- agency-admin flags, per-user field-edit dials, a mandatory-password-set
-- marker for the new onboarding flow, and the teams/team_members/
-- team_customers/lead_notes tables. Purely additive: no existing policy is
-- touched here (see the follow-up RLS-cutover migration), and the new
-- tables get RLS enabled with zero policies (default-deny), so this ships
-- with zero behavior change for anything that exists today.

alter table public.users
  add column is_platform_owner boolean not null default false,
  add column is_agency_admin boolean not null default false,
  add column can_edit_property_details boolean not null default false,
  add column can_edit_financial_details boolean not null default false,
  add column can_edit_contact_info boolean not null default false,
  add column password_set_at timestamptz;

comment on column public.users.is_platform_owner is 'The one operator of the whole platform, above every agency. Ungrantable except by hand -- see enforce_admin_grant_restriction below.';
comment on column public.users.is_agency_admin is 'Can manage other users/teams within their own org. Grantable only by the platform owner, enforced by enforce_admin_grant_restriction below.';
comment on column public.users.password_set_at is 'Null until the mandatory onboarding password-set step completes. Existing accounts are backfilled to created_at since they already have a working password and only need to go through MFA enrollment, not a fresh password.';

-- Existing admins keep equivalent standing under the new model; nobody
-- loses access as of this migration.
update public.users set is_agency_admin = true where role = 'admin';
update public.users set password_set_at = created_at where password_set_at is null;

create table public.teams (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  created_by uuid references public.users (id) on delete set null
);
comment on table public.teams is 'A scoped subset of one agency''s users and customers, created by that agency''s admin.';
create index teams_org_id_idx on public.teams (org_id);

create table public.team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (team_id, user_id)
);
comment on table public.team_members is 'Which agency users belong to which teams. Many-to-many: a user may be on several teams at once.';
create index team_members_team_id_idx on public.team_members (team_id);
create index team_members_user_id_idx on public.team_members (user_id);

create table public.team_customers (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  lead_id uuid not null references public.leads (id) on delete cascade,
  assigned_at timestamptz not null default now(),
  assigned_by uuid references public.users (id) on delete set null,
  unique (lead_id)
);
comment on table public.team_customers is 'Which team a customer is assigned to, if any. unique(lead_id) enforces at most one team per customer -- reassignment is an upsert on that key.';
create index team_customers_team_id_idx on public.team_customers (team_id);

create table public.lead_notes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  author_id uuid references public.users (id) on delete set null,
  author_email text not null,
  body text not null,
  created_at timestamptz not null default now()
);
comment on table public.lead_notes is 'Freeform notes on a customer, postable by anyone who can see it regardless of edit rights. Append-only, like consent_records -- author_email is a denormalized snapshot so a note stays attributable after its author is removed.';
create index lead_notes_lead_id_idx on public.lead_notes (lead_id);

alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.team_customers enable row level security;
alter table public.lead_notes enable row level security;

-- Helper functions, `private` schema -- same pattern as the existing
-- private.current_staff_org_id()/current_staff_role(): unreachable via
-- PostgREST's RPC surface, usable inside RLS policy expressions.

create or replace function private.is_platform_owner()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce((select is_platform_owner from public.users where id = auth.uid()), false)
$$;

create or replace function private.is_agency_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce((select is_agency_admin from public.users where id = auth.uid()), false)
$$;

create or replace function private.can_access_lead(p_lead_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select case
    when private.current_staff_role() = 'partner' then false
    when private.is_platform_owner() then true
    else exists (
      select 1
      from public.leads l
      where l.id = p_lead_id
        and l.org_id = private.current_staff_org_id()
        and (
          private.is_agency_admin()
          or exists (
            select 1
            from public.team_customers tc
            join public.team_members tm on tm.team_id = tc.team_id
            where tc.lead_id = p_lead_id and tm.user_id = auth.uid()
          )
          or (
            not exists (select 1 from public.team_members where user_id = auth.uid())
            and not exists (select 1 from public.team_customers where lead_id = p_lead_id)
          )
        )
    )
  end
$$;

comment on function private.can_access_lead(uuid) is 'True if the current session may see this lead: the platform owner always; a partner never (routed access is handled entirely by the separate, untouched partner_routes policies); otherwise only same-org staff, and only when they are an agency admin, on the lead''s assigned team, or (lead unassigned AND caller is on no team at all).';

grant execute on function private.is_platform_owner() to anon, authenticated;
grant execute on function private.is_agency_admin() to anon, authenticated;
grant execute on function private.can_access_lead(uuid) to anon, authenticated;

-- Only the platform owner may grant/revoke admin/owner status. RLS can only
-- restrict which *rows* an UPDATE touches, not individual *columns* within
-- an allowed row, so this trigger is the actual backstop -- the
-- corresponding server action checks the same rule first, purely for a
-- clean error message instead of a raw DB exception.
create or replace function private.enforce_admin_grant_restriction()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if (new.is_agency_admin is distinct from old.is_agency_admin
      or new.is_platform_owner is distinct from old.is_platform_owner)
     and not private.is_platform_owner() then
    raise exception 'Only the platform owner can change admin/owner status.';
  end if;
  return new;
end;
$$;

create trigger enforce_admin_grant_restriction
  before update on public.users
  for each row
  execute function private.enforce_admin_grant_restriction();
