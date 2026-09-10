"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Collab, DropEvent } from "@/data/market";
import { collabHref } from "@/lib/collab-path";
import { formatDay, sizeVsMine, windowStatusLabel } from "@/lib/copy";
import { useDesk } from "@/lib/desk-book";
import { useDeskPrefs } from "@/lib/desk-prefs-context";
import {
  disableReminders,
  enableReminders,
  loadReminderPref,
} from "@/lib/drop-reminders";
import { clsx } from "@/lib/format";
import {
  dayMarks,
  eventsInMonth,
  eventsOnDay,
  localIso,
  monthCells,
  monthLabel,
  monthPrefix,
} from "@/lib/when-grid";

const tone: Record<DropEvent["status"], string> = {
  priced: "text-blue",
  raffle: "text-gold",
  shock: "text-warn",
  closed: "text-dim",
};

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function DropCalendar() {
  const { calendar, listed, ready } = useDesk();
  const { size } = useDeskPrefs();
  const [today, setToday] = useState("");
  const [cursor, setCursor] = useState({ year: 0, month: 0 });
  const [selected, setSelected] = useState("");
  const [remind, setRemind] = useState(false);
  const [busy, setBusy] = useState(false);
  const [denied, setDenied] = useState(false);
  const [native, setNative] = useState(false);

  useEffect(() => {
    const d = new Date();
    const iso = localIso(d);
    setToday(iso);
    setCursor({ year: d.getFullYear(), month: d.getMonth() });
    setSelected(iso);
    setRemind(loadReminderPref().enabled);
    void import("@capacitor/core").then(({ Capacitor }) => {
      setNative(Capacitor.isNativePlatform());
    });
  }, []);

  const marks = useMemo(() => dayMarks(calendar), [calendar]);
  const cells = useMemo(
    () => monthCells(cursor.year, cursor.month),
    [cursor.year, cursor.month],
  );
  const monthRows = useMemo(
    () => eventsInMonth(calendar, cursor.year, cursor.month),
    [calendar, cursor.year, cursor.month],
  );
  const selectedRows = eventsOnDay(calendar, selected);
  const restUpcoming = monthRows.filter(
    (ev) => ev.status !== "closed" && ev.date !== selected && ev.date >= today,
  );
  const restDone = monthRows.filter(
    (ev) => ev.status === "closed" && ev.date !== selected,
  );

  if (!today) {
    return (
      <div className="px-4 py-6 text-[13px] text-dim">Loading the month…</div>
    );
  }

  function shiftMonth(delta: number) {
    const d = new Date(cursor.year, cursor.month + delta, 1);
    const year = d.getFullYear();
    const month = d.getMonth();
    const prefix = monthPrefix(year, month);
    setCursor({ year, month });
    if (!selected.startsWith(prefix)) {
      const inMonth = calendar
        .filter((ev) => ev.date.startsWith(prefix))
        .sort((a, b) => a.date.localeCompare(b.date));
      const nextOpen = inMonth.find((ev) => ev.status !== "closed" && ev.date >= today);
      setSelected(nextOpen?.date ?? inMonth[0]?.date ?? `${prefix}01`);
    }
  }

  async function toggleRemind() {
    if (!ready || busy) return;
    setBusy(true);
    const result = remind
      ? await disableReminders(calendar, listed)
      : await enableReminders(calendar, listed);
    setRemind(loadReminderPref().enabled);
    setDenied(Boolean(result.denied));
    setBusy(false);
  }

  return (
    <div>
      <div className="border-b border-line px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            className="border border-line px-2 py-1 text-[12px] text-muted hover:text-ink"
            aria-label="Previous month"
          >
            ‹
          </button>
          <h2 className="font-cond text-xl tracking-wide text-ink">
            {monthLabel(cursor.year, cursor.month)}
          </h2>
          <button
            type="button"
            onClick={() => shiftMonth(1)}
            className="border border-line px-2 py-1 text-[12px] text-muted hover:text-ink"
            aria-label="Next month"
          >
            ›
          </button>
        </div>
        <div className="mt-3 grid grid-cols-7 text-center text-[11px] text-dim">
          {weekdays.map((d) => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-px bg-line">
          {cells.map((cell, i) => {
            if (!cell.iso || cell.day == null) {
              return <div key={`empty-${i}`} className="min-h-11 bg-bg" />;
            }
            const mark = marks.get(cell.iso);
            const isToday = cell.iso === today;
            const isSelected = cell.iso === selected;
            return (
              <button
                key={cell.iso}
                type="button"
                onClick={() => setSelected(cell.iso!)}
                className={clsx(
                  "relative flex min-h-11 flex-col items-center justify-center text-[13px] tabular",
                  isSelected
                    ? "bg-gold/15 text-gold"
                    : cell.iso < today
                      ? "bg-bg text-dim"
                      : "bg-bg text-ink",
                  isToday && !isSelected && "ring-1 ring-inset ring-gold/70",
                )}
              >
                {cell.day}
                {mark ? (
                  <span className="absolute bottom-1 flex gap-0.5">
                    {mark.open ? (
                      <span className="block h-1 w-1 rounded-full bg-gold" />
                    ) : null}
                    {mark.closed ? (
                      <span className="block h-1 w-1 rounded-full bg-dim" />
                    ) : null}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
        <details className="mt-3">
          <summary className="cursor-pointer text-[12px] text-dim hover:text-muted">
            Phone ping if the app is closed
          </summary>
          <div className="mt-2 flex items-start justify-between gap-3">
            <button
              type="button"
              role="switch"
              aria-checked={remind}
              disabled={!ready || busy}
              onClick={() => void toggleRemind()}
              className={clsx(
                "border px-2 py-1 text-[12px]",
                remind
                  ? "border-gold bg-gold/15 text-gold"
                  : "border-line text-dim hover:text-muted",
              )}
            >
              {remind ? "Day-before ping on" : "Notify me the day before"}
            </button>
          </div>
          <p className="mt-2 text-[12px] leading-5 text-dim">
            {native
              ? "Optional. Most people skip this. If you want it, it pings at 9:00 the day before, on this phone only."
              : "Optional. The usual heads-up is the card when you open Exquisite. This extra ping only fires in the Android app."}
          </p>
          {denied ? (
            <p className="mt-1 text-[12px] text-warn">
              Notifications are off for Exquisite. Turn them on in system settings if
              you want the ping.
            </p>
          ) : null}
        </details>
      </div>

      <Section
        title={selected === today ? "Today" : formatDay(selected)}
        rows={selectedRows}
        listed={listed}
        mySize={size}
        empty="Nothing on this day."
      />
      <Section
        title="Coming up this month"
        rows={restUpcoming}
        listed={listed}
        mySize={size}
      />
      <Section
        title="Already happened"
        rows={restDone}
        listed={listed}
        mySize={size}
      />
    </div>
  );
}

function Section({
  title,
  rows,
  listed,
  mySize,
  empty = "Nothing here yet.",
}: {
  title: string;
  rows: DropEvent[];
  listed: Collab[];
  mySize: string;
  empty?: string;
}) {
  const hideEmptyBucket =
    (title === "Coming up this month" || title === "Already happened") &&
    rows.length === 0;

  if (hideEmptyBucket) return null;

  return (
    <section>
      <h2 className="border-b border-line px-4 py-2 text-[13px] text-muted">{title}</h2>
      {rows.length === 0 ? (
        <p className="px-4 py-3 text-[13px] text-dim">{empty}</p>
      ) : (
        <ul className="divide-y divide-line">
          {rows.map((ev) => {
            const match = listed.find((c) => c.ticker === ev.ticker);
            const sizeLine = match && mySize ? sizeVsMine(match.peakSize, mySize) : null;
            const inner = (
              <>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[13px] text-ink">{formatDay(ev.date)}</span>
                  <span className={clsx("text-[12px]", tone[ev.status])}>
                    {windowStatusLabel[ev.status]}
                  </span>
                </div>
                <div className="mt-1 font-cond text-[16px] tracking-wide text-gold-2">
                  {match?.name ?? ev.name}
                </div>
                {match ? (
                  <div className="mt-0.5 text-[12px] text-muted">{ev.name}</div>
                ) : null}
                <div className="mt-0.5 text-[12px] text-dim">{ev.channel}</div>
                {sizeLine ? (
                  <div
                    className={`mt-0.5 text-[12px] ${
                      sizeLine.startsWith("Hottest size is yours")
                        ? "text-gold"
                        : "text-dim"
                    }`}
                  >
                    {sizeLine}
                  </div>
                ) : null}
              </>
            );
            return (
              <li key={`${ev.date}-${ev.ticker}-${ev.name}`} className="px-4 py-3">
                {match ? (
                  <Link href={collabHref(match.slug)} className="block no-underline">
                    {inner}
                  </Link>
                ) : (
                  inner
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
