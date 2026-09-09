import { deskStats } from "@/data/market";
import { compactUsd, cnDelta, signedPct, signedUsd } from "@/lib/format";

const items = [
  {
    kicker: "EXQCI",
    label: "Collab composite",
    value: deskStats.index.toLocaleString("en-US", { minimumFractionDigits: 1 }),
    delta: `${signedUsd(deskStats.indexChange)}  ${signedPct(deskStats.indexChangePct)}`,
    n: deskStats.indexChangePct,
  },
  {
    kicker: "PREM",
    label: "Premium index",
    value: `${deskStats.premiumIdx.toFixed(1)}%`,
    delta: "Last − retail, equal weight",
    n: 1,
  },
  {
    kicker: "ADV",
    label: "Tape volume",
    value: compactUsd(deskStats.adv),
    delta: "24h estimated notional",
    n: 0,
  },
  {
    kicker: "OPEN",
    label: "Live windows",
    value: String(deskStats.openDrops),
    delta: `${deskStats.names} names on the board`,
    n: 0,
  },
];

export function KpiStrip() {
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
