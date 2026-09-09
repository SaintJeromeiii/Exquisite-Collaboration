import type { SizeLevel } from "@/data/market";
import { clsx, usd } from "@/lib/format";

export function SizeBook({ levels }: { levels: SizeLevel[] }) {
  const maxVol = Math.max(...levels.map((l) => l.volume), 1);

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-line font-mono text-[10px] tracking-[0.14em] text-dim uppercase">
            <th className="px-3 py-2 font-normal">Size</th>
            <th className="px-3 py-2 text-right font-normal">Bid</th>
            <th className="px-3 py-2 text-right font-normal">Ask</th>
            <th className="px-3 py-2 text-right font-normal">Sprd</th>
            <th className="px-3 py-2 font-normal">Depth</th>
          </tr>
        </thead>
        <tbody>
          {levels.map((l) => {
            const spread = l.ask - l.bid;
            return (
              <tr
                key={l.size}
                className={clsx("border-b border-line/70", l.peak && "bg-line/50")}
              >
                <td className="px-3 py-1.5 font-mono text-[12px]">
                  {l.size}
                  {l.peak ? (
                    <span className="ml-2 font-mono text-[9px] tracking-[0.14em] text-gold">
                      PEAK
                    </span>
                  ) : null}
                </td>
                <td className="px-3 py-1.5 text-right font-mono text-[12px] text-up tabular">
                  {usd(l.bid)}
                </td>
                <td className="px-3 py-1.5 text-right font-mono text-[12px] text-down tabular">
                  {usd(l.ask)}
                </td>
                <td className="px-3 py-1.5 text-right font-mono text-[12px] text-muted tabular">
                  {usd(spread)}
                </td>
                <td className="px-3 py-1.5">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 flex-1 bg-bg">
                      <div
                        className={clsx("h-1.5", l.peak ? "bg-gold" : "bg-line-2")}
                        style={{ width: `${(l.volume / maxVol) * 100}%` }}
                      />
                    </div>
                    <span className="w-6 text-right font-mono text-[10px] text-dim tabular">
                      {l.volume}
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
