import { DropCalendar } from "@/components/DropCalendar";
import { PrefsBar } from "@/components/PrefsBar";

export default function WhenPage() {
  return (
    <div className="flex flex-col">
      <div className="border-b border-line px-4 py-3">
        <h1 className="exq-display text-3xl text-ink">When</h1>
        <p className="mt-1 max-w-2xl text-[13px] leading-5 text-muted">
          Month grid of restocks, raffles, leftovers, done. Tap a day. When
          something is close, EXQ tells you as you open the app — you do not
          have to allow another phone notification.
        </p>
        <PrefsBar />
      </div>
      <DropCalendar />
    </div>
  );
}
