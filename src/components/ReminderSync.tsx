"use client";

import { useEffect } from "react";
import { useDesk } from "@/lib/desk-book";
import { syncDropReminders } from "@/lib/drop-reminders";

export function ReminderSync() {
  const { ready, calendar, listed } = useDesk();

  useEffect(() => {
    if (!ready) return;
    void syncDropReminders(calendar, listed);
  }, [ready, calendar, listed]);

  return null;
}
