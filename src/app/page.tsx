import { DropCalendar } from "@/components/DropCalendar";
import { KpiStrip } from "@/components/KpiStrip";
import { Panel } from "@/components/Panel";
import { PremiumHeatmap } from "@/components/PremiumHeatmap";
import { PriceChart } from "@/components/PriceChart";
import { TimeSales } from "@/components/TimeSales";
import { Watchlist } from "@/components/Watchlist";
import { indexSeries } from "@/data/market";

export default function MarketPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <KpiStrip />
      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.9fr)]">
        <Panel
          kicker="F1"
          title="Watchlist · all collab seats"
          action="Follow / endorse any name"
          className="border-t-0 border-l-0 max-lg:border-r-0"
          bodyClassName="overflow-auto"
        >
          <Watchlist />
        </Panel>
        <Panel
          kicker="EXQCI"
          title="Composite · 90 session"
          action="Equal-weight last prints"
          className="border-t-0 border-r-0 max-lg:border-l-0"
          bodyClassName="p-2"
        >
          <PriceChart data={indexSeries} height={260} />
        </Panel>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3">
        <Panel
          kicker="HEAT"
          title="Premium by seat"
          action="Not celebrity-only"
          className="border-l-0 max-lg:border-r-0"
        >
          <PremiumHeatmap />
        </Panel>
        <Panel kicker="T&S" title="Time and sales" action="09 Sep 2026">
          <TimeSales limit={8} />
        </Panel>
        <Panel
          kicker="CAL"
          title="Windows"
          action="Raffle / shock / priced"
          className="border-r-0 max-lg:border-l-0"
        >
          <DropCalendar />
        </Panel>
      </div>
    </div>
  );
}
