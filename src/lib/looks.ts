export type Look = {
  src: string;
  label: string;
};

export function collabLooks(slug: string): Look[] {
  return [
    { src: `/looks/${slug}-lat.png`, label: "Side" },
    { src: `/looks/${slug}-3q.png`, label: "Three-quarter" },
  ];
}

export function collabHero(slug: string) {
  return `/looks/${slug}-lat.png`;
}
