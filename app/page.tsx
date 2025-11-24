import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CodeActions } from "@/components/CodeActions";

export default async function Home() {
  const [totalCards, totalMessages] = await prisma.$transaction([
    prisma.cards.count(),
    prisma.messages.count(),
  ]);
  const supporters = [
    "pinkfairy",
    "ChewyTofu",
    "NickFanClubPresident",
    "NickFanClubVicePresident",
    "No2 biggest fan",
    "NickFanClubChiefSimp",
    "Liltomato",
    "Boba Fatt",
    "Dontkissme",
  ];

  return (
    <div className="min-h-screen font-sans">
      <div className="absolute inset-0 -z-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_24%,rgba(255,179,71,0.32),transparent_34%),radial-gradient(circle_at_78%_6%,rgba(42,157,143,0.22),transparent_32%)]" />
      </div>

      <main className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-10 sm:px-6 lg:px-12">
        <nav className="flex flex-col gap-3 rounded-[18px] border border-[var(--border)] bg-white/70 p-4 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="h-8 w-8 rounded-full bg-[var(--accent-2)]" />
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                  Memory Album
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-[var(--text)]">
            <Link
              className="rounded-full border border-[var(--border)] px-3 py-2 hover:border-[var(--accent-2)]"
              href="/"
            >
              Home
            </Link>
            <Link
              className="rounded-full border border-[var(--border)] px-3 py-2 hover:border-[var(--accent-2)]"
              href="/cards/view"
            >
              View card
            </Link>
            <Link
              className="rounded-full border border-[var(--border)] px-3 py-2 hover:border-[var(--accent-2)]"
              href="/cards/new"
            >
              Create card
            </Link>
          </div>
        </nav>

        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-[var(--muted)]">
              Memory Album
            </p>
            <h1 className="mt-2 text-3xl font-semibold leading-tight text-[var(--text)] sm:text-4xl">
              Keep every moment personal.
            </h1>
            <p className="mt-3 max-w-2xl text-base text-[var(--muted)] sm:text-lg">
              Create albums with memories for every occasion; birthdays, get well
              soon, celebrations, and all the moments that matter. Invite others to
              add messages, photos, and notes in one place.
            </p>
          </div>
        </header>

        <CodeActions />

        <section className="grid gap-4 sm:grid-cols-2">
          <div className="glass rounded-[18px] border border-[var(--border)] p-6">
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
              Cards sent
            </p>
            <p className="mt-2 text-4xl font-semibold text-[var(--text)]">
              {totalCards.toLocaleString()}
            </p>
            <p className="text-sm text-[var(--muted)]">Shared albums created</p>
          </div>
          <div className="glass rounded-[18px] border border-[var(--border)] p-6">
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
              Messages shared
            </p>
            <p className="mt-2 text-4xl font-semibold text-[var(--text)]">
              {totalMessages.toLocaleString()}
            </p>
            <p className="text-sm text-[var(--muted)]">Notes, wishes, and memories</p>
          </div>
        </section>

        <section className="glass rounded-[18px] border border-[var(--border)] p-6 text-center">
          <div className="text-3xl mb-2">☕</div>
          <h3 className="text-xl font-semibold text-[var(--text)]">Support Memory Album</h3>
          <p className="mt-2 text-sm text-[var(--muted)]">
            If this is helpful, you can buy Nick a coffee to keep it running.
          </p>
          <a
            href="https://ko-fi.com/nickt"
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center justify-center rounded-full bg-[var(--accent-2)] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          >
            Donate on Ko-fi
          </a>
        </section>

        <section className="glass rounded-[18px] border border-[var(--border)] p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                Supporters
              </p>
              <h3 className="text-xl font-semibold text-[var(--text)]">
                Thanks for keeping Memory Album alive
              </h3>
            </div>
          </div>

          <div className="relative mt-4 overflow-hidden">
            <div className="animate-marquee whitespace-nowrap text-sm font-semibold text-[var(--text)]">
              {[...supporters, ...supporters].map((name, idx) => (
                <span
                  key={name + idx}
                  className="mr-6 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white/70 px-3 py-2 shadow-sm"
                >
                  <span className="h-2 w-2 rounded-full bg-[var(--accent-2)]" />
                  {name}
                </span>
              ))}
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
