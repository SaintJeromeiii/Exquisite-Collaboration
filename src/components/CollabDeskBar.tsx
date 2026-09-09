"use client";

import { DeskActions } from "@/components/DeskActions";
import { SeatBadge } from "@/components/SeatBadge";
import { seatLabel, type CollabSeat } from "@/data/market";
import { useDeskBook } from "@/lib/desk-book";

export function CollabDeskBar({
  slug,
  seat,
}: {
  slug: string;
  seat: CollabSeat;
}) {
  const { endorsed, followed } = useDeskBook();
  const stamped = endorsed.has(slug);
  const covering = followed.has(slug);

  return (
    <div className="mt-3 flex flex-wrap items-center gap-3">
      <div className="flex items-baseline gap-2">
        <SeatBadge seat={seat} />
        <span className="font-mono text-[10px] tracking-[0.12em] text-dim uppercase">
          {seatLabel[seat]} seat
        </span>
      </div>
      {covering ? (
        <span className="font-mono text-[10px] tracking-[0.14em] text-gold uppercase">
          On coverage
        </span>
      ) : null}
      {stamped ? (
        <span className="font-mono text-[10px] tracking-[0.14em] text-up uppercase">
          Desk stamp
        </span>
      ) : null}
      <DeskActions slug={slug} />
    </div>
  );
}
