import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { createProperty } from "@/lib/api";

function formatErrors(data: unknown): string {
  if (!data || typeof data !== "object") return "Something went wrong";
  const parts: string[] = [];
  for (const [, v] of Object.entries(data)) {
    if (Array.isArray(v)) parts.push(...v.map(String));
    else if (v) parts.push(String(v));
  }
  return parts.length ? parts.join(" ") : "Something went wrong";
}

export function SubmitPropertyPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setBusy(true);
    try {
      await createProperty({
        name: name.trim(),
        description: description.trim(),
        price: price.trim(),
        image: image.trim(),
      });
      setSuccess("Property listed successfully. It will appear in the catalog.");
      setName("");
      setDescription("");
      setPrice("");
      setImage("");
    } catch (err) {
      const e = err as Error & { data?: unknown };
      setError(e.data ? formatErrors(e.data) : e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link
            to="/dashboard"
            className="text-lg font-semibold tracking-tight text-teal-800"
          >
            Property Buyer
          </Link>
          <div className="flex flex-wrap gap-3 text-sm font-medium">
            <Link
              to="/dashboard"
              className="text-slate-600 underline-offset-2 hover:text-teal-800 hover:underline"
            >
              Dashboard
            </Link>
            <Link
              to="/submit-property"
              className="text-teal-800 underline-offset-2 hover:underline"
            >
              List a property
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">List a property</h1>
          <p className="mt-2 text-slate-600">
            Submit details and an image URL. No account required.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          {success ? (
            <p
              className="rounded-lg bg-teal-50 px-3 py-2 text-sm text-teal-900"
              role="status"
            >
              {success}
            </p>
          ) : null}
          {error ? (
            <p
              className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          <Input
            label="Property name"
            name="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="off"
          />

          <div className="w-full">
            <label
              htmlFor="description"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-11 w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-base text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
              placeholder="Describe the property…"
            />
          </div>

          <Input
            label="Price (USD)"
            name="price"
            type="text"
            inputMode="decimal"
            required
            placeholder="e.g. 450000.00"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />

          <Input
            label="Image URL"
            name="image"
            type="url"
            required
            placeholder="https://…"
            value={image}
            onChange={(e) => setImage(e.target.value)}
          />

          <Button
            type="submit"
            variant="primary"
            className="min-h-12 w-full text-base"
            disabled={busy}
          >
            {busy ? "Submitting…" : "Submit listing"}
          </Button>
        </form>
      </div>
    </div>
  );
}
