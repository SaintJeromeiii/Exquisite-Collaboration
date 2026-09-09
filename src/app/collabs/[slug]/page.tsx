import Link from "next/link";
import { notFound } from "next/navigation";
import { CollabDeskBar } from "@/components/CollabDeskBar";
import { Panel } from "@/components/Panel";
import { PriceChart } from "@/components/PriceChart";
import { SizeBook } from "@/components/SizeBook";
import { collabs, getCollab, premium, relatedCollabs } from "@/data/market";
import { cnDelta, signedPct, usd } from "@/lib/format";

export function generateStaticParams() {
  return collabs.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = getCollab(slug);
  if (!c) return { title: "Name not listed — EXQ Desk" };
  return {
    title: `${c.ticker} — ${c.name} | EXQ Desk`,
    description: c.thesis,
  };
}

export default async function CollabPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = getCollab(slug);
  if (!c) notFound();
  const prem = premium(c);
  const samePartner = collabs.filter((x) => x.partner === c.partner && x.slug !== c.slug);
  const related = relatedCollabs(c);
  const relatedTitle = samePartner.length ? "Same partner strip" : "Same seat";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="grid grid-cols-2 border-b border-line lg:grid-cols-[1.4fr_repeat(4,minmax(0,0.7fr))]">
        <div className="col-span-2 border-b border-line px-4 py-3 lg:col-span-1 lg:border-b-0 lg:border-r">
          <div className="flex items-baseline gap-3">
            <span className="font-cond text-3xl tracking-wide text-gold-2">
              {c.ticker}
            </span>
            <span className="font-mono text-[10px] tracking-[0.16em] text-dim uppercase">
              {c.status}
            </span>
          </div>
          <h1 className="mt-1 text-[15px] text-ink">{c.name}</h1>
          <p className="font-mono text-[11px] text-muted">
            {c.colorway} · dropped {c.dropDate}
          </p>
          <CollabDeskBar slug={c.slug} seat={c.seat} />
        </div>
        <Stat label="Last" value={c.last ? usd(c.last) : "PRE"} delta={c.changePct} />
        <Stat label="Retail" value={usd(c.retail)} />
        <Stat
          label="Exp. ROC"
          value={c.last ? signedPct(prem, 1) : "—"}
          delta={prem}
          asDelta
        />
        <Stat
          label="Peak size"
          value={`US ${c.peakSize}`}
          note={c.sizePremiumPct ? `+${c.sizePremiumPct.toFixed(1)}% loc` : undefined}
        />
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.85fr)]">
        <Panel
          kicker="PX"
          title="Last print series"
          action="Volume in bars · close in line"
          className="border-t-0 border-l-0 max-lg:border-r-0"
          bodyClassName="p-2"
        >
          <PriceChart data={c.series} height={280} />
        </Panel>
        <Panel
          kicker="BOOK"
          title="Size book"
          action="Bid / ask by US men’s"
          className="border-t-0 border-r-0 max-lg:border-l-0"
          bodyClassName="overflow-auto"
        >
          <SizeBook levels={c.sizes} />
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3">
        <Panel
          kicker="THS"
          title="Desk thesis"
          className="border-l-0 max-lg:border-r-0"
          bodyClassName="space-y-3 p-4 text-[13px] leading-6 text-muted"
        >
          <p className="text-ink">{c.thesis}</p>
          <p>{c.strategy}</p>
          <ul className="space-y-1 font-mono text-[11px] text-dim">
            {c.notes.map((n) => (
              <li key={n}>· {n}</li>
            ))}
          </ul>
        </Panel>
        <Panel kicker="SPEC" title="Construction" bodyClassName="p-4">
          <div className="kicker">Materials</div>
          <ul className="mt-2 space-y-1 text-[13px] text-ink">
            {c.materials.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
          <div className="kicker mt-4">Alpha channels</div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {c.channels.map((ch) => (
              <span
                key={ch}
                className="border border-line px-2 py-1 font-mono text-[10px] tracking-[0.12em] text-gold uppercase"
              >
                {ch}
              </span>
            ))}
          </div>
          <div className="kicker mt-4">Scarcity</div>
          <div className="mt-2 flex items-center gap-3">
            <div className="h-1.5 flex-1 bg-bg">
              <div className="h-1.5 bg-gold" style={{ width: `${c.scarcity}%` }} />
            </div>
            <span className="font-mono text-[12px] text-gold tabular">{c.scarcity}</span>
          </div>
        </Panel>
        <Panel
          kicker="REL"
          title={relatedTitle}
          className="border-r-0 max-lg:border-l-0"
          bodyClassName="p-0"
        >
          {related.length ? (
            <ul className="divide-y divide-line">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={`/collabs/${r.slug}`}
                    className="block px-4 py-3 no-underline hover:bg-panel-2"
                  >
                    <div className="flex items-baseline justify-between">
                      <span className="font-cond text-[15px] tracking-wide text-gold-2">
                        {r.ticker}
                      </span>
                      <span className={`font-mono text-[12px] tabular ${cnDelta(r.changePct)}`}>
                        {r.last ? usd(r.last) : "PRE"}
                      </span>
                    </div>
                    <div className="text-[12px] text-muted">{r.silhouette}</div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="p-4 font-mono text-[11px] text-dim">
              Only name on this partner/seat. Follow it from the desk bar to keep
              it on coverage.
            </p>
          )}
        </Panel>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  delta,
  asDelta,
  note,
}: {
  label: string;
  value: string;
  delta?: number;
  asDelta?: boolean;
  note?: string;
}) {
  return (
    <div className="border-line px-4 py-3 max-lg:border-b lg:border-r lg:last:border-r-0">
      <div className="kicker">{label}</div>
      <div
        className={`mt-1 font-cond text-2xl tracking-wide tabular ${
          asDelta && delta != null ? cnDelta(delta) : "text-ink"
        }`}
      >
        {value}
      </div>
      {delta != null && !asDelta ? (
        <div className={`font-mono text-[11px] tabular ${cnDelta(delta)}`}>
          {signedPct(delta)}
        </div>
      ) : note ? (
        <div className="font-mono text-[11px] text-dim">{note}</div>
      ) : null}
    </div>
  );
}
