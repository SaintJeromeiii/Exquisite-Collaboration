"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CollabDossier } from "@/components/CollabDossier";

function FileBody() {
  const params = useSearchParams();
  const slug = params.get("s") ?? "";
  return <CollabDossier slug={slug} />;
}

export default function FilePage() {
  return (
    <Suspense fallback={<p className="p-4 font-mono text-[11px] text-dim">Loading file…</p>}>
      <FileBody />
    </Suspense>
  );
}
