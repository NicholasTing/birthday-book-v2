import { createClient } from "@/lib/prismic";

type BirthdayEntry = {
  name: string;
  relation?: string;
  dateLabel: string;
  daysAway: number;
  giftIdea?: string;
};

const mockBirthdays: BirthdayEntry[] = [
  {
    name: "Ava Thompson",
    relation: "Sister",
    dateLabel: "Jan 08",
    daysAway: 3,
    giftIdea: "Weekend brunch + photo album",
  },
  {
    name: "Daniel Park",
    relation: "Best friend",
    dateLabel: "Jan 17",
    daysAway: 12,
    giftIdea: "Concert tickets for his favorite band",
  },
  {
    name: "Samira Ali",
    relation: "Teammate",
    dateLabel: "Jan 28",
    daysAway: 23,
    giftIdea: "Coffee tasting set",
  },
  {
    name: "Grandma Rose",
    relation: "Grandma",
    dateLabel: "Feb 04",
    daysAway: 30,
    giftIdea: "Printed letter + flowers",
  },
];

const moments = [
  {
    title: "Captured their smile",
    note: "Added 6 photos from last year's picnic. Set a reminder to print them.",
    time: "Today",
  },
  {
    title: "Planned the surprise",
    note: "Shared the secret dinner plan with 4 guests. Kept Ava off the loop.",
    time: "Yesterday",
  },
  {
    title: "Gift inspiration saved",
    note: "Pinned 3 ideas from Prismic: ceramic mug, local roast, handwritten card.",
    time: "Mon",
  },
];

const stats = [
  { label: "Loved ones", value: "32" },
  { label: "This month", value: "6" },
  { label: "Stories saved", value: "128" },
  { label: "Automations", value: "4" },
];

async function loadBirthdays(): Promise<BirthdayEntry[]> {
  try {
    const client = createClient();
    const docs = await client.getAllByType("birthday", { pageSize: 12 });

    const entries = docs.map((doc) => {
      const date = doc.data?.date as string | undefined;
      const name = (doc.data as any)?.name ?? doc.uid ?? "Birthday";
      const relation = (doc.data as any)?.relation;
      const giftIdea = (doc.data as any)?.giftIdea ?? (doc.data as any)?.gift_idea;

      const parsed = date ? new Date(date) : undefined;
      const now = new Date();
      const year = now.getFullYear();
      const target = parsed
        ? new Date(year, parsed.getMonth(), parsed.getDate())
        : undefined;
      const msInDay = 1000 * 60 * 60 * 24;
      const daysAway =
        target && !Number.isNaN(target.getTime())
          ? Math.max(
              0,
              Math.round(
                (target.getTime() - new Date(now.toDateString()).getTime()) /
                  msInDay,
              ),
            )
          : 0;

      const dateLabel = parsed
        ? parsed.toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
          })
        : "TBD";

      return {
        name,
        relation,
        dateLabel,
        daysAway,
        giftIdea,
      };
    });

    if (!entries.length) return mockBirthdays;
    return entries;
  } catch (err) {
    return mockBirthdays;
  }
}

