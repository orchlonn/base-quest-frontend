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
    <div className="mx-auto max-w-md mt-10">
      <div className="glass p-7">
        <h1 className="text-2xl font-display font-bold">Welcome back</h1>
        <p className="text-sm opacity-75">Sign in to continue your quest.</p>
        <form className="mt-6 space-y-3" onSubmit={onSubmit}>
          <div>
            <label className="text-sm opacity-80">Email or username</label>
            <input
              className="input mt-1"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm opacity-80">Password</label>
            <input
              className="input mt-1"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {err && <p className="text-sm text-rose-300">{err}</p>}
          <button className="neon-btn w-full" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="mt-4 text-sm opacity-75">
          New to BaseQuest?{" "}
          <Link className="underline text-cyan-300" href="/register">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
