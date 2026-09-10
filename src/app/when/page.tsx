import { DropCalendar } from "@/components/DropCalendar";
import { PrefsBar } from "@/components/PrefsBar";

export default function WhenPage() {
  return (
    <div className="flex flex-col">
      <div className="border-b border-line px-4 py-3">
        <h1 className="exq-display text-3xl text-ink">When</h1>
        <p className="mt-1 max-w-2xl text-[13px] leading-5 text-muted">
          Month grid of restocks, raffles, leftovers, done. These are desk
          dates, not a live store clock. The shop or partner posts the real
          time on their social — follow those. Tap a day. When something is
          close, Exquisite tells you as you open the app.
        </p>
        <PrefsBar />
      </div>
      <DropCalendar />
    </div>
  );
}
