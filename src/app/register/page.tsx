"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/store/auth";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
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
      const res = await api<{ token: string; user: any }>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, username, password }),
        auth: false,
      });
      setSession(res.token, res.user);
      router.push("/pre-test");
    } catch (e: any) {
      setErr(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md mt-6 md:mt-12">
      <div className="text-center mb-6">
        <div className="text-5xl mb-2">🚀</div>
        <h1 className="text-3xl font-display font-black">Join the quest</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Create a student account to start playing.
        </p>
      </div>

      <div className="card">
        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Email
            </label>
            <input
              className="input mt-1.5"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Username
            </label>
            <input
              className="input mt-1.5"
              required
              minLength={3}
              maxLength={20}
              pattern="[A-Za-z0-9_]+"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="letters, numbers, underscore"
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
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="at least 6 characters"
            />
          </div>
          {err && (
            <div className="rounded-xl border border-[var(--coral)] bg-[var(--coral-soft)] px-3 py-2 text-sm font-semibold text-[var(--coral-dark)]">
              {err}
            </div>
          )}
          <button className="btn-primary w-full !py-3" disabled={loading}>
            {loading ? "Creating…" : "Create account"}
          </button>
        </form>
      </div>

      <p className="mt-5 text-center text-sm text-[var(--text-muted)]">
        Already have an account?{" "}
        <Link
          className="font-bold text-[var(--mint-dark)] hover:underline"
          href="/login"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
