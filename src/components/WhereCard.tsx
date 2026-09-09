"use client";

import { Panel } from "@/components/Panel";
import type { Collab, DropEvent } from "@/data/market";
import { formatDay, windowStatusLabel } from "@/lib/copy";
import { accessLabel, accessTone, whereFor } from "@/lib/where";

export function WhereCard({
  collab,
  calendar,
}: {
  collab: Collab;
  calendar: DropEvent[];
}) {
  const guess = whereFor(collab, calendar);

  return (
    <Panel
      title="Where to buy"
      kicker="Guess"
      className="border-x-0"
      bodyClassName="p-4"
      fill={false}
    >
      <p className="text-[13px] leading-5 text-muted">{guess.how}</p>
      <p className="mt-2 text-[12px] leading-5 text-dim">
        Not a store. Not live stock. If a pair is exclusive, the shop is the
        door — you cannot check out from here.
      </p>
      {guess.next ? (
        <p className="mt-3 text-[13px] text-ink">
          Next window: {formatDay(guess.next.date)} · {guess.next.name} ·{" "}
          {windowStatusLabel[guess.next.status]}
        </p>
      ) : null}
      <ul className="mt-3 divide-y divide-line border border-line">
        {guess.doors.map((door) => (
          <li key={door.name} className="px-3 py-2.5">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-[14px] text-ink">{door.name}</span>
              <span className={`text-[12px] ${accessTone[door.access]}`}>
                {accessLabel[door.access]}
              </span>
            </div>
            <p className="mt-0.5 text-[12px] leading-5 text-dim">{door.line}</p>
          </li>
        ))}
      </ul>
      {guess.follow.length ? (
        <p className="mt-3 text-[12px] leading-5 text-muted">
          Follow {guess.follow.join(", ")}. The drop time usually hits their
          social first.
        </p>
      ) : null}
    </Panel>
  );
}
