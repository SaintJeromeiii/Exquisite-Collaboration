"use client";

import { clsx } from "@/lib/format";
import { useDeskBook } from "@/lib/desk-book";

export function DeskActions({
  slug,
  compact = false,
}: {
  slug: string;
  compact?: boolean;
}) {
  const { ready, followed, endorsed, follow, unfollow, endorse, revoke } =
    useDeskBook();
  const watching = followed.has(slug);
  const stamped = endorsed.has(slug);

  return (
    <div className={clsx("flex items-center gap-1", compact && "justify-end")}>
      <button
        type="button"
        disabled={!ready}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (watching) unfollow(slug);
          else follow(slug);
        }}
        className={clsx(
          "border px-1.5 py-0.5 text-[11px]",
          watching
            ? "border-gold bg-gold/15 text-gold"
            : "border-line text-dim hover:border-line-2 hover:text-muted",
        )}
        title={watching ? "Stop watching" : "Watch this collab"}
      >
        {watching ? "Watching" : "Watch"}
      </button>
      <button
        type="button"
        disabled={!ready}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (stamped) revoke(slug);
          else endorse(slug);
        }}
        className={clsx(
          "border px-1.5 py-0.5 text-[11px]",
          stamped
            ? "border-up bg-up/15 text-up"
            : "border-line text-dim hover:border-line-2 hover:text-muted",
        )}
        title={stamped ? "Remove your take" : "Put a take on this collab"}
      >
        {stamped ? "Taken" : "Take"}
      </button>
    </div>
  );
}
