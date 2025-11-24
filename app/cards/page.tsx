import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CardsIndexPage() {
  let cards: Awaited<ReturnType<typeof prisma.cards.findMany>> = [];
  try {
    cards = await prisma.cards.findMany({
      orderBy: { created_at: "desc" },
    });
  } catch (err) {
    console.error("Failed to load cards", err);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-10">
      <header className="flex flex-col gap-2">
        <p className="text-sm uppercase tracking-[0.16em] text-[var(--muted)]">
          Memory Album
        </p>
        <h1 className="text-3xl font-semibold text-[var(--text)] sm:text-4xl">
          All albums
        </h1>
        <p className="text-sm text-[var(--muted)]">
          Quick list of every card with its code and occasion.
        </p>
      </header>

      {cards.length === 0 ? (
        <div className="glass rounded-[18px] border border-[var(--border)] p-6">
          <p className="text-sm font-semibold text-[var(--text)]">No cards yet.</p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Create one from the home page or via the API at <code className="font-mono">/api/cards/new</code>.
          </p>
        </div>
      ) : (
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <article
              key={card.id}
              className="glass rounded-[18px] border border-[var(--border)] p-5"
            >
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--muted)]">
                  Code: {card.code}
                </span>
                {card.occasion ? (
                  <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--muted)]">
                    {card.occasion}
                  </span>
                ) : null}
              </div>
              <h3 className="mt-3 text-lg font-semibold text-[var(--text)]">
                {card.recipient}
              </h3>
              <div className="mt-4 flex gap-2">
                <Link
                  href={`/cards/view?code=${encodeURIComponent(card.code)}`}
                  className="rounded-[12px] bg-[var(--accent-2)] px-3 py-2 text-xs font-semibold text-white transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                >
                  View messages
                </Link>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
