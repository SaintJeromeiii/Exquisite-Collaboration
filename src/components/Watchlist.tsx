"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { DeskActions } from "@/components/DeskActions";
import { SeatBadge } from "@/components/SeatBadge";
import { Sparkline } from "@/components/Sparkline";
import {
  listedCollabs,
  premium,
  seatLabel,
  seatsOnBoard,
  type Collab,
  type CollabSeat,
} from "@/data/market";
import { useDeskBook } from "@/lib/desk-book";
import { clsx, cnDelta, signedPct, usd } from "@/lib/format";

type BoardFilter = "all" | "followed" | "endorsed" | CollabSeat;

function statusLabel(c: Collab) {
  if (c.status === "pre-market") return "PRE";
  if (c.status === "retired") return "LEG";
  if (c.status === "live") return "LIVE";
  return "SEC";
}

export function Watchlist({ activeTicker }: { activeTicker?: string }) {
  const router = useRouter();
  const { followed, endorsed } = useDeskBook();
  const [filter, setFilter] = useState<BoardFilter>("all");
  const seats = seatsOnBoard();
  const rows = listedCollabs().filter((c) => {
    if (filter === "all") return true;
    if (filter === "followed") return followed.has(c.slug);
    if (filter === "endorsed") return endorsed.has(c.slug);
    return c.seat === filter;
  });

  const chips: { id: BoardFilter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "followed", label: "Flw" },
    { id: "endorsed", label: "End" },
    ...seats.map((seat) => ({ id: seat, label: seatLabel[seat] })),
  ];

  return (
    <div>
      <div className="sticky top-0 z-20 flex flex-wrap gap-1 border-b border-line bg-panel px-2 py-2">
        {chips.map((chip) => (
          <button
            key={chip.id}
            type="button"
            onClick={() => setFilter(chip.id)}
            className={clsx(
              "border px-2 py-0.5 font-mono text-[10px] tracking-[0.12em] uppercase",
              filter === chip.id
                ? "border-gold bg-gold/15 text-gold"
                : "border-line text-dim hover:text-muted",
            )}
          >
            {chip.label}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[880px] border-collapse text-left">
          <thead>
            <tr className="border-b border-line font-mono text-[10px] tracking-[0.14em] text-dim uppercase">
              <th className="px-3 py-2 font-normal">Ticker</th>
              <th className="px-3 py-2 font-normal">Seat</th>
              <th className="px-3 py-2 font-normal">Name</th>
              <th className="px-3 py-2 text-right font-normal">Last</th>
              <th className="px-3 py-2 text-right font-normal">Chg</th>
              <th className="px-3 py-2 text-right font-normal">Prem</th>
              <th className="px-3 py-2 font-normal">Peak sz</th>
              <th className="px-3 py-2 font-normal">Desk</th>
              <th className="px-3 py-2 font-normal">Tape</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => {
              const prem = premium(c);
              const active = c.ticker === activeTicker;
              return (
                <tr
                  key={c.ticker}
                  onClick={() => router.push(`/collabs/${c.slug}`)}
                  className={clsx(
                    "cursor-pointer border-b border-line/80 hover:bg-panel-2",
                    active && "bg-line/60",
                  )}
                >
                  <td className="px-3 py-2">
                    <div className="flex items-baseline gap-2">
                      <span className="font-cond text-[15px] tracking-wide text-gold-2">
                        {c.ticker}
                      </span>
                      <span className="font-mono text-[9px] tracking-[0.12em] text-dim">
                        {statusLabel(c)}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <SeatBadge seat={c.seat} />
                  </td>
                  <td className="px-3 py-2">
                    <Link
                      href={`/collabs/${c.slug}`}
                      className="block max-w-[240px] truncate text-[12px] text-ink no-underline"
                    >
                      {c.name}
                    </Link>
                    <div className="font-mono text-[10px] text-dim">
                      {c.partner} · {c.brand}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-[13px] tabular">
                    {c.last ? usd(c.last) : "—"}
                  </td>
                  <td
                    className={`px-3 py-2 text-right font-mono text-[12px] tabular ${cnDelta(c.changePct)}`}
                  >
                    {c.last ? signedPct(c.changePct) : "—"}
                  </td>
                  <td
                    className={`px-3 py-2 text-right font-mono text-[12px] tabular ${cnDelta(prem)}`}
                  >
                    {c.last ? signedPct(prem, 1) : "—"}
                  </td>
                  <td className="px-3 py-2 font-mono text-[12px] text-muted">
                    {c.peakSize}
                    {c.sizePremiumPct ? (
                      <span className="ml-1 text-gold">+{c.sizePremiumPct.toFixed(1)}</span>
                    ) : null}
                  </td>
                  <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                    <DeskActions slug={c.slug} compact />
                  </td>
                  <td className="px-3 py-2">
                    <Sparkline values={c.series.map((p) => p.c)} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {rows.length === 0 ? (
          <p className="px-3 py-6 font-mono text-[11px] tracking-[0.08em] text-dim">
            No names in this slice. Follow or endorse from All, or pick another seat.
          </p>
        ) : null}
      </div>
    </div>
  );
}
