"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DeskBookProvider, useDesk } from "@/lib/desk-book";
import { DeskPrefsProvider } from "@/lib/desk-prefs-context";
import { clsx } from "@/lib/format";
import { NativeBoot } from "./NativeBoot";
import { OpenHeadsUp } from "./OpenHeadsUp";
import { ReminderSync } from "./ReminderSync";

const nav = [
  { href: "/", label: "Board" },
  { href: "/when", label: "When" },
  { href: "/saved", label: "Saved" },
  { href: "/desk", label: "Desk" },
];

export function TerminalShell({ children }: { children: React.ReactNode }) {
  return (
    <DeskBookProvider>
      <DeskPrefsProvider>
        <ShellFrame>{children}</ShellFrame>
      </DeskPrefsProvider>
    </DeskBookProvider>
  );
}

function ExqMark() {
  return (
    <Link
      href="/"
      aria-label="Exquisite Collaboration"
      className="exq-wordmark-hit flex items-baseline gap-2 no-underline"
    >
      <span className="flex flex-col leading-none">
        <span className="exq-wordmark text-[17px] text-gold">Exquisite</span>
        <span className="exq-wordmark mt-0.5 text-[17px] text-gold">
          Collaboration
        </span>
      </span>
    </Link>
  );
}

function ShellFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { listed } = useDesk();

  return (
    <div className="exq-shell bg-bg text-ink pt-[env(safe-area-inset-top,0px)]">
      <NativeBoot />
      <ReminderSync />
      <OpenHeadsUp />
      <header className="flex items-center justify-between border-b border-line px-3 py-2.5">
        <ExqMark />
        <span className="font-sans text-[12px] text-dim">
          {listed.length} on the board
        </span>
      </header>

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
                "px-3 py-1.5 text-[13px] no-underline",
                active ? "bg-line text-gold" : "text-muted hover:bg-panel-2 hover:text-ink",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <main className="exq-main">{children}</main>

      <footer className="exq-footer flex shrink-0 items-center justify-between gap-3 border-t border-line px-3 pt-1 text-[11px] text-dim">
        <span>No store. Just the take.</span>
        <Link href="/privacy" className="text-dim no-underline hover:text-muted">
          Privacy
        </Link>
      </footer>
    </div>
  );
}
