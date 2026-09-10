import type { Collab, DropEvent, SessionStatus } from "@/data/market";
import { localIso } from "@/lib/when-grid";

export function isoDay(value: string) {
  const m = value.trim().match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : "";
}

export function hasWindowOnDay(
  calendar: DropEvent[],
  ticker: string,
  date: string,
) {
  return calendar.some((ev) => ev.ticker === ticker && ev.date === date);
}

export function windowsForTicker(calendar: DropEvent[], ticker: string) {
  return calendar
    .filter((ev) => ev.ticker === ticker)
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date));
}

function releaseWindowName(collab: Pick<Collab, "colorway">) {
  const color = collab.colorway.trim();
  if (color && color !== "TBD") return color;
  return "Release";
}

export function windowStatusForDate(
  date: string,
  collabStatus: SessionStatus,
): DropEvent["status"] {
  const today = localIso();
  if (date < today || collabStatus === "secondary" || collabStatus === "retired") {
    return "closed";
  }
  return "priced";
}

export function releaseWindowFor(
  collab: Pick<Collab, "ticker" | "colorway" | "channels" | "status">,
  date: string,
): DropEvent {
  return {
    date,
    ticker: collab.ticker,
    name: releaseWindowName(collab),
    channel: collab.channels[0] || "Desk",
    status: windowStatusForDate(date, collab.status),
  };
}

/** Put a release on When. Same day is a no-op. Moving the date updates the old day. */
export function upsertReleaseWindow(
  calendar: DropEvent[],
  ticker: string,
  prevDate: string | undefined,
  next: DropEvent,
): DropEvent[] {
  const rows = calendar.slice();
  if (rows.some((ev) => ev.ticker === ticker && ev.date === next.date)) {
    return rows;
  }
  const prev = isoDay(prevDate ?? "");
  if (prev && prev !== next.date) {
    const old = rows.findIndex((ev) => ev.ticker === ticker && ev.date === prev);
    if (old >= 0) {
      rows[old] = { ...rows[old], date: next.date };
      return rows;
    }
  }
  return [...rows, next];
}
