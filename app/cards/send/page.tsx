"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type GifResult = {
  id: string;
  url: string;
  preview: string;
};

export default function SendMessagePage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-10">
          <p className="text-sm text-[var(--muted)]">Loading...</p>
        </main>
      }
    >
      <SendMessageContent />
    </Suspense>
  );
}

function SendMessageContent() {
  const searchParams = useSearchParams();
  const codeParam = searchParams?.get("code") ?? "";
  const [author, setAuthor] = useState("");
  const [message, setMessage] = useState("");
  const [gifQuery, setGifQuery] = useState("");
  const [gifResults, setGifResults] = useState<GifResult[]>([]);
  const [selectedGif, setSelectedGif] = useState<GifResult | null>(null);
  const [pickerOpen, setPickerOpen] = useState(true);
  const [status, setStatus] = useState<null | { type: "success" | "error"; text: string }>(null);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingSend, setLoadingSend] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [lastQuery, setLastQuery] = useState("");
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  // Track card validity for UX; sending still validates server-side.
  const [cardOk, setCardOk] = useState(false);
  const [checkingCard, setCheckingCard] = useState(false);

  useEffect(() => {
    setStatus(null);
  }, [author, message]);

  const effectiveCode = codeParam.trim();

  useEffect(() => {
    if (!effectiveCode) {
      setCardOk(false);
      return;
    }
    let cancelled = false;
    async function check() {
      setCheckingCard(true);
      try {
        const res = await fetch(
          `/api/cards/${encodeURIComponent(effectiveCode)}/exists`,
          { method: "GET", cache: "no-store" },
        );
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.error || "Card not found");
        }
        if (!cancelled) {
          setCardOk(true);
          setStatus(null);
        }
      } catch (err) {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : "Card not found";
          setCardOk(false);
          setStatus({ type: "error", text: msg });
        }
      } finally {
        if (!cancelled) setCheckingCard(false);
      }
    }
    check();
    return () => {
      cancelled = true;
    };
  }, [effectiveCode]);

  async function fetchGifs(query: string, offset: number, append: boolean) {
    if (!query.trim()) return;
    const key = process.env.NEXT_PUBLIC_GIPHY_KEY;
    if (!key) {
      setStatus({ type: "error", text: "GIPHY key missing." });
      return;
    }
    if (append) {
      setLoadingMore(true);
    } else {
      setLoadingSearch(true);
    }
    try {
      const limit = 12;
      const res = await fetch(
        `https://api.giphy.com/v1/gifs/search?api_key=${key}&q=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}`,
      );
      const data = await res.json();
      const items: GifResult[] =
        data?.data?.map((g: { id: string; images?: { original?: { url?: string }; fixed_width?: { url?: string } } }) => ({
          id: g.id,
          url: g.images?.original?.url ?? "",
          preview: g.images?.fixed_width?.url ?? g.images?.original?.url ?? "",
        })) ?? [];
      setGifResults((prev) => (append ? [...prev, ...items.filter((g) => g.url)] : items.filter((g) => g.url)));
      setLastQuery(query);
      const pagination = data?.pagination;
      const totalCount = pagination?.total_count ?? 0;
      const count = pagination?.count ?? items.length;
      const nextOffset = offset + count;
      setHasMore(nextOffset < totalCount && items.length > 0);
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", text: "Failed to load GIFs." });
      setHasMore(false);
    } finally {
      if (append) {
        setLoadingMore(false);
      } else {
        setLoadingSearch(false);
      }
    }
  }

  const loadMoreGifs = useCallback(() => {
    if (!hasMore || loadingMore || !lastQuery) return;
    fetchGifs(lastQuery, gifResults.length, true);
  }, [hasMore, loadingMore, lastQuery, gifResults.length]);

  useEffect(() => {
    if (!hasMore || loadingMore || !lastQuery || !gifResults.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadMoreGifs();
          }
        });
      },
      { root: null, rootMargin: "200px", threshold: 0 },
    );
    const node = sentinelRef.current;
    if (node) observer.observe(node);
    return () => {
      if (node) observer.unobserve(node);
      observer.disconnect();
    };
  }, [hasMore, loadingMore, lastQuery, gifResults.length, loadMoreGifs]);

  function searchGifs() {
    setGifResults([]);
    setSelectedGif(null);
    setHasMore(false);
    setLastQuery("");
    fetchGifs(gifQuery, 0, false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    const effectiveCode = codeParam.trim();
    if (!effectiveCode) {
      setStatus({ type: "error", text: "Card code is required." });
      return;
    }
    if (!message.trim()) {
      setStatus({ type: "error", text: "Message is required." });
      return;
    }
    // Validate card existence before sending
    const trimmedCode = effectiveCode;
    try {
      const existsRes = await fetch(
        `/api/cards/${encodeURIComponent(trimmedCode)}/exists`,
        { method: "GET", cache: "no-store" },
      );
      if (!existsRes.ok) {
        const body = await existsRes.json().catch(() => ({}));
        throw new Error(body?.error || "Card not found");
      }
    } catch (err) {
      const messageText = err instanceof Error ? err.message : "Card not found";
      setStatus({ type: "error", text: messageText });
      return;
    }
    setLoadingSend(true);
    try {
      const res = await fetch(`/api/cards/${encodeURIComponent(trimmedCode)}/messages/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author: author.trim() || "Anon",
          message: message.trim(),
          gif: selectedGif?.url ?? null,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || "Failed to send");
      }
      setStatus({ type: "success", text: "Message sent!" });
      setMessage("");
      setSelectedGif(null);
    } catch (err) {
      const messageText = err instanceof Error ? err.message : "Failed to send";
      setStatus({ type: "error", text: messageText });
    } finally {
      setLoadingSend(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-10">
      <div className="flex items-center gap-3 text-sm font-semibold text-[var(--text)]">
        <Link
          href="/"
          className="rounded-full border border-[var(--border)] px-3 py-2 hover:border-[var(--accent-2)]"
        >
          ← Back to home
        </Link>
        <Link
          href="/cards/view"
          className="rounded-full border border-[var(--border)] px-3 py-2 hover:border-[var(--accent-2)]"
        >
          View a card
        </Link>
      </div>

      <header className="flex flex-col gap-2">
        <p className="text-sm uppercase tracking-[0.16em] text-[var(--muted)]">
          Send a message
        </p>
        <h1 className="text-3xl font-semibold text-[var(--text)] sm:text-4xl">
          Add your note & GIF
        </h1>
        <p className="text-sm text-[var(--muted)]">
          Enter your name and message, pick a GIF, and we’ll send it to the card.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="glass rounded-[18px] border border-[var(--border)] p-5 shadow-sm space-y-4"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2 text-sm font-medium text-[var(--text)]">
            <span>Card code</span>
            {effectiveCode ? (
              <div className="inline-flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[#f7f9fd] px-3 py-3 text-[var(--text)]">
                <span className="h-2 w-2 rounded-full bg-[var(--accent-2)]" />
                {effectiveCode}
                <span className="text-xs text-[var(--muted)]">
                  {checkingCard ? "Checking..." : cardOk ? "Card verified" : "Not found"}
                </span>
              </div>
            ) : (
              <div className="rounded-xl border border-[var(--border)] bg-[#f7f9fd] px-3 py-3 text-[var(--muted)]">
                No code found. Go back and start from the home page form.
              </div>
            )}
          </div>
          <label className="flex flex-col gap-2 text-sm font-medium text-[var(--text)]">
            Your name
            <input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Your name"
              className="rounded-xl border border-[var(--border)] bg-[#f7f9fd] px-3 py-3 text-[var(--text)] outline-none ring-2 ring-transparent transition focus:ring-[var(--accent)]"
              autoComplete="off"
              required
            />
          </label>
        </div>

        <label className="flex flex-col gap-2 text-sm font-medium text-[var(--text)]">
          Message
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write something thoughtful..."
            className="min-h-[140px] rounded-xl border border-[var(--border)] bg-[#f7f9fd] px-3 py-3 text-[var(--text)] outline-none ring-2 ring-transparent transition focus:ring-[var(--accent)]"
            required
          />
        </label>

        <div className="space-y-3 rounded-[16px] border border-[var(--border)] bg-white/60 p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-[var(--text)]">Attach a GIF (optional)</p>
              <p className="text-xs text-[var(--muted)]">
                Powered by GIPHY. Search, then tap a GIF to attach.
              </p>
            </div>
            {selectedGif ? (
              <button
                type="button"
                onClick={() => {
                  setSelectedGif(null);
                  setPickerOpen(true);
                }}
                className="text-xs font-semibold text-[var(--accent-2)] underline"
              >
                Change GIF
              </button>
            ) : null}
          </div>

          {!selectedGif ? (
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                value={gifQuery}
                onChange={(e) => setGifQuery(e.target.value)}
                placeholder="Search GIPHY: celebration, hug, heart..."
                className="w-full rounded-xl border border-[var(--border)] bg-[#f7f9fd] px-3 py-3 text-[var(--text)] outline-none ring-2 ring-transparent transition focus:ring-[var(--accent)]"
              />
              <button
                type="button"
                onClick={() => {
                  setPickerOpen(true);
                  searchGifs();
                }}
                className="rounded-[12px] bg-[var(--accent-2)] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] active:translate-y-[1px]"
                disabled={loadingSearch}
              >
                {loadingSearch ? "Searching..." : "Search GIFs"}
              </button>
            </div>
          ) : null}

          {selectedGif ? (
            <div className="rounded-lg border border-[var(--border)] bg-white/80 p-2">
              <p className="text-xs font-semibold text-[var(--muted)]">Selected GIF</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedGif.preview}
                alt="Selected GIF"
                className="mt-2 h-auto w-full max-w-sm rounded-lg object-contain"
              />
            </div>
          ) : null}

          {pickerOpen && gifResults.length > 0 ? (
            <div className="max-h-[380px] overflow-y-auto rounded-lg border border-[var(--border)] bg-white/50 p-3">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {gifResults.map((gif) => (
                  <button
                    key={gif.id}
                    type="button"
                    onClick={() => {
                      setSelectedGif(gif);
                      setPickerOpen(false);
                    }}
                    className={`overflow-hidden rounded-lg border ${
                      selectedGif?.id === gif.id
                        ? "border-[var(--accent-2)] ring-2 ring-[var(--accent-2)]"
                        : "border-[var(--border)]"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={gif.preview}
                      alt="GIF option"
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
              <div ref={sentinelRef} className="h-6 w-full" />
              {loadingMore ? (
                <p className="mt-2 text-xs text-[var(--muted)]">Loading more...</p>
              ) : null}
            </div>
          ) : null}
        </div>

        {status ? (
          <div
            className={`rounded-[12px] border px-4 py-3 text-sm ${
              status.type === "success"
                ? "border-green-200 bg-green-50 text-green-800"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            {status.text}
          </div>
        ) : null}

        <div className="flex items-center gap-3">
          {loadingSend ? (
            <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
              <span className="spinner" />
              Sending...
            </div>
          ) : null}
          {checkingCard ? (
            <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
              <span className="spinner" />
              Verifying card...
            </div>
          ) : null}
        </div>

        <button
          type="submit"
          className="w-full rounded-[14px] bg-[var(--accent-2)] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] active:translate-y-[1px]"
          disabled={loadingSend || checkingCard || !effectiveCode || !cardOk}
        >
          {loadingSend ? "Sending..." : "Send message"}
        </button>
      </form>
    </main>
  );
}
