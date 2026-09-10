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
import { collabStatusLabel, formatDay, windowStatusLabel } from "@/lib/copy";
import { seedSlugs } from "@/lib/desk-file";
import {
  emptyDeskDrafts,
  loadDeskDrafts,
  writeDeskDrafts,
  type CalDraft,
  type DeskDrafts,
  type NameDraft,
} from "@/lib/desk-draft";
import {
  hasWindowOnDay,
  isoDay,
  windowsForTicker,
  windowStatusForDate,
} from "@/lib/desk-when";
import { clsx } from "@/lib/format";
import {
  datesFromText,
  lookupReleaseDates,
  type DateHit,
} from "@/lib/date-lookup";
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
    { id: "names", label: "Sneaker names" },
    { id: "cal", label: "Calendar dates" },
    { id: "tape", label: "Resale sales" },
    { id: "io", label: "Publish file" },
  ];

  return (
    <div className="flex flex-col">
      <div className="border-b border-line px-4 py-3">
        <h1 className="exq-display mt-1 text-3xl text-ink">Desk</h1>
        <p className="mt-1 max-w-3xl text-[13px] leading-5 text-muted">
          Add a new sneaker on the left. Put a release date on the file and it
          shows on When. Names already on the board need a yes before you
          edit. This phone is the working copy.
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
          Open shoe page{" "}
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
      onMsg("Need a board code.");
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
      dropDate: isoDay(draft.dropDate),
      status: "pre-market",
      scarcity: 50,
      channels: ["Desk"],
      materials: [],
      thesis: "",
      strategy: "",
      notes: ["Opened from Desk. Fill the file."],
    });
    if (!slug) {
      onMsg("That board code is already on the board.");
      return;
    }
    onSelectNew(slug);
    setDraft({
      ticker: "",
      name: "",
      partner: "",
      brand: "",
      seat: "boutique",
      dropDate: "",
    });
    onMsg(
      isoDay(draft.dropDate)
        ? `${nextTicker.toUpperCase()} saved. It is on When.`
        : `${nextTicker.toUpperCase()} saved on this phone.`,
    );
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
        kicker="THE BOARD"
        title="Sneaker names"
        action={`${desk.listed.length} on the board`}
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
            label="Board code"
            value={draft.ticker}
            placeholder="WSG.JAZZ"
            onChange={(ticker) => setDraft({ ...draft, ticker })}
          />
          <Field
            label="Shoe name"
            value={draft.name}
            placeholder="Partner x silhouette"
            onChange={(name) => setDraft({ ...draft, name })}
          />
          <Field
            label="Collab partner"
            value={draft.partner}
            placeholder="Westside Gunn"
            onChange={(partner) => setDraft({ ...draft, partner })}
          />
          <Field
            label="Shoe brand"
            value={draft.brand}
            placeholder="Saucony"
            onChange={(brand) => setDraft({ ...draft, brand })}
          />
          <Field
            label="Release date"
            value={draft.dropDate}
            type="date"
            onChange={(dropDate) => setDraft({ ...draft, dropDate })}
          />
          <label className="block">
            <span className="kicker">Collab type</span>
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
          <SaveButton onClick={openFromDraft}>Save this sneaker</SaveButton>
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
        kicker="SHOE FILE"
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
                label="Last sale price"
                value={String(current.last || "")}
                placeholder="286"
                onChange={(v) => desk.patch(current.slug, { last: Number(v) || 0 })}
              />
              <Field
                label="Retail price"
                value={String(current.retail || "")}
                placeholder="170"
                onChange={(v) => desk.patch(current.slug, { retail: Number(v) || 0 })}
              />
              <Field
                label="Hottest size"
                value={current.peakSize}
                placeholder="10.5"
                onChange={(v) => desk.patch(current.slug, { peakSize: v })}
              />
              <label className="block">
                <span className="kicker">Where this shoe is now</span>
                <select
                  value={current.status}
                  onChange={(e) =>
                    desk.patch(current.slug, { status: e.target.value as SessionStatus })
                  }
                  className="mt-1 w-full border border-line bg-bg px-2 py-1 font-mono text-[12px] text-ink"
                >
                  {(["pre-market", "live", "secondary", "retired"] as SessionStatus[]).map(
                    (s) => (
                      <option key={s} value={s}>
                        {collabStatusLabel[s]}
                      </option>
                    ),
                  )}
                </select>
              </label>
            </div>
            <Field
              label="Colorway name"
              value={current.colorway}
              placeholder="Awesome God"
              onChange={(v) => desk.patch(current.slug, { colorway: v })}
            />
            <Field
              label="Release date"
              value={isoDay(current.dropDate)}
              type="date"
              onChange={(v) => {
                desk.setDropDate(current.slug, v);
                onMsg(
                  isoDay(v)
                    ? `${current.ticker} is on When for that date.`
                    : "Release date cleared. When dates already booked stay.",
                );
              }}
            />
            <p className="text-[12px] leading-4 text-muted">
              Find dates, then pick one. It is not on When until you tap it.
              The shop’s account is still the real time.
            </p>
            <DateLookup
              query={[current.partner, current.brand, current.name, current.colorway]
                .filter((part) => part && part !== "TBD")
                .join(" ")}
              onPick={(date) => {
                desk.setDropDate(current.slug, date);
                onMsg(`${current.ticker} is on When for ${date}.`);
              }}
              onMsg={onMsg}
            />
            <WhenDates
              ticker={current.ticker}
              shop={current.channels[0] ?? ""}
              onMsg={onMsg}
            />
            <Field
              label="Where it drops"
              value={current.channels.join(", ")}
              placeholder="adidas, SNKRS, Kith"
              onChange={(v) =>
                desk.patch(current.slug, {
                  channels: v.split(",").map((x) => x.trim()).filter(Boolean),
                })
              }
            />
            <p className="text-[12px] leading-4 text-muted">
              Shops and sites that actually have it. Separate with commas.
            </p>
            <label className="block">
              <span className="kicker">Why this pair matters</span>
              <textarea
                value={current.thesis}
                onChange={(e) => desk.patch(current.slug, { thesis: e.target.value })}
                rows={4}
                className="mt-1 w-full border border-line bg-bg px-2 py-1.5 text-[13px] text-ink"
              />
            </label>
            <label className="block">
              <span className="kicker">What to watch on this pair</span>
              <textarea
                value={current.strategy}
                onChange={(e) => desk.patch(current.slug, { strategy: e.target.value })}
                rows={3}
                className="mt-1 w-full border border-line bg-bg px-2 py-1.5 text-[13px] text-ink"
              />
            </label>
            <label className="block">
              <span className="kicker">Your take on this pair</span>
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
                Save this shoe
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

