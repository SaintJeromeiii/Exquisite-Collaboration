import { CoverageStrip } from "@/components/CoverageStrip";
import { Panel } from "@/components/Panel";

export default function BookPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b border-line px-4 py-3">
        <div className="kicker">F4 · Desk book</div>
        <h1 className="mt-1 font-cond text-2xl tracking-wide text-ink">
          Coverage and stamps
        </h1>
        <p className="mt-1 max-w-3xl text-[13px] leading-5 text-muted">
          Follow any collab to put it on coverage. Endorse to publish a desk
          stamp — your call as the expert. Celebrity is one seat. Boutique,
          designer, athlete, retailer, and brand-on-brand are the rest of the
          board.
        </p>
      </div>
      <Panel
        kicker="BOOK"
        title="Followed names · endorsed names"
        action="Stored on this desk"
        className="min-h-0 flex-1 border-0"
        bodyClassName="overflow-auto"
      >
        <CoverageStrip />
      </Panel>
    </div>
  );
}
