import Link from "next/link";
import { collabs, prints } from "@/data/market";
import { clsx, usd } from "@/lib/format";

function hrefFor(ticker: string) {
  return `/collabs/${collabs.find((c) => c.ticker === ticker)?.slug ?? ""}`;
}

export function TimeSales({ limit }: { limit?: number }) {
  const rows = limit ? prints.slice(0, limit) : prints;

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-line font-mono text-[10px] tracking-[0.14em] text-dim uppercase">
            <th className="px-3 py-2 font-normal">Time</th>
            <th className="px-3 py-2 font-normal">Ticker</th>
            <th className="px-3 py-2 font-normal">Sz</th>
            <th className="px-3 py-2 text-right font-normal">Print</th>
            <th className="px-3 py-2 font-normal">Side</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p, i) => (
            <tr key={`${p.t}-${p.ticker}-${i}`} className="border-b border-line/70">
              <td className="px-3 py-1.5 font-mono text-[11px] text-dim tabular">{p.t}</td>
              <td className="px-3 py-1.5">
                <Link
                  href={hrefFor(p.ticker)}
                  className="font-cond text-[13px] tracking-wide text-gold-2 no-underline"
                >
                  {p.ticker}
                </Link>
              </td>
              <td className="px-3 py-1.5 font-mono text-[11px] text-muted">{p.size}</td>
              <td
                className={clsx(
                  "px-3 py-1.5 text-right font-mono text-[12px] tabular",
                  p.side === "buy" ? "text-up" : "text-down",
                )}
              >
                {usd(p.price)}
              </td>
              <td
                className={clsx(
                  "px-3 py-1.5 font-mono text-[10px] tracking-[0.12em] uppercase",
                  p.side === "buy" ? "text-up" : "text-down",
                )}
              >
                {p.side}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
