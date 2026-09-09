"use client";

import { useEffect, useState } from "react";
import { TAKE_HINT_KEY } from "@/lib/desk-prefs";

export function TakeHint() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      setShow(window.localStorage.getItem(TAKE_HINT_KEY) !== "1");
    } catch {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  return (
    <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-3">
      <p className="text-[13px] leading-5 text-muted">
        <span className="text-ink">Watch</span> saves a name.{" "}
        <span className="text-ink">Take</span> is your sentence on why.{" "}
        <span className="text-ink">When</span> is the calendar.
      </p>
      <button
        type="button"
        className="shrink-0 text-[12px] text-gold"
        onClick={() => {
          try {
            window.localStorage.setItem(TAKE_HINT_KEY, "1");
          } catch {
            // private mode
          }
          setShow(false);
        }}
      >
        Got it
      </button>
    </div>
  );
}
