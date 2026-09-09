export type DeskCity = "nyc" | "london" | "tokyo";

export type DeskPrefs = {
  size: string;
  city: DeskCity | "";
};

export const PREFS_KEY = "exq.desk.prefs.v1";
export const TAKE_HINT_KEY = "exq.take.hint.v1";

export const SIZE_OPTIONS = [
  "8",
  "8.5",
  "9",
  "9.5",
  "10",
  "10.5",
  "11",
  "11.5",
  "12",
  "13",
];

export const CITY_OPTIONS: { id: DeskCity; label: string }[] = [
  { id: "nyc", label: "NYC" },
  { id: "london", label: "London" },
  { id: "tokyo", label: "Tokyo" },
];

export const emptyPrefs: DeskPrefs = { size: "", city: "" };

export function normalizeSize(raw: string) {
  return raw.replace(/^US\s+/i, "").trim();
}

export function sizesMatch(a: string, b: string) {
  const left = normalizeSize(a);
  const right = normalizeSize(b);
  return Boolean(left && right && left === right);
}

export function parsePrefs(raw: unknown): DeskPrefs | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const size = typeof o.size === "string" ? o.size : "";
  const city =
    o.city === "nyc" || o.city === "london" || o.city === "tokyo" ? o.city : "";
  return { size, city };
}

export function loadPrefs(): DeskPrefs {
  try {
    const raw = window.localStorage.getItem(PREFS_KEY);
    if (!raw) return emptyPrefs;
    return parsePrefs(JSON.parse(raw)) ?? emptyPrefs;
  } catch {
    return emptyPrefs;
  }
}

export function savePrefs(prefs: DeskPrefs) {
  try {
    window.localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // private mode / quota
  }
}
