"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { LookThumb } from "@/components/LookThumb";
import type { DropEvent } from "@/data/market";
import { collabHref } from "@/lib/collab-path";
import { formatDay, windowStatusLabel } from "@/lib/copy";
import { useDesk } from "@/lib/desk-book";
import { accessLabel, whereFor } from "@/lib/where";
import {
  headsTitle,
  headsToShow,
  snoozeHeadsUntilLaterToday,
  thanksForHeadsUp,
} from "@/lib/heads-up";

export function OpenHeadsUp() {
  const { ready, calendar, listed } = useDesk();
  const [rows, setRows] = useState<DropEvent[]>([]);

  const consider = useCallback(() => {
    if (!ready) return;
    setRows((current) => (current.length ? current : headsToShow(calendar)));
  }, [ready, calendar]);

  useEffect(() => {
    consider();
  }, [consider]);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "visible") consider();
    };
    document.addEventListener("visibilitychange", onVis);
    let offApp: (() => void) | undefined;
    void (async () => {
      try {
        const { Capacitor } = await import("@capacitor/core");
        if (!Capacitor.isNativePlatform()) return;
        const { App } = await import("@capacitor/app");
        const handle = await App.addListener("appStateChange", ({ isActive }) => {
          if (isActive) consider();
        });
        offApp = () => {
          void handle.remove();
        };
      } catch {
        // web
      }
    })();
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      offApp?.();
    };
  }, [consider]);

  useEffect(() => {
    if (!rows.length) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        thanksForHeadsUp();
        setRows([]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [rows.length]);

  if (!rows.length) return null;

  const title = headsTitle(rows);

  function closeThanks() {
    thanksForHeadsUp();
    setRows([]);
  }

  function closeSnooze() {
    const until = snoozeHeadsUntilLaterToday();
    setRows([]);
    const wait = Math.max(0, until - Date.now());
    window.setTimeout(() => consider(), wait);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 px-4 pb-[max(1.5rem,env(safe-area-inset-bottom,0px))] pt-10 sm:items-center sm:pb-10">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="exq-heads-title"
        className="w-full max-w-md border border-line bg-panel shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
      >
        <div className="border-b border-line px-4 py-3">
          <p className="font-mono text-[10px] tracking-[0.18em] text-gold uppercase">
            Heads-up
          </p>
          <h2
            id="exq-heads-title"
            className="exq-display mt-1 text-3xl text-ink"
          >
            {title}
          </h2>
          <p className="mt-1 text-[13px] leading-5 text-muted">
            A window on the desk is close. No phone ping — just this, when you
            open EXQ.
          </p>
        </div>
        <ul className="divide-y divide-line">
          {rows.map((ev) => {
            const match = listed.find((c) => c.ticker === ev.ticker);
            const door = match ? whereFor(match, []).doors[0] : null;
            const inner = (
              <>
                {match ? (
                  <LookThumb
                    slug={match.slug}
                    ticker={match.ticker}
                    className="h-14 w-20"
                  />
                ) : null}
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-[12px] text-muted">{formatDay(ev.date)}</span>
                    <span className="text-[12px] text-gold">
                      {windowStatusLabel[ev.status]}
                    </span>
                  </div>
                  <div className="mt-0.5 font-cond text-[17px] tracking-wide text-gold-2">
                    {match?.name ?? ev.name}
                  </div>
                  <div className="mt-0.5 text-[12px] text-dim">
                    {ev.channel}
                    {door ? ` · ${accessLabel[door.access]}` : ""}
                    {match ? ` · ${ev.name}` : ""}
                  </div>
                </div>
              </>
            );
            return (
              <li key={`${ev.date}-${ev.ticker}-${ev.name}`}>
                {match ? (
                  <Link
                    href={collabHref(match.slug)}
                    onClick={closeThanks}
                    className="flex gap-3 px-4 py-3 no-underline"
                  >
                    {inner}
                  </Link>
                ) : (
                  <div className="flex gap-3 px-4 py-3">{inner}</div>
                )}
              </li>
            );
          })}
        </ul>
        <div className="flex flex-col gap-2 border-t border-line p-3">
          <button
            type="button"
            onClick={closeThanks}
            className="border border-gold bg-gold/15 px-3 py-2.5 text-[14px] text-gold"
          >
            Thanks for the heads-up
          </button>
          <button
            type="button"
            onClick={closeSnooze}
            className="border border-line px-3 py-2.5 text-[14px] text-muted hover:text-ink"
          >
            Remind me again later today
          </button>
        </div>
      </div>
    </div>
  );
}
