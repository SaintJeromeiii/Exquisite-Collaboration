import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-start justify-center px-8">
      <div className="kicker">404</div>
      <h1 className="mt-2 font-cond text-4xl tracking-wide text-gold-2">
        Name not listed
      </h1>
      <p className="mt-2 max-w-md text-[13px] text-muted">
        That ticker is not on the EXQ board. Return to the market or open the
        WSG.JAZZ dossier.
      </p>
      <div className="mt-4 flex gap-4 font-mono text-[11px] tracking-[0.14em] uppercase">
        <Link href="/" className="text-gold no-underline">
          F1 Market
        </Link>
        <Link href="/collabs/wsg-jazz" className="text-muted no-underline">
          F4 WSG.JAZZ
        </Link>
      </div>
    </div>
  );
}
