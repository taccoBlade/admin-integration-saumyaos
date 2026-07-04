"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { loginAction } from "../actions";
import { useSearchParams } from "next/navigation";
import { Lock, Mail, ShieldAlert } from "lucide-react";
import { Suspense } from "react";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-sm font-semibold text-black bg-[var(--accent-blue)] hover:bg-[var(--accent-blue)]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent-blue)] disabled:opacity-55 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-cyan-500/10"
    >
      {pending ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-5 w-5 text-black" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Authenticating...
        </span>
      ) : (
        "Sign In"
      )}
    </button>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");

  const [state, formAction] = useActionState(loginAction, null);

  // Determine if there is an active error to show
  let displayError = state?.error || null;
  if (!displayError && errorParam === "unauthorized") {
    displayError = "Access denied: Your email is not authorized to access this administration area.";
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#050608] bento-bg-grid px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden select-none">
      {/* Background radial gradient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[var(--accent-purple)]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-md w-full space-y-8 relative z-10">
        <div>
          <div className="mx-auto h-12 w-12 rounded-2xl bg-gradient-to-tr from-[var(--accent-purple)] to-[var(--accent-blue)] p-[1px] flex items-center justify-center shadow-lg shadow-purple-500/10">
            <div className="h-full w-full bg-[#08090b] rounded-2xl flex items-center justify-center text-[var(--accent-blue)]">
              <Lock className="w-5 h-5" />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-white">
            SAUMYA.OS
          </h2>
          <p className="mt-2 text-center text-xs font-mono uppercase tracking-widest text-[var(--muted)]">
            Restricted Admin Workspace
          </p>
        </div>

        <div className="bg-[#08090b]/80 border border-white/5 backdrop-blur-xl p-8 rounded-[28px] shadow-2xl space-y-6">
          {displayError && (
            <div className="p-4 bg-red-950/30 border border-red-500/20 rounded-2xl flex items-start gap-3 text-sm text-red-400">
              <ShieldAlert className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
              <div>
                <p className="font-semibold">Authorization Failure</p>
                <p className="mt-1 text-xs text-red-400/80 leading-relaxed">{displayError}</p>
              </div>
            </div>
          )}

          <form action={formAction} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-xs font-mono uppercase tracking-wider text-[var(--muted)] mb-2">
                  Admin Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="h-4.5 w-4.5" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    className="block w-full pl-11 pr-4 py-3 bg-[#0c0d12] border border-white/5 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[var(--accent-blue)]/50 focus:ring-1 focus:ring-[var(--accent-blue)]/50 transition-all duration-200"
                    placeholder="Enter email address"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-mono uppercase tracking-wider text-[var(--muted)] mb-2">
                  Security Phrase / Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="h-4.5 w-4.5" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    className="block w-full pl-11 pr-4 py-3 bg-[#0c0d12] border border-white/5 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[var(--accent-blue)]/50 focus:ring-1 focus:ring-[var(--accent-blue)]/50 transition-all duration-200"
                    placeholder="Enter security key"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <SubmitButton />
            </div>
          </form>
        </div>

        <div className="text-center">
          <p className="text-[10px] font-mono text-[var(--muted)]">
            Unauthorized activity is monitored and logged.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full flex items-center justify-center bg-[#050608] px-4 py-12 text-white font-mono text-xs uppercase tracking-widest">
        Loading Authentication Interface...
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
