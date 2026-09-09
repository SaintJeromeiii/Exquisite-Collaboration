"use client";

import Link from "next/link";
import { useState } from "react";
import { DeskActions } from "@/components/DeskActions";
import { Panel } from "@/components/Panel";
import { SeatBadge } from "@/components/SeatBadge";
import { Sparkline } from "@/components/Sparkline";
import {
  listedCollabs,
  premium,
  seatLabel,
  type Collab,
  type CollabSeat,
} from "@/data/market";
import { useDeskBook } from "@/lib/desk-book";
import { clsx, cnDelta, signedPct, usd } from "@/lib/format";

type SortKey = "ticker" | "last" | "prem" | "size" | "vol";
type LedgerFilter = "all" | "followed" | "endorsed" | CollabSeat;

export default function LedgerPage() {
  const { followed, endorsed } = useDeskBook();
  const [sort, setSort] = useState<SortKey>("prem");
  const [filter, setFilter] = useState<LedgerFilter>("all");

  const rows = listedCollabs().filter((c) => {
    if (filter === "all") return true;
    if (filter === "followed") return followed.has(c.slug);
    if (filter === "endorsed") return endorsed.has(c.slug);
    return c.seat === filter;
  });
  rows.sort((a, b) => {
    if (sort === "ticker") return a.ticker.localeCompare(b.ticker);
    if (sort === "last") return b.last - a.last;
    if (sort === "prem") return premium(b) - premium(a);
    if (sort === "size") return b.sizePremiumPct - a.sizePremiumPct;
    return b.volume24h - a.volume24h;
  });

  const chips: { id: LedgerFilter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "followed", label: "Flw" },
    { id: "endorsed", label: "End" },
    { id: "celebrity", label: "Celebrity" },
    { id: "athlete", label: "Athlete" },
    { id: "boutique", label: "Boutique" },
    { id: "designer", label: "Designer" },
    { id: "retailer", label: "Retailer" },
    { id: "brand", label: "Brand" },
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b border-line px-4 py-3">
        <div className="kicker">F3 · Expected return ledger</div>
        <h1 className="mt-1 font-cond text-2xl tracking-wide text-ink">
          Capital without the box
        </h1>
        <p className="mt-1 max-w-3xl text-[13px] leading-5 text-muted">
          Every collab seat is on this book — celebrity, athlete, boutique,
          designer, retailer, brand-on-brand. Follow to cover. Endorse to stamp.
          ROC is last versus retail.
        </p>
        <div className="mt-3 flex flex-wrap gap-1">
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
      </div>
      <Panel
        kicker="ROC"
        title="Last vs retail · size premium · alpha channel"
        action="Desk model · 09 Sep 2026"
        className="min-h-0 flex-1 border-0"
        bodyClassName="overflow-auto"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] border-collapse text-left">
            <thead>
              <tr className="border-b border-line font-mono text-[10px] tracking-[0.12em] text-dim uppercase">
                <Th active={sort === "ticker"} onClick={() => setSort("ticker")}>
                  Ticker
                </Th>
                <th className="px-3 py-2 font-normal">Seat</th>
                <th className="px-3 py-2 font-normal">Collaboration</th>
                <Th active={sort === "last"} onClick={() => setSort("last")} right>
                  Last
                </Th>
                <th className="px-3 py-2 text-right font-normal">Retail</th>
                <Th active={sort === "prem"} onClick={() => setSort("prem")} right>
                  Exp. ROC
                </Th>
                <Th active={sort === "size"} onClick={() => setSort("size")}>
                  Peak size
                </Th>
                <Th active={sort === "vol"} onClick={() => setSort("vol")} right>
                  ADV
                </Th>
                <th className="px-3 py-2 font-normal">Core channel / strategy</th>
                <th className="px-3 py-2 font-normal">Desk</th>
                <th className="px-3 py-2 font-normal">Curve</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <LedgerRow key={c.ticker} c={c} />
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

function Th({
  children,
  onClick,
  active,
  right,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active: boolean;
  right?: boolean;
}) {
  return (
    <th className={clsx("px-3 py-2 font-normal", right && "text-right")}>
      <button
        type="button"
        onClick={onClick}
        className={clsx(
          "tracking-[0.12em] uppercase",
          active ? "text-gold" : "text-dim hover:text-muted",
        )}
      >
        {children}
      </button>
    </th>
  );
}

function LedgerRow({ c }: { c: Collab }) {
  const prem = premium(c);
  return (
    <tr className="border-b border-line/80 hover:bg-panel-2">
      <td className="px-3 py-3">
        <Link
          href={`/collabs/${c.slug}`}
          className="font-cond text-[15px] tracking-wide text-gold-2 no-underline"
        >
          {c.ticker}
        </Link>
      </td>
      <td className="px-3 py-3">
        <SeatBadge seat={c.seat} />
        <div className="font-mono text-[9px] tracking-[0.08em] text-dim uppercase">
          {seatLabel[c.seat]}
        </div>
      </td>
      <td className="px-3 py-3">
        <div className="text-[13px]">{c.name}</div>
        <div className="font-mono text-[10px] text-dim">
          {c.partner} · {c.colorway} · {c.dropDate}
        </div>
      </td>
      <td className="px-3 py-3 text-right font-mono text-[13px] tabular">
        {c.last ? usd(c.last) : "PRE"}
      </td>
      <td className="px-3 py-3 text-right font-mono text-[12px] text-muted tabular">
        {usd(c.retail)}
      </td>
      <td
        className={`px-3 py-3 text-right font-mono text-[13px] tabular ${cnDelta(prem)}`}
      >
        {c.last ? signedPct(prem, 1) : "—"}
      </td>
      <td className="px-3 py-3 font-mono text-[12px]">
        US {c.peakSize}
        <span className="ml-2 text-gold">+{c.sizePremiumPct.toFixed(1)}%</span>
      </td>
      <td className="px-3 py-3 text-right font-mono text-[12px] text-muted tabular">
        {c.volume24h ? usd(c.volume24h) : "—"}
      </td>
      <td className="max-w-[300px] px-3 py-3 text-[12px] leading-5 text-muted">
        {c.strategy}
      </td>
      <td className="px-3 py-3">
        <DeskActions slug={c.slug} compact />
      </td>
      <td className="px-3 py-3">
        <Sparkline values={c.series.map((p) => p.c)} width={96} />
      </td>
    </tr>
  );
}
