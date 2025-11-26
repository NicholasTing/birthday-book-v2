"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";

type AlbumCard = {
  cardId: string;
  code: string;
  recipient: string;
  occasion: string;
  created_at: string;
  year: number | null;
  added_at: string;
};

type AlbumResponse = {
  album: {
    id: string;
    name: string;
    created_at: string;
  };
  cards: AlbumCard[];
};

export default function ViewAlbumPage() {
  const STATE_KEY = "album_view_state";
  const [albumCode, setAlbumCode] = useState("");
  const [passcode, setPasscode] = useState("");
  const [addCode, setAddCode] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [data, setData] = useState<AlbumResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? sessionStorage.getItem(STATE_KEY) : null;
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed?.albumCode && parsed?.passcode && parsed?.data) {
        setAlbumCode(parsed.albumCode);
        setPasscode(parsed.passcode);
        setData(parsed.data);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setData(null);
    if (!albumCode.trim() || !passcode.trim()) {
      setStatus("Album code and passcode are required.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/album`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ albumCode: albumCode.trim(), passcode: passcode.trim() }),
        cache: "no-store",
      });
      const raw = await res.text();
      let body: any = null;
      try {
        body = raw ? JSON.parse(raw) : null;
      } catch {
        body = null;
      }
      if (!res.ok) {
        const msg = (body && body.error) || `Failed to load album (${res.status})`;
        throw new Error(msg);
      }
      setData(body as AlbumResponse);
      try {
        sessionStorage.setItem(
          STATE_KEY,
          JSON.stringify({
            albumCode: albumCode.trim(),
            passcode: passcode.trim(),
            data: body,
          }),
        );
      } catch {
        // ignore
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load album";
      setStatus(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data || !addCode.trim() || !albumCode.trim() || !passcode.trim()) return;
    setStatus(null);
    setAdding(true);
    try {
      const res = await fetch("/api/albums/add-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          albumId: data.album.id,
          passcode: passcode.trim(),
          cardCode: addCode.trim(),
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error || "Failed to add card");
      // Refresh album view
      await handleSubmit(new Event("submit") as any);
      setAddCode("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to add card";
      setStatus(msg);
    } finally {
      setAdding(false);
    }
  };

  const grouped =
    data?.cards
      ?.slice()
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .reduce<Record<string, AlbumCard[]>>((acc, card) => {
        const d = new Date(card.created_at);
        const key = d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
        acc[key] = acc[key] ? [...acc[key], card] : [card];
        return acc;
      }, {}) ?? {};

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-10">
      <div className="flex items-center gap-3 text-sm font-semibold text-[var(--text)]">
        <Link
          href="/"
          className="rounded-full border border-[var(--border)] px-3 py-2 hover:border-[var(--accent-2)]"
        >
          ← Back to home
        </Link>
        {data ? (
          <button
            type="button"
            onClick={() => {
              setData(null);
              setAlbumCode("");
              setPasscode("");
              setStatus(null);
              sessionStorage.removeItem(STATE_KEY);
            }}
            className="rounded-full border border-[var(--border)] px-3 py-2 hover:border-[var(--accent-2)]"
          >
            Check another album
          </button>
        ) : null}
      </div>

      <header className="flex flex-col gap-2">
        <p className="text-sm uppercase tracking-[0.16em] text-[var(--muted)]">Albums</p>
        <h1 className="text-3xl font-semibold text-[var(--text)] sm:text-4xl">
          View an album
        </h1>
        <p className="text-sm text-[var(--muted)]">
          Enter the album code (or ID) and passcode to see its cards.
        </p>
      </header>

      {!data ? (
        <form
          onSubmit={handleSubmit}
          className="glass rounded-[18px] border border-[var(--border)] p-5 shadow-sm space-y-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-medium text-[var(--text)]">
              Album code
              <input
                value={albumCode}
                onChange={(e) => setAlbumCode(e.target.value)}
                placeholder="Album code or ID"
                className="rounded-xl border border-[var(--border)] bg-[#f7f9fd] px-3 py-3 text-[var(--text)] outline-none ring-2 ring-transparent transition focus:ring-[var(--accent)]"
                autoComplete="off"
                required
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-[var(--text)]">
              Passcode
              <input
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Album passcode"
                className="rounded-xl border border-[var(--border)] bg-[#f7f9fd] px-3 py-3 text-[var(--text)] outline-none ring-2 ring-transparent transition focus:ring-[var(--accent)]"
                autoComplete="off"
                required
              />
            </label>
          </div>
        {status ? (
          <div className="rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {status}
          </div>
        ) : null}
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
            <span className="spinner" />
            Loading album...
          </div>
        ) : null}
        <button
          type="submit"
          className="w-full rounded-[14px] bg-[var(--accent-2)] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] active:translate-y-[1px]"
          disabled={loading}
        >
            {loading ? "Loading..." : "View album"}
          </button>
        </form>
      ) : null}

      {data ? (
        <section className="glass rounded-[18px] border border-[var(--border)] p-6 shadow-sm">
          <div className="flex flex-col gap-1">
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
              Album
            </p>
            <h2 className="text-2xl font-semibold text-[var(--text)]">{data.album.name}</h2>
            <p className="text-sm text-[var(--muted)]">
              Created {new Date(data.album.created_at).toLocaleString()}
            </p>
          </div>

          <form onSubmit={handleAddCard} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex flex-1 flex-col gap-2 text-sm font-medium text-[var(--text)]">
              <label htmlFor="add-card">Add a card to this album</label>
              <input
                id="add-card"
                value={addCode}
                onChange={(e) => setAddCode(e.target.value)}
                placeholder="Card code"
                className="rounded-xl border border-[var(--border)] bg-[#f7f9fd] px-3 py-3 text-[var(--text)] outline-none ring-2 ring-transparent transition focus:ring-[var(--accent)]"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-[14px] bg-[var(--accent-2)] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] active:translate-y-[1px] sm:w-auto"
              disabled={adding}
            >
              {adding ? "Adding..." : "Add card"}
            </button>
          </form>

          {Object.keys(grouped).length === 0 ? (
            <p className="mt-4 text-sm text-[var(--muted)]">No cards linked yet.</p>
          ) : (
            <div className="mt-6 space-y-4">
              {Object.entries(grouped).map(([label, cards]) => (
                <div key={label} className="relative pl-4">
                  <div className="absolute left-1 top-0 bottom-0 w-px bg-[var(--border)]" />
                  <div className="mb-3 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[var(--accent-2)]" />
                    <p className="text-sm font-semibold text-[var(--text)]">{label}</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {cards.map((c) => (
                      <Link
                        key={c.cardId}
                        href={`/cards/view?code=${encodeURIComponent(c.code)}`}
                        className="rounded-[14px] border border-[var(--border)] bg-white/70 p-4 transition hover:-translate-y-[1px] hover:border-[var(--accent-2)]"
                      >
                        <p className="mt-2 text-base font-semibold text-[var(--text)]">
                          Dear {c.recipient}
                        </p>
                        <p className="text-sm text-[var(--muted)]">{c.occasion}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      ) : null}
    </main>
  );
}
