"use client";

import { useEffect, useState } from "react";
import { useDesk } from "@/lib/desk-book";
import { followThisWeek } from "@/lib/follow-week";
import { localIso } from "@/lib/when-grid";

export function FollowWeek() {
  const { calendar, listed } = useDesk();
  const [today, setToday] = useState("");

  useEffect(() => {
    setToday(localIso());
  }, []);

  if (!today) return null;

  const names = followThisWeek(listed, calendar, today);
  if (!names.length) return null;

  return (
    <div className="border-b border-line px-4 py-3">
      <p className="kicker">This week</p>
      <p className="mt-1 text-[13px] leading-5 text-muted">
        Follow {names.join(", ")}. Drop times usually hit their social first.
      </p>
    </div>
  );
}
