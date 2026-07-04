"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";

export async function loginAction(state: unknown, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  // 1. Authenticate with Supabase Auth
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  const user = data.user;
  if (!user) {
    return { error: "Authentication failed. No user returned." };
  }

  // 2. Validate email matches ADMIN_ALLOWED_EMAIL
  const allowedEmail = process.env.ADMIN_ALLOWED_EMAIL;
  if (allowedEmail && user.email?.toLowerCase() !== allowedEmail.toLowerCase()) {
    await supabase.auth.signOut();
    return { error: "Access denied: Unauthorized email address." };
  }

  // 3. Query admin_profile using admin client (service role) to bypass RLS
  try {
    const adminDb = createSupabaseAdminClient();
    const { data: profile, error: profileError } = await adminDb
      .from("admin_profile")
      .select("id")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error("Database error while checking admin profile:", profileError);
      await supabase.auth.signOut();
      return { error: "Database verification error occurred." };
    }

    if (!profile) {
      await supabase.auth.signOut();
      return {
        error: "Admin profile not found. Please run the admin setup script to link your account.",
      };
    }

    // Update last login timestamp
    await adminDb
      .from("admin_profile")
      .update({ last_login_at: new Date().toISOString() })
      .eq("auth_user_id", user.id);

  } catch (err) {
    console.error("Admin verification exception:", err);
    await supabase.auth.signOut();
    return { error: "Internal server error during verification." };
  }

  redirect("/admin");
}

export async function logoutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/auth/login");
}
