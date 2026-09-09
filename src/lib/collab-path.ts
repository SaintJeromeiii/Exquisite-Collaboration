import { seedSlugs } from "@/lib/desk-file";

export function collabHref(slug: string) {
  return seedSlugs.has(slug)
    ? `/collabs/${slug}/`
    : `/file/?s=${encodeURIComponent(slug)}`;
}
