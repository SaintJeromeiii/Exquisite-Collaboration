"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { collabs as seedCollabs, premium, type Collab, type DropEvent, type Print } from "@/data/market";
import {
  draftFromCollab,
  emptyDeskFile,
  fetchRemoteDeskFile,
  parseDeskFile,
  resolveDesk,
  slugFromTicker,
  type CollabPatch,
  restoreWipedSeedCopy,
  mergeRemoteCoverage,
  remoteIsNewer,
  type DeskFile,
  type ExtraDraft,
} from "@/lib/desk-file";
import { isoDay, releaseWindowFor, upsertReleaseWindow } from "@/lib/desk-when";

const KEY_V1 = "exq.desk.book.v1";
const KEY = "exq.desk.book.v2";

type DeskApi = {
  ready: boolean;
  file: DeskFile;
  listed: Collab[];
  all: Collab[];
  killed: Set<string>;
  calendar: DropEvent[];
  prints: Print[];
  followed: Set<string>;
  endorsed: Set<string>;
  stamps: Record<string, string>;
  remoteAt: string | null;
  get: (slug: string) => Collab | undefined;
  follow: (slug: string) => void;
  unfollow: (slug: string) => void;
  endorse: (slug: string) => void;
  revoke: (slug: string) => void;
  setStamp: (slug: string, note: string) => void;
  patch: (slug: string, patch: CollabPatch) => void;
  setDropDate: (slug: string, date: string) => void;
  addName: (draft: Omit<ExtraDraft, "slug"> & { slug?: string }) => string | null;
  kill: (slug: string) => void;
  restore: (slug: string) => void;
  restoreSeedCopy: (slug: string) => void;
  addWindow: (ev: DropEvent) => void;
  patchWindow: (index: number, patch: Partial<DropEvent>) => void;
  removeWindow: (index: number) => void;
  addPrint: (print: Print) => void;
  removePrint: (index: number) => void;
  pullRemote: () => Promise<boolean>;
  importFile: (raw: unknown) => boolean;
  exportFile: () => DeskFile;
  save: () => void;
};

const DeskContext = createContext<DeskApi | null>(null);

function touch(file: DeskFile): DeskFile {
  return { ...file, updatedAt: new Date().toISOString() };
}

function withCollabPatch(
  current: DeskFile,
  slug: string,
  next: CollabPatch,
): DeskFile {
  const extraIndex = current.extras.findIndex((item) => item.slug === slug);
  if (extraIndex >= 0) {
    const extras = current.extras.slice();
    extras[extraIndex] = {
      ...extras[extraIndex],
      ...next,
      slug,
      ticker: extras[extraIndex].ticker,
    };
    return { ...current, extras };
  }
  return {
    ...current,
    patches: {
      ...current.patches,
      [slug]: { ...current.patches[slug], ...next },
    },
  };
}

function loadStored(): { file: DeskFile; hadLocal: boolean } {
  try {
    const v2 = window.localStorage.getItem(KEY);
    if (v2) {
      const parsed = parseDeskFile(JSON.parse(v2));
      if (parsed) return { file: parsed, hadLocal: true };
    }
    const v1 = window.localStorage.getItem(KEY_V1);
    if (v1) {
      const parsed = parseDeskFile(JSON.parse(v1));
      if (parsed) return { file: parsed, hadLocal: true };
    }
  } catch {
    // fall through
  }
  return { file: emptyDeskFile(), hadLocal: false };
}

