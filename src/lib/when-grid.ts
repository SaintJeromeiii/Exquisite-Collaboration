import type { DropEvent } from "@/data/market";

export function localIso(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function monthLabel(year: number, month: number) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month, 1));
}

export function monthCells(year: number, month: number) {
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: { iso: string | null; day: number | null }[] = [];
  for (let i = 0; i < firstWeekday; i += 1) cells.push({ iso: null, day: null });
  for (let d = 1; d <= daysInMonth; d += 1) {
    const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({ iso, day: d });
  }
  while (cells.length % 7 !== 0) cells.push({ iso: null, day: null });
  return cells;
}

export function eventsOnDay(calendar: DropEvent[], iso: string) {
  return calendar
    .filter((ev) => ev.date === iso)
    .slice()
    .sort((a, b) => a.ticker.localeCompare(b.ticker));
}

export function dayMarks(calendar: DropEvent[]) {
  const map = new Map<string, { open: boolean; closed: boolean }>();
  for (const ev of calendar) {
    const cur = map.get(ev.date) ?? { open: false, closed: false };
    if (ev.status === "closed") cur.closed = true;
    else cur.open = true;
    map.set(ev.date, cur);
  }
  return map;
}

export function monthPrefix(year: number, month: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-`;
}

export function eventsInMonth(calendar: DropEvent[], year: number, month: number) {
  const prefix = monthPrefix(year, month);
  return calendar
    .filter((ev) => ev.date.startsWith(prefix))
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date) || a.ticker.localeCompare(b.ticker));
}

export function upcomingOpen(calendar: DropEvent[]) {
  return calendar
    .filter((ev) => ev.status !== "closed" && ev.date >= localIso())
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date) || a.ticker.localeCompare(b.ticker));
}

export function addLocalDays(iso: string, days: number) {
  const [y, m, d] = iso.split("-").map(Number);
  return localIso(new Date(y, m - 1, d + days));
}

export function nearOpen(calendar: DropEvent[], horizonDays = 3) {
  const today = localIso();
  const until = addLocalDays(today, horizonDays);
  return upcomingOpen(calendar).filter((ev) => ev.date <= until);
}
