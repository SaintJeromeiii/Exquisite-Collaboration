"use client";

import Link from "next/link";
import { useState } from "react";
import { DeskActions } from "@/components/DeskActions";
import { LookThumb } from "@/components/LookThumb";
import { premium, seatLabel, type CollabSeat } from "@/data/market";
import { collabHref } from "@/lib/collab-path";
import { collabStatusLabel, sizeVsMine, vsRetailLine } from "@/lib/copy";
import { useDesk } from "@/lib/desk-book";
import { useDeskPrefs } from "@/lib/desk-prefs-context";
import { clsx } from "@/lib/format";

type BoardFilter = "all" | "followed" | "endorsed" | CollabSeat;

export function Watchlist() {
  const { followed, endorsed, listed, stamps } = useDesk();
  const { size } = useDeskPrefs();
  const [filter, setFilter] = useState<BoardFilter>("all");
  const seats = (
    ["celebrity", "athlete", "boutique", "designer", "retailer", "brand"] as CollabSeat[]
  ).filter((seat) => listed.some((c) => c.seat === seat));

  const rows = listed
    .filter((c) => {
      if (filter === "all") return true;
      if (filter === "followed") return followed.has(c.slug);
      if (filter === "endorsed") return endorsed.has(c.slug);
      return c.seat === filter;
    })
    .slice()
    .sort((a, b) => {
      const rank = (slug: string) =>
        endorsed.has(slug) ? 0 : followed.has(slug) ? 1 : 2;
      const d = rank(a.slug) - rank(b.slug);
      if (d !== 0) return d;
      return premium(b) - premium(a);
    });

  const chips: { id: BoardFilter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "followed", label: "Watching" },
    { id: "endorsed", label: "Your takes" },
    ...seats.map((seat) => ({ id: seat, label: seatLabel[seat] })),
  ];

  return (
    <div>
      <div className="sticky top-0 z-20 flex flex-wrap gap-1 border-b border-line bg-bg px-3 py-2">
        {chips.map((chip) => (
          <button
            key={chip.id}
            type="button"
            onClick={() => setFilter(chip.id)}
            className={clsx(
              "border px-2 py-0.5 text-[11px]",
              filter === chip.id
                ? "border-gold bg-gold/15 text-gold"
                : "border-line text-dim hover:text-muted",
            )}
          >
            {chip.label}
          </button>
        ))}
      </div>
      <ul className="divide-y divide-line">
        {rows.map((c) => {
          const take = stamps[c.slug];
          const sizeLine = sizeVsMine(c.peakSize, size);
          return (
            <li key={c.slug} className="flex gap-3 px-3 py-3 hover:bg-panel-2">
              <Link href={collabHref(c.slug)} className="flex min-w-0 flex-1 gap-3 no-underline">
                <LookThumb slug={c.slug} ticker={c.ticker} className="h-16 w-24" />
                <div className="min-w-0 flex-1">
                  <h2 className="font-cond text-[17px] leading-tight tracking-wide text-ink">
                    {c.name}
                  </h2>
                  <p className="mt-0.5 text-[12px] text-muted">
                    {c.colorway} · {collabStatusLabel[c.status]}
                  </p>
                  <p className={`mt-1.5 text-[13px] tabular ${c.last ? "text-ink" : "text-dim"}`}>
                    {vsRetailLine(c)}
                  </p>
                  {sizeLine ? (
                    <p
                      className={`mt-1 text-[12px] ${
                        sizeLine.startsWith("Hottest size is yours")
                          ? "text-gold"
                          : "text-dim"
                      }`}
                    >
                      {sizeLine}
                    </p>
                  ) : null}
                  {endorsed.has(c.slug) && take ? (
                    <p className="mt-1.5 text-[13px] leading-5 text-gold-2">{take}</p>
                  ) : null}
                </div>
              </Link>
              <div className="shrink-0 pt-0.5">
                <DeskActions slug={c.slug} compact />
              </div>
            </li>
          );
        })}
      </ul>
      {rows.length === 0 ? (
        <p className="px-3 py-6 text-[13px] text-dim">
          Nothing in this slice. Watch a collab from All, or pick another seat.
        </p>
      ) : null}
    </div>
  );
}
