"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/store/auth";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const setSession = useAuth((s) => s.setSession);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await api<{ token: string; user: any }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ identifier, password }),
        auth: false,
      });
      setSession(res.token, res.user);
      router.push("/dashboard");
    } catch (e: any) {
      setErr(e.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md mt-6 md:mt-12">
      <div className="text-center mb-6">
        <div className="text-5xl mb-2">👋</div>
        <h1 className="text-3xl font-display font-black">Welcome back</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Sign in to continue your quest.
        </p>
      </div>

      <div className="card">
        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Email or username
            </label>
            <input
              className="input mt-1.5"
              required
              autoFocus
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Password
            </label>
            <input
              className="input mt-1.5"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {err && (
            <div className="rounded-xl border border-[var(--coral)] bg-[var(--coral-soft)] px-3 py-2 text-sm font-semibold text-[var(--coral-dark)]">
              {err}
            </div>
          )}
          <button className="btn-primary w-full !py-3" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>

      <p className="mt-5 text-center text-sm text-[var(--text-muted)]">
        New to BaseQuest?{" "}
        <Link
          className="font-bold text-[var(--mint-dark)] hover:underline"
          href="/register"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
