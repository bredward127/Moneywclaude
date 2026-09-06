"use server";

import { redirect } from "next/navigation";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { getSupabaseServerSessionClient } from "@/lib/supabase/server-session";
import { getDefaultOrgId } from "@/lib/org";

export async function isSetupNeeded(): Promise<boolean> {
  try {
    const supabase = getSupabaseServiceClient();
    const { count, error } = await supabase.from("users").select("id", { count: "exact", head: true });
    if (error) {
      // Fail toward showing the setup form, not hiding it: bootstrapFirstAdmin
      // re-checks this same condition itself before creating anything, so a
      // false positive here is safe, while a false negative would lock a
      // fresh deployment out of ever creating its first admin account.
      console.error("[auth] failed to check setup state", error);
      return true;
    }
    return !count || count === 0;
  } catch (err) {
    console.error("[auth] isSetupNeeded threw", err);
    return true;
  }
}

/**
 * One-time bootstrap for the very first account -- under the agency/team
 * model, that's the platform owner, not just an "admin". Deliberately has no
 * auth guard of its own -- its safety comes entirely from the zero-users
 * check below, which makes it permanently inert the moment any staff
 * account exists. The password never passes through anything but the
 * caller's own browser and Supabase Auth.
 */
export async function bootstrapFirstAdmin({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!email.trim() || password.length < 8) {
    return { ok: false, error: "Enter an email and a password of at least 8 characters." };
  }

  try {
    const supabase = getSupabaseServiceClient();

    const { count, error: countError } = await supabase
      .from("users")
      .select("id", { count: "exact", head: true });
    if (countError) {
      console.error("[auth] failed to check existing staff count", countError);
      return { ok: false, error: "Could not verify setup state. Please try again." };
    }
    if (count && count > 0) {
      return { ok: false, error: "Setup has already been completed." };
    }

    const { data: created, error: createError } = await supabase.auth.admin.createUser({
      email: email.trim(),
      password,
      email_confirm: true,
    });
    if (createError || !created.user) {
      console.error("[auth] failed to create first admin auth user", createError);
      return { ok: false, error: createError?.message ?? "Could not create the account." };
    }

    const { error: insertError } = await supabase.from("users").insert({
      id: created.user.id,
      org_id: getDefaultOrgId(),
      email: email.trim(),
      role: "admin",
      is_platform_owner: true,
      is_agency_admin: true,
      password_set_at: new Date().toISOString(),
    });
    if (insertError) {
      console.error("[auth] failed to provision first admin profile", insertError);
      await supabase.auth.admin.deleteUser(created.user.id);
      return { ok: false, error: "Could not finish setting up the account. Please try again." };
    }

    return { ok: true };
  } catch (err) {
    console.error("[auth] bootstrapFirstAdmin threw", err);
    return { ok: false, error: "Could not verify setup state. Please try again." };
  }
}

export async function signOut() {
  const supabase = await getSupabaseServerSessionClient();
  await supabase.auth.signOut();
  redirect("/dashboard/login");
}
