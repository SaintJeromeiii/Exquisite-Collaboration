"use client";

import { useState } from "react";
import type { Collab, DropEvent } from "@/data/market";
import { useDeskPrefs } from "@/lib/desk-prefs-context";
import { shareTakeText } from "@/lib/share-take";

export function ShareTake({
  collab,
  take,
  calendar,
}: {
  collab: Collab;
  take: string;
  calendar: DropEvent[];
}) {
  const { city } = useDeskPrefs();
  const [msg, setMsg] = useState("");

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        className="border border-line px-1.5 py-0.5 text-[11px] text-dim hover:border-line-2 hover:text-muted"
        onClick={async () => {
          const text = shareTakeText(collab, take, calendar, city);
          try {
            if (navigator.share) {
              await navigator.share({ title: collab.name, text });
              setMsg("Shared.");
              return;
            }
          } catch (err) {
            if (err instanceof Error && err.name === "AbortError") return;
          }
          try {
            await navigator.clipboard.writeText(text);
            setMsg("Copied.");
          } catch {
            setMsg("Could not share.");
          }
        }}
      >
        Share
      </button>
      {msg ? <span className="text-[11px] text-gold">{msg}</span> : null}
    </div>
  );
}
