import type { CollabSeat, DropEvent } from "@/data/market";

const KEY = "exq.desk.draft.v1";

export type NameDraft = {
  ticker: string;
  name: string;
  partner: string;
  brand: string;
  seat: CollabSeat;
};

export type CalDraft = {
  date: string;
  ticker: string;
  name: string;
  channel: string;
  status: DropEvent["status"];
};

export type DeskDrafts = {
  name: NameDraft;
  cal: CalDraft;
};

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function emptyDeskDrafts(): DeskDrafts {
  return {
    name: { ticker: "", name: "", partner: "", brand: "", seat: "boutique" },
    cal: {
      date: todayIso(),
      ticker: "",
      name: "",
      channel: "",
      status: "raffle",
    },
  };
}

export function loadDeskDrafts(): DeskDrafts {
  const empty = emptyDeskDrafts();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as Partial<DeskDrafts>;
    return {
      name: { ...empty.name, ...parsed.name },
      cal: { ...empty.cal, ...parsed.cal },
    };
  } catch {
    return empty;
  }
}

export function writeDeskDrafts(drafts: DeskDrafts) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(drafts));
  } catch {
    // private mode / quota
  }
}
