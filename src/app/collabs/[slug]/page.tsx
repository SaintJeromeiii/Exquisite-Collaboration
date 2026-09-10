import { CollabDossier } from "@/components/CollabDossier";
import { collabs, getCollab } from "@/data/market";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return collabs.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = getCollab(slug);
  if (!c) return { title: "Not on the board — Exquisite" };
  return {
    title: `${c.name} | Exquisite`,
    description: c.thesis,
  };
}

export default async function CollabPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!getCollab(slug)) notFound();
  return <CollabDossier slug={slug} />;
}
