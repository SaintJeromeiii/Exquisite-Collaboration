"use client";

import { useEffect, useMemo, useState } from "react";
import { LookThumb } from "@/components/LookThumb";
import { Panel } from "@/components/Panel";
import {
  seatLabel,
  type CollabSeat,
  type DropEvent,
  type SessionStatus,
} from "@/data/market";
import { collabHref } from "@/lib/collab-path";
import { useDesk } from "@/lib/desk-book";
import { seedSlugs } from "@/lib/desk-file";
import {
  emptyDeskDrafts,
  loadDeskDrafts,
  writeDeskDrafts,
  type CalDraft,
  type DeskDrafts,
  type NameDraft,
} from "@/lib/desk-draft";
import { clsx } from "@/lib/format";
import Link from "next/link";

type Tab = "names" | "cal" | "tape" | "io";

const seats: CollabSeat[] = [
  "celebrity",
  "athlete",
  "boutique",
  "designer",
  "retailer",
  "brand",
];

function savedWhen(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function DeskPage() {
  const desk = useDesk();
  const [tab, setTab] = useState<Tab>("names");
  const [selected, setSelected] = useState("");
  const [editing, setEditing] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [drafts, setDrafts] = useState<DeskDrafts>(emptyDeskDrafts);
  const [draftReady, setDraftReady] = useState(false);
  const current = desk.get(selected);

  useEffect(() => {
    setDrafts(loadDeskDrafts());
    setDraftReady(true);
  }, []);

  useEffect(() => {
    if (!draftReady) return;
    writeDeskDrafts(drafts);
  }, [drafts, draftReady]);

  const tabs: { id: Tab; label: string }[] = [
    { id: "names", label: "Names" },
    { id: "cal", label: "When" },
    { id: "tape", label: "Sales" },
    { id: "io", label: "Publish" },
  ];

  return (
    <div className="flex flex-col">
      <div className="border-b border-line px-4 py-3">
        <h1 className="exq-display mt-1 text-3xl text-ink">Desk</h1>
        <p className="mt-1 max-w-3xl text-[13px] leading-5 text-muted">
          Add a new sneaker on the left. Names already on the board need a yes
          before you edit — so you do not wipe a write-up by mistake. This
          phone is the working copy.
        </p>
        {msg ? (
          <p className="mt-2 font-mono text-[11px] text-gold">{msg}</p>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-1 border-b border-line px-3 py-2">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={clsx(
              "border px-2 py-0.5 font-mono text-[10px] tracking-[0.12em] uppercase",
              tab === item.id
                ? "border-gold bg-gold/15 text-gold"
                : "border-line text-dim hover:text-muted",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className={tab === "names" ? "" : "hidden"}>
        <NamesTab
          selected={selected}
          editing={editing}
          pending={pending}
          onAskEdit={(slug) => {
            if (slug === selected && editing) return;
            setPending(slug);
          }}
          onConfirmEdit={() => {
            if (!pending) return;
            setSelected(pending);
            setEditing(true);
            setPending(null);
          }}
          onCancelEdit={() => setPending(null)}
          onSelectNew={(slug) => {
            setSelected(slug);
            setEditing(true);
            setPending(null);
          }}
          onMsg={setMsg}
          draft={drafts.name}
          setDraft={(name) => setDrafts((d) => ({ ...d, name }))}
        />
      </div>
      {draftReady ? (
        <>
          <div className={tab === "cal" ? "" : "hidden"}>
            <CalTab
              onMsg={setMsg}
              draft={drafts.cal}
              setDraft={(cal) => setDrafts((d) => ({ ...d, cal }))}
            />
          </div>
          <div className={tab === "tape" ? "" : "hidden"}>
            <TapeTab onMsg={setMsg} />
          </div>
          <div className={tab === "io" ? "" : "hidden"}>
            <IoTab onMsg={setMsg} />
          </div>
        </>
      ) : null}

      {tab === "names" && current ? (
        <p className="px-4 py-2 font-mono text-[10px] text-dim">
          Open dossier{" "}
          <Link href={collabHref(current.slug)} className="text-gold no-underline">
            {current.ticker}
          </Link>
        </p>
      ) : null}
    </div>
  );
}

function NamesTab({
  selected,
  editing,
  pending,
  onAskEdit,
  onConfirmEdit,
  onCancelEdit,
  onSelectNew,
  onMsg,
  draft,
  setDraft,
}: {
  selected: string;
  editing: boolean;
  pending: string | null;
  onAskEdit: (slug: string) => void;
  onConfirmEdit: () => void;
  onCancelEdit: () => void;
  onSelectNew: (slug: string) => void;
  onMsg: (s: string) => void;
  draft: NameDraft;
  setDraft: (next: NameDraft) => void;
}) {
  const desk = useDesk();
  const current = desk.get(selected);
  const pendingName = pending ? desk.get(pending) : undefined;

  const openFromDraft = () => {
    const nextTicker = draft.ticker.trim();
    const nextName = draft.name.trim();
    const nextPartner = draft.partner.trim();
    const nextBrand = draft.brand.trim();
    if (!nextTicker) {
      onMsg("Need a ticker.");
      return;
    }
    const slug = desk.addName({
      ticker: nextTicker,
      name: nextName || nextTicker,
      partner: nextPartner || "TBD",
      seat: draft.seat || "boutique",
      brand: nextBrand || "TBD",
      silhouette: nextName || nextTicker,
      colorway: "TBD",
      retail: 0,
      last: 0,
      changePct: 0,
      volume24h: 0,
      peakSize: "10",
      sizePremiumPct: 0,
      dropDate: new Date().toISOString().slice(0, 10),
      status: "pre-market",
      scarcity: 50,
      channels: ["Desk"],
      materials: [],
      thesis: "",
      strategy: "",
      notes: ["Opened from Desk. Fill the file."],
    });
    if (!slug) {
      onMsg("Ticker already on the board.");
      return;
    }
    onSelectNew(slug);
    setDraft({ ticker: "", name: "", partner: "", brand: "", seat: "boutique" });
    onMsg(`${nextTicker.toUpperCase()} saved on this phone.`);
  };

  const ordered = useMemo(
    () =>
      [...desk.all].sort((a, b) => {
        const ak = desk.killed.has(a.slug) ? 1 : 0;
        const bk = desk.killed.has(b.slug) ? 1 : 0;
        return ak - bk || a.ticker.localeCompare(b.ticker);
      }),
    [desk.all, desk.killed],
  );

  return (
    <>
    <div className="grid lg:grid-cols-[minmax(240px,0.8fr)_minmax(0,1.4fr)]">
      <Panel
        kicker="BOARD"
        title="Names"
        action={`${desk.listed.length} live`}
        className="border-l-0 max-lg:border-r-0"
        bodyClassName="max-h-[22rem] overflow-auto lg:max-h-[36rem]"
        fill={false}
      >
        <form
          className="space-y-2 border-b border-line p-3"
          onSubmit={(e) => {
            e.preventDefault();
            openFromDraft();
          }}
        >
          <div className="kicker">Add a new sneaker</div>
          <p className="text-[12px] leading-4 text-muted">
            Use this only if the pair is not already on the board.
          </p>
          <Field
            label="Ticker"
            value={draft.ticker}
            placeholder="FOO.BAR"
            onChange={(ticker) => setDraft({ ...draft, ticker })}
          />
          <Field
            label="Name"
            value={draft.name}
            placeholder="Partner x silhouette"
            onChange={(name) => setDraft({ ...draft, name })}
          />
          <Field
            label="Partner"
            value={draft.partner}
            onChange={(partner) => setDraft({ ...draft, partner })}
          />
          <Field
            label="Brand"
            value={draft.brand}
            onChange={(brand) => setDraft({ ...draft, brand })}
          />
          <label className="block">
            <span className="kicker">Seat</span>
            <select
              value={draft.seat}
              onChange={(e) =>
                setDraft({ ...draft, seat: e.target.value as CollabSeat })
              }
              className="mt-1 w-full border border-line bg-bg px-2 py-1 font-mono text-[12px] text-ink"
            >
              {seats.map((s) => (
                <option key={s} value={s}>
                  {seatLabel[s]}
                </option>
              ))}
            </select>
          </label>
          <SaveButton onClick={openFromDraft}>Save name</SaveButton>
        </form>
        <ul className="divide-y divide-line">
          {ordered.map((c) => {
            const dead = desk.killed.has(c.slug);
            return (
              <li key={c.slug}>
                <button
                  type="button"
                  onClick={() => onAskEdit(c.slug)}
                  className={clsx(
                    "flex w-full items-center gap-2 px-3 py-2 text-left",
                    selected === c.slug ? "bg-line/60" : "hover:bg-panel-2",
                    dead && "opacity-50",
                  )}
                >
                  <LookThumb slug={c.slug} ticker={c.ticker} />
                  <span className="font-cond text-[14px] tracking-wide text-gold-2">
                    {c.ticker}
                  </span>
                  {desk.endorsed.has(c.slug) ? (
                    <span className="font-mono text-[9px] text-up">END</span>
                  ) : null}
                  {dead ? (
                    <span className="font-mono text-[9px] text-dim">OFF</span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </Panel>

      <Panel
        kicker="FILE"
        title={current?.name ?? "No shoe open"}
        className="border-r-0 max-lg:border-l-0"
        bodyClassName="space-y-3 p-4"
        fill={false}
      >
        {current && editing ? (
          <>
            <p className="text-[13px] leading-5 text-muted">
              You are editing {current.name}. This is already on the desk — not
              a new sneaker.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Field
                label="Last"
                value={String(current.last || "")}
                onChange={(v) => desk.patch(current.slug, { last: Number(v) || 0 })}
              />
              <Field
                label="Retail"
                value={String(current.retail || "")}
                onChange={(v) => desk.patch(current.slug, { retail: Number(v) || 0 })}
              />
              <Field
                label="Peak size"
                value={current.peakSize}
                onChange={(v) => desk.patch(current.slug, { peakSize: v })}
              />
              <label className="block">
                <span className="kicker">Status</span>
                <select
                  value={current.status}
                  onChange={(e) =>
                    desk.patch(current.slug, { status: e.target.value as SessionStatus })
                  }
                  className="mt-1 w-full border border-line bg-bg px-2 py-1 font-mono text-[12px] text-ink"
                >
                  {["pre-market", "live", "secondary", "retired"].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <Field
              label="Colorway"
              value={current.colorway}
              onChange={(v) => desk.patch(current.slug, { colorway: v })}
            />
            <Field
              label="Doors (comma)"
              value={current.channels.join(", ")}
              placeholder="Kith, boutiques, EQL"
              onChange={(v) =>
                desk.patch(current.slug, {
                  channels: v.split(",").map((x) => x.trim()).filter(Boolean),
                })
              }
            />
            <label className="block">
              <span className="kicker">Thesis</span>
              <textarea
                value={current.thesis}
                onChange={(e) => desk.patch(current.slug, { thesis: e.target.value })}
                rows={4}
                className="mt-1 w-full border border-line bg-bg px-2 py-1.5 text-[13px] text-ink"
              />
            </label>
            <label className="block">
              <span className="kicker">Strategy</span>
              <textarea
                value={current.strategy}
                onChange={(e) => desk.patch(current.slug, { strategy: e.target.value })}
                rows={3}
                className="mt-1 w-full border border-line bg-bg px-2 py-1.5 text-[13px] text-ink"
              />
            </label>
            <label className="block">
              <span className="kicker">Your take</span>
              <textarea
                value={desk.stamps[current.slug] ?? ""}
                onChange={(e) => desk.setStamp(current.slug, e.target.value)}
                rows={2}
                placeholder="Write the take — why this pair."
                className="mt-1 w-full border border-line bg-bg px-2 py-1.5 text-[13px] text-ink"
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <SaveButton
                onClick={() => {
                  desk.save();
                  onMsg("Saved on this phone.");
                }}
              >
                Save
              </SaveButton>
              {seedSlugs.has(current.slug) ? (
                <button
                  type="button"
                  className="border border-line px-3 py-2 text-[13px] text-muted"
                  onClick={() => {
                    desk.restoreSeedCopy(current.slug);
                    onMsg("Original write-up is back.");
                  }}
                >
                  Put original write-up back
                </button>
              ) : null}
              {desk.killed.has(current.slug) ? (
                <button
                  type="button"
                  className="border border-up px-3 py-2 text-[13px] text-up"
                  onClick={() => {
                    desk.restore(current.slug);
                    onMsg(`${current.ticker} is back on the board.`);
                  }}
                >
                  Put back on
                </button>
              ) : (
                <button
                  type="button"
                  className="border border-down px-3 py-2 text-[13px] text-down"
                  onClick={() => {
                    desk.kill(current.slug);
                    onMsg(`${current.ticker} taken off the board.`);
                  }}
                >
                  Take off board
                </button>
              )}
            </div>
            <p className="font-mono text-[11px] text-dim">
              {desk.ready
                ? `Saved on this phone · ${savedWhen(desk.file.updatedAt)}`
                : "Saved on this phone"}
            </p>
          </>
        ) : (
          <p className="text-[13px] leading-5 text-muted">
            Add a new sneaker on the left, or tap a name that is already on the
            board. You will be asked before anything is edited.
          </p>
        )}
      </Panel>
    </div>
    {pendingName ? (
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 px-4 pb-[max(1.5rem,env(safe-area-inset-bottom,0px))] pt-10 sm:items-center sm:pb-10">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="exq-edit-shoe-title"
          className="w-full max-w-md border border-line bg-panel shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
        >
          <div className="border-b border-line px-4 py-3">
            <p className="font-mono text-[10px] tracking-[0.18em] text-gold uppercase">
              Already on the desk
            </p>
            <h2
              id="exq-edit-shoe-title"
              className="exq-display mt-1 text-2xl text-ink"
            >
              Do you want to edit this shoe?
            </h2>
            <p className="mt-2 text-[13px] leading-5 text-muted">
              {pendingName.name} is already on the board. This is not a new
              sneaker. Editing can change the write-up on this phone.
            </p>
          </div>
          <div className="flex gap-2 px-4 py-3">
            <SaveButton onClick={onConfirmEdit}>Edit this shoe</SaveButton>
            <button
              type="button"
              className="border border-line px-3 py-2 text-[13px] text-muted"
              onClick={onCancelEdit}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    ) : null}
    </>
  );
}

function CalTab({
  onMsg,
  draft,
  setDraft,
}: {
  onMsg: (s: string) => void;
  draft: CalDraft;
  setDraft: (next: CalDraft) => void;
}) {
  const desk = useDesk();

  function saveWindow() {
    if (!draft.ticker.trim() || !draft.name.trim()) {
      onMsg("Ticker and name required.");
      return;
    }
    desk.addWindow({
      date: draft.date,
      ticker: draft.ticker.trim().toUpperCase(),
      name: draft.name.trim(),
      channel: draft.channel.trim() || "Desk",
      status: draft.status,
    });
    onMsg("Saved. It is on When.");
    setDraft({ ...draft, name: "" });
  }

  return (
    <Panel kicker="WHEN" title="Calendar" className="border-x-0" bodyClassName="p-4" fill={false}>
      <p className="mb-3 text-[13px] leading-5 text-muted">
        Type the date, then tap Save. Leaving this screen keeps the draft on
        this phone. It does not show on When until you save.
      </p>
      <form
        className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5"
        onSubmit={(e) => {
          e.preventDefault();
          saveWindow();
        }}
      >
        <Field label="Date" value={draft.date} onChange={(date) => setDraft({ ...draft, date })} />
        <Field
          label="Ticker"
          value={draft.ticker}
          onChange={(ticker) => setDraft({ ...draft, ticker })}
        />
        <Field label="Name" value={draft.name} onChange={(name) => setDraft({ ...draft, name })} />
        <Field
          label="Channel"
          value={draft.channel}
          onChange={(channel) => setDraft({ ...draft, channel })}
        />
        <label className="block">
          <span className="kicker">Status</span>
          <select
            value={draft.status}
            onChange={(e) =>
              setDraft({ ...draft, status: e.target.value as DropEvent["status"] })
            }
            className="mt-1 w-full border border-line bg-bg px-2 py-1 font-mono text-[12px] text-ink"
          >
            {["priced", "raffle", "shock", "closed"].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <div className="sm:col-span-2 lg:col-span-5">
          <SaveButton onClick={saveWindow}>Save</SaveButton>
        </div>
      </form>
      <ul className="divide-y divide-line border border-line">
        {desk.calendar.map((ev, i) => (
          <li key={`${ev.date}-${ev.ticker}-${i}`} className="flex items-center justify-between gap-2 px-3 py-2">
            <div>
              <div className="font-mono text-[11px] text-dim">
                {ev.date} · {ev.status} · {ev.channel}
              </div>
              <div className="font-cond text-[14px] text-gold-2">{ev.ticker}</div>
              <div className="text-[12px] text-muted">{ev.name}</div>
            </div>
            <button
              type="button"
              className="font-mono text-[10px] text-down uppercase"
              onClick={() => desk.removeWindow(i)}
            >
              Cut
            </button>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function TapeTab({ onMsg }: { onMsg: (s: string) => void }) {
  const desk = useDesk();
  const [t, setT] = useState(() =>
    new Date().toLocaleTimeString("en-US", { hour12: false, timeZone: "America/New_York" }).slice(0, 8),
  );
  const [ticker, setTicker] = useState("");
  const [size, setSize] = useState("10");
  const [price, setPrice] = useState("");
  const [side, setSide] = useState<"buy" | "sell">("buy");

  return (
    <Panel kicker="SALES" title="Last sales" className="border-x-0" bodyClassName="p-4" fill={false}>
      <div className="mb-4 grid gap-2 sm:grid-cols-5">
        <Field label="Time ET" value={t} onChange={setT} />
        <Field label="Ticker" value={ticker} onChange={setTicker} />
        <Field label="Size" value={size} onChange={setSize} />
        <Field label="Print" value={price} onChange={setPrice} />
        <label className="block">
          <span className="kicker">Side</span>
          <select
            value={side}
            onChange={(e) => setSide(e.target.value as "buy" | "sell")}
            className="mt-1 w-full border border-line bg-bg px-2 py-1 font-mono text-[12px] text-ink"
          >
            <option value="buy">buy</option>
            <option value="sell">sell</option>
          </select>
        </label>
      </div>
      <SaveButton
        onClick={() => {
          const px = Number(price);
          if (!ticker || !px) {
            onMsg("Ticker and print required.");
            return;
          }
          desk.addPrint({ t, ticker: ticker.toUpperCase(), size, price: px, side });
          onMsg("Print on tape.");
          setPrice("");
        }}
      >
        Save sale
      </SaveButton>
      <ul className="mt-4 divide-y divide-line border border-line">
        {desk.prints.map((p, i) => (
          <li key={`${p.t}-${p.ticker}-${i}`} className="flex items-center justify-between px-3 py-2 font-mono text-[12px]">
            <span className="text-dim">{p.t}</span>
            <span className="text-gold-2">{p.ticker}</span>
            <span>{p.size}</span>
            <span className={p.side === "buy" ? "text-up" : "text-down"}>{p.price}</span>
            <button type="button" className="text-[10px] text-down uppercase" onClick={() => desk.removePrint(i)}>
              Cut
            </button>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function IoTab({ onMsg }: { onMsg: (s: string) => void }) {
  const desk = useDesk();
  const json = JSON.stringify(desk.exportFile(), null, 2);

  return (
    <Panel kicker="IO" title="Publish" className="border-x-0" bodyClassName="space-y-3 p-4" fill={false}>
      <p className="text-[13px] leading-5 text-muted">
        Working copy is on this device. To refresh the app without a Play
        upload, download the file, replace{" "}
        <span className="font-mono text-[11px] text-ink">docs/desk/book.json</span>{" "}
        in the GitHub repo, and push to main. Other installs pull it on launch.
      </p>
      <p className="font-mono text-[11px] text-dim">
        Local {desk.file.updatedAt}
        {desk.remoteAt ? ` · remote ${desk.remoteAt}` : " · remote not loaded"}
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="border border-gold px-2 py-1 font-mono text-[10px] tracking-[0.14em] text-gold uppercase"
          onClick={() => {
            const blob = new Blob([json], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "book.json";
            a.click();
            URL.revokeObjectURL(url);
            onMsg("Downloaded book.json.");
          }}
        >
          Download JSON
        </button>
        <button
          type="button"
          className="border border-line px-2 py-1 font-mono text-[10px] tracking-[0.14em] text-muted uppercase"
          onClick={async () => {
            await navigator.clipboard.writeText(json);
            onMsg("Copied.");
          }}
        >
          Copy
        </button>
        <button
          type="button"
          className="border border-line px-2 py-1 font-mono text-[10px] tracking-[0.14em] text-muted uppercase"
          onClick={async () => {
            const ok = await desk.pullRemote();
            onMsg(ok ? "Pulled remote book into this device." : "Remote book not reachable.");
          }}
        >
          Pull remote
        </button>
        <label className="border border-line px-2 py-1 font-mono text-[10px] tracking-[0.14em] text-muted uppercase">
          Import
          <input
            type="file"
            accept="application/json"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              try {
                const ok = desk.importFile(JSON.parse(await file.text()));
                onMsg(ok ? "Imported." : "File was not a desk book.");
              } catch {
                onMsg("Could not read that file.");
              }
            }}
          />
        </label>
      </div>
      <pre className="max-h-64 overflow-auto border border-line bg-bg p-2 font-mono text-[10px] text-dim">
        {json.slice(0, 4000)}
        {json.length > 4000 ? "\n…" : ""}
      </pre>
    </Panel>
  );
}

function SaveButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="border border-gold bg-gold/15 px-3 py-2 text-[13px] text-gold"
    >
      {children}
    </button>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="kicker">{label}</span>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full border border-line bg-bg px-2 py-1 font-mono text-[12px] text-ink outline-none focus:border-gold"
      />
    </label>
  );
}
