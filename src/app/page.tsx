import { Watchlist } from "@/components/Watchlist";

export default function BoardPage() {
  return (
    <div className="flex flex-col">
      <div className="border-b border-line px-4 py-3">
        <h1 className="font-cond text-2xl tracking-wide text-ink">Board</h1>
        <p className="mt-1 max-w-2xl text-[13px] leading-5 text-muted">
          Every collab on the desk. The ones with a call sit at the top. Tap a
          shoe to read why.
        </p>
      </div>
      <Watchlist />
    </div>
  );
}
