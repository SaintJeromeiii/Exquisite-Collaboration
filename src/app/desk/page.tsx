"use client";

import { useMemo, useState } from "react";
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

export default function DeskPage() {
  const desk = useDesk();
  const [tab, setTab] = useState<Tab>("names");
  const [selected, setSelected] = useState("wsg-jazz");
  const [msg, setMsg] = useState("");
  const current = desk.get(selected);

  const tabs: { id: Tab; label: string }[] = [
    { id: "names", label: "Names" },
    { id: "cal", label: "When" },
    { id: "tape", label: "Sales" },
    { id: "io", label: "Publish" },
  ];

  return (
    <div className="flex flex-col">
      <div className="border-b border-line px-4 py-3">
        <h1 className="mt-1 font-cond text-2xl tracking-wide text-ink">
          Desk
        </h1>
        <p className="mt-1 max-w-3xl text-[13px] leading-5 text-muted">
          Add a name when you hear it. Take it off the board when it is dead.
          Write the call. Dates and sales live here so they do not rot in a
          build. This phone is the working copy. Export JSON and push to GitHub
          to update other installs.
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

      {tab === "names" ? (
        <NamesTab
          selected={selected}
          onSelect={setSelected}
          onMsg={setMsg}
        />
      ) : null}
      {tab === "cal" ? <CalTab onMsg={setMsg} /> : null}
      {tab === "tape" ? <TapeTab onMsg={setMsg} /> : null}
      {tab === "io" ? <IoTab onMsg={setMsg} /> : null}

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
  onSelect,
  onMsg,
}: {
  selected: string;
  onSelect: (slug: string) => void;
  onMsg: (s: string) => void;
}) {
  const desk = useDesk();
  const current = desk.get(selected);

  const openFromForm = (form: HTMLFormElement) => {
    const fd = new FormData(form);
    const nextTicker = String(fd.get("ticker") ?? "").trim();
    const nextName = String(fd.get("name") ?? "").trim();
    const nextPartner = String(fd.get("partner") ?? "").trim();
    const nextBrand = String(fd.get("brand") ?? "").trim();
    const nextSeat = (String(fd.get("seat") ?? "boutique") as CollabSeat) || "boutique";
    if (!nextTicker) {
      onMsg("Need a ticker.");
      return;
    }
    const slug = desk.addName({
      ticker: nextTicker,
      name: nextName || nextTicker,
      partner: nextPartner || "TBD",
      seat: nextSeat,
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
    onSelect(slug);
    form.reset();
    onMsg(`${nextTicker.toUpperCase()} opened and put on coverage.`);
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
            openFromForm(e.currentTarget);
          }}
        >
          <div className="kicker">New name</div>
          <DraftField name="ticker" label="Ticker" placeholder="FOO.BAR" />
          <DraftField name="name" label="Name" placeholder="Partner x silhouette" />
          <DraftField name="partner" label="Partner" />
          <DraftField name="brand" label="Brand" />
          <label className="block">
            <span className="kicker">Seat</span>
            <select
              name="seat"
              defaultValue="boutique"
              className="mt-1 w-full border border-line bg-bg px-2 py-1 font-mono text-[12px] text-ink"
            >
              {seats.map((s) => (
                <option key={s} value={s}>
                  {seatLabel[s]}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="border border-gold px-2 py-1 font-mono text-[10px] tracking-[0.14em] text-gold uppercase"
            onClick={(e) => {
              const form = e.currentTarget.form;
              if (form) openFromForm(form);
            }}
          >
            Open name
          </button>
        </form>
        <ul className="divide-y divide-line">
          {ordered.map((c) => {
            const dead = desk.killed.has(c.slug);
            return (
              <li key={c.slug}>
                <button
                  type="button"
                  onClick={() => onSelect(c.slug)}
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
        title={current?.ticker ?? "Select a name"}
        className="border-r-0 max-lg:border-l-0"
        bodyClassName="space-y-3 p-4"
        fill={false}
      >
        {current ? (
          <>
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
              <span className="kicker">Desk call</span>
              <textarea
                value={desk.stamps[current.slug] ?? ""}
                onChange={(e) => desk.setStamp(current.slug, e.target.value)}
                rows={2}
                placeholder="Write the call — why this pair."
                className="mt-1 w-full border border-line bg-bg px-2 py-1.5 text-[13px] text-ink"
              />
            </label>
            <div className="flex flex-wrap gap-2">
              {desk.killed.has(current.slug) ? (
                <button
                  type="button"
                  className="border border-up px-2 py-1 font-mono text-[10px] tracking-[0.14em] text-up uppercase"
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
                  className="border border-down px-2 py-1 font-mono text-[10px] tracking-[0.14em] text-down uppercase"
                  onClick={() => {
                    desk.kill(current.slug);
                    onMsg(`${current.ticker} taken off the board.`);
                  }}
                >
                  Take off board
                </button>
              )}
            </div>
          </>
        ) : (
          <p className="font-mono text-[11px] text-dim">Select a name.</p>
        )}
      </Panel>
    </div>
  );
}

function CalTab({ onMsg }: { onMsg: (s: string) => void }) {
  const desk = useDesk();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [ticker, setTicker] = useState("");
  const [name, setName] = useState("");
  const [channel, setChannel] = useState("");
  const [status, setStatus] = useState<DropEvent["status"]>("raffle");

  return (
    <Panel kicker="WHEN" title="Calendar" className="border-x-0" bodyClassName="p-4" fill={false}>
      <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        <Field label="Date" value={date} onChange={setDate} />
        <Field label="Ticker" value={ticker} onChange={setTicker} />
        <Field label="Name" value={name} onChange={setName} />
        <Field label="Channel" value={channel} onChange={setChannel} />
        <label className="block">
          <span className="kicker">Status</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as DropEvent["status"])}
            className="mt-1 w-full border border-line bg-bg px-2 py-1 font-mono text-[12px] text-ink"
          >
            {["priced", "raffle", "shock", "closed"].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      </div>
      <button
        type="button"
        className="mb-4 border border-gold px-2 py-1 font-mono text-[10px] tracking-[0.14em] text-gold uppercase"
        onClick={() => {
          if (!ticker || !name) {
            onMsg("Ticker and name required.");
            return;
          }
          desk.addWindow({ date, ticker: ticker.toUpperCase(), name, channel: channel || "Desk", status });
          onMsg("Window booked.");
          setName("");
        }}
      >
        Book window
      </button>
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
      <button
        type="button"
        className="mb-4 border border-gold px-2 py-1 font-mono text-[10px] tracking-[0.14em] text-gold uppercase"
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
        Print
      </button>
      <ul className="divide-y divide-line border border-line">
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

function DraftField({
  name,
  label,
  placeholder,
}: {
  name: string;
  label: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="kicker">{label}</span>
      <input
        name={name}
        placeholder={placeholder}
        className="mt-1 w-full border border-line bg-bg px-2 py-1 font-mono text-[12px] text-ink outline-none focus:border-gold"
      />
    </label>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  name,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  name?: string;
}) {
  return (
    <label className="block">
      <span className="kicker">{label}</span>
      <input
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full border border-line bg-bg px-2 py-1 font-mono text-[12px] text-ink outline-none focus:border-gold"
      />
    </label>
  );
}
