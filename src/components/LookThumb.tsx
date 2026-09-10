"use client";

import { useEffect, useState } from "react";
import { ShoeMark } from "@/components/ShoeMark";
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

  useEffect(() => {
    setOk(true);
  }, [slug]);

  if (!ok) return <ShoeMark ticker={ticker} className={className} />;

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
