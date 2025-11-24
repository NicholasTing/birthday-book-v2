 "use client";

import { useState } from "react";
import Link from "next/link";

export default function NewCardPage() {
  const [recipient, setRecipient] = useState("");
  const [occasion, setOccasion] = useState<"Birthday" | "Other">("Birthday");
  const [customMessage, setCustomMessage] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [status, setStatus] = useState<null | { type: "success" | "error"; text: string }>(null);
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setCreatedCode(null);
    if (!recipient.trim()) {
      setStatus({ type: "error", text: "Recipient is required." });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/cards/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient: recipient.trim(),
          occasion,
          custom_message: customMessage.trim(),
          code: customCode.trim() || undefined,
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body?.error || "Failed to create card");
      }
      setCreatedCode(body.card?.code);
      setStatus({ type: "success", text: "Card created!" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to create card";
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
        {createdCode ? (
          <Link
            href={`/cards/send?code=${encodeURIComponent(createdCode)}`}
            className="rounded-full border border-[var(--border)] px-3 py-2 hover:border-[var(--accent-2)]"
          >
            Add a message
          </Link>
        ) : null}
      </div>

      <header className="flex flex-col gap-2">
        <p className="text-sm uppercase tracking-[0.16em] text-[var(--muted)]">
          Create card
        </p>
        <h1 className="text-3xl font-semibold text-[var(--text)] sm:text-4xl">
          Start a new Memory Album card
        </h1>
        <p className="text-sm text-[var(--muted)]">
          Add the recipient and occasion, then share the code so others can view or send messages.
        </p>
      </header>

      <form
        onSubmit={handleCreate}
        className="glass rounded-[18px] border border-[var(--border)] p-5 shadow-sm space-y-4"
      >
        <label className="flex flex-col gap-2 text-sm font-medium text-[var(--text)]">
          Recipient name
          <input
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="Who is this for?"
            className="rounded-xl border border-[var(--border)] bg-[#f7f9fd] px-3 py-3 text-[var(--text)] outline-none ring-2 ring-transparent transition focus:ring-[var(--accent)]"
            required
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-[var(--text)]">
          Occasion
          <select
            value={occasion}
            onChange={(e) => setOccasion(e.target.value as "Birthday" | "Other")}
            className="rounded-xl border border-[var(--border)] bg-[#f7f9fd] px-3 py-3 text-[var(--text)] outline-none ring-2 ring-transparent transition focus:ring-[var(--accent)]"
            required
          >
            <option value="Birthday">Birthday</option>
            <option value="Other">Other</option>
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-[var(--text)]">
          Custom message (optional)
          <textarea
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            placeholder="A message for the recipient, e.g. 'Congratulations on your new job!' or 'Get well soon!'"
            className="min-h-[120px] rounded-xl border border-[var(--border)] bg-[#f7f9fd] px-3 py-3 text-[var(--text)] outline-none ring-2 ring-transparent transition focus:ring-[var(--accent)]"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-[var(--text)]">
          Card code (optional)
          <input
            value={customCode}
            onChange={(e) => setCustomCode(e.target.value)}
            placeholder="Leave blank to auto-generate"
            className="rounded-xl border border-[var(--border)] bg-[#f7f9fd] px-3 py-3 text-[var(--text)] outline-none ring-2 ring-transparent transition focus:ring-[var(--accent)]"
          />
          <span className="text-xs text-[var(--muted)]">
            Codes are case sensitive. If taken, we’ll auto-generate another.
          </span>
        </label>

        {status ? (
          <div
            className={`rounded-[12px] border px-4 py-3 text-sm ${
              status.type === "success"
                ? "border-green-200 bg-green-50 text-green-800"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            {status.text}{" "}
            {status.type === "success" && createdCode ? `Code: ${createdCode}` : null}
          </div>
        ) : null}

        {createdCode ? (
          <div className="rounded-[12px] border border-[var(--border)] bg-white/70 px-4 py-3 text-sm text-[var(--text)]">
            Share this code: <span className="font-semibold">{createdCode}</span>
            <div className="mt-2 flex gap-2">
              <Link
                href={`/cards/view?code=${encodeURIComponent(createdCode)}`}
                className="rounded-[10px] border border-[var(--border)] px-3 py-2 text-xs font-semibold hover:border-[var(--accent-2)]"
              >
                View card
              </Link>
              <Link
                href={`/cards/send?code=${encodeURIComponent(createdCode)}`}
                className="rounded-[10px] bg-[var(--accent-2)] px-3 py-2 text-xs font-semibold text-white"
              >
                Send a message
              </Link>
            </div>
          </div>
        ) : null}

        <button
          type="submit"
          className="w-full rounded-[14px] bg-[var(--accent-2)] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] active:translate-y-[1px]"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create card"}
        </button>
      </form>
    </main>
  );
}