export default async function Home() {
  const birthdays = await loadBirthdays();

  return (
    <div className="min-h-screen font-sans">
      <div className="absolute inset-0 -z-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(124,93,250,0.18),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(242,201,76,0.2),transparent_28%)]" />
      </div>

      <main className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-10 sm:px-6 lg:px-12">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-[var(--muted)]">
              Birthday Book
            </p>
            <h1 className="mt-2 text-3xl font-semibold leading-tight text-[var(--text)] sm:text-4xl">
              Keep every birthday personal, never last-minute.
            </h1>
            <p className="mt-3 max-w-2xl text-base text-[var(--muted)] sm:text-lg">
              A calm, mobile-first way to track the people you love, save
              stories, and ship thoughtful gifts on time.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="gradient-border relative rounded-[18px] px-5 py-3 text-sm font-semibold text-[var(--text)] transition hover:translate-y-[-1px] active:translate-y-0">
              <span className="glass relative block rounded-[16px] px-2 py-1">
                Start with Prismic CMS
              </span>
            </button>
            <button className="rounded-[18px] border border-[var(--border)] px-5 py-3 text-sm font-semibold text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--text)]">
              Preview mobile
            </button>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1.35fr_1fr]">
          <div className="gradient-border rounded-[18px]">
            <div className="glass relative overflow-hidden rounded-[16px] p-6 sm:p-8">
              <div className="absolute right-[-80px] top-[-80px] h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(242,201,76,0.28),transparent_55%)]" />
              <div className="absolute left-[-120px] bottom-[-120px] h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(124,93,250,0.18),transparent_60%)]" />
              <div className="relative flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="rounded-full bg-[rgba(255,255,255,0.05)] px-3 py-1 text-xs font-medium text-[var(--muted)]">
                    Upcoming birthdays
                  </div>
                  <div className="text-xs text-[var(--muted)]">Auto-reminders on</div>
                </div>

                <div className="flex flex-wrap gap-3">
                  {stats.map((item) => (
                    <div
                      key={item.label}
                      className="glass rounded-xl border border-[rgba(255,255,255,0.06)] px-4 py-3 text-left"
                    >
                      <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                        {item.label}
                      </p>
                      <p className="mt-1 text-2xl font-semibold text-[var(--text)]">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {birthdays.map((person) => (
                    <article
                      key={person.name}
                      className="glass rounded-xl border border-[rgba(255,255,255,0.06)] p-4 transition hover:-translate-y-0.5 hover:border-[var(--accent)]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-[var(--text)]">
                            {person.name}
                          </p>
                          <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                            {person.relation}
                          </p>
                        </div>
                        <span className="rounded-full bg-[rgba(242,201,76,0.12)] px-3 py-1 text-xs font-semibold text-[var(--accent)]">
                          {person.daysAway} days
                        </span>
                      </div>
                      <div className="mt-4 flex items-center justify-between text-sm text-[var(--muted)]">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-[var(--accent-2)]" />
                          <span>{person.date}</span>
                        </div>
                        <div className="text-[var(--text)]">{person.giftIdea}</div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="glass h-full rounded-[18px] border border-[rgba(255,255,255,0.06)] p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                  Memory stream
                </p>
                <h3 className="mt-2 text-xl font-semibold text-[var(--text)]">
                  Stories, notes, reminders
                </h3>
              </div>
              <span className="rounded-full border border-[rgba(255,255,255,0.08)] px-3 py-1 text-xs text-[var(--muted)]">
                Syncs with mobile
              </span>
            </div>

            <div className="mt-6 space-y-4">
              {moments.map((moment, idx) => (
                <div
                  key={moment.title}
                  className="rounded-xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.03)] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[var(--text)]">
                        {moment.title}
                      </p>
                      <p className="mt-1 text-sm text-[var(--muted)]">{moment.note}</p>
                    </div>
                    <span className="text-xs text-[var(--muted)]">{moment.time}</span>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="h-1 w-12 rounded-full bg-[var(--accent-2)]" />
                    <div className="h-1 w-8 rounded-full bg-[var(--accent)]" />
                    <div className="h-1 w-16 rounded-full bg-[rgba(255,255,255,0.12)]" />
                  </div>
                  {idx === 0 ? (
                    <p className="mt-3 text-xs text-[var(--muted)]">
                      Tip: link Prismic slices to automate story drops on mobile.
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="glass rounded-[18px] border border-[rgba(255,255,255,0.06)] p-6 sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                Works everywhere
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-[var(--text)]">
                Mobile-first, desktop ready
              </h3>
              <p className="mt-2 max-w-2xl text-sm text-[var(--muted)] sm:text-base">
                Adaptive layouts for quick thumb reach, offline-friendly prompts,
                and focused detail screens. On desktop, multi-column views keep you
                in flow when planning.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-[var(--muted)]">
              <span className="rounded-full border border-[rgba(255,255,255,0.08)] px-3 py-1">
                Snappy list/detail split
              </span>
              <span className="rounded-full border border-[rgba(255,255,255,0.08)] px-3 py-1">
                Haptics-ready actions
              </span>
              <span className="rounded-full border border-[rgba(255,255,255,0.08)] px-3 py-1">
                Dark-mode native
              </span>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.03)] p-4">
              <p className="text-sm font-semibold text-[var(--text)]">
                Calendar + focus mode
              </p>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Quick swipe through birthdays with a single action bar: call, text,
                send gift, or snooze.
              </p>
            </div>
            <div className="rounded-xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.03)] p-4">
              <p className="text-sm font-semibold text-[var(--text)]">
                Story slices from Prismic
              </p>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Build rich “About” and “Gift guide” sections in Prismic; render them
                inline with slices on web and mobile.
              </p>
            </div>
            <div className="rounded-xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.03)] p-4">
              <p className="text-sm font-semibold text-[var(--text)]">
                Smart reminders
              </p>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Auto-schedule nudges for shipping cutoffs, RSVP deadlines, and
                photo recaps after the day.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
