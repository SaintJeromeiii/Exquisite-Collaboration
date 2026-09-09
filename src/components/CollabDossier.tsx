"use client";

import Link from "next/link";
import { CollabDeskBar } from "@/components/CollabDeskBar";
import { LookPane } from "@/components/LookPane";
import { LookThumb } from "@/components/LookThumb";
import { Panel } from "@/components/Panel";
import { SizeBook } from "@/components/SizeBook";
import { WhereCard } from "@/components/WhereCard";
import { premium, type Collab } from "@/data/market";
import { collabHref } from "@/lib/collab-path";
import { collabStatusLabel, formatDay, vsRetailShort } from "@/lib/copy";
import { useDesk } from "@/lib/desk-book";
import { collabLooks } from "@/lib/looks";
import { usd } from "@/lib/format";

export function CollabDossier({ slug }: { slug: string }) {
  const { get, listed, ready, endorsed, stamps, calendar } = useDesk();
  const c = get(slug);
  if (!ready && !c) {
    return <p className="p-4 text-[13px] text-dim">Loading…</p>;
  }
  if (!c) {
    return (
      <div className="px-4 py-8">
        <p className="text-[13px] text-muted">
          This collab is not on the board. Add it from Desk.
        </p>
      </div>
    );
  }

  const prem = premium(c);
  const call = stamps[c.slug];
  const samePartner = listed.filter((x) => x.partner === c.partner && x.slug !== c.slug);
  const related = samePartner.length
    ? samePartner
    : listed.filter((x) => x.seat === c.seat && x.slug !== c.slug).slice(0, 4);
  const relatedTitle = samePartner.length ? `More from ${c.partner}` : "Related";

  return (
    <div className="flex flex-col">
      <div className="border-b border-line px-4 py-3">
        <p className="text-[12px] text-dim">
          {collabStatusLabel[c.status]}
          {c.dropDate ? ` · dropped ${formatDay(c.dropDate)}` : ""}
        </p>
        <h1 className="mt-1 font-cond text-2xl tracking-wide text-ink">{c.name}</h1>
        <p className="mt-1 text-[13px] text-muted">{c.colorway}</p>
      </div>

      <LookPane ticker={c.ticker} colorway={c.colorway} looks={collabLooks(c.slug)} />

      <div className="border-b border-line px-4 py-3">
        {endorsed.has(c.slug) && call ? (
          <p className="text-[16px] leading-6 text-gold-2">{call}</p>
        ) : endorsed.has(c.slug) ? (
          <p className="text-[13px] text-muted">Call is on. Write why below.</p>
        ) : (
          <p className="text-[13px] text-muted">
            Watch to save it. Call when you have a reason.
          </p>
        )}
        <CollabDeskBar slug={c.slug} seat={c.seat} />
      </div>

      <div className="grid grid-cols-2 border-b border-line lg:grid-cols-4">
        <Stat label="Last sale" value={c.last ? usd(c.last) : "—"} />
        <Stat label="Retail" value={usd(c.retail)} />
        <Stat label="Vs retail" value={vsRetailShort(c)} hot={prem} />
        <Stat
          label="Hottest size"
          value={`US ${c.peakSize}`}
          note={
            c.sizePremiumPct
              ? `${c.sizePremiumPct.toFixed(0)}% more than other sizes`
              : undefined
          }
        />
      </div>

      <WhereCard collab={c} calendar={calendar} />

      <ThesisPanel c={c} />

      <Panel
        title="What sizes cost more"
        className="border-x-0"
        bodyClassName="max-h-72 overflow-auto lg:max-h-none"
        fill={false}
      >
        <SizeBook levels={c.sizes} />
      </Panel>

      <Panel
        title={relatedTitle}
        className="border-x-0 border-b-0"
        bodyClassName="p-0"
        fill={false}
      >
        {related.length ? (
          <ul className="divide-y divide-line">
            {related.map((r) => (
              <li key={r.slug}>
                <Link
                  href={collabHref(r.slug)}
                  className="flex items-center gap-3 px-4 py-3 no-underline hover:bg-panel-2"
                >
                  <LookThumb slug={r.slug} ticker={r.ticker} className="h-12 w-[4.5rem]" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[14px] text-ink">{r.name}</div>
                    <div className="text-[12px] text-muted">
                      {r.last ? usd(r.last) : "No resale yet"}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="p-4 text-[13px] text-dim">No other names in this group yet.</p>
        )}
      </Panel>
    </div>
  );
}

function ThesisPanel({ c }: { c: Collab }) {
  return (
    <Panel
      title="Why it matters"
      className="border-x-0"
      bodyClassName="space-y-3 p-4 text-[14px] leading-6 text-muted"
      fill={false}
    >
      <p className="text-ink">{c.thesis}</p>
      <p>{c.strategy}</p>
      {c.materials.length ? (
        <p className="text-[13px] text-dim">{c.materials.join(" · ")}</p>
      ) : null}
    </Panel>
  );
}

function Stat({
  label,
  value,
  note,
  hot,
}: {
  label: string;
  value: string;
  note?: string;
  hot?: number;
}) {
  return (
    <div className="border-line px-4 py-3 max-lg:border-b lg:border-r lg:last:border-r-0">
      <div className="text-[11px] text-dim">{label}</div>
      <div
        className={`mt-1 font-cond text-xl tracking-wide tabular ${
          hot != null && hot !== 0 ? (hot > 0 ? "text-up" : "text-down") : "text-ink"
        }`}
      >
        {value}
      </div>
      {note ? <div className="mt-0.5 text-[11px] text-dim">{note}</div> : null}
    </div>
  );
}
