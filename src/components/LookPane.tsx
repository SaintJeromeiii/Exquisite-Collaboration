"use client";

import { useState } from "react";
import { Panel } from "@/components/Panel";
import { clsx } from "@/lib/format";
import type { Look } from "@/lib/looks";

export function LookPane({
  ticker,
  colorway,
  looks,
}: {
  ticker: string;
  colorway: string;
  looks: Look[];
}) {
  const [i, setI] = useState(0);
  const [failed, setFailed] = useState<Record<string, boolean>>({});
  const available = looks.filter((item) => !failed[item.src]);
  const look = available[Math.min(i, Math.max(available.length - 1, 0))];

  if (!look) {
    return (
      <Panel
        title="Looks"
        action="No photo on file"
        className="border-t-0 border-x-0"
        bodyClassName="p-4"
        fill={false}
      >
        <p className="text-[13px] text-dim">
          Side and three-quarter stills go in public/looks when you have rights
          to the pair.
        </p>
      </Panel>
    );
  }

  return (
    <Panel
      title="Looks"
      action={look.label}
      className="border-t-0 border-x-0"
      bodyClassName="p-0"
      fill={false}
    >
      <div className="bg-bg">
        <img
          src={look.src}
          alt={`${ticker} ${colorway} ${look.label}`}
          className="mx-auto h-[260px] w-full object-contain lg:h-[320px]"
          onError={() => setFailed((m) => ({ ...m, [look.src]: true }))}
        />
      </div>
      {available.length > 1 ? (
        <div className="flex items-center gap-1.5 border-t border-line px-2 py-2">
          {available.map((item, index) => (
            <button
              key={item.src}
              type="button"
              onClick={() => setI(index)}
              className={clsx(
                "border bg-bg p-0.5",
                index === i ? "border-gold" : "border-line hover:border-muted",
              )}
              aria-label={`${item.label} look`}
            >
              <img
                src={item.src}
                alt=""
                className="h-10 w-16 object-cover"
                onError={() => setFailed((m) => ({ ...m, [item.src]: true }))}
              />
            </button>
          ))}
          <span className="ml-auto text-[11px] text-dim">
            {Math.min(i, available.length - 1) + 1} / {available.length}
          </span>
        </div>
      ) : null}
    </Panel>
  );
}
