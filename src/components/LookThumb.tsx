"use client";

import { useState } from "react";
import { collabHero } from "@/lib/looks";

export function LookThumb({
  slug,
  ticker,
  className = "h-8 w-11",
}: {
  slug: string;
  ticker: string;
  className?: string;
}) {
  const [ok, setOk] = useState(true);
  if (!ok) return null;
  return (
    <img
      src={collabHero(slug)}
      alt=""
      className={`shrink-0 border border-line bg-bg object-cover ${className}`}
      title={ticker}
      onError={() => setOk(false)}
    />
  );
}
