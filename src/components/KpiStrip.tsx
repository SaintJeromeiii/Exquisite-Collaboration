"use client";

import { indexSeries } from "@/data/market";
import { deskKpis, useDesk } from "@/lib/desk-book";
import { compactUsd, cnDelta, signedPct, signedUsd } from "@/lib/format";

export function KpiStrip() {
  const { listed, calendar } = useDesk();
  const live = deskKpis(listed, calendar);
  const last = indexSeries[indexSeries.length - 1]?.c ?? 1846.2;
  const items = [
    {
      kicker: "EXQCI",
      label: "Collab composite",
      value: last.toLocaleString("en-US", { minimumFractionDigits: 1 }),
      delta: `${signedUsd(26.4)}  ${signedPct(1.45)}`,
      n: 1.45,
    },
    {
      kicker: "PREM",
      label: "Premium index",
      value: `${live.premiumIdx.toFixed(1)}%`,
      delta: "Last − retail, equal weight",
      n: 1,
    },
    {
      kicker: "ADV",
      label: "Tape volume",
      value: compactUsd(live.adv),
      delta: "24h estimated notional",
      n: 0,
    },
    {
      kicker: "OPEN",
      label: "Live windows",
      value: String(live.openDrops),
      delta: `${live.names} names on the board`,
      n: 0,
    },
  ];

  return (
    <div className="grid grid-cols-2 border-b border-line lg:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.kicker}
          className="border-line px-4 py-3 not-last:border-r max-lg:odd:border-r max-lg:[&:nth-child(-n+2)]:border-b"
        >
          <div className="kicker">{item.kicker}</div>
          <div className="mt-1 flex items-baseline gap-3">
            <span className="font-cond text-3xl leading-none font-semibold tracking-wide tabular">
              {item.value}
            </span>
            <span className={`font-mono text-[11px] tabular ${cnDelta(item.n)}`}>
              {item.n !== 0 ? item.delta : null}
            </span>
          </div>
          <div className="mt-1 font-mono text-[10px] tracking-[0.08em] text-dim">
            {item.n === 0 ? item.delta : item.label}
          </div>
        </div>
      ))}
    </div>
  );
}
