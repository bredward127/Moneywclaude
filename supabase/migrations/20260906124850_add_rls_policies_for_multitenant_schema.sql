-- Helper functions + RLS policies implementing:
--  - public (anon): zero read/write access to any of these tables. All
--    public writes happen exclusively through server-side, Zod-validated
--    code using the service role key (which bypasses RLS entirely) -- there
--    is deliberately no anon INSERT policy on leads/consent_records, since
--    an RLS insert policy would let a client bypass server-side validation
--    entirely by writing to PostgREST directly.
--  - authenticated staff (users.role <> 'partner'): full read of their
--    organization's leads/media/consent records, and manage routing +
--    contract packets for those leads.
--  - authenticated partners (users.role = 'partner'): read-only, and only
--    for leads that have an explicit partner_routes row naming them (plus
--    updating the status/notes on their own routed rows).
--
-- Note: the helper functions created here were later moved from `public` to
-- a `private` schema by the next migration (move_rls_helpers_to_private_schema)
-- after the security advisor flagged them as callable via PostgREST's public
-- RPC surface. Kept verbatim here for an accurate history; do not re-run
-- this migration's function definitions after that one without re-pointing
-- the policies too.

create or replace function public.current_staff_org_id()
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select org_id from public.users where id = auth.uid()
$$;

create or replace function public.current_staff_role()
returns text
language sql
security definer
stable
set search_path = public
as $$
  select role from public.users where id = auth.uid()
$$;

grant execute on function public.current_staff_org_id() to anon, authenticated;
grant execute on function public.current_staff_role() to anon, authenticated;

alter table public.organizations enable row level security;
alter table public.users enable row level security;
alter table public.leads enable row level security;
alter table public.lead_media enable row level security;
alter table public.consent_records enable row level security;
alter table public.partner_routes enable row level security;
alter table public.contract_packets enable row level security;

-- organizations: staff can see their own org row only.
create policy organizations_select_own on public.organizations
  for select using (id = public.current_staff_org_id());

-- users: everyone can see their own profile; non-partner staff can see
-- every profile in their organization (needed to assign partner routes).
create policy users_select_self on public.users
  for select using (id = auth.uid());
create policy users_select_org_staff on public.users
  for select using (
    org_id = public.current_staff_org_id()
    and public.current_staff_role() <> 'partner'
  );

-- leads: no anon/public policy at all. Non-partner staff see/update their
-- org's leads; partners see only leads explicitly routed to them.
create policy leads_staff_select on public.leads
  for select using (
    org_id = public.current_staff_org_id()
    and public.current_staff_role() <> 'partner'
  );
create policy leads_staff_update on public.leads
  for update using (
    org_id = public.current_staff_org_id()
    and public.current_staff_role() <> 'partner'
  );
create policy leads_partner_select on public.leads
  for select using (
    exists (
      select 1 from public.partner_routes pr
      where pr.lead_id = leads.id and pr.partner_id = auth.uid()
    )
  );

-- consent_records: write-once audit trail -- no insert/update/delete policy
-- for any client role. Non-partner staff can read.
create policy consent_records_staff_select on public.consent_records
  for select using (
    exists (
      select 1 from public.leads l
      where l.id = consent_records.lead_id
        and l.org_id = public.current_staff_org_id()
        and public.current_staff_role() <> 'partner'
    )
  );

-- lead_media: metadata only (actual bytes stay behind service-role-issued
-- signed URLs regardless of this policy). Staff see their org's photos;
-- partners see photos for leads routed to them.
create policy lead_media_staff_select on public.lead_media
  for select using (
    exists (
      select 1 from public.leads l
      where l.id = lead_media.lead_id
        and l.org_id = public.current_staff_org_id()
        and public.current_staff_role() <> 'partner'
    )
  );
create policy lead_media_partner_select on public.lead_media
  for select using (
    exists (
      select 1 from public.partner_routes pr
      where pr.lead_id = lead_media.lead_id and pr.partner_id = auth.uid()
    )
  );

-- partner_routes: staff manage routing for their org's leads. A partner may
-- see and update (status/notes only, via the with check) their own rows.
create policy partner_routes_staff_all on public.partner_routes
  for all using (
    exists (
      select 1 from public.leads l
      where l.id = partner_routes.lead_id
        and l.org_id = public.current_staff_org_id()
        and public.current_staff_role() <> 'partner'
    )
  ) with check (
    exists (
      select 1 from public.leads l
      where l.id = partner_routes.lead_id
        and l.org_id = public.current_staff_org_id()
        and public.current_staff_role() <> 'partner'
    )
  );
create policy partner_routes_partner_select on public.partner_routes
  for select using (partner_id = auth.uid());
create policy partner_routes_partner_update on public.partner_routes
  for update using (partner_id = auth.uid()) with check (partner_id = auth.uid());

-- contract_packets: staff manage the full lifecycle for their org's leads.
-- Partners get read-only visibility for leads routed to them.
create policy contract_packets_staff_all on public.contract_packets
  for all using (
    exists (
      select 1 from public.leads l
      where l.id = contract_packets.lead_id
        and l.org_id = public.current_staff_org_id()
        and public.current_staff_role() <> 'partner'
    )
  ) with check (
    exists (
      select 1 from public.leads l
      where l.id = contract_packets.lead_id
        and l.org_id = public.current_staff_org_id()
        and public.current_staff_role() <> 'partner'
    )
  );
create policy contract_packets_partner_select on public.contract_packets
  for select using (
    exists (
      select 1 from public.partner_routes pr
      where pr.lead_id = contract_packets.lead_id and pr.partner_id = auth.uid()
    )
  );
