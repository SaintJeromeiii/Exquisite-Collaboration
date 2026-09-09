import type { Collab, DropEvent, SessionStatus } from "@/data/market";
import { premium } from "@/data/market";
import { usd } from "@/lib/format";

export const collabStatusLabel: Record<SessionStatus, string> = {
  "pre-market": "Coming",
  live: "Out now",
  secondary: "On resale",
  retired: "Archived",
};

export const windowStatusLabel: Record<DropEvent["status"], string> = {
  priced: "For sale",
  raffle: "Raffle",
  shock: "Surprise drop",
  closed: "Done",
};

export function formatDay(iso: string) {
  const d = new Date(`${iso}T12:00:00Z`);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(d);
}

export function vsRetailLine(c: Collab) {
  if (!c.last) return "No resale price yet";
  const p = premium(c);
  if (p > 0.5) {
    return `${usd(c.last)} · ${usd(c.retail)} retail · ${Math.round(p)}% over`;
  }
  if (p < -0.5) {
    return `${usd(c.last)} · ${usd(c.retail)} retail · ${Math.round(Math.abs(p))}% under`;
  }
  return `${usd(c.last)} · about retail (${usd(c.retail)})`;
}

export function vsRetailShort(c: Collab) {
  if (!c.last) return "No resale yet";
  const p = premium(c);
  if (p > 0.5) return `${Math.round(p)}% over retail`;
  if (p < -0.5) return `${Math.round(Math.abs(p))}% under retail`;
  return "About retail";
}
