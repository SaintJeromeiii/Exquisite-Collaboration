import Link from "next/link";
import { calendar } from "@/data/market";
import { clsx } from "@/lib/format";

const tone: Record<(typeof calendar)[number]["status"], string> = {
  priced: "text-blue",
  raffle: "text-gold",
  shock: "text-warn",
  closed: "text-dim",
};

export function DropCalendar() {
  return (
    <ul className="divide-y divide-line">
      {calendar.map((ev) => (
        <li key={`${ev.date}-${ev.ticker}-${ev.name}`} className="px-3 py-2">
          <div className="flex items-baseline justify-between gap-3">
            <span className="font-mono text-[11px] text-dim tabular">{ev.date.slice(5)}</span>
            <span className={clsx("font-mono text-[10px] tracking-[0.14em] uppercase", tone[ev.status])}>
              {ev.status}
            </span>
          </div>
          <div className="mt-0.5 font-cond text-[14px] tracking-wide text-gold-2">
            {ev.ticker}
          </div>
          <div className="text-[12px] text-ink">{ev.name}</div>
          <div className="font-mono text-[10px] tracking-[0.08em] text-dim uppercase">
            {ev.channel}
          </div>
        </li>
      ))}
      <li className="px-3 py-2">
        <Link
          href="/tape"
          className="font-mono text-[10px] tracking-[0.14em] text-muted uppercase no-underline hover:text-gold"
        >
          Full tape →
        </Link>
      </li>
    </ul>
  );
}