function DateLookup({
  query,
  onPick,
  onMsg,
}: {
  query: string;
  onPick: (date: string) => void;
  onMsg: (s: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [paste, setPaste] = useState("");
  const [hits, setHits] = useState<DateHit[]>([]);

  function showHits(next: DateHit[], empty: string) {
    setHits(next);
    onMsg(next.length ? "Pick a date. It does not go on When until you tap it." : empty);
  }

  return (
    <div className="space-y-2 border border-line p-3">
      <div className="kicker">Find a date</div>
      <p className="text-[12px] leading-4 text-muted">
        Search the public web, or paste a line from the shop or partner post.
        You pick. You can still type the date above.
      </p>
      <SaveButton
        onClick={() => {
          void (async () => {
            setBusy(true);
            const found = await lookupReleaseDates(query);
            showHits(
              found.hits,
              found.error ?? "No date found. Paste a line from the post.",
            );
            setBusy(false);
          })();
        }}
      >
        {busy ? "Looking up…" : "Look up dates"}
      </SaveButton>
      <label className="block">
        <span className="kicker">Or paste a line from the post</span>
        <textarea
          value={paste}
          onChange={(e) => setPaste(e.target.value)}
          rows={2}
          placeholder="Drops Friday, October 2, 2026 at Kith."
          className="mt-1 w-full border border-line bg-bg px-2 py-1.5 text-[13px] text-ink"
        />
      </label>
      <button
        type="button"
        className="border border-line px-3 py-2 text-[13px] text-muted"
        onClick={() => {
          const next = datesFromText(paste, "Pasted text");
          showHits(next, "No date in that text. Type it above.");
        }}
      >
        Read dates from that text
      </button>
      {hits.length ? (
        <ul className="divide-y divide-line border border-line">
          {hits.map((hit) => (
            <li key={`${hit.date}-${hit.source}`}>
              <button
                type="button"
                className="flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left hover:bg-panel-2"
                onClick={() => onPick(hit.date)}
              >
                <span className="text-[13px] text-gold">
                  Use {formatDay(hit.date)}
                </span>
                <span className="text-[12px] text-muted">{hit.source}</span>
                {hit.snippet ? (
                  <span className="text-[11px] leading-4 text-dim">{hit.snippet}</span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function WhenDates({
  ticker,
  shop,
  onMsg,
}: {
  ticker: string;
  shop: string;
  onMsg: (s: string) => void;
}) {
  const desk = useDesk();
  const [date, setDate] = useState("");
  const [where, setWhere] = useState("");
  const [how, setHow] = useState<DropEvent["status"]>("priced");
  const rows = windowsForTicker(desk.calendar, ticker);

  function calendarIndex(ev: DropEvent) {
    return desk.calendar.findIndex(
      (row) =>
        row.date === ev.date &&
        row.ticker === ev.ticker &&
        row.name === ev.name &&
        row.channel === ev.channel &&
        row.status === ev.status,
    );
  }

  function addDate() {
    const day = isoDay(date);
    if (!day) {
      onMsg("Pick a date first.");
      return;
    }
    if (hasWindowOnDay(desk.calendar, ticker, day)) {
      onMsg("Already on When for that day.");
      return;
    }
    const collab = desk.listed.find((c) => c.ticker === ticker);
    const past = windowStatusForDate(day, collab?.status ?? "pre-market") === "closed";
    desk.addWindow({
      date: day,
      ticker,
      name: collab?.colorway && collab.colorway !== "TBD" ? collab.colorway : "Release",
      channel: where.trim() || shop || "Desk",
      status: past ? "closed" : how,
    });
    setDate("");
    setWhere("");
    setHow("priced");
    onMsg(`${ticker} added to When.`);
  }

  return (
    <div className="space-y-2 border border-line p-3">
      <div className="kicker">Dates on the calendar</div>
      {rows.length ? (
        <ul className="space-y-2">
          {rows.map((ev, i) => {
            const index = calendarIndex(ev);
            return (
              <li
                key={`${ev.date}-${ev.channel}-${i}`}
                className="flex flex-wrap items-center justify-between gap-2 text-[12px]"
              >
                <span className="text-muted">
                  {formatDay(ev.date)} · {ev.channel}
                </span>
                <div className="flex items-center gap-2">
                  <HowSelect
                    value={ev.status}
                    onChange={(status) => {
                      if (index < 0) return;
                      desk.patchWindow(index, { status });
                    }}
                  />
                  <button
                    type="button"
                    className="font-mono text-[10px] text-down uppercase"
                    onClick={() => {
                      if (index >= 0) desk.removeWindow(index);
                    }}
                  >
                    Remove
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-[12px] leading-4 text-dim">
          Nothing on When yet. Set the release date above, or add another date
          here.
        </p>
      )}
      <div className="grid grid-cols-2 gap-2">
        <Field label="Add another date" value={date} type="date" onChange={setDate} />
        <Field
          label="Shop or site"
          value={where}
          placeholder={shop || "adidas, SNKRS"}
          onChange={setWhere}
        />
        <HowSelect value={how} onChange={setHow} label="How it drops" />
      </div>
      <SaveButton onClick={addDate}>Add to When</SaveButton>
    </div>
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
  const listed = useMemo(
    () => [...desk.listed].sort((a, b) => a.ticker.localeCompare(b.ticker)),
    [desk.listed],
  );

  function pickShoe(ticker: string) {
    const collab = listed.find((c) => c.ticker === ticker);
    if (!collab) {
      setDraft({ ...draft, ticker: "", name: "" });
      return;
    }
    setDraft({
      ...draft,
      ticker: collab.ticker,
      name: collab.name,
      channel: draft.channel || collab.channels[0] || "",
    });
  }

  function saveWindow() {
    const day = isoDay(draft.date);
    const ticker = draft.ticker.trim().toUpperCase();
    if (!day || !ticker) {
      onMsg("Pick a shoe and a date.");
      return;
    }
    if (hasWindowOnDay(desk.calendar, ticker, day)) {
      onMsg("Already on When for that day.");
      return;
    }
    const collab = listed.find((c) => c.ticker === ticker);
    desk.addWindow({
      date: day,
      ticker,
      name: draft.name.trim() || collab?.name || ticker,
      channel: draft.channel.trim() || collab?.channels[0] || "Desk",
      status: draft.status,
    });
    if (collab && !isoDay(collab.dropDate)) {
      desk.patch(collab.slug, { dropDate: day });
    }
    onMsg("Saved. It is on When.");
    setDraft({ ...draft, name: collab ? collab.name : "" });
  }

  return (
    <Panel kicker="DATES" title="Drop calendar" className="border-x-0" bodyClassName="p-4" fill={false}>
      <p className="mb-3 text-[13px] leading-5 text-muted">
        Pick a shoe already on the board, set the date, and say how it drops
        — for sale, raffle, surprise, or done. A release date on the shoe
        file also puts it on When as for sale until you change it.
      </p>
      <form
        className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5"
        onSubmit={(e) => {
          e.preventDefault();
          saveWindow();
        }}
      >
        <label className="block sm:col-span-2 lg:col-span-2">
          <span className="kicker">Shoe on the board</span>
          <select
            value={listed.some((c) => c.ticker === draft.ticker) ? draft.ticker : ""}
            onChange={(e) => pickShoe(e.target.value)}
            className="mt-1 w-full border border-line bg-bg px-2 py-1 font-mono text-[12px] text-ink"
          >
            <option value="">Pick a name on the board</option>
            {listed.map((c) => (
              <option key={c.slug} value={c.ticker}>
                {c.ticker} · {c.name}
              </option>
            ))}
          </select>
        </label>
        <Field
          label="Drop date"
          value={isoDay(draft.date)}
          type="date"
          onChange={(date) => setDraft({ ...draft, date })}
        />
        <Field
          label="Shop or site"
          value={draft.channel}
          placeholder="adidas, SNKRS, Kith"
          onChange={(channel) => setDraft({ ...draft, channel })}
        />
        <HowSelect
          value={draft.status}
          onChange={(status) => setDraft({ ...draft, status })}
          label="How it drops"
        />
        <div className="sm:col-span-2 lg:col-span-5">
          <SaveButton onClick={saveWindow}>Save this date</SaveButton>
        </div>
      </form>
      <ul className="divide-y divide-line border border-line">
        {desk.calendar.map((ev, i) => (
          <li key={`${ev.date}-${ev.ticker}-${i}`} className="flex items-center justify-between gap-2 px-3 py-2">
            <div>
              <div className="font-mono text-[11px] text-dim">
                {ev.date} · {windowStatusLabel[ev.status]} · {ev.channel}
              </div>
              <div className="font-cond text-[14px] text-gold-2">{ev.ticker}</div>
              <div className="text-[12px] text-muted">{ev.name}</div>
            </div>
            <button
              type="button"
              className="font-mono text-[10px] text-down uppercase"
              onClick={() => desk.removeWindow(i)}
            >
              Remove
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
    <Panel kicker="SALES" title="Resale sales" className="border-x-0" bodyClassName="p-4" fill={false}>
      <div className="mb-4 grid gap-2 sm:grid-cols-5">
        <Field label="Sale time (Eastern)" value={t} onChange={setT} />
        <Field
          label="Board code"
          value={ticker}
          placeholder="WSG.JAZZ"
          onChange={setTicker}
        />
        <Field label="Shoe size" value={size} onChange={setSize} />
        <Field
          label="Sale price"
          value={price}
          placeholder="286"
          onChange={setPrice}
        />
        <label className="block">
          <span className="kicker">Bought or sold</span>
          <select
            value={side}
            onChange={(e) => setSide(e.target.value as "buy" | "sell")}
            className="mt-1 w-full border border-line bg-bg px-2 py-1 font-mono text-[12px] text-ink"
          >
            <option value="buy">Bought</option>
            <option value="sell">Sold</option>
          </select>
        </label>
      </div>
      <SaveButton
        onClick={() => {
          const px = Number(price);
          if (!ticker || !px) {
            onMsg("Board code and sale price required.");
            return;
          }
          desk.addPrint({ t, ticker: ticker.toUpperCase(), size, price: px, side });
          onMsg("Sale saved.");
          setPrice("");
        }}
      >
        Save this sale
      </SaveButton>
      <ul className="mt-4 divide-y divide-line border border-line">
        {desk.prints.map((p, i) => (
          <li key={`${p.t}-${p.ticker}-${i}`} className="flex items-center justify-between px-3 py-2 font-mono text-[12px]">
            <span className="text-dim">{p.t}</span>
            <span className="text-gold-2">{p.ticker}</span>
            <span>{p.size}</span>
            <span className={p.side === "buy" ? "text-up" : "text-down"}>{p.price}</span>
            <button type="button" className="text-[10px] text-down uppercase" onClick={() => desk.removePrint(i)}>
              Remove
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
    <Panel kicker="FILE" title="Publish this desk" className="border-x-0" bodyClassName="space-y-3 p-4" fill={false}>
      <p className="text-[13px] leading-5 text-muted">
        Dates on this phone are the desk call. They update when you publish
        the desk file to GitHub — not by shipping a new Play Store build. The
        shop or partner account is the real time. Follow those.
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
          Download desk file
        </button>
        <button
          type="button"
          className="border border-line px-2 py-1 font-mono text-[10px] tracking-[0.14em] text-muted uppercase"
          onClick={async () => {
            await navigator.clipboard.writeText(json);
            onMsg("Copied.");
          }}
        >
          Copy desk file
        </button>
        <button
          type="button"
          className="border border-line px-2 py-1 font-mono text-[10px] tracking-[0.14em] text-muted uppercase"
          onClick={async () => {
            const ok = await desk.pullRemote();
            onMsg(ok ? "Pulled remote book into this device." : "Remote book not reachable.");
          }}
        >
          Pull from GitHub
        </button>
        <label className="border border-line px-2 py-1 font-mono text-[10px] tracking-[0.14em] text-muted uppercase">
          Import a desk file
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
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: "text" | "date";
}) {
  return (
    <label className="block">
      <span className="kicker">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full border border-line bg-bg px-2 py-1 font-mono text-[12px] text-ink outline-none focus:border-gold"
      />
    </label>
  );
}

const howItDrops: DropEvent["status"][] = ["priced", "raffle", "shock", "closed"];

function HowSelect({
  value,
  onChange,
  label,
}: {
  value: DropEvent["status"];
  onChange: (v: DropEvent["status"]) => void;
  label?: string;
}) {
  const select = (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as DropEvent["status"])}
      className="mt-1 w-full border border-line bg-bg px-2 py-1 font-mono text-[12px] text-ink"
      aria-label={label ?? "How it drops"}
    >
      {howItDrops.map((s) => (
        <option key={s} value={s}>
          {windowStatusLabel[s]}
        </option>
      ))}
    </select>
  );
  if (!label) return select;
  return (
    <label className="block">
      <span className="kicker">{label}</span>
      {select}
    </label>
  );
}
