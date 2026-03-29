import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { registerRequest } from "@/lib/api";

function formatRegisterErrors(data: unknown): string {
  if (!data || typeof data !== "object") return "Registration failed";
  const parts: string[] = [];
  for (const [, v] of Object.entries(data)) {
    if (Array.isArray(v)) parts.push(...v.map(String));
    else if (v) parts.push(String(v));
  }
  return parts.length ? parts.join(" ") : "Registration failed";
}

export function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await registerRequest(name.trim(), email.trim(), password);
      navigate("/login", { replace: true });
    } catch (err) {
      const e = err as Error & { data?: unknown };
      if (e.data) setError(formatRegisterErrors(e.data));
      else setError(e.message ?? "Registration failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 py-10">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Create account</h1>
        <p className="mt-2 text-slate-600">Join as a buyer</p>
      </div>
      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        {error ? (
          <p
            className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800"
            role="alert"
          >
            {error}
          </p>
        ) : null}
        <Input
          label="Name"
          name="name"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label="Password (min 8 characters)"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button
          type="submit"
          variant="primary"
          className="min-h-12 w-full text-base"
          disabled={busy}
        >
          {busy ? "Creating…" : "Register"}
        </Button>
        <p className="text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-teal-700 underline-offset-2 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
