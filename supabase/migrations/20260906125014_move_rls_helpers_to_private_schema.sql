-- The advisor flags current_staff_org_id()/current_staff_role() as
-- callable directly via PostgREST's public RPC surface
-- (/rest/v1/rpc/current_staff_org_id) since they live in `public`, which is
-- an exposed schema. They're only meant to be used inside RLS policy
-- expressions, not called directly. Fix: move them into a `private` schema
-- that is never in PostgREST's exposed-schemas list, so they become
-- unreachable via the REST/RPC API while remaining callable from within
-- policy expressions evaluated on public.* tables (which still requires
-- EXECUTE on them for the querying role -- that grant is kept).

create schema if not exists private;
grant usage on schema private to anon, authenticated;

create or replace function private.current_staff_org_id()
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select org_id from public.users where id = auth.uid()
$$;

create or replace function private.current_staff_role()
returns text
language sql
security definer
stable
set search_path = public
as $$
  select role from public.users where id = auth.uid()
$$;

grant execute on function private.current_staff_org_id() to anon, authenticated;
grant execute on function private.current_staff_role() to anon, authenticated;

alter policy organizations_select_own on public.organizations
  using (id = private.current_staff_org_id());

alter policy users_select_org_staff on public.users
  using (
    org_id = private.current_staff_org_id()
    and private.current_staff_role() <> 'partner'
  );

alter policy leads_staff_select on public.leads
  using (
    org_id = private.current_staff_org_id()
    and private.current_staff_role() <> 'partner'
  );
alter policy leads_staff_update on public.leads
  using (
    org_id = private.current_staff_org_id()
    and private.current_staff_role() <> 'partner'
  );

alter policy consent_records_staff_select on public.consent_records
  using (
    exists (
      select 1 from public.leads l
      where l.id = consent_records.lead_id
        and l.org_id = private.current_staff_org_id()
        and private.current_staff_role() <> 'partner'
    )
  );

alter policy lead_media_staff_select on public.lead_media
  using (
    exists (
      select 1 from public.leads l
      where l.id = lead_media.lead_id
        and l.org_id = private.current_staff_org_id()
        and private.current_staff_role() <> 'partner'
    )
  );

alter policy partner_routes_staff_all on public.partner_routes
  using (
    exists (
      select 1 from public.leads l
      where l.id = partner_routes.lead_id
        and l.org_id = private.current_staff_org_id()
        and private.current_staff_role() <> 'partner'
    )
  )
  with check (
    exists (
      select 1 from public.leads l
      where l.id = partner_routes.lead_id
        and l.org_id = private.current_staff_org_id()
        and private.current_staff_role() <> 'partner'
    )
  );

alter policy contract_packets_staff_all on public.contract_packets
  using (
    exists (
      select 1 from public.leads l
      where l.id = contract_packets.lead_id
        and l.org_id = private.current_staff_org_id()
        and private.current_staff_role() <> 'partner'
    )
  )
  with check (
    exists (
      select 1 from public.leads l
      where l.id = contract_packets.lead_id
        and l.org_id = private.current_staff_org_id()
        and private.current_staff_role() <> 'partner'
    )
  );

drop function public.current_staff_org_id();
drop function public.current_staff_role();
