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
  const isFollowed = followed.has(slug);
  const isEndorsed = endorsed.has(slug);

  return (
    <div className={clsx("flex items-center gap-1", compact && "justify-end")}>
      <button
        type="button"
        disabled={!ready}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (isFollowed) unfollow(slug);
          else follow(slug);
        }}
        className={clsx(
          "border px-1.5 py-0.5 font-mono text-[9px] tracking-[0.14em] uppercase",
          isFollowed
            ? "border-gold bg-gold/15 text-gold"
            : "border-line text-dim hover:border-line-2 hover:text-muted",
        )}
        title={
          isFollowed
            ? "Remove from coverage"
            : "Follow — add this collab to your desk coverage"
        }
      >
        Flw
      </button>
      <button
        type="button"
        disabled={!ready}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (isEndorsed) revoke(slug);
          else endorse(slug);
        }}
        className={clsx(
          "border px-1.5 py-0.5 font-mono text-[9px] tracking-[0.14em] uppercase",
          isEndorsed
            ? "border-up bg-up/15 text-up"
            : "border-line text-dim hover:border-line-2 hover:text-muted",
        )}
        title={
          isEndorsed
            ? "Revoke desk stamp"
            : "Endorse — put your stamp on this collab"
        }
      >
        End
      </button>
    </div>
  );
}
