import { isoDay } from "@/lib/desk-when";

export type DateHit = {
  date: string;
  source: string;
  snippet: string;
};

const MONTHS: Record<string, string> = {
  january: "01",
  jan: "01",
  february: "02",
  feb: "02",
  march: "03",
  mar: "03",
  april: "04",
  apr: "04",
  may: "05",
  june: "06",
  jun: "06",
  july: "07",
  jul: "07",
  august: "08",
  aug: "08",
  september: "09",
  sept: "09",
  sep: "09",
  october: "10",
  oct: "10",
  november: "11",
  nov: "11",
  december: "12",
  dec: "12",
};

function plausible(iso: string) {
  const day = isoDay(iso);
  if (!day) return false;
  const year = Number(day.slice(0, 4));
  return year >= 2025 && year <= 2028;
}

function toIso(year: string, month: string, day: string) {
  const mm = month.padStart(2, "0");
  const dd = day.padStart(2, "0");
  const iso = `${year}-${mm}-${dd}`;
  const d = new Date(`${iso}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return "";
  if (d.toISOString().slice(0, 10) !== iso) return "";
  return plausible(iso) ? iso : "";
}

/** Pull calendar days out of a post, email, or search snippet. */
export function datesFromText(raw: string, source = "Pasted text"): DateHit[] {
  const text = raw.replace(/\s+/g, " ").trim();
  if (!text) return [];
  const found = new Map<string, DateHit>();

  function add(iso: string, snippet: string) {
    if (!iso || found.has(iso)) return;
    found.set(iso, { date: iso, source, snippet: snippet.slice(0, 180) });
  }

  for (const m of text.matchAll(/\b(20\d{2})-(\d{2})-(\d{2})\b/g)) {
    add(toIso(m[1], m[2], m[3]), m[0]);
  }
  for (const m of text.matchAll(
    /\b(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sept?|Oct|Nov|Dec)\.?\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(20\d{2})\b/gi,
  )) {
    const month = MONTHS[m[1].toLowerCase().replace(".", "")];
    if (month) add(toIso(m[3], month, m[2]), m[0]);
  }
  for (const m of text.matchAll(
    /\b(\d{1,2})(?:st|nd|rd|th)?\s+(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sept?|Oct|Nov|Dec)\.?,?\s+(20\d{2})\b/gi,
  )) {
    const month = MONTHS[m[2].toLowerCase().replace(".", "")];
    if (month) add(toIso(m[3], month, m[1]), m[0]);
  }

  return Array.from(found.values()).sort((a, b) => a.date.localeCompare(b.date));
}

function decode(html: string) {
  return html
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseDuckHits(html: string): DateHit[] {
  const blocks = html.split(/class="result__/);
  const hits: DateHit[] = [];
  const seen = new Set<string>();
  for (const block of blocks.slice(0, 12)) {
    const title = decode(block.match(/result__a[^>]*>([\s\S]*?)<\/a>/i)?.[1] ?? "");
    const snippet = decode(
      block.match(/result__snippet[^>]*>([\s\S]*?)<\/(?:a|td|div)/i)?.[1] ?? "",
    );
    const blob = `${title} ${snippet}`;
    for (const hit of datesFromText(blob, title || "Web search")) {
      if (seen.has(hit.date)) continue;
      seen.add(hit.date);
      hits.push({ ...hit, snippet: snippet || hit.snippet });
    }
  }
  return hits.slice(0, 5);
}

export async function lookupReleaseDates(query: string): Promise<{
  hits: DateHit[];
  error?: string;
}> {
  const q = query.replace(/\s+/g, " ").trim();
  if (!q) return { hits: [], error: "Need a shoe name to search." };
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(`${q} release date drop`)}`;
  try {
    const res = await fetch(url, {
      headers: { Accept: "text/html" },
    });
    if (!res.ok) {
      return {
        hits: [],
        error: "Search did not answer. Paste a line from the shop post, or type the date.",
      };
    }
    const html = await res.text();
    const hits = parseDuckHits(html);
    if (!hits.length) {
      return {
        hits: [],
        error:
          "No date in those results. Paste a line from the shop or partner post, or type it.",
      };
    }
    return { hits };
  } catch {
    return {
      hits: [],
      error:
        "Search could not run here. Paste a line from the shop post, or type the date.",
    };
  }
}
