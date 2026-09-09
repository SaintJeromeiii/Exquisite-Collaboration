import { DropCalendar } from "@/components/DropCalendar";
import { Panel } from "@/components/Panel";
import { TimeSales } from "@/components/TimeSales";
import { prints } from "@/data/market";

export default function TapePage() {
  return (
    <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.7fr)]">
      <Panel
        kicker="F2"
        title="Print tape"
        action={`${prints.length} last sales · ET`}
        className="border-t-0 border-l-0 max-lg:border-r-0"
        bodyClassName="overflow-auto"
      >
        <TimeSales />
      </Panel>
      <Panel
        kicker="CAL"
        title="Forward windows"
        action="Desk calendar"
        className="border-t-0 border-r-0 max-lg:border-l-0"
        bodyClassName="overflow-auto"
      >
        <DropCalendar />
      </Panel>
    </div>
  );
}