export function DeskBookProvider({ children }: { children: React.ReactNode }) {
  const [file, setFile] = useState<DeskFile>(emptyDeskFile);
  const [ready, setReady] = useState(false);
  const [remoteAt, setRemoteAt] = useState<string | null>(null);

  useEffect(() => {
    const { file: stored, hadLocal } = loadStored();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage hydrate
    setFile(restoreWipedSeedCopy(stored));
    setReady(true);

    void (async () => {
      const remote = await fetchRemoteDeskFile();
      if (!remote) return;
      setRemoteAt(remote.updatedAt);
      setFile((current) => {
        const next = restoreWipedSeedCopy(remote);
        if (!hadLocal) return mergeRemoteCoverage(current, next);
        if (!remoteIsNewer(current, next)) return current;
        return mergeRemoteCoverage(current, next);
      });
    })();
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(file));
    } catch {
      // private mode / quota
    }
  }, [file, ready]);

  const resolved = useMemo(() => resolveDesk(file), [file]);

  const mutate = useCallback((fn: (current: DeskFile) => DeskFile) => {
    setFile((current) => touch(fn(current)));
  }, []);

  const mutatePersonal = useCallback((fn: (current: DeskFile) => DeskFile) => {
    setFile(fn);
  }, []);

  const follow = useCallback((slug: string) => {
    mutatePersonal((current) =>
      current.followed.includes(slug)
        ? current
        : { ...current, followed: [...current.followed, slug] },
    );
  }, [mutatePersonal]);

  const unfollow = useCallback((slug: string) => {
    mutatePersonal((current) => ({
      ...current,
      followed: current.followed.filter((item) => item !== slug),
      endorsed: current.endorsed.filter((item) => item !== slug),
      stamps: Object.fromEntries(
        Object.entries(current.stamps).filter(([key]) => key !== slug),
      ),
    }));
  }, [mutatePersonal]);

  const endorse = useCallback((slug: string) => {
    mutatePersonal((current) => ({
      ...current,
      followed: current.followed.includes(slug)
        ? current.followed
        : [...current.followed, slug],
      endorsed: current.endorsed.includes(slug)
        ? current.endorsed
        : [...current.endorsed, slug],
    }));
  }, [mutatePersonal]);

  const revoke = useCallback((slug: string) => {
    mutatePersonal((current) => ({
      ...current,
      endorsed: current.endorsed.filter((item) => item !== slug),
      stamps: Object.fromEntries(
        Object.entries(current.stamps).filter(([key]) => key !== slug),
      ),
    }));
  }, [mutatePersonal]);

  const setStamp = useCallback((slug: string, note: string) => {
    mutatePersonal((current) => ({
      ...current,
      followed: current.followed.includes(slug)
        ? current.followed
        : [...current.followed, slug],
      endorsed: current.endorsed.includes(slug)
        ? current.endorsed
        : [...current.endorsed, slug],
      stamps: { ...current.stamps, [slug]: note },
    }));
  }, [mutatePersonal]);

  const patch = useCallback((slug: string, next: CollabPatch) => {
    mutate((current) => withCollabPatch(current, slug, next));
  }, [mutate]);

  const setDropDate = useCallback((slug: string, date: string) => {
    mutate((current) => {
      const day = isoDay(date);
      const before = resolveDesk(current).all.find((c) => c.slug === slug);
      const patched = withCollabPatch(current, slug, { dropDate: day });
      if (!day || !before) return patched;
      return {
        ...patched,
        calendar: upsertReleaseWindow(
          current.calendar ?? resolveDesk(current).calendar,
          before.ticker,
          before.dropDate,
          releaseWindowFor(before, day),
        ),
      };
    });
  }, [mutate]);

  const addName = useCallback((draft: Omit<ExtraDraft, "slug"> & { slug?: string }) => {
    const slug = draft.slug || slugFromTicker(draft.ticker);
    const ticker = draft.ticker.trim().toUpperCase();
    if (!slug || !ticker) return null;
    const taken =
      seedCollabs.some((c) => c.slug === slug || c.ticker === ticker) ||
      file.extras.some((item) => item.slug === slug || item.ticker === ticker);
    if (taken) return null;
    mutate((current) => {
      if (current.extras.some((item) => item.slug === slug || item.ticker === ticker)) {
        return current;
      }
      const extra: ExtraDraft = {
        ...draft,
        slug,
        ticker,
        dropDate: isoDay(draft.dropDate),
        channels: draft.channels.length ? draft.channels : ["Desk"],
      };
      const day = extra.dropDate;
      return {
        ...current,
        extras: [...current.extras, extra],
        followed: current.followed.includes(slug)
          ? current.followed
          : [...current.followed, slug],
        calendar: day
          ? upsertReleaseWindow(
              current.calendar ?? resolveDesk(current).calendar,
              ticker,
              undefined,
              releaseWindowFor(extra, day),
            )
          : current.calendar,
      };
    });
    return slug;
  }, [file.extras, mutate]);

  const kill = useCallback((slug: string) => {
    mutate((current) =>
      current.killed.includes(slug)
        ? current
        : { ...current, killed: [...current.killed, slug] },
    );
  }, [mutate]);

  const restore = useCallback((slug: string) => {
    mutate((current) => ({
      ...current,
      killed: current.killed.filter((item) => item !== slug),
    }));
  }, [mutate]);

  const restoreSeedCopy = useCallback((slug: string) => {
    mutate((current) => {
      const patch = { ...(current.patches[slug] ?? {}) };
      delete patch.thesis;
      delete patch.strategy;
      const patches = { ...current.patches };
      if (Object.keys(patch).length) patches[slug] = patch;
      else delete patches[slug];
      return { ...current, patches };
    });
  }, [mutate]);

  const addWindow = useCallback((ev: DropEvent) => {
    mutate((current) => ({
      ...current,
      calendar: [...(current.calendar ?? resolved.calendar), ev],
    }));
  }, [mutate, resolved.calendar]);

  const patchWindow = useCallback((index: number, patch: Partial<DropEvent>) => {
    mutate((current) => {
      const rows = (current.calendar ?? resolved.calendar).slice();
      if (!rows[index]) return current;
      rows[index] = { ...rows[index], ...patch };
      return { ...current, calendar: rows };
    });
  }, [mutate, resolved.calendar]);

  const removeWindow = useCallback((index: number) => {
    mutate((current) => {
      const rows = (current.calendar ?? resolved.calendar).slice();
      rows.splice(index, 1);
      return { ...current, calendar: rows };
    });
  }, [mutate, resolved.calendar]);

  const addPrint = useCallback((print: Print) => {
    mutate((current) => ({
      ...current,
      prints: [print, ...(current.prints ?? resolved.prints)].slice(0, 80),
    }));
  }, [mutate, resolved.prints]);

  const removePrint = useCallback((index: number) => {
    mutate((current) => {
      const rows = (current.prints ?? resolved.prints).slice();
      rows.splice(index, 1);
      return { ...current, prints: rows };
    });
  }, [mutate, resolved.prints]);

  const pullRemote = useCallback(async () => {
    const remote = await fetchRemoteDeskFile();
    if (!remote) return false;
    setRemoteAt(remote.updatedAt);
    setFile((current) => mergeRemoteCoverage(current, restoreWipedSeedCopy(remote)));
    return true;
  }, []);

  const importFile = useCallback((raw: unknown) => {
    const parsed = parseDeskFile(raw);
    if (!parsed) return false;
    setFile((current) => mergeRemoteCoverage(current, parsed));
    return true;
  }, []);

  const exportFile = useCallback(() => file, [file]);

  const save = useCallback(() => {
    setFile((current) => touch(current));
  }, []);

  const get = useCallback(
    (slug: string) => resolved.all.find((c) => c.slug === slug),
    [resolved.all],
  );

  const value = useMemo<DeskApi>(
    () => ({
      ready,
      file,
      listed: resolved.listed,
      all: resolved.all,
      killed: resolved.killed,
      calendar: resolved.calendar,
      prints: resolved.prints,
      followed: new Set(file.followed),
      endorsed: new Set(file.endorsed),
      stamps: file.stamps,
      remoteAt,
      get,
      follow,
      unfollow,
      endorse,
      revoke,
      setStamp,
      patch,
      setDropDate,
      addName,
      kill,
      restore,
      restoreSeedCopy,
      addWindow,
      patchWindow,
      removeWindow,
      addPrint,
      removePrint,
      pullRemote,
      importFile,
      exportFile,
      save,
    }),
    [
      addName,
      addPrint,
      addWindow,
      endorse,
      exportFile,
      file,
      follow,
      get,
      importFile,
      kill,
      patch,
      patchWindow,
      pullRemote,
      ready,
      remoteAt,
      removePrint,
      removeWindow,
      resolved,
      restore,
      restoreSeedCopy,
      revoke,
      save,
      setDropDate,
      setStamp,
      unfollow,
    ],
  );

  return <DeskContext.Provider value={value}>{children}</DeskContext.Provider>;
}

export function useDesk() {
  const ctx = useContext(DeskContext);
  if (!ctx) throw new Error("useDesk requires DeskBookProvider");
  return ctx;
}

export function useDeskBook() {
  const desk = useDesk();
  return {
    ready: desk.ready,
    followed: desk.followed,
    endorsed: desk.endorsed,
    follow: desk.follow,
    unfollow: desk.unfollow,
    endorse: desk.endorse,
    revoke: desk.revoke,
  };
}

export function deskKpis(listed: Collab[], calendar: DropEvent[]) {
  const priced = listed.filter((c) => c.last > 0);
  const premAvg =
    priced.reduce((sum, c) => sum + premium(c), 0) / Math.max(priced.length, 1);
  return {
    premiumIdx: Math.round(premAvg * 10) / 10,
    adv: priced.reduce((sum, c) => sum + c.volume24h, 0),
    openDrops: calendar.filter((e) => e.status !== "closed").length,
    names: listed.length,
  };
}

export { draftFromCollab };
