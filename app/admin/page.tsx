import { createSupabaseServerClient } from "@/lib/supabase/server";
import { logoutAction } from "../auth/actions";
import { LogOut, ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const supabase = createSupabaseServerClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/login");
  }

  // Fetch display name from admin_profile
  const { data: profile } = await supabase
    .from("admin_profile")
    .select("display_name")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  const displayName = profile?.display_name || user.email?.split("@")[0] || "Saumya";

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#050608] bento-bg-grid px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden select-none">
      {/* Background radial gradient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-md w-full space-y-8 relative z-10 text-center">
        <div className="bg-[#08090b]/80 border border-white/5 backdrop-blur-xl p-10 rounded-[32px] shadow-2xl space-y-6">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-8 h-8 animate-pulse" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Authentication Successful
            </h1>
            <p className="text-slate-400 text-sm">
              Welcome, <span className="font-semibold text-white">{displayName}</span>
            </p>
          </div>

          <div className="pt-4 border-t border-white/5">
            <form action={logoutAction}>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-white/5 hover:border-white/10 rounded-xl text-sm font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 focus:outline-none transition-all duration-200"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
