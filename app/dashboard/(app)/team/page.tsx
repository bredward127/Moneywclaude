import { redirect } from "next/navigation";
import { getCurrentStaffProfile } from "@/lib/dashboard/auth";
import { getSupabaseServerSessionClient } from "@/lib/supabase/server-session";
import { InviteTeamMemberForm } from "./InviteTeamMemberForm";

export const metadata = { title: "Team | Dashboard" };

export default async function TeamPage() {
  const profile = await getCurrentStaffProfile();
  if (!profile) redirect("/dashboard/login");
  if (profile.role !== "admin") {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
        Only admins can manage the team.
      </div>
    );
  }

  const supabase = await getSupabaseServerSessionClient();
  const { data: teammates } = await supabase
    .from("users")
    .select("id, email, role, created_at")
    .order("created_at", { ascending: true });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Team</h1>
        <p className="mt-1 text-sm text-slate-600">
          Add the staff and partner accounts who need dashboard access.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-slate-900">Add teammate</h2>
          <div className="mt-4">
            <InviteTeamMemberForm />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-slate-900">Current team</h2>
          <ul className="mt-4 divide-y divide-slate-100">
            {(teammates ?? []).map((member) => (
              <li key={member.id as string} className="flex items-center justify-between gap-4 py-3">
                <span className="text-sm text-slate-700">{member.email as string}</span>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 capitalize">
                  {member.role as string}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
