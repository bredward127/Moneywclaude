-- Fixes "infinite recursion detected in policy for relation leads", hit
-- when inserting into team_customers: team_customers_admin_all's with-check
-- directly (not through a function) joins to leads for the cross-agency
-- guard, which evaluates leads_staff_select, which calls
-- can_access_lead(). can_access_lead() was a simple `language sql`
-- function -- Postgres's planner can inline simple SQL functions for
-- optimization, and once inlined, its own reference to `leads` gets folded
-- into the *same* query's row-security expansion as the outer
-- team_customers policy, which the planner then sees as `leads`
-- referencing its own policy again -- a real self-reference in the
-- expanded plan, not just in theory. SECURITY DEFINER's "runs as owner,
-- bypasses that owner's RLS" protection only holds at an actual opaque
-- function-call boundary; inlining erases that boundary before it applies.
--
-- `language plpgsql` functions are never inlined by the planner, so
-- rewriting can_access_lead() (and, for the same class of risk,
-- is_platform_owner()/is_agency_admin()) in plpgsql keeps the call an
-- opaque, privilege-isolated boundary and eliminates the false-positive
-- cycle. Logic is unchanged from the original migration -- only the
-- language and control flow shape changed.

create or replace function private.is_platform_owner()
returns boolean
language plpgsql
security definer
stable
set search_path = public
as $$
begin
  return coalesce((select is_platform_owner from public.users where id = auth.uid()), false);
end;
$$;

create or replace function private.is_agency_admin()
returns boolean
language plpgsql
security definer
stable
set search_path = public
as $$
begin
  return coalesce((select is_agency_admin from public.users where id = auth.uid()), false);
end;
$$;

create or replace function private.can_access_lead(p_lead_id uuid)
returns boolean
language plpgsql
security definer
stable
set search_path = public
as $$
declare
  v_result boolean;
begin
  if private.current_staff_role() = 'partner' then
    return false;
  end if;

  if private.is_platform_owner() then
    return true;
  end if;

  select exists (
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
  ) into v_result;

  return v_result;
end;
$$;
