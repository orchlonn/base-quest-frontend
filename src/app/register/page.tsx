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
    <div className="mx-auto max-w-md mt-10">
      <div className="glass p-7">
        <h1 className="text-2xl font-display font-bold">Join BaseQuest</h1>
        <p className="text-sm opacity-75">Create a student account to start playing.</p>
        <form className="mt-6 space-y-3" onSubmit={onSubmit}>
          <div>
            <label className="text-sm opacity-80">Email</label>
            <input
              className="input mt-1"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm opacity-80">Username</label>
            <input
              className="input mt-1"
              required
              minLength={3}
              maxLength={20}
              pattern="[A-Za-z0-9_]+"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm opacity-80">Password</label>
            <input
              className="input mt-1"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {err && <p className="text-sm text-rose-300">{err}</p>}
          <button className="neon-btn w-full" disabled={loading}>
            {loading ? "Creating…" : "Create account"}
          </button>
        </form>
        <p className="mt-4 text-sm opacity-75">
          Already have an account?{" "}
          <Link className="underline text-cyan-300" href="/login">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
