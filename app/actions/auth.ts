"use server";

import { redirect } from "next/navigation";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { getSupabaseServerSessionClient } from "@/lib/supabase/server-session";
import { getCurrentStaffProfile } from "@/lib/dashboard/auth";
import { getDefaultOrgId } from "@/lib/org";

export async function isSetupNeeded(): Promise<boolean> {
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
}

/**
 * One-time bootstrap for the very first dashboard admin. Deliberately has no
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
  });
  if (insertError) {
    console.error("[auth] failed to provision first admin profile", insertError);
    await supabase.auth.admin.deleteUser(created.user.id);
    return { ok: false, error: "Could not finish setting up the account. Please try again." };
  }

  return { ok: true };
}

export async function inviteTeamMember({
  email,
  password,
  role,
}: {
  email: string;
  password: string;
  role: "admin" | "reviewer" | "acquisitions" | "partner";
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const me = await getCurrentStaffProfile();
  if (!me || me.role !== "admin") {
    return { ok: false, error: "Only admins can add teammates." };
  }
  if (!email.trim() || password.length < 8) {
    return { ok: false, error: "Enter an email and a password of at least 8 characters." };
  }

  const supabase = getSupabaseServiceClient();

  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email: email.trim(),
    password,
    email_confirm: true,
  });
  if (createError || !created.user) {
    console.error("[auth] failed to create teammate auth user", createError);
    return { ok: false, error: createError?.message ?? "Could not create the account." };
  }

  const { error: insertError } = await supabase.from("users").insert({
    id: created.user.id,
    org_id: me.orgId,
    email: email.trim(),
    role,
  });
  if (insertError) {
    console.error("[auth] failed to provision teammate profile", insertError);
    await supabase.auth.admin.deleteUser(created.user.id);
    return { ok: false, error: "Could not finish adding this teammate. Please try again." };
  }

  return { ok: true };
}

export async function signOut() {
  const supabase = await getSupabaseServerSessionClient();
  await supabase.auth.signOut();
  redirect("/dashboard/login");
}
