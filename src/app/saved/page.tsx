import { CoverageStrip } from "@/components/CoverageStrip";

export default function SavedPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b border-line px-4 py-3">
        <h1 className="font-cond text-2xl tracking-wide text-ink">Saved</h1>
        <p className="mt-1 max-w-2xl text-[13px] leading-5 text-muted">
          Watching is your list. A call is the stamp — one sentence on why this
          pair matters.
        </p>
      </div>
      <CoverageStrip />
    </div>
  );
}
