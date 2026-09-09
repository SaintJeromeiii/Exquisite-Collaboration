import type { SizeLevel } from "@/data/market";
import { clsx, usd } from "@/lib/format";

export function SizeBook({ levels }: { levels: SizeLevel[] }) {
  const maxVol = Math.max(...levels.map((l) => l.volume), 1);

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-line text-[11px] text-dim">
            <th className="px-3 py-2 font-normal">Size</th>
            <th className="px-3 py-2 text-right font-normal">Buy</th>
            <th className="px-3 py-2 text-right font-normal">Sell</th>
            <th className="px-3 py-2 font-normal">Activity</th>
          </tr>
        </thead>
        <tbody>
          {levels.map((l) => (
            <tr
              key={l.size}
              className={clsx("border-b border-line/70", l.peak && "bg-line/50")}
            >
              <td className="px-3 py-1.5 text-[13px]">
                {l.size}
                {l.peak ? (
                  <span className="ml-2 text-[11px] text-gold">hottest</span>
                ) : null}
              </td>
              <td className="px-3 py-1.5 text-right text-[13px] text-up tabular">
                {usd(l.bid)}
              </td>
              <td className="px-3 py-1.5 text-right text-[13px] text-down tabular">
                {usd(l.ask)}
              </td>
              <td className="px-3 py-1.5">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 flex-1 bg-bg">
                    <div
                      className={clsx("h-1.5", l.peak ? "bg-gold" : "bg-line-2")}
                      style={{ width: `${(l.volume / maxVol) * 100}%` }}
                    />
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
