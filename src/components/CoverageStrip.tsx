"use client";

import Link from "next/link";
import { DeskActions } from "@/components/DeskActions";
import { SeatBadge } from "@/components/SeatBadge";
import { collabs } from "@/data/market";
import { useDeskBook } from "@/lib/desk-book";
import { clsx, cnDelta, usd } from "@/lib/format";

export function CoverageStrip() {
  const { followed, endorsed } = useDeskBook();
  const followedNames = collabs.filter((c) => followed.has(c.slug));
  const endorsedNames = collabs.filter((c) => endorsed.has(c.slug));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2">
      <section className="border-line max-lg:border-b lg:border-r">
        <header className="flex h-8 items-center justify-between border-b border-line px-3">
          <h2 className="font-mono text-[10px] tracking-[0.16em] text-muted uppercase">
            Coverage · followed
          </h2>
          <span className="font-mono text-[10px] text-gold tabular">
            {followedNames.length}
          </span>
        </header>
        {followedNames.length ? (
          <ul className="divide-y divide-line">
            {followedNames.map((c) => (
              <li key={c.slug} className="flex items-center justify-between gap-3 px-3 py-2">
                <Link href={`/collabs/${c.slug}`} className="min-w-0 no-underline">
                  <div className="flex items-baseline gap-2">
                    <span className="font-cond text-[14px] tracking-wide text-gold-2">
                      {c.ticker}
                    </span>
                    <SeatBadge seat={c.seat} />
                  </div>
                  <div className="truncate text-[12px] text-muted">{c.name}</div>
                </Link>
                <DeskActions slug={c.slug} compact />
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-3 py-4 font-mono text-[11px] leading-5 text-dim">
            No coverage yet. Follow any collab — celebrity, boutique, designer,
            athlete, retailer, or brand-on-brand — from MKT or a dossier.
          </p>
        )}
      </section>
      <section>
        <header className="flex h-8 items-center justify-between border-b border-line px-3">
          <h2 className="font-mono text-[10px] tracking-[0.16em] text-muted uppercase">
            Desk stamps · endorsed
          </h2>
          <span className="font-mono text-[10px] text-up tabular">
            {endorsedNames.length}
          </span>
        </header>
        {endorsedNames.length ? (
          <ul className="divide-y divide-line">
            {endorsedNames.map((c) => (
              <li key={c.slug} className="flex items-center justify-between gap-3 px-3 py-2">
                <Link href={`/collabs/${c.slug}`} className="min-w-0 no-underline">
                  <div className="flex items-baseline gap-2">
                    <span className="font-cond text-[14px] tracking-wide text-gold-2">
                      {c.ticker}
                    </span>
                    <span className={clsx("font-mono text-[11px] tabular", cnDelta(1))}>
                      {c.last ? usd(c.last) : "PRE"}
                    </span>
                  </div>
                  <div className="truncate text-[12px] text-muted">
                    {c.partner} · {c.brand}
                  </div>
                </Link>
                <DeskActions slug={c.slug} compact />
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-3 py-4 font-mono text-[11px] leading-5 text-dim">
            Endorsement is the desk call — your public stamp as the expert. It
            auto-follows. Use it on any seat, not only celebrity names.
          </p>
        )}
      </section>
    </div>
  );
}
