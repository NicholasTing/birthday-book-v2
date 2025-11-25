"use client";

import Link from "next/link";
import { useState } from "react";

export function NavBar() {
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/", label: "Home" },
    { href: "/cards/view", label: "View card" },
    { href: "/cards/new", label: "Create card" },
    { href: "/albums/create", label: "Create album" },
    { href: "/albums/view", label: "View album" },
  ];

  return (
    <nav className="rounded-[18px] border border-[var(--border)] bg-white/70 p-4 shadow-sm backdrop-blur">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-8 w-8 rounded-full bg-[var(--accent-2)]" />
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
              Memory Album
            </p>
          </div>
        </div>
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text)] sm:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle navigation"
        >
          <span className="text-lg">{open ? "✕" : "☰"}</span>
        </button>
        <div className="hidden flex-wrap items-center gap-3 text-sm font-semibold text-[var(--text)] sm:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              className="rounded-full border border-[var(--border)] px-3 py-2 hover:border-[var(--accent-2)]"
              href={link.href}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
      {open ? (
        <div className="mt-3 flex flex-col gap-2 text-sm font-semibold text-[var(--text)] sm:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              className="rounded-full border border-[var(--border)] px-3 py-2 hover:border-[var(--accent-2)]"
              href={link.href}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      ) : null}
    </nav>
  );
}
