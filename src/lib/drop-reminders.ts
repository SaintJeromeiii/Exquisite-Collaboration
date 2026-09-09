import type { Collab, DropEvent } from "@/data/market";
import { collabHref } from "@/lib/collab-path";
import { windowStatusLabel } from "@/lib/copy";
import { upcomingOpen } from "@/lib/when-grid";

const PREF_KEY = "exq.when.reminders.v1";
const WEB_SHOWN_KEY = "exq.when.reminders.shown.v1";
export const REMINDER_IDS_KEY = "exq.when.reminder.ids.v1";

export type ReminderName = Pick<Collab, "ticker" | "slug" | "name">;

export type ReminderPref = {
  enabled: boolean;
};

export type ReminderSyncResult = {
  ok: boolean;
  count: number;
  native: boolean;
  denied?: boolean;
};

export function loadReminderPref(): ReminderPref {
  try {
    const raw = window.localStorage.getItem(PREF_KEY);
    if (!raw) return { enabled: false };
    const parsed = JSON.parse(raw) as ReminderPref;
    return { enabled: Boolean(parsed.enabled) };
  } catch {
    return { enabled: false };
  }
}

export function saveReminderPref(pref: ReminderPref) {
  window.localStorage.setItem(PREF_KEY, JSON.stringify(pref));
}

function notifId(ev: DropEvent) {
  let h = 0;
  const s = `${ev.date}:${ev.ticker}:${ev.name}`;
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) | 0;
  return 810000 + (Math.abs(h) % 90000);
}

function remindAt(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const morningOf = new Date(y, m - 1, d, 9, 0, 0);
  const dayBefore = new Date(morningOf);
  dayBefore.setDate(dayBefore.getDate() - 1);
  const now = Date.now();
  if (dayBefore.getTime() > now + 60_000) return dayBefore;
  if (morningOf.getTime() > now + 60_000) return morningOf;
  return null;
}

function dropHref(ev: DropEvent, listed: ReminderName[]) {
  const slug = listed.find((c) => c.ticker === ev.ticker)?.slug;
  return slug ? collabHref(slug) : "/when/";
}

function extraHref(extra: unknown): string | null {
  if (!extra || typeof extra !== "object") return null;
  const href = (extra as { href?: unknown }).href;
  return typeof href === "string" && href.startsWith("/") ? href : null;
}

export async function syncDropReminders(
  calendar: DropEvent[],
  listed: ReminderName[],
): Promise<ReminderSyncResult> {
  const pref = loadReminderPref();
  const upcoming = upcomingOpen(calendar);

  try {
    const { Capacitor } = await import("@capacitor/core");
    if (Capacitor.isNativePlatform()) {
      const { LocalNotifications } = await import("@capacitor/local-notifications");
      const pending = await LocalNotifications.getPending();
      const ours = pending.notifications.filter(
        (n) => (n.extra as { kind?: string } | undefined)?.kind === "drop",
      );
      if (ours.length) {
        await LocalNotifications.cancel({
          notifications: ours.map((n) => ({ id: n.id })),
        });
      }
      if (!pref.enabled) return { ok: true, count: 0, native: true };

      const perm = await LocalNotifications.requestPermissions();
      if (perm.display !== "granted") {
        saveReminderPref({ enabled: false });
        return { ok: false, count: 0, native: true, denied: true };
      }

      const notifications = upcoming.flatMap((ev) => {
        const at = remindAt(ev.date);
        if (!at) return [];
        const match = listed.find((c) => c.ticker === ev.ticker);
        return [
          {
            id: notifId(ev),
            title: `${match?.name ?? ev.ticker} is close`,
            body: `${windowStatusLabel[ev.status]} · ${ev.name} · ${ev.channel}`,
            extra: { kind: "drop", href: dropHref(ev, listed) },
            schedule: { at, allowWhileIdle: true },
            autoCancel: true,
            isExactNotification: false,
          },
        ];
      });

      if (notifications.length) {
        await LocalNotifications.schedule({ notifications });
      }
      window.localStorage.setItem(
        REMINDER_IDS_KEY,
        JSON.stringify(notifications.map((n) => n.id)),
      );
      return { ok: true, count: notifications.length, native: true };
    }
  } catch {
    // fall through to web
  }

  if (!pref.enabled) return { ok: true, count: 0, native: false };
  pingWebIfNear(upcoming, listed);
  return { ok: true, count: upcoming.length, native: false };
}

function pingWebIfNear(upcoming: DropEvent[], listed: ReminderName[]) {
  if (typeof Notification === "undefined" || Notification.permission !== "granted") {
    return;
  }
  let shown: Record<string, boolean> = {};
  try {
    shown = JSON.parse(window.localStorage.getItem(WEB_SHOWN_KEY) || "{}") as Record<
      string,
      boolean
    >;
  } catch {
    shown = {};
  }
  const now = Date.now();
  for (const ev of upcoming) {
    const key = `${ev.date}:${ev.ticker}`;
    const at = remindAt(ev.date);
    if (!at || shown[key]) continue;
    const ms = at.getTime() - now;
    if (ms > 0 && ms < 36 * 60 * 60 * 1000) {
      const match = listed.find((c) => c.ticker === ev.ticker);
      try {
        new Notification(`${match?.name ?? ev.ticker} is close`, {
          body: `${windowStatusLabel[ev.status]} · ${ev.channel}`,
        });
        shown[key] = true;
      } catch {
        // ignored
      }
    }
  }
  window.localStorage.setItem(WEB_SHOWN_KEY, JSON.stringify(shown));
}

export async function enableReminders(
  calendar: DropEvent[],
  listed: ReminderName[],
) {
  saveReminderPref({ enabled: true });
  return syncDropReminders(calendar, listed);
}

export async function disableReminders(
  calendar: DropEvent[],
  listed: ReminderName[],
) {
  saveReminderPref({ enabled: false });
  return syncDropReminders(calendar, listed);
}

export { extraHref };
