"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  emptyPrefs,
  loadPrefs,
  savePrefs,
  type DeskCity,
  type DeskPrefs,
} from "@/lib/desk-prefs";

type PrefsApi = DeskPrefs & {
  ready: boolean;
  setSize: (size: string) => void;
  setCity: (city: DeskCity | "") => void;
};

const PrefsContext = createContext<PrefsApi | null>(null);

export function DeskPrefsProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<DeskPrefs>(emptyPrefs);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage hydrate
    setPrefs(loadPrefs());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    savePrefs(prefs);
  }, [prefs, ready]);

  const setSize = useCallback((size: string) => {
    setPrefs((cur) => ({ ...cur, size }));
  }, []);

  const setCity = useCallback((city: DeskCity | "") => {
    setPrefs((cur) => ({ ...cur, city }));
  }, []);

  const value = useMemo<PrefsApi>(
    () => ({ ...prefs, ready, setSize, setCity }),
    [prefs, ready, setSize, setCity],
  );

  return <PrefsContext.Provider value={value}>{children}</PrefsContext.Provider>;
}

export function useDeskPrefs() {
  const ctx = useContext(PrefsContext);
  if (!ctx) throw new Error("useDeskPrefs requires DeskPrefsProvider");
  return ctx;
}
