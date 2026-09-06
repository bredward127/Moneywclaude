-- Cuts staff-facing RLS over from the old blanket "any non-partner staff in
-- my org" rule to private.can_access_lead(), which additionally accounts
-- for team assignment. Since no teams exist yet at the moment this ships,
-- every existing user still falls into the "on zero teams, lead assigned to
-- zero teams" branch of can_access_lead() -- behavior is identical to today
-- until teams are actually created and used.
--
-- Also fixes a gap in the previous migration's enforce_admin_grant_restriction
-- trigger: it must not block the service-role client from changing
-- is_agency_admin/is_platform_owner, since every users-table write in this
-- codebase goes through the service-role client with an app-level check
-- (see agency-users.ts) rather than the session-scoped client -- there is no
-- RLS UPDATE policy on users for the session-scoped client to use in the
-- first place. auth.uid() is null for service-role requests (no end-user is
-- being impersonated), so the fix is to only enforce this rule when a real
-- session (auth.uid() is not null) is what's attempting the change.

create or replace function private.enforce_admin_grant_restriction()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if (new.is_agency_admin is distinct from old.is_agency_admin
      or new.is_platform_owner is distinct from old.is_platform_owner)
     and auth.uid() is not null
     and not private.is_platform_owner() then
    raise exception 'Only the platform owner can change admin/owner status.';
  end if;
  return new;
end;
$$;

alter policy leads_staff_select on public.leads
  using (private.can_access_lead(id));

alter policy leads_staff_update on public.leads
  using (private.can_access_lead(id));

alter policy lead_media_staff_select on public.lead_media
  using (private.can_access_lead(lead_media.lead_id));

alter policy consent_records_staff_select on public.consent_records
  using (private.can_access_lead(consent_records.lead_id));

alter policy contract_packets_staff_all on public.contract_packets
  using (private.can_access_lead(contract_packets.lead_id))
  with check (private.can_access_lead(contract_packets.lead_id));

-- teams: names are low-sensitivity, so any staff in the org (partners
-- included -- they're never shown this UI, but there's nothing to hide)
-- can read them; only an agency admin (own org) or the platform owner can
-- create/rename/delete.
create policy teams_select_org on public.teams
  for select using (
    private.is_platform_owner()
    or org_id = private.current_staff_org_id()
  );

create policy teams_admin_all on public.teams
  for all using (
    private.is_platform_owner()
    or (private.is_agency_admin() and org_id = private.current_staff_org_id())
  ) with check (
    private.is_platform_owner()
    or (private.is_agency_admin() and org_id = private.current_staff_org_id())
  );

-- team_members: same openness as teams, joined through team_id -> org_id.
create policy team_members_select_org on public.team_members
  for select using (
    private.is_platform_owner()
    or exists (
      select 1 from public.teams t
      where t.id = team_members.team_id and t.org_id = private.current_staff_org_id()
    )
  );

create policy team_members_admin_all on public.team_members
  for all using (
    private.is_platform_owner()
    or exists (
      select 1 from public.teams t
      where t.id = team_members.team_id
        and t.org_id = private.current_staff_org_id()
        and private.is_agency_admin()
    )
  ) with check (
    private.is_platform_owner()
    or exists (
      select 1 from public.teams t
      where t.id = team_members.team_id
        and t.org_id = private.current_staff_org_id()
        and private.is_agency_admin()
    )
  );

-- team_customers: unlike teams/team_members, this is customer data, so
-- visibility is narrower -- an org's admins/owner, plus that specific
-- team's own members (not every staff member org-wide). Writes additionally
-- require the target lead to actually belong to the same org as the team,
-- guarding against assigning a customer across agency boundaries.
create policy team_customers_select on public.team_customers
  for select using (
    private.is_platform_owner()
    or exists (
      select 1 from public.teams t
      where t.id = team_customers.team_id
        and t.org_id = private.current_staff_org_id()
        and private.is_agency_admin()
    )
    or exists (
      select 1 from public.team_members tm
      where tm.team_id = team_customers.team_id and tm.user_id = auth.uid()
    )
  );

create policy team_customers_admin_all on public.team_customers
  for all using (
    private.is_platform_owner()
    or exists (
      select 1 from public.teams t
      where t.id = team_customers.team_id
        and t.org_id = private.current_staff_org_id()
        and private.is_agency_admin()
    )
  ) with check (
    (
      private.is_platform_owner()
      or exists (
        select 1 from public.teams t
        where t.id = team_customers.team_id
          and t.org_id = private.current_staff_org_id()
          and private.is_agency_admin()
      )
    )
    and exists (
      select 1 from public.teams t
      join public.leads l on l.org_id = t.org_id
      where t.id = team_customers.team_id and l.id = team_customers.lead_id
    )
  );

-- lead_notes: anyone who can see the lead can read and post notes on it,
-- regardless of their edit permissions. Append-only -- no update/delete
-- policy, same as consent_records.
create policy lead_notes_select on public.lead_notes
  for select using (private.can_access_lead(lead_id));

create policy lead_notes_insert on public.lead_notes
  for insert with check (private.can_access_lead(lead_id) and author_id = auth.uid());
