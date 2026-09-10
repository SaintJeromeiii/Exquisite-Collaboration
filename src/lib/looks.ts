import { seedSlugs } from "@/lib/desk-file";

export type Look = {
  src: string;
  label: string;
};

const DEFAULT_LOOKS: Look[] = [
  { src: "/looks/default-lat.png", label: "Side" },
  { src: "/looks/default-3q.png", label: "Three-quarter" },
];

export function hasStill(slug: string) {
  return seedSlugs.has(slug);
}

export function collabLooks(slug: string): Look[] {
  if (!hasStill(slug)) return DEFAULT_LOOKS;
  return [
    { src: `/looks/${slug}-lat.png`, label: "Side" },
    { src: `/looks/${slug}-3q.png`, label: "Three-quarter" },
  ];
}

export function collabHero(slug: string) {
  return hasStill(slug) ? `/looks/${slug}-lat.png` : DEFAULT_LOOKS[0].src;
}
