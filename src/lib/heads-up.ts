import type { DropEvent } from "@/data/market";
import { addLocalDays, localIso, nearOpen } from "@/lib/when-grid";

const KEY = "exq.heads.v1";

export type HeadsState = {
  dismissedOn: string | null;
  snoozeUntil: number;
};

export function loadHeadsState(): HeadsState {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { dismissedOn: null, snoozeUntil: 0 };
    const parsed = JSON.parse(raw) as HeadsState;
    return {
      dismissedOn: typeof parsed.dismissedOn === "string" ? parsed.dismissedOn : null,
      snoozeUntil: Number(parsed.snoozeUntil) || 0,
    };
  } catch {
    return { dismissedOn: null, snoozeUntil: 0 };
  }
}

function saveHeadsState(state: HeadsState) {
  window.localStorage.setItem(KEY, JSON.stringify(state));
}

export function thanksForHeadsUp() {
  saveHeadsState({ dismissedOn: localIso(), snoozeUntil: 0 });
}

export function laterToday() {
  const now = Date.now();
  const fourHours = now + 4 * 60 * 60 * 1000;
  const evening = new Date();
  evening.setHours(21, 0, 0, 0);
  if (evening.getTime() > now + 30 * 60 * 1000) {
    return Math.min(fourHours, evening.getTime());
  }
  return now + 2 * 60 * 60 * 1000;
}

export function snoozeHeadsUntilLaterToday() {
  const until = laterToday();
  saveHeadsState({ dismissedOn: null, snoozeUntil: until });
  return until;
}

export function headsToShow(calendar: DropEvent[]) {
  const near = nearOpen(calendar);
  if (!near.length) return [];
  const today = localIso();
  const state = loadHeadsState();
  if (state.dismissedOn === today) return [];
  if (state.snoozeUntil > Date.now()) return [];
  return near;
}

export function headsTitle(rows: DropEvent[]) {
  const today = localIso();
  const tomorrow = addLocalDays(today, 1);
  const dates = Array.from(new Set(rows.map((ev) => ev.date)));
  if (dates.length === 1 && dates[0] === today) return "Out today";
  if (dates.length === 1 && dates[0] === tomorrow) return "Tomorrow";
  if (dates.every((d) => d === today || d === tomorrow)) return "Close";
  return "Coming up";
}
