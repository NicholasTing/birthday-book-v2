"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

type Status = { type: "success" | "error"; text: string };

function AlbumCreateContent() {
  const params = useSearchParams();
  const prefillCard = params?.get("code") ?? "";
  const router = useRouter();

  const [name, setName] = useState("");
  const [passcode, setPasscode] = useState("");
  const [albumCode, setAlbumCode] = useState("");
  const [cardCode, setCardCode] = useState(prefillCard);
  const [status, setStatus] = useState<Status | null>(null);
  const [albumId, setAlbumId] = useState<string | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setAlbumId(null);
    if (!name.trim() || !passcode.trim() || !cardCode.trim()) {
      setStatus({ type: "error", text: "Name, passcode, and card code are required." });
      return;
    }
    setLoading(true);
    try {
      // Create album
      const res = await fetch("/api/albums/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          passcode: passcode.trim(),
          code: albumCode.trim() || undefined,
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error || "Failed to create album");
      const createdId = body.album?.id as string | undefined;
      const createdCode = body.album?.code as string | undefined;
      setAlbumId(createdId ?? null);
      setGeneratedCode(createdCode ?? null);

      // Attach a card (required)
      if (createdId) {
        const addRes = await fetch("/api/albums/add-card", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            albumId: createdId,
            passcode: passcode.trim(),
            cardCode: cardCode.trim(),
          }),
        });
        const addBody = await addRes.json();
        if (!addRes.ok) throw new Error(addBody?.error || "Failed to add card to album");
      }

      setStatus({
        type: "success",
        text: createdId
          ? "Album created! Share the passcode to manage it."
          : "Album created.",
      });
      if (createdCode) {
        router.push(`/albums/view?code=${encodeURIComponent(createdCode)}`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to create album";
      setStatus({ type: "error", text: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-10">
      <div className="flex items-center gap-3 text-sm font-semibold text-[var(--text)]">
        <Link
          href="/"
          className="rounded-full border border-[var(--border)] px-3 py-2 hover:border-[var(--accent-2)]"
        >
          ← Back to home
        </Link>
        {cardCode ? (
          <span className="rounded-full border border-[var(--border)] px-3 py-2 text-xs text-[var(--muted)]">
            Prefilled code: {cardCode}
          </span>
        ) : null}
      </div>

      <header className="flex flex-col gap-2">
        <p className="text-sm uppercase tracking-[0.16em] text-[var(--muted)]">Albums</p>
        <h1 className="text-3xl font-semibold text-[var(--text)] sm:text-4xl">
          Create an album
        </h1>
        <p className="text-sm text-[var(--muted)]">
          Add a passcode you’ll remember. Optionally attach a card now and label its year.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="glass rounded-[18px] border border-[var(--border)] p-5 shadow-sm space-y-4"
      >
        <label className="flex flex-col gap-2 text-sm font-medium text-[var(--text)]">
          Album name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My Memory Album"
            className="rounded-xl border border-[var(--border)] bg-[#f7f9fd] px-3 py-3 text-[var(--text)] outline-none ring-2 ring-transparent transition focus:ring-[var(--accent)]"
            required
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-[var(--text)]">
          Passcode (only you know this)
          <input
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder="Minimum 4 characters"
            className="rounded-xl border border-[var(--border)] bg-[#f7f9fd] px-3 py-3 text-[var(--text)] outline-none ring-2 ring-transparent transition focus:ring-[var(--accent)]"
            required
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-medium text-[var(--text)]">
            Card code (required)
            <input
              value={cardCode}
              onChange={(e) => setCardCode(e.target.value)}
              placeholder="ABC-123"
              className="rounded-xl border border-[var(--border)] bg-[#f7f9fd] px-3 py-3 text-[var(--text)] outline-none ring-2 ring-transparent transition focus:ring-[var(--accent)]"
              required
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-[var(--text)]">
            Album code (optional)
            <input
              value={albumCode}
              onChange={(e) => setAlbumCode(e.target.value)}
              placeholder="Leave blank to auto-generate"
              className="rounded-xl border border-[var(--border)] bg-[#f7f9fd] px-3 py-3 text-[var(--text)] outline-none ring-2 ring-transparent transition focus:ring-[var(--accent)]"
            />
            <span className="text-xs text-[var(--muted)]">
              Codes are case sensitive. If taken, we’ll auto-generate another.
            </span>
          </label>
        </div>

        {status ? (
          <div
            className={`rounded-[12px] border px-4 py-3 text-sm ${
              status.type === "success"
                ? "border-green-200 bg-green-50 text-green-800"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            {status.text}{" "}
            {status.type === "success" && (generatedCode || albumId)
              ? `Code: ${generatedCode ?? albumId}`
              : null}
          </div>
        ) : null}

        <button
          type="submit"
          className="w-full rounded-[14px] bg-[var(--accent-2)] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] active:translate-y-[1px]"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create album"}
        </button>
      </form>
    </main>
  );
}

export default function AlbumCreatePage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-10">
          <p className="text-sm text-[var(--muted)]">Loading...</p>
        </main>
      }
    >
      <AlbumCreateContent />
    </Suspense>
  );
}
