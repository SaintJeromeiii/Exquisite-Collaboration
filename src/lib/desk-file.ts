import {
  calendar as seedCalendar,
  collabs as seedCollabs,
  prints as seedPrints,
  seriesFrom,
  sizeBook,
  type Collab,
  type CollabSeat,
  type DropEvent,
  type Print,
  type SessionStatus,
} from "@/data/market";

export const DESK_FILE_VERSION = 2;
export const DESK_REMOTE_URLS = [
  "https://raw.githubusercontent.com/SaintJeromeiii/Exquisite-Collaboration/main/docs/desk/book.json",
  "https://cdn.jsdelivr.net/gh/SaintJeromeiii/Exquisite-Collaboration@main/docs/desk/book.json",
];

export const seedSlugs = new Set(seedCollabs.map((c) => c.slug));

export type ExtraDraft = {
  slug: string;
  ticker: string;
  name: string;
  partner: string;
  seat: CollabSeat;
  brand: string;
  silhouette: string;
  colorway: string;
  retail: number;
  last: number;
  changePct: number;
  volume24h: number;
  peakSize: string;
  sizePremiumPct: number;
  dropDate: string;
  status: SessionStatus;
  scarcity: number;
  channels: string[];
  materials: string[];
  thesis: string;
  strategy: string;
  notes: string[];
};

export type CollabPatch = Partial<
  Omit<ExtraDraft, "slug" | "ticker">
>;

export type DeskFile = {
  v: number;
  updatedAt: string;
  killed: string[];
  extras: ExtraDraft[];
  patches: Record<string, CollabPatch>;
  followed: string[];
  endorsed: string[];
  stamps: Record<string, string>;
  calendar: DropEvent[] | null;
  prints: Print[] | null;
};

export function emptyDeskFile(): DeskFile {
  return {
    v: DESK_FILE_VERSION,
    updatedAt: new Date().toISOString(),
    killed: [],
    extras: [],
    patches: {},
    followed: [],
    endorsed: [],
    stamps: {},
    calendar: null,
    prints: null,
  };
}

export function slugFromTicker(ticker: string) {
  return ticker
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function collabFromDraft(d: ExtraDraft): Collab {
  const px = d.last || d.retail || 100;
  return {
    ...d,
    series: seriesFrom(d.ticker, d.dropDate || "2026-09-09", 40, px, px),
    sizes: sizeBook(d.peakSize || "10", px, d.ticker),
  };
}

export function draftFromCollab(c: Collab): ExtraDraft {
  return {
    slug: c.slug,
    ticker: c.ticker,
    name: c.name,
    partner: c.partner,
    seat: c.seat,
    brand: c.brand,
    silhouette: c.silhouette,
    colorway: c.colorway,
    retail: c.retail,
    last: c.last,
    changePct: c.changePct,
    volume24h: c.volume24h,
    peakSize: c.peakSize,
    sizePremiumPct: c.sizePremiumPct,
    dropDate: c.dropDate,
    status: c.status,
    scarcity: c.scarcity,
    channels: [...c.channels],
    materials: [...c.materials],
    thesis: c.thesis,
    strategy: c.strategy,
    notes: [...c.notes],
  };
}

function applyPatch(c: Collab, patch: CollabPatch): Collab {
  const next: Collab = {
    ...c,
    ...patch,
    slug: c.slug,
    ticker: c.ticker,
    channels: patch.channels ?? c.channels,
    materials: patch.materials ?? c.materials,
    notes: patch.notes ?? c.notes,
  };
  if (patch.last != null && patch.last !== c.last) {
    const px = next.last || next.retail || 100;
    next.sizes = sizeBook(next.peakSize, px, next.ticker);
    if (next.series.length) {
      next.series = next.series.map((bar, i, arr) =>
        i === arr.length - 1 ? { ...bar, c: px } : bar,
      );
    }
  }
  return next;
}

export function parseDeskFile(raw: unknown): DeskFile | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (o.followed && !("v" in o) && !("patches" in o)) {
    const followed = Array.isArray(o.followed) ? o.followed.filter((x) => typeof x === "string") : [];
    const endorsed = Array.isArray(o.endorsed) ? o.endorsed.filter((x) => typeof x === "string") : [];
    return { ...emptyDeskFile(), followed, endorsed };
  }
  const file = emptyDeskFile();
  file.updatedAt = typeof o.updatedAt === "string" ? o.updatedAt : file.updatedAt;
  file.killed = Array.isArray(o.killed) ? o.killed.filter((x) => typeof x === "string") : [];
  file.followed = Array.isArray(o.followed) ? o.followed.filter((x) => typeof x === "string") : [];
  file.endorsed = Array.isArray(o.endorsed) ? o.endorsed.filter((x) => typeof x === "string") : [];
  file.stamps =
    o.stamps && typeof o.stamps === "object" && !Array.isArray(o.stamps)
      ? Object.fromEntries(
          Object.entries(o.stamps as Record<string, unknown>).filter(
            (entry): entry is [string, string] => typeof entry[1] === "string",
          ),
        )
      : {};
  file.patches =
    o.patches && typeof o.patches === "object" && !Array.isArray(o.patches)
      ? (o.patches as Record<string, CollabPatch>)
      : {};
  file.extras = Array.isArray(o.extras) ? (o.extras as ExtraDraft[]) : [];
  file.calendar = Array.isArray(o.calendar) ? (o.calendar as DropEvent[]) : null;
  file.prints = Array.isArray(o.prints) ? (o.prints as Print[]) : null;
  return file;
}

