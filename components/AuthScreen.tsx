import React, { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";

type Mode = "sign-in" | "sign-up" | "reset" | "update-password";

export const AuthScreen: React.FC<{ recoveryMode?: boolean }> = ({ recoveryMode = false }) => {
  const [mode, setMode] = useState<Mode>(recoveryMode ? "update-password" : "sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (recoveryMode) setMode("update-password");
  }, [recoveryMode]);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      if (mode === "sign-up") {
        const { data, error: authError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (authError) throw authError;
        setNotice(data.session
          ? "Your Forge account is ready."
          : "Check your email to confirm your account, then sign in.");
      } else if (mode === "sign-in") {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (authError) throw authError;
      } else if (mode === "reset") {
        const { error: authError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: window.location.origin,
        });
        if (authError) throw authError;
        setNotice("If an account exists for this email, password reset instructions will arrive shortly.");
      } else {
        const { error: authError } = await supabase.auth.updateUser({ password });
        if (authError) throw authError;
        setNotice("Password updated. Sign in again with your new password.");
        setPassword("");
        await supabase.auth.signOut();
      }
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Authentication failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const title = mode === "sign-up" ? "Create your Forge account"
    : mode === "reset" ? "Reset your password"
    : mode === "update-password" ? "Choose a new password" : "Welcome back";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-5 py-12 text-gray-100">
      <section className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111] p-7 shadow-2xl shadow-black/30">
        <div className="mb-8">
          <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/15 text-xl font-black text-orange-400">F</div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-orange-400">Forge · Private workspace</p>
          <h1 className="mt-3 text-2xl font-bold text-white">{title}</h1>
          <p className="mt-2 text-sm leading-relaxed text-gray-400">
            {mode === "reset" ? "Enter your account email to receive a secure recovery link."
              : mode === "update-password" ? "Set a new password for your Forge account."
              : "Sign in to access your private AI workspace, conversations, and saved memory."}
          </p>
        </div>

        {!supabase ? (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-200">
            Authentication is not configured yet. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in the frontend environment, then redeploy.
          </div>
        ) : (
          <form onSubmit={(event) => void submit(event)} className="space-y-4">
            {mode !== "update-password" && (
              <div>
                <label htmlFor="forge-auth-email" className="mb-2 block text-xs font-medium text-gray-300">Email address</label>
                <input id="forge-auth-email" type="email" autoComplete="email" required maxLength={254}
                  value={email} onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-3 text-sm text-white placeholder:text-gray-600 focus:border-orange-500"
                  placeholder="you@example.com" />
              </div>
            )}
            {mode !== "reset" && (
              <div>
                <label htmlFor="forge-auth-password" className="mb-2 block text-xs font-medium text-gray-300">Password</label>
                <input id="forge-auth-password" type="password" autoComplete={mode === "sign-up" || mode === "update-password" ? "new-password" : "current-password"}
                  required minLength={8} maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-3 text-sm text-white placeholder:text-gray-600 focus:border-orange-500"
                  placeholder="At least 8 characters" />
              </div>
            )}
            {error && <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/5 p-3 text-xs text-red-300">{error}</p>}
            {notice && <p role="status" className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-xs text-emerald-200">{notice}</p>}
            <button type="submit" disabled={busy}
              className="w-full rounded-lg bg-orange-600 px-4 py-3 text-sm font-semibold text-white hover:bg-orange-500 disabled:cursor-wait disabled:opacity-50">
              {busy ? "Please wait…" : mode === "sign-up" ? "Create account" : mode === "reset" ? "Send recovery email" : mode === "update-password" ? "Update password" : "Sign in"}
            </button>
          </form>
        )}

        {supabase && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-400">
            {mode === "sign-in" ? (
              <>
                <button type="button" onClick={() => { setMode("sign-up"); setError(""); setNotice(""); }} className="hover:text-white">Create an account</button>
                <button type="button" onClick={() => { setMode("reset"); setError(""); setNotice(""); }} className="hover:text-white">Forgot password?</button>
              </>
            ) : mode === "update-password" ? null : (
              <button type="button" onClick={() => { setMode("sign-in"); setError(""); setNotice(""); }} className="hover:text-white">Back to sign in</button>
            )}
          </div>
        )}
        <p className="mt-8 border-t border-white/10 pt-5 text-[11px] leading-relaxed text-gray-600">
          Your workspace is stored in a browser database scoped to your signed-in account on this device. Account authentication does not yet enable cloud sync.
        </p>
      </section>
    </main>
  );
};
