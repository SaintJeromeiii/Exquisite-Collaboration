"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type DeskBook = {
  followed: string[];
  endorsed: string[];
};

const EMPTY: DeskBook = { followed: [], endorsed: [] };
const KEY = "exq.desk.book.v1";

type DeskBookApi = {
  ready: boolean;
  followed: Set<string>;
  endorsed: Set<string>;
  follow: (slug: string) => void;
  unfollow: (slug: string) => void;
  endorse: (slug: string) => void;
  revoke: (slug: string) => void;
};

const DeskBookContext = createContext<DeskBookApi | null>(null);

export function DeskBookProvider({ children }: { children: React.ReactNode }) {
  const [book, setBook] = useState<DeskBook>(EMPTY);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as DeskBook;
        // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage hydrate
        setBook({
          followed: Array.isArray(parsed.followed) ? parsed.followed : [],
          endorsed: Array.isArray(parsed.endorsed) ? parsed.endorsed : [],
        });
      }
    } catch {
      setBook(EMPTY);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(KEY, JSON.stringify(book));
  }, [book, ready]);

  const follow = useCallback((slug: string) => {
    setBook((current) =>
      current.followed.includes(slug)
        ? current
        : { ...current, followed: [...current.followed, slug] },
    );
  }, []);

  const unfollow = useCallback((slug: string) => {
    setBook((current) => ({
      followed: current.followed.filter((item) => item !== slug),
      endorsed: current.endorsed.filter((item) => item !== slug),
    }));
  }, []);

  const endorse = useCallback((slug: string) => {
    setBook((current) => ({
      followed: current.followed.includes(slug)
        ? current.followed
        : [...current.followed, slug],
      endorsed: current.endorsed.includes(slug)
        ? current.endorsed
        : [...current.endorsed, slug],
    }));
  }, []);

  const revoke = useCallback((slug: string) => {
    setBook((current) => ({
      ...current,
      endorsed: current.endorsed.filter((item) => item !== slug),
    }));
  }, []);

  const value = useMemo(
    () => ({
      ready,
      followed: new Set(book.followed),
      endorsed: new Set(book.endorsed),
      follow,
      unfollow,
      endorse,
      revoke,
    }),
    [book.followed, book.endorsed, ready, follow, unfollow, endorse, revoke],
  );

  return (
    <DeskBookContext.Provider value={value}>{children}</DeskBookContext.Provider>
  );
}

export function useDeskBook() {
  const ctx = useContext(DeskBookContext);
  if (!ctx) {
    throw new Error("useDeskBook requires DeskBookProvider");
  }
  return ctx;
}
