-- The previous migration's plpgsql rewrite didn't fix the recursion --
-- confirmed by re-testing. The actual cause is narrower: team_customers_admin_all
-- has a *direct, raw* join to public.leads inside its own policy body (the
-- cross-agency guard). A raw table reference embedded directly in one
-- table's policy forces Postgres to substitute the referenced table's own
-- policy inline while rewriting the outer query -- and since leads'
-- policy calls can_access_lead(), which itself queries leads, that
-- produces a genuine cycle in the *rewritten query's* policy graph. This
-- is different from every other can_access_lead() consumer (leads_staff_select,
-- lead_notes_select, etc.), which only ever *call the function* -- a plain
-- function call is opaque to this rewrite step, so those are unaffected
-- (confirmed: can_access_lead() called as a bare function, or from a
-- policy with no raw leads reference of its own, works fine).
--
-- Fix: drop the raw leads join from the policy. The cross-agency guard
-- (a lead can only be assigned to a team in its own org) moves to the
-- application layer in assignCustomerToTeam (app/actions/teams.ts), via
-- two independent top-level queries instead of one embedded join --
-- functionally equivalent, without the self-reference.

drop policy if exists team_customers_admin_all on public.team_customers;

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
    private.is_platform_owner()
    or exists (
      select 1 from public.teams t
      where t.id = team_customers.team_id
        and t.org_id = private.current_staff_org_id()
        and private.is_agency_admin()
    )
  );
