import Link from "next/link";
import type { Collab } from "@/data/market";
import { premium } from "@/data/market";
import { cnDelta, signedPct, usd } from "@/lib/format";

export function TickerTape({ names }: { names: Collab[] }) {
  const row = names.filter((c) => c.last > 0);
  const doubled = [...row, ...row];

  return (
    <div className="relative z-0 overflow-hidden border-b border-line bg-panel-2">
      <div className="tape-track flex w-max gap-8 py-1.5 pr-8">
        {doubled.map((c, i) => (
          <Link
            key={`${c.ticker}-${i}`}
            href={`/collabs/${c.slug}`}
            className="flex items-baseline gap-2 whitespace-nowrap font-mono text-[11px] no-underline"
          >
            <span className="font-cond text-[13px] tracking-wide text-gold-2">
              {c.ticker}
            </span>
            <span className="tabular text-ink">{usd(c.last)}</span>
            <span className={`tabular ${cnDelta(c.changePct)}`}>
              {signedPct(c.changePct)}
            </span>
            <span className="text-dim">{signedPct(premium(c), 0)} prem</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
