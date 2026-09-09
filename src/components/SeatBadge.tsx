import { seatShort, type CollabSeat } from "@/data/market";
import { clsx } from "@/lib/format";

export function SeatBadge({ seat }: { seat: CollabSeat }) {
  return (
    <span
      className={clsx(
        "font-mono text-[9px] tracking-[0.12em] uppercase",
        seat === "celebrity" && "text-gold",
        seat === "athlete" && "text-blue",
        seat === "boutique" && "text-ink",
        seat === "designer" && "text-gold-2",
        seat === "retailer" && "text-muted",
        seat === "brand" && "text-warn",
      )}
    >
      {seatShort[seat]}
    </span>
  );
}
