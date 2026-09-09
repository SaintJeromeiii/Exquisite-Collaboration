export function Panel({
  title,
  kicker,
  action,
  children,
  className = "",
  bodyClassName = "",
}: {
  title: string;
  kicker?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={`flex min-h-0 flex-col border border-line bg-panel ${className}`}>
      <header className="flex h-8 shrink-0 items-center justify-between border-b border-line px-3">
        <div className="flex items-baseline gap-2">
          {kicker ? (
            <span className="font-mono text-[10px] tracking-[0.18em] text-gold">
              {kicker}
            </span>
          ) : null}
          <h2 className="font-mono text-[10px] tracking-[0.16em] text-muted uppercase">
            {title}
          </h2>
        </div>
        {action ? <div className="text-[10px] font-mono tracking-[0.12em] text-dim">{action}</div> : null}
      </header>
      <div className={`min-h-0 flex-1 ${bodyClassName}`}>{children}</div>
    </section>
  );
}
