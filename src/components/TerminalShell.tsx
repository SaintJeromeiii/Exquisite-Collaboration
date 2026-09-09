"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { collabs } from "@/data/market";
import { DeskBookProvider } from "@/lib/desk-book";
import { clsx, cnDelta, formatNy, signedPct } from "@/lib/format";
import { NativeBoot } from "./NativeBoot";
import { TickerTape } from "./TickerTape";

const nav = [
  { href: "/", key: "F1", label: "MKT" },
  { href: "/tape", key: "F2", label: "TAPE" },
  { href: "/ledger", key: "F3", label: "LEDGER" },
  { href: "/book", key: "F4", label: "BOOK" },
  { href: "/collabs/wsg-jazz", key: "F5", label: "WSG.JAZZ" },
];

export function TerminalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [now, setNow] = useState("—");

  useEffect(() => {
    const tick = () => setNow(formatNy(new Date()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <DeskBookProvider>
    <div className="flex min-h-full flex-col bg-bg text-ink pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <NativeBoot />
      <header className="grid grid-cols-[1fr_auto_1fr] items-center border-b border-line px-3 py-1.5">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-baseline gap-2 no-underline">
            <span className="font-cond text-lg leading-none font-semibold tracking-[0.14em] text-gold">
              EXQ
            </span>
            <span className="hidden font-mono text-[10px] tracking-[0.22em] text-muted uppercase sm:inline">
              Exquisite Collab Desk
            </span>
          </Link>
          <span className="hidden font-mono text-[10px] tracking-[0.16em] text-dim uppercase md:inline">
            One Wall · NYSE tape
          </span>
        </div>
        <div
          className="font-mono text-[11px] tracking-[0.08em] text-muted tabular"
          suppressHydrationWarning
        >
          {now} <span className="text-dim">ET</span>
        </div>
        <div className="flex items-center justify-end gap-3">
          <span className="font-mono text-[10px] tracking-[0.14em] text-dim uppercase">
            Delay {`15m`}
          </span>
          <span className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.16em] text-up uppercase">
            <span className="live-dot inline-block h-1.5 w-1.5 rounded-full bg-up" />
            Live
          </span>
        </div>
      </header>

      <TickerTape names={collabs} />

      <nav className="relative z-10 flex items-center gap-1 overflow-x-auto border-b border-line bg-bg px-2 py-1">
        {nav.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-baseline gap-1.5 px-2.5 py-1 font-mono text-[11px] tracking-[0.12em] uppercase no-underline",
                active
                  ? "bg-line text-gold"
                  : "text-muted hover:bg-panel-2 hover:text-ink",
              )}
            >
              <span className="text-[9px] text-dim">{item.key}</span>
              {item.label}
            </Link>
          );
        })}
        <span className="ml-auto hidden px-2 font-mono text-[10px] tracking-[0.14em] text-dim uppercase sm:inline">
          Follow any collab · Endorse from the desk
        </span>
      </nav>

      <main className="flex min-h-0 flex-1 flex-col">{children}</main>

      <footer className="flex items-center justify-between gap-3 border-t border-line px-3 py-1 font-mono text-[10px] tracking-[0.08em] text-dim">
        <span>EXQCI desk estimates · illustrative until live feeds are wired</span>
        <span className="flex items-center gap-3">
          <Link href="/privacy" className="text-dim no-underline hover:text-muted">
            Privacy
          </Link>
          <span className="hidden sm:inline">
            {collabs.filter((c) => c.status === "secondary").length} names on secondary ·{" "}
            <span className={cnDelta(1.45)}>{signedPct(1.45)}</span> session
          </span>
        </span>
      </footer>
    </div>
    </DeskBookProvider>
  );
}
