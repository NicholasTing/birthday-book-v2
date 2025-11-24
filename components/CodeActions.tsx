"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  layout?: "grid" | "stack";
};

async function checkCardExists(code: string) {
  const res = await fetch(`/api/cards/${encodeURIComponent(code)}/exists`, {
    method: "GET",
    cache: "no-store",
  });
  return res.ok;
}

export function CodeActions({ layout = "grid" }: Props) {
  const router = useRouter();
  const [sendCode, setSendCode] = useState("");
  const [viewCode, setViewCode] = useState("");
  const [sendError, setSendError] = useState<string | null>(null);
  const [viewError, setViewError] = useState<string | null>(null);
  const [checking, setChecking] = useState<"send" | "view" | null>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sendCode.trim()) return;
    setChecking("send");
    setSendError(null);
    const exists = await checkCardExists(sendCode.trim());
    if (exists) {
      router.push(`/cards/send?code=${encodeURIComponent(sendCode.trim())}`);
    } else {
      setSendError("Card code not found. Please check the code (case sensitive).");
    }
    setChecking(null);
  };

  const handleView = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewCode.trim()) return;
    setChecking("view");
    setViewError(null);
    const exists = await checkCardExists(viewCode.trim());
    if (exists) {
      router.push(`/cards/view?code=${encodeURIComponent(viewCode.trim())}`);
    } else {
      setViewError("Card code not found. Please check the code (case sensitive).");
    }
    setChecking(null);
  };

  const wrapperClass =
    layout === "grid"
      ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      : "flex flex-col gap-4";

  return (
    <section className={wrapperClass}>
      <article className="glass flex h-full flex-col rounded-[18px] border border-[var(--border)] p-5">
        <div>
          <h3 className="text-lg font-semibold text-[var(--text)]">Send a message</h3>
          <p className="mt-1 text-sm text-[var(--muted)]">Drop a note tied to a card code.</p>
        </div>
        <form className="mt-4 flex flex-1 flex-col gap-3" onSubmit={handleSend}>
          <label className="block text-sm font-medium text-[var(--text)]" htmlFor="send-code">
            Card code
          </label>
          <input
            id="send-code"
            name="send-code"
            placeholder="ABC-123"
            className="w-full rounded-xl border border-[rgba(20,33,61,0.12)] bg-[#f7f9fd] px-3 py-3 text-[var(--text)] outline-none ring-2 ring-transparent transition focus:ring-[var(--accent)]"
            inputMode="text"
            autoComplete="off"
            value={sendCode}
            onChange={(e) => setSendCode(e.target.value)}
          />
          {sendError ? (
            <p className="text-xs text-red-600">{sendError}</p>
          ) : null}
          <button
            type="submit"
            className="mt-auto w-full rounded-[14px] bg-[var(--accent-2)] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] active:translate-y-[1px]"
            disabled={checking === "send"}
          >
            {checking === "send" ? "Checking..." : "Send message"}
          </button>
        </form>
      </article>

      <article className="glass flex h-full flex-col rounded-[18px] border border-[var(--border)] p-5">
        <div>
          <h3 className="text-lg font-semibold text-[var(--text)]">View a card</h3>
          <p className="mt-1 text-sm text-[var(--muted)]">Open the shared card instantly.</p>
        </div>
        <form className="mt-4 flex flex-1 flex-col gap-3" onSubmit={handleView}>
          <label className="block text-sm font-medium text-[var(--text)]" htmlFor="view-code">
            Card code
          </label>
          <input
            id="view-code"
            name="view-code"
            placeholder="ABC-123"
            className="w-full rounded-xl border border-[rgba(20,33,61,0.12)] bg-[#f7f9fd] px-3 py-3 text-[var(--text)] outline-none ring-2 ring-transparent transition focus:ring-[var(--accent)]"
            inputMode="text"
            autoComplete="off"
            value={viewCode}
            onChange={(e) => setViewCode(e.target.value)}
          />
          {viewError ? (
            <p className="text-xs text-red-600">{viewError}</p>
          ) : null}
          <button
            type="submit"
            className="mt-auto w-full rounded-[14px] bg-[var(--accent-2)] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] active:translate-y-[1px]"
            disabled={checking === "view"}
          >
            {checking === "view" ? "Checking..." : "View card"}
          </button>
        </form>
      </article>

      <article className="glass flex h-full flex-col rounded-[18px] border border-[var(--border)] p-5">
        <div>
          <h3 className="text-lg font-semibold text-[var(--text)]">Create a card</h3>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Start a new card and share the code with others.
          </p>
        </div>
        <div className="mt-4 flex-1 flex items-end">
          <button
            type="button"
            onClick={() => router.push("/cards/new")}
            className="w-full rounded-[14px] bg-[var(--accent-2)] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] active:translate-y-[1px]"
          >
            Create card
          </button>
        </div>
      </article>
    </section>
  );
}
