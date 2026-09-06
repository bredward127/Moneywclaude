import "server-only";
import { getSupabaseServerSessionClient } from "@/lib/supabase/server-session";

/**
 * Confirms the current dashboard session may see a given lead, by making an
 * RLS-scoped read through the caller's own session (leads_staff_select /
 * leads_partner_select). Use this to gate service-role-only operations that
 * RLS itself can't cover directly, such as generating a storage signed URL.
 */
export async function assertLeadAccessible(leadId: string): Promise<boolean> {
  const supabase = await getSupabaseServerSessionClient();
  const { data } = await supabase.from("leads").select("id").eq("id", leadId).maybeSingle();
  return Boolean(data);
}
