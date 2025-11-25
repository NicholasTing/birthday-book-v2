export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { cards, messages } from "@prisma/client";

type Props = {
  searchParams: Promise<{ code?: string }>;
};

export default async function ViewCardPage({ searchParams }: Props) {
  const params = await searchParams;
  const rawCode = typeof params?.code === "string" ? params.code : "";
  const code = rawCode.trim();

  let card: (cards & { card_senders: messages[] }) | null = null;

  if (code) {
    try {
      card = (await prisma.cards.findUnique({
        where: { code },
        include: {
          card_senders: { orderBy: { created_at: "desc" } },
        },
      })) as (cards & { card_senders: messages[] }) | null;
    } catch (err) {
      console.error("Failed to load card", err);
      card = null;
    }
  }

  const notFound = code && !card;

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-10">
      <div className="flex items-center gap-3 text-sm font-semibold text-[var(--text)]">
        <Link
          href="/"
          className="rounded-full border border-[var(--border)] px-3 py-2 hover:border-[var(--accent-2)]"
        >
          ← Back to home
        </Link>
        {code ? (
          <Link
            href={`/albums/create?code=${encodeURIComponent(code)}`}
            className="rounded-full border border-[var(--border)] px-3 py-2 hover:border-[var(--accent-2)]"
          >
            Create album with this card
          </Link>
        ) : null}
        {!card ? null : (
          <Link
            href="/cards/view"
            className="rounded-full border border-[var(--border)] px-3 py-2 hover:border-[var(--accent-2)]"
          >
            Enter another code
          </Link>
        )}
      </div>

      <header className="flex flex-col gap-2">
        <p className="text-sm uppercase tracking-[0.16em] text-[var(--muted)]">
          Memory Album
        </p>
        <h1 className="text-3xl font-semibold text-[var(--text)] sm:text-4xl">
          {card
            ? card.occasion?.toLowerCase() === "birthday"
              ? `${card.recipient}'s birthday`
              : card.custom_message || "Card"
            : "Enter your card code"}
        </h1>
        {!card ? (
          <p className="text-sm text-[var(--muted)]">
            Paste the code you received to load your card and messages.
          </p>
        ) : null}
      </header> 

      {!card ? (
        <form
          className="glass rounded-[18px] border border-[var(--border)] p-5 shadow-sm"
          action="/cards/view"
          method="get"
        >
          <label className="block text-sm font-medium text-[var(--text)]" htmlFor="code">
            Card code
          </label>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              id="code"
              name="code"
              defaultValue={rawCode}
              placeholder="ABC-123"
              className="w-full rounded-xl border border-[var(--border)] bg-[#f7f9fd] px-3 py-3 text-[var(--text)] outline-none ring-2 ring-transparent transition focus:ring-[var(--accent)]"
              autoComplete="off"
              inputMode="text"
              required
            />
            <button
              type="submit"
              className="w-full rounded-[14px] bg-[var(--accent-2)] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] active:translate-y-[1px] sm:w-auto"
            >
              View card
            </button>
          </div>
        </form>
      ) : null}

      {notFound ? (
        <div className="glass rounded-[18px] border border-[var(--border)] p-5">
          <p className="text-sm font-semibold text-[var(--text)]">Card not found</p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Double-check the code or{" "}
            <Link
              className="text-[var(--accent-2)] underline decoration-[var(--accent-2)] underline-offset-4"
              href="/cards/new"
            >
              create a new card
            </Link>
            .
          </p>
        </div>
      ) : null}

      {card ? (
        <section className="glass rounded-[18px] border border-[var(--border)] p-6 shadow-sm">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-semibold text-[var(--text)]">
              Messages
            </h2>
            <p className="text-sm text-[var(--muted)]">
              {card.card_senders.length} message
              {card.card_senders.length === 1 ? "" : "s"}
            </p>
          </div>

          <div className="mt-5 space-y-4">
            {card.card_senders.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">No messages yet.</p>
            ) : (
              card.card_senders.map((m: any) => (
                <article
                  key={m.id}
                  className="rounded-xl border border-[var(--border)] bg-[#f7f9fd] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[var(--text)]">
                        {m.author || "Anon"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 whitespace-pre-wrap text-sm text-[var(--text)]">
                    {m.message}
                  </div>
                  {m.gif ? (
                    <div className="mt-3 overflow-hidden rounded-lg border border-[var(--border)] bg-white">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={m.gif}
                        alt="Attached GIF"
                        className="h-auto w-full object-contain"
                        loading="lazy"
                      />
                    </div>
                  ) : null}
                </article>
              ))
            )}
          </div>
        </section>
      ) : null}
    </main>
  );
}
