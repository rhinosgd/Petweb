"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password");
      return;
    }
    router.push(params.get("callbackUrl") || "/admin");
  }

  return (
    <form onSubmit={onSubmit} className="card w-full max-w-sm">
      <h1 className="mb-1 font-serif text-2xl">Admin Sign In</h1>
      <p className="mb-6 text-sm text-ink/78">Paw &amp; Craft Admin</p>
      {error && <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}
      <label className="label">Email</label>
      <input className="input mb-4" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <label className="label">Password</label>
      <input className="input mb-6" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      <button className="btn-primary w-full" disabled={loading}>
        {loading ? "Signing in…" : "Sign In"}
      </button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-6">
      <Suspense fallback={<div className="text-sm text-ink/70">Loading…</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
