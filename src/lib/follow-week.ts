import type { Collab, DropEvent } from "@/data/market";
import { whereFor } from "@/lib/where";

function addDays(iso: string, days: number) {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function followThisWeek(
  listed: Collab[],
  calendar: DropEvent[],
  todayIso: string,
) {
  const end = addDays(todayIso, 7);
  const names: string[] = [];
  const seen = new Set<string>();

  calendar
    .filter(
      (ev) => ev.status !== "closed" && ev.date >= todayIso && ev.date <= end,
    )
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .forEach((ev) => {
      const match = listed.find((c) => c.ticker === ev.ticker);
      if (!match) return;
      for (const name of whereFor(match).follow) {
        if (seen.has(name)) continue;
        seen.add(name);
        names.push(name);
      }
    });

  return names.slice(0, 6);
}