export type ResolvedDesk = {
  listed: Collab[];
  all: Collab[];
  killed: Set<string>;
  calendar: DropEvent[];
  prints: Print[];
};

const SEED_COPY_KEYS = ["thesis", "strategy"] as const;

/** Empty write-up patches from an accidental wipe should not hide the original. */
export function restoreWipedSeedCopy(file: DeskFile): DeskFile {
  let changed = false;
  const patches: Record<string, CollabPatch> = {};
  for (const [slug, patch] of Object.entries(file.patches)) {
    const seed = seedCollabs.find((c) => c.slug === slug);
    if (!seed) {
      patches[slug] = patch;
      continue;
    }
    const next: CollabPatch = { ...patch };
    for (const key of SEED_COPY_KEYS) {
      const val = next[key];
      if (typeof val === "string" && val.trim() === "" && seed[key].trim()) {
        delete next[key];
        changed = true;
      }
    }
    patches[slug] = next;
  }
  return changed ? { ...file, patches } : file;
}

export function resolveDesk(file: DeskFile): ResolvedDesk {
  const bySlug = new Map<string, Collab>();
  for (const c of seedCollabs) bySlug.set(c.slug, c);
  for (const extra of file.extras) {
    if (!extra?.slug || !extra?.ticker) continue;
    bySlug.set(extra.slug, collabFromDraft(extra));
  }
  for (const [slug, patch] of Object.entries(file.patches)) {
    const current = bySlug.get(slug);
    if (current) bySlug.set(slug, applyPatch(current, patch));
  }
  const killed = new Set(file.killed);
  const all = Array.from(bySlug.values());
  const listed = all.filter((c) => !killed.has(c.slug));
  return {
    listed,
    all,
    killed,
    calendar: file.calendar ?? seedCalendar,
    prints: file.prints ?? seedPrints,
  };
}

export async function fetchRemoteDeskFile(): Promise<DeskFile | null> {
  for (const url of DESK_REMOTE_URLS) {
    try {
      const res = await fetch(`${url}?t=${Date.now()}`, { cache: "no-store" });
      if (!res.ok) continue;
      const parsed = parseDeskFile(await res.json());
      if (parsed) return parsed;
    } catch {
      // try next host
    }
  }
  return null;
}
