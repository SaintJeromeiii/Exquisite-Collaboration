"use client";

import { DeskActions } from "@/components/DeskActions";
import { seatLabel, type CollabSeat } from "@/data/market";
import { useDesk } from "@/lib/desk-book";

export function CollabDeskBar({
  slug,
  seat,
}: {
  slug: string;
  seat: CollabSeat;
}) {
  const { endorsed, followed, stamps, setStamp } = useDesk();
  const stamped = endorsed.has(slug);
  const watching = followed.has(slug);
  const note = stamps[slug] ?? "";

  return (
    <div className="mt-3 space-y-2">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-[12px] text-dim">{seatLabel[seat]}</span>
        {watching ? <span className="text-[12px] text-gold">Watching</span> : null}
        {stamped ? <span className="text-[12px] text-up">Your take</span> : null}
        <DeskActions slug={slug} />
      </div>
      {stamped ? (
        <label className="block">
          <span className="text-[12px] text-muted">The take</span>
          <textarea
            value={note}
            onChange={(e) => setStamp(slug, e.target.value)}
            rows={2}
            placeholder="Why this pair — size, channel, hold or fade."
            className="mt-1 w-full resize-y border border-line bg-bg px-2 py-1.5 font-sans text-[13px] leading-5 text-ink outline-none focus:border-gold"
          />
        </label>
      ) : null}
    </div>
  );
}
