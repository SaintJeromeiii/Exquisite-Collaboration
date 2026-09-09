"use client";

import { CITY_OPTIONS, SIZE_OPTIONS } from "@/lib/desk-prefs";
import { useDeskPrefs } from "@/lib/desk-prefs-context";

export function PrefsBar() {
  const { size, city, setSize, setCity } = useDeskPrefs();

  return (
    <div className="mt-3 flex flex-wrap items-end gap-3">
      <label className="block">
        <span className="kicker">Your size</span>
        <select
          value={size}
          onChange={(e) => setSize(e.target.value)}
          className="mt-1 block border border-line bg-bg px-2 py-1 text-[13px] text-ink"
        >
          <option value="">Not set</option>
          {SIZE_OPTIONS.map((s) => (
            <option key={s} value={s}>
              US {s}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="kicker">City</span>
        <select
          value={city}
          onChange={(e) =>
            setCity(e.target.value as (typeof CITY_OPTIONS)[number]["id"] | "")
          }
          className="mt-1 block border border-line bg-bg px-2 py-1 text-[13px] text-ink"
        >
          <option value="">Any</option>
          {CITY_OPTIONS.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
