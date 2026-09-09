"use client";

import Link from "next/link";
import { premium, seatLabel, type CollabSeat } from "@/data/market";
import { collabHref } from "@/lib/collab-path";
import { useDesk } from "@/lib/desk-book";
import { clsx } from "@/lib/format";

export function PremiumHeatmap() {
  const { listed } = useDesk();
  const brands = Array.from(new Set(listed.map((c) => c.brand)));
  const seats = (
    ["celebrity", "athlete", "boutique", "designer", "retailer", "brand"] as CollabSeat[]
  ).filter((seat) => listed.some((c) => c.seat === seat));

  function cell(seat: CollabSeat, brand: string) {
    const names = listed.filter((c) => c.seat === seat && c.brand === brand && c.last > 0);
    if (!names.length) return null;
    const avg = names.reduce((sum, c) => sum + premium(c), 0) / names.length;
    const top = [...names].sort((a, b) => premium(b) - premium(a))[0];
    return { avg, top, n: names.length };
  }

  function tone(p: number) {
    if (p >= 60) return "bg-up/35 text-up";
    if (p >= 30) return "bg-up/15 text-up";
    if (p > 0) return "bg-gold/15 text-gold-2";
    if (p === 0) return "bg-panel-2 text-dim";
    return "bg-down/20 text-down";
  }

  return (
    <div className="overflow-x-auto p-3">
      <table className="w-full min-w-[420px] border-collapse">
        <thead>
          <tr>
            <th className="px-2 py-1 text-left font-mono text-[10px] tracking-[0.12em] text-dim font-normal">
              Seat \ Brand
            </th>
            {brands.map((b) => (
              <th
                key={b}
                className="px-2 py-1 text-center font-mono text-[10px] tracking-[0.1em] text-muted font-normal"
              >
                {b}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {seats.map((seat) => (
            <tr key={seat}>
              <td className="px-2 py-1 font-mono text-[11px] text-muted">
                {seatLabel[seat]}
              </td>
              {brands.map((brand) => {
                const data = cell(seat, brand);
                return (
                  <td key={brand} className="p-1">
                    {data ? (
                      <Link
                        href={collabHref(data.top.slug)}
                        className={clsx(
                          "block px-2 py-2 text-center font-mono text-[11px] tabular no-underline",
                          tone(data.avg),
                        )}
                        title={`${data.n} name${data.n > 1 ? "s" : ""} · avg premium`}
                      >
                        {data.avg.toFixed(0)}%
                      </Link>
                    ) : (
                      <div className="px-2 py-2 text-center font-mono text-[11px] text-dim">
                        ·
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 font-mono text-[10px] tracking-[0.06em] text-dim">
        Cell = average last vs retail by seat. Click through to the richest name in
        the cell. Source: live desk book.
      </p>
    </div>
  );
}
