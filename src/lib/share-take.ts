import type { Collab, DropEvent } from "@/data/market";
import { formatDay, windowStatusLabel } from "@/lib/copy";
import type { DeskCity } from "@/lib/desk-prefs";
import { accessLabel, whereFor } from "@/lib/where";

export function shareTakeText(
  collab: Collab,
  take: string,
  calendar: DropEvent[],
  city: DeskCity | "" = "",
) {
  const guess = whereFor(collab, calendar, city);
  const raw = take.trim() || collab.thesis.split(".")[0]?.trim() || "";
  const why = raw ? (/[.!?]$/.test(raw) ? raw : `${raw}.`) : null;
  const doors = guess.doors
    .slice(0, 4)
    .map((d) => `${d.name} (${accessLabel[d.access]})`)
    .join("; ");

  return [
    collab.name,
    why,
    guess.next
      ? `Next: ${formatDay(guess.next.date)} · ${guess.next.name} · ${windowStatusLabel[guess.next.status]}`
      : null,
    doors ? `Where: ${doors}` : null,
    guess.follow.length ? `Follow ${guess.follow.join(", ")}` : null,
    "No store. Just the take. — Exquisite",
  ]
    .filter(Boolean)
    .join("\n");
}
