"use client";

import Link from "next/link";
import { DeskActions } from "@/components/DeskActions";
import { LookThumb } from "@/components/LookThumb";
import { collabHref } from "@/lib/collab-path";
import { vsRetailLine } from "@/lib/copy";
import { useDesk } from "@/lib/desk-book";

export function CoverageStrip() {
  const { followed, endorsed, all, stamps } = useDesk();
  const watching = all.filter((c) => followed.has(c.slug));
  const takes = all.filter((c) => endorsed.has(c.slug));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2">
      <section className="border-line max-lg:border-b lg:border-r">
        <header className="flex h-9 items-center justify-between border-b border-line px-3">
          <h2 className="text-[13px] text-muted">Watching</h2>
          <span className="text-[12px] text-gold tabular">{watching.length}</span>
        </header>
        {watching.length ? (
          <ul className="divide-y divide-line">
            {watching.map((c) => (
              <li key={c.slug} className="flex items-center justify-between gap-3 px-3 py-2">
                <Link href={collabHref(c.slug)} className="flex min-w-0 items-center gap-2 no-underline">
                  <LookThumb slug={c.slug} ticker={c.ticker} className="h-12 w-[4.5rem]" />
                  <div className="min-w-0">
                    <div className="truncate text-[14px] text-ink">{c.name}</div>
                    <div className="truncate text-[12px] text-muted">{vsRetailLine(c)}</div>
                  </div>
                </Link>
                <DeskActions slug={c.slug} compact />
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-3 py-4 text-[13px] leading-5 text-dim">
            Watch a collab from the board when you want it on this list.
          </p>
        )}
      </section>
      <section>
        <header className="flex h-9 items-center justify-between border-b border-line px-3">
          <h2 className="text-[13px] text-muted">Your takes</h2>
          <span className="text-[12px] text-up tabular">{takes.length}</span>
        </header>
        {takes.length ? (
          <ul className="divide-y divide-line">
            {takes.map((c) => (
              <li key={c.slug} className="px-3 py-2">
                <div className="flex items-center justify-between gap-3">
                  <Link href={collabHref(c.slug)} className="flex min-w-0 items-center gap-2 no-underline">
                    <LookThumb slug={c.slug} ticker={c.ticker} className="h-12 w-[4.5rem]" />
                    <div className="min-w-0">
                      <div className="truncate text-[14px] text-ink">{c.name}</div>
                      <div className="truncate text-[12px] text-muted">{vsRetailLine(c)}</div>
                    </div>
                  </Link>
                  <DeskActions slug={c.slug} compact />
                </div>
                {stamps[c.slug] ? (
                  <p className="mt-2 text-[13px] leading-5 text-gold-2">{stamps[c.slug]}</p>
                ) : (
                  <p className="mt-2 text-[12px] text-dim">Take is on. Add the sentence on the collab page.</p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-3 py-4 text-[13px] leading-5 text-dim">
            A take is your stamp. Use it when you have a reason, not just a
            watch.
          </p>
        )}
      </section>
    </div>
  );
}
