"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function Redirect({ href }: { href: string }) {
  const router = useRouter();
  useEffect(() => {
    router.replace(href);
  }, [href, router]);
  return <p className="p-4 text-[13px] text-muted">Taking you there…</p>;
}
