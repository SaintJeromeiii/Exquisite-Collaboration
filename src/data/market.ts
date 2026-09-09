export type SessionStatus = "pre-market" | "live" | "secondary" | "retired";

export type Ohlc = {
  t: string;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
};

export type SizeLevel = {
  size: string;
  bid: number;
  ask: number;
  volume: number;
  peak: boolean;
};

export type Print = {
  t: string;
  ticker: string;
  size: string;
  price: number;
  side: "buy" | "sell";
};

export type DropEvent = {
  date: string;
  ticker: string;
  name: string;
  channel: string;
  status: "priced" | "raffle" | "shock" | "closed";
};

export type CollabSeat =
  | "celebrity"
  | "athlete"
  | "boutique"
  | "designer"
  | "retailer"
  | "brand";

export const seatOrder: CollabSeat[] = [
  "celebrity",
  "athlete",
  "boutique",
  "designer",
  "retailer",
  "brand",
];

export const seatLabel: Record<CollabSeat, string> = {
  celebrity: "Celebrity",
  athlete: "Athlete",
  boutique: "Boutique",
  designer: "Designer",
  retailer: "Retailer",
  brand: "Brand",
};

export const seatShort: Record<CollabSeat, string> = {
  celebrity: "CEL",
  athlete: "ATH",
  boutique: "BOUT",
  designer: "DSN",
  retailer: "RTL",
  brand: "BRD",
};

export type Collab = {
  slug: string;
  ticker: string;
  name: string;
  partner: string;
  seat: CollabSeat;
  brand: string;
  silhouette: string;
  colorway: string;
  retail: number;
  last: number;
  changePct: number;
  volume24h: number;
  peakSize: string;
  sizePremiumPct: number;
  dropDate: string;
  status: SessionStatus;
  scarcity: number;
  channels: string[];
  materials: string[];
  thesis: string;
  strategy: string;
  series: Ohlc[];
  sizes: SizeLevel[];
  notes: string[];
};

function hash(input: string) {
  let h = 0;
  for (let i = 0; i < input.length; i += 1) {
    h = (h * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function round(n: number) {
  return Math.round(n * 100) / 100;
}

function addDays(iso: string, days: number) {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function seriesFrom(key: string, startDate: string, days: number, start: number, end: number) {
  const h = hash(key);
  const out: Ohlc[] = [];
  let close = start;
  const drift = (end / start) ** (1 / Math.max(days - 1, 1)) - 1;

  for (let i = 0; i < days; i += 1) {
    const wave = Math.sin((i + (h % 11)) / 5.5) * 0.018;
    const jitter = (((h + i * 19) % 9) - 4) * 0.0024;
    const next = Math.max(40, close * (1 + drift + wave + jitter));
    const high = Math.max(close, next) * (1.012 + ((h + i) % 5) * 0.002);
    const low = Math.min(close, next) * (0.988 - ((h + i) % 4) * 0.002);
    out.push({
      t: addDays(startDate, i),
      o: round(close),
      h: round(high),
      l: round(low),
      c: round(next),
      v: 60 + ((h + i * 23) % 280),
    });
    close = next;
  }

  return out;
}

function sizeBook(peak: string, last: number, seed: string): SizeLevel[] {
  const sizes = ["7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12", "13"];
  const h = hash(seed);
  const peakIndex = sizes.indexOf(peak);

  return sizes.map((size, i) => {
    const dist = Math.abs(i - peakIndex);
    const loc = 1 + Math.max(0, 0.05 - dist * 0.02);
    const spread = 8 + dist * 3 + (h % 5);
    const mid = last * loc * (1 - dist * 0.022);
    return {
      size,
      bid: Math.round(mid - spread / 2),
      ask: Math.round(mid + spread / 2),
      volume: Math.max(4, 52 - dist * 9 + ((h + i) % 8)),
      peak: size === peak,
    };
  });
}

export const collabs: Collab[] = [
  {
    slug: "wsg-jazz",
    ticker: "WSG.JAZZ",
    name: "Westside Gunn x Saucony Grid Jazz 9",
    partner: "Westside Gunn",
    seat: "celebrity",
    brand: "Saucony",
    silhouette: "Grid Jazz 9",
    colorway: "Awesome God",
    retail: 170,
    last: 286,
    changePct: 4.38,
    volume24h: 184200,
    peakSize: "10.5",
    sizePremiumPct: 18.4,
    dropDate: "2026-08-28",
    status: "secondary",
    scarcity: 82,
    channels: ["Kith", "EQL", "Saucony", "Griselda"],
    materials: [
      "Zebra / cheetah / cow faux pony hair",
      "Premium leather lining",
      "Moccasin laces",
      "Acrylic scorpion hangtag",
    ],
    thesis:
      "Archival running silhouette converted into a one-off art object. Animal-print pony hair is laid irregularly, so pairs are not identical. Branding is fully Griselda: scorpion on heel window, insole, and hangtag. Timed to Westside Gunn Day in Buffalo and the Flygod Is An Awesome God trilogy.",
    strategy:
      "Highest-conviction WSG print. Watch 10–11.5 for structural premium. Secondary bid still holds 60%+ over retail 12 sessions after the 08/28 drop.",
    series: seriesFrom("WSG.JAZZ", "2026-08-28", 13, 410, 286),
    sizes: sizeBook("10.5", 286, "WSG.JAZZ"),
    notes: [
      "Partial album sessions recorded at Saucony Boston Innovation Hub.",
      "Design language references atmos Tokyo maximalism and Jeremy Scott collage logic.",
      "Prior vault pulls (Triumph 4, Omni 9) trained the market to treat WSG x Saucony as a series, not a one-off.",
    ],
  },
  {
    slug: "wsg-triumph",
    ticker: "WSG.TRI",
    name: "Westside Gunn x Saucony ProGrid Triumph 4",
    partner: "Westside Gunn",
    seat: "celebrity",
    brand: "Saucony",
    silhouette: "ProGrid Triumph 4",
    colorway: "Super Flygod",
    retail: 180,
    last: 312,
    changePct: -1.26,
    volume24h: 96400,
    peakSize: "11",
    sizePremiumPct: 14.1,
    dropDate: "2025-12-04",
    status: "secondary",
    scarcity: 74,
    channels: ["Kith", "Saucony", "EQL"],
    materials: ["Neon overlay", "Glow-in-the-dark compounds", "Early-2000s performance mesh"],
    thesis:
      "Series opener. Neon GITD Triumph 4 pulled from Saucony’s early-2000s performance vault and reissued as lifestyle. Set the bid for every later WSG vault shoe.",
    strategy:
      "Mature name. Spread has compressed since Jazz 9 priced. Use as a relative-value pair against WSG.JAZZ rather than a fresh entry.",
    series: seriesFrom("WSG.TRI", "2026-06-12", 90, 268, 312),
    sizes: sizeBook("11", 312, "WSG.TRI"),
    notes: [
      "Kith editorial framed the shoe as archive, not hype lifestyle.",
      "Glow treatment still drives after-hours photo volume, which keeps tape active.",
    ],
  },
  {
    slug: "wsg-omni",
    ticker: "WSG.OMN",
    name: "Westside Gunn x Saucony ProGrid Omni 9",
    partner: "Westside Gunn",
    seat: "celebrity",
    brand: "Saucony",
    silhouette: "ProGrid Omni 9",
    colorway: "Trail Flygod",
    retail: 170,
    last: 248,
    changePct: 0.81,
    volume24h: 61200,
    peakSize: "10",
    sizePremiumPct: 11.2,
    dropDate: "2026-03-18",
    status: "secondary",
    scarcity: 61,
    channels: ["Saucony", "EQL", "Boutiques"],
    materials: ["Trail mesh", "Aggressive lugged outsole", "Gunn graphic overlays"],
    thesis:
      "Trail tool from the same vault. Less fashion-week gravity than Jazz 9, more runner-crossover bid. Holds as the cheap way to stay long WSG x Saucony.",
    strategy:
      "Best risk/reward on the WSG curve if Jazz 9 premium mean-reverts. Mid sizes still the book.",
    series: seriesFrom("WSG.OMN", "2026-06-12", 90, 198, 248),
    sizes: sizeBook("10", 248, "WSG.OMN"),
    notes: ["Omni 9 is the volume name on the WSG strip.", "Trail last limits some lifestyle crossover."],
  },
  {
    slug: "bronson-1906",
    ticker: "BRN.1906",
    name: "Action Bronson x New Balance 1906R",
    partner: "Action Bronson",
    seat: "celebrity",
    brand: "New Balance",
    silhouette: "1906R",
    colorway: "Kitchen",
    retail: 185,
    last: 338,
    changePct: 2.12,
    volume24h: 142800,
    peakSize: "12",
    sizePremiumPct: 21.6,
    dropDate: "2026-07-11",
    status: "secondary",
    scarcity: 88,
    channels: ["NB", "Kith", "Concepts", "Password pages"],
    materials: ["Premium pigskin", "Open-mesh", "Bronson iconography"],
    thesis:
      "Scarcity is the trade. Localized password pages and split boutique allocation keep float tight. Size 9 and 12 carry the structural premium.",
    strategy:
      "Do not chase late secondary. Alpha is in geo-targeted password detection and Concepts/Kith raffle routing.",
    series: seriesFrom("BRN.1906", "2026-07-11", 61, 420, 338),
    sizes: sizeBook("12", 338, "BRN.1906"),
    notes: [
      "Watch sudden localized webstore locks — historically a 90-minute tell.",
      "Bronson’s NB book has a loyal size-12 bid that does not exist on most collabs.",
    ],
  },
  {
    slug: "kith-kayano",
    ticker: "KTH.GEL",
    name: "Kith x ASICS Gel-Kayano 14",
    partner: "Kith",
    seat: "retailer",
    brand: "ASICS",
    silhouette: "Gel-Kayano 14",
    colorway: "Lifestyle",
    retail: 160,
    last: 218,
    changePct: -0.91,
    volume24h: 201400,
    peakSize: "8.5",
    sizePremiumPct: 9.4,
    dropDate: "2026-05-02",
    status: "secondary",
    scarcity: 54,
    channels: ["Kith US", "Kith EU", "ASICS"],
    materials: ["Nubuck", "Gel tooling", "Kith sockliner"],
    thesis:
      "High lifestyle demand, lower scarcity. EU vs US stock leaks are the only remaining edge. Small sizes hold the bid.",
    strategy:
      "Treat as a volume/liquidity name. Premium is thin; use for tape reads, not directional alpha.",
    series: seriesFrom("KTH.GEL", "2026-06-12", 90, 236, 218),
    sizes: sizeBook("8.5", 218, "KTH.GEL"),
    notes: ["Regional Kith EU leaks still move the US book for 2–4 hours.", "Women’s/small-size bid is the real market."],
  },
  {
    slug: "jae-saucony",
    ticker: "JAE.SAU",
    name: "Jae Tips x Saucony",
    partner: "Jae Tips",
    seat: "celebrity",
    brand: "Saucony",
    silhouette: "Archive pack",
    colorway: "Tips Vault",
    retail: 160,
    last: 204,
    changePct: -3.32,
    volume24h: 42800,
    peakSize: "9.5",
    sizePremiumPct: 6.1,
    dropDate: "2025-11-14",
    status: "retired",
    scarcity: 41,
    channels: ["Saucony", "Secondary"],
    materials: ["Premium leather", "Tips graphic language"],
    thesis:
      "Capital rotation name. Jae Tips has moved the design seat to Nike. Saucony residual still trades, but the bid is a legacy audience, not new allocation.",
    strategy:
      "Fade unless a restock rumor prints. The flow story is JAE.NK, not this residual.",
    series: seriesFrom("JAE.SAU", "2026-06-12", 90, 246, 204),
    sizes: sizeBook("9.5", 204, "JAE.SAU"),
    notes: [
      "Useful as a control for WSG.JAZZ: same brand, different partner gravity.",
      "Do not confuse brand heat with partner heat.",
    ],
  },
  {
    slug: "jae-nike",
    ticker: "JAE.NK",
    name: "Jae Tips x Nike",
    partner: "Jae Tips",
    seat: "celebrity",
    brand: "Nike",
    silhouette: "Unconfirmed last",
    colorway: "Tips Nike",
    retail: 150,
    last: 0,
    changePct: 0,
    volume24h: 0,
    peakSize: "10",
    sizePremiumPct: 0,
    dropDate: "2026-10-15",
    status: "pre-market",
    scarcity: 90,
    channels: ["SNKRS", "Nike", "Boutiques TBD"],
    materials: ["TBD — watch materials leak 21–14 days pre-drop"],
    thesis:
      "Seat change is the trade. Tips leaving Saucony for Nike is a flow event: attention, affiliate clicks, and raffle congestion will reprice before the shoe exists.",
    strategy:
      "Desk is long the information, not the box. Track silhouette leaks, SNKRS geo, and whether the first Nike last is archival or new.",
    series: seriesFrom("JAE.NK", "2026-08-01", 40, 150, 150),
    sizes: sizeBook("10", 150, "JAE.NK"),
    notes: [
      "Implied market is a 40–70% day-one premium if the last is a known 2000s runner.",
      "If Nike issues a generic lifestyle cupsole, premium collapses. Silhouette selection is the whole model.",
    ],
  },
  {
    slug: "cortiez-nike",
    ticker: "CTZ.NK",
    name: "Cortiez x Nike",
    partner: "Cortiez",
    seat: "boutique",
    brand: "Nike",
    silhouette: "Collab runner",
    colorway: "UK street",
    retail: 140,
    last: 195,
    changePct: 1.04,
    volume24h: 38900,
    peakSize: "9",
    sizePremiumPct: 12.8,
    dropDate: "2026-06-20",
    status: "secondary",
    scarcity: 69,
    channels: ["Nike UK", "Cortiez", "EQL"],
    materials: ["Cordura mixes", "UK club color stories"],
    thesis:
      "UK streetwear bid with thinner US depth. Cross-Atlantic arb still exists on 8.5–9.5.",
    strategy:
      "Geo is the edge. US secondary often lags UK retail by a session.",
    series: seriesFrom("CTZ.NK", "2026-06-20", 82, 240, 195),
    sizes: sizeBook("9", 195, "CTZ.NK"),
    notes: ["Lower ADV — spreads are wide. Size in, don’t market-take."],
  },
  {
    slug: "atmos-sb",
    ticker: "ATM.SB",
    name: "atmos x Nike SB Dunk Low",
    partner: "atmos",
    seat: "boutique",
    brand: "Nike",
    silhouette: "SB Dunk Low",
    colorway: "Safari",
    retail: 135,
    last: 268,
    changePct: 1.72,
    volume24h: 156400,
    peakSize: "9.5",
    sizePremiumPct: 16.8,
    dropDate: "2026-04-09",
    status: "secondary",
    scarcity: 79,
    channels: ["atmos Tokyo", "SNKRS JP", "EQL"],
    materials: ["Safari pony hair", "Standard SB cupsole", "atmos heel embroidery"],
    thesis:
      "Tokyo boutique gravity, not celebrity. Safari dunks are a recurring atmos last: the bid is the store, the print, and JP allocation — not a rapper’s album cycle.",
    strategy:
      "Watch JP SNKRS geo and atmos web restocks. US secondary lags Tokyo by a session on shock windows.",
    series: seriesFrom("ATM.SB", "2026-04-09", 90, 310, 268),
    sizes: sizeBook("9.5", 268, "ATM.SB"),
    notes: [
      "atmos is the original maximalist boutique seat. Treat as a category, not a one-off dunk.",
      "Pony-hair pairs are not identical. That keeps the tape alive after the first week.",
    ],
  },
  {
    slug: "concepts-gel",
    ticker: "CNS.GEL",
    name: "Concepts x ASICS Gel-Lyte III",
    partner: "Concepts",
    seat: "boutique",
    brand: "ASICS",
    silhouette: "Gel-Lyte III",
    colorway: "Boston",
    retail: 150,
    last: 198,
    changePct: -0.5,
    volume24h: 54200,
    peakSize: "10",
    sizePremiumPct: 8.6,
    dropDate: "2026-06-06",
    status: "secondary",
    scarcity: 58,
    channels: ["Concepts", "ASICS", "EQL"],
    materials: ["Split tongue", "Premium suede", "Concepts woven"],
    thesis:
      "Boston boutique on an archival runner. Lower celebrity heat, sticky regional bid. This is the control name for ‘store as designer.’",
    strategy:
      "Do not expect WSG-style premiums. Use for boutique-seat relative value against KTH.GEL and JND.2160.",
    series: seriesFrom("CNS.GEL", "2026-06-06", 90, 220, 198),
    sizes: sizeBook("10", 198, "CNS.GEL"),
    notes: ["Concepts raffles still clear. Premium is the tell that the seat is healthy, not hyped."],
  },
  {
    slug: "bodega-2002r",
    ticker: "BDG.2002",
    name: "Bodega x New Balance 2002R",
    partner: "Bodega",
    seat: "boutique",
    brand: "New Balance",
    silhouette: "2002R",
    colorway: "Closed for Business",
    retail: 175,
    last: 255,
    changePct: 0.39,
    volume24h: 87300,
    peakSize: "10.5",
    sizePremiumPct: 13.2,
    dropDate: "2026-05-22",
    status: "secondary",
    scarcity: 71,
    channels: ["Bodega", "NB", "Kith"],
    materials: ["Mixed mesh", "Utility overlays", "Bodega hit"],
    thesis:
      "Boston-to-LA boutique language on a 2002R last. Story is store myth, not a celebrity universe. Holds a cleaner bid than most NB collabs without a rapper attached.",
    strategy:
      "Peak 10–11. Password pages on Bodega.com are the tell. Pair against BRN.1906 to separate artist premium from boutique premium.",
    series: seriesFrom("BDG.2002", "2026-05-22", 90, 290, 255),
    sizes: sizeBook("10.5", 255, "BDG.2002"),
    notes: ["Useful pair trade: BRN.1906 minus BDG.2002 ≈ celebrity overlay on NB."],
  },
  {
    slug: "jjjjound-2160",
    ticker: "JND.2160",
    name: "JJJJound x ASICS GT-2160",
    partner: "JJJJound",
    seat: "boutique",
    brand: "ASICS",
    silhouette: "GT-2160",
    colorway: "Muted",
    retail: 160,
    last: 242,
    changePct: 1.26,
    volume24h: 110800,
    peakSize: "9",
    sizePremiumPct: 15.4,
    dropDate: "2026-07-24",
    status: "secondary",
    scarcity: 84,
    channels: ["JJJJound", "ASICS", "EQL"],
    materials: ["Undyed mesh", "Quiet suede", "Tone-on-tone branding"],
    thesis:
      "Restraint is the product. JJJJound’s ASICS book trades on scarcity of taste, not loud materials. Small sizes and EU allocation drive the premium.",
    strategy:
      "Highest-conviction boutique ASICS print on the board. Do not confuse with Kith volume names.",
    series: seriesFrom("JND.2160", "2026-07-24", 48, 310, 242),
    sizes: sizeBook("9", 242, "JND.2160"),
    notes: ["Site crashes are the float. If JJJJound stays up, premium compresses."],
  },
  {
    slug: "union-jordan1",
    ticker: "UNI.J1",
    name: "Union LA x Air Jordan 1",
    partner: "Union LA",
    seat: "boutique",
    brand: "Jordan",
    silhouette: "Air Jordan 1",
    colorway: "Storm Blue",
    retail: 180,
    last: 410,
    changePct: -2.14,
    volume24h: 224600,
    peakSize: "10",
    sizePremiumPct: 22.8,
    dropDate: "2026-03-01",
    status: "secondary",
    scarcity: 91,
    channels: ["Union", "SNKRS", "Jordan"],
    materials: ["Stitched-through collar", "Aged midsole", "Union wing"],
    thesis:
      "Boutique construction on the most liquid last in footwear. Union AJ1s are a market of their own — celebrity is irrelevant. The collar and aging are the spec.",
    strategy:
      "Liquid enough to be a hedge. Spread is tight vs WSG-style art objects. Size 9–11 is the book.",
    series: seriesFrom("UNI.J1", "2026-03-01", 90, 520, 410),
    sizes: sizeBook("10", 410, "UNI.J1"),
    notes: ["Treat as the boutique benchmark. Everything else is a spread to UNI.J1."],
  },
  {
    slug: "amm-jordan3",
    ticker: "AMM.J3",
    name: "A Ma Maniére x Air Jordan 3",
    partner: "A Ma Maniére",
    seat: "boutique",
    brand: "Jordan",
    silhouette: "Air Jordan 3",
    colorway: "While You Were Sleeping",
    retail: 200,
    last: 365,
    changePct: 0.83,
    volume24h: 167900,
    peakSize: "10.5",
    sizePremiumPct: 17.1,
    dropDate: "2026-02-14",
    status: "secondary",
    scarcity: 80,
    channels: ["AMM", "SNKRS", "Jordan"],
    materials: ["Pebbled leather", "Muted elephant print", "AMM sockliner"],
    thesis:
      "Atlanta boutique luxury on a Jordan 3 last. Soft materials, tight raffle, no celebrity required. Women’s and men’s books both print.",
    strategy:
      "Follow the AMM series, not a single colorway. Restock rumors are usually noise.",
    series: seriesFrom("AMM.J3", "2026-02-14", 90, 430, 365),
    sizes: sizeBook("10.5", 365, "AMM.J3"),
    notes: ["Pair vs UNI.J1 for boutique-on-Jordan relative value."],
  },
  {
    slug: "patta-airmax",
    ticker: "PAT.AM1",
    name: "Patta x Nike Air Max 1",
    partner: "Patta",
    seat: "boutique",
    brand: "Nike",
    silhouette: "Air Max 1",
    colorway: "Amsterdam",
    retail: 160,
    last: 214,
    changePct: 0.47,
    volume24h: 63100,
    peakSize: "9.5",
    sizePremiumPct: 10.4,
    dropDate: "2026-06-28",
    status: "secondary",
    scarcity: 63,
    channels: ["Patta", "Nike EU", "EQL"],
    materials: ["Hairy suede", "Patta flag", "Air Max 1 tooling"],
    thesis:
      "Amsterdam boutique on the most copied lifestyle last. EU-first allocation. US tape is a lagging indicator.",
    strategy:
      "Geo is the edge, same as Cortiez. Do not lift US asks during an EU restock.",
    series: seriesFrom("PAT.AM1", "2026-06-28", 74, 248, 214),
    sizes: sizeBook("9.5", 214, "PAT.AM1"),
    notes: ["Patta’s calendar is denser than its premiums. Select, don’t cover the whole book."],
  },
  {
    slug: "ald-550",
    ticker: "ALD.550",
    name: "Aimé Leon Dore x New Balance 550",
    partner: "Aimé Leon Dore",
    seat: "retailer",
    brand: "New Balance",
    silhouette: "550",
    colorway: "Green",
    retail: 160,
    last: 228,
    changePct: -1.05,
    volume24h: 134500,
    peakSize: "11",
    sizePremiumPct: 11.8,
    dropDate: "2026-04-18",
    status: "secondary",
    scarcity: 66,
    channels: ["ALD", "NB", "Kith"],
    materials: ["Leather upper", "ALD branding", "Vintage basketball last"],
    thesis:
      "Retailer-as-designer on a basketball cupsole. ALD’s NB seat is a franchise. Premium has compressed from the 2021 peak; still the cleanest retailer name on NB besides Kith.",
    strategy:
      "Volume name. Use for tape, not for outsized ROC. Watch 11–12 where ALD’s audience actually lives.",
    series: seriesFrom("ALD.550", "2026-04-18", 90, 260, 228),
    sizes: sizeBook("11", 228, "ALD.550"),
    notes: ["Kith vs ALD on NB is the retailer-seat relative value pair."],
  },
  {
    slug: "salehe-nb",
    ticker: "SLH.YURT",
    name: "Salehe Bembury x New Balance 574 Yurt",
    partner: "Salehe Bembury",
    seat: "designer",
    brand: "New Balance",
    silhouette: "574 Yurt",
    colorway: "Universal",
    retail: 160,
    last: 275,
    changePct: 2.61,
    volume24h: 98900,
    peakSize: "10",
    sizePremiumPct: 19.2,
    dropDate: "2026-08-01",
    status: "secondary",
    scarcity: 77,
    channels: ["NB", "Salehe", "Boutiques"],
    materials: ["Yurt wrap", "Crocodile-texture overlays", "Utility lacing"],
    thesis:
      "Designer seat, not celebrity. Salehe’s NB and Crocs work is silhouette invention — the wrap, the texture — rather than a vault restyle with a famous name on the tongue.",
    strategy:
      "Cover the designer, not the drop. If the next last is a new wrap, premium expands. If it is a standard 574, fade.",
    series: seriesFrom("SLH.YURT", "2026-08-01", 40, 340, 275),
    sizes: sizeBook("10", 275, "SLH.YURT"),
    notes: ["Designer gravity shows up in construction, not Instagram follower counts."],
  },
  {
    slug: "sacai-vaporwaffle",
    ticker: "SAC.VPR",
    name: "sacai x Nike VaporWaffle",
    partner: "sacai",
    seat: "designer",
    brand: "Nike",
    silhouette: "VaporWaffle",
    colorway: "Black / White",
    retail: 180,
    last: 248,
    changePct: -0.4,
    volume24h: 176200,
    peakSize: "8.5",
    sizePremiumPct: 12.1,
    dropDate: "2026-03-20",
    status: "secondary",
    scarcity: 60,
    channels: ["SNKRS", "Nike", "sacai"],
    materials: ["Stacked midsole", "Waffle dual outsole", "sacai tag"],
    thesis:
      "Fashion-house designer on a Nike runner. The last itself is the IP. Restocks have trained the market to fade day-one spikes.",
    strategy:
      "Liquid designer name. Thin premium is the point — this is a flow/volume print, not a scarcity object.",
    series: seriesFrom("SAC.VPR", "2026-03-20", 90, 290, 248),
    sizes: sizeBook("8.5", 248, "SAC.VPR"),
    notes: ["Small-size bid is structural. Do not read a men’s 12 print as the market."],
  },
  {
    slug: "kiko-gel",
    ticker: "KIK.GEL",
    name: "Kiko Kostadinov x ASICS Gel-Kiril",
    partner: "Kiko Kostadinov",
    seat: "designer",
    brand: "ASICS",
    silhouette: "Gel-Kiril",
    colorway: "Studio",
    retail: 220,
    last: 310,
    changePct: 1.31,
    volume24h: 41200,
    peakSize: "9",
    sizePremiumPct: 14.6,
    dropDate: "2026-07-03",
    status: "secondary",
    scarcity: 73,
    channels: ["ASICS", "Kiko", "Dover Street"],
    materials: ["Sculpted Gel", "Technical mesh", "Runway last"],
    thesis:
      "Runway designer, performance factory. Lower ADV, wider spreads. The bid is fashion-week and archive, not hype-app raffles.",
    strategy:
      "Thin tape. Size in on asks, don’t lift. Follow if you cover designer ASICS; skip if you only cover vault rap collabs.",
    series: seriesFrom("KIK.GEL", "2026-07-03", 69, 360, 310),
    sizes: sizeBook("9", 310, "KIK.GEL"),
    notes: ["This is how you prove the desk is not a celebrity-only product."],
  },
  {
    slug: "palace-xt6",
    ticker: "PAL.XT6",
    name: "Palace x Salomon XT-6",
    partner: "Palace",
    seat: "brand",
    brand: "Salomon",
    silhouette: "XT-6",
    colorway: "Tri-ferg trail",
    retail: 230,
    last: 295,
    changePct: 0.68,
    volume24h: 72800,
    peakSize: "9.5",
    sizePremiumPct: 11.0,
    dropDate: "2026-08-14",
    status: "secondary",
    scarcity: 70,
    channels: ["Palace", "Salomon", "EQL"],
    materials: ["Trail mesh", "Quicklace", "Palace tri-ferg"],
    thesis:
      "Streetwear brand on a technical trail last. No celebrity, no boutique — two brands sharing a silhouette. The trade is whether Palace’s audience will pay Salomon money.",
    strategy:
      "Brand-on-brand seat. Watch UK vs US allocation. If Palace restocks, premium dies fast.",
    series: seriesFrom("PAL.XT6", "2026-08-14", 27, 360, 295),
    sizes: sizeBook("9.5", 295, "PAL.XT6"),
    notes: ["Category proof: collabs are not only people. Brands collab too."],
  },
  {
    slug: "kd-nb",
    ticker: "KD.NB",
    name: "Kevin Durant x New Balance KD",
    partner: "Kevin Durant",
    seat: "athlete",
    brand: "New Balance",
    silhouette: "KD signature",
    colorway: "Thunder",
    retail: 150,
    last: 0,
    changePct: 0,
    volume24h: 0,
    peakSize: "12",
    sizePremiumPct: 0,
    dropDate: "2026-11-01",
    status: "pre-market",
    scarcity: 86,
    channels: ["NB", "Basketball retail", "SNKRS-equivalent"],
    materials: ["TBD performance knit", "Athlete branding"],
    thesis:
      "Athlete seat, not celebrity designer. Durant’s move toward NB is a performance-contract story. Cover it as an athlete last, not as a vault lifestyle object.",
    strategy:
      "Pre-market. Follow for the seat, endorse only once the last is a real signature — not a painted 550.",
    series: seriesFrom("KD.NB", "2026-08-01", 40, 150, 150),
    sizes: sizeBook("12", 150, "KD.NB"),
    notes: [
      "Athlete collabs price on on-court minutes and signature history, not album cycles.",
      "If NB issues a lifestyle cupsole with a KD tag, treat as a miss.",
    ],
  },
];

export const indexSeries: Ohlc[] = seriesFrom("EXQCI", "2026-06-12", 90, 1640, 1846);

export const prints: Print[] = [
  { t: "11:18:41", ticker: "WSG.JAZZ", size: "10.5", price: 286, side: "buy" },
  { t: "11:18:22", ticker: "UNI.J1", size: "10", price: 412, side: "sell" },
  { t: "11:18:12", ticker: "BRN.1906", size: "12", price: 340, side: "buy" },
  { t: "11:17:55", ticker: "KTH.GEL", size: "8", price: 216, side: "sell" },
  { t: "11:17:41", ticker: "ATM.SB", size: "9.5", price: 271, side: "buy" },
  { t: "11:17:29", ticker: "WSG.TRI", size: "11", price: 310, side: "sell" },
  { t: "11:17:08", ticker: "JND.2160", size: "9", price: 244, side: "buy" },
  { t: "11:16:58", ticker: "WSG.JAZZ", size: "11", price: 279, side: "buy" },
  { t: "11:16:40", ticker: "SLH.YURT", size: "10", price: 278, side: "buy" },
  { t: "11:16:21", ticker: "CTZ.NK", size: "9", price: 196, side: "buy" },
  { t: "11:16:02", ticker: "AMM.J3", size: "10.5", price: 366, side: "buy" },
  { t: "11:15:47", ticker: "WSG.OMN", size: "10", price: 248, side: "buy" },
  { t: "11:15:22", ticker: "SAC.VPR", size: "8.5", price: 246, side: "sell" },
  { t: "11:15:02", ticker: "BRN.1906", size: "9", price: 351, side: "buy" },
  { t: "11:14:48", ticker: "PAL.XT6", size: "9.5", price: 296, side: "buy" },
  { t: "11:14:36", ticker: "JAE.SAU", size: "9.5", price: 201, side: "sell" },
  { t: "11:14:18", ticker: "BDG.2002", size: "10.5", price: 256, side: "buy" },
  { t: "11:14:08", ticker: "KTH.GEL", size: "8.5", price: 221, side: "buy" },
  { t: "11:13:44", ticker: "WSG.JAZZ", size: "10", price: 274, side: "sell" },
  { t: "11:13:11", ticker: "WSG.TRI", size: "10.5", price: 314, side: "buy" },
  { t: "11:12:51", ticker: "KIK.GEL", size: "9", price: 312, side: "buy" },
  { t: "11:12:39", ticker: "BRN.1906", size: "11.5", price: 329, side: "sell" },
  { t: "11:12:04", ticker: "WSG.JAZZ", size: "11.5", price: 288, side: "buy" },
  { t: "11:11:28", ticker: "KTH.GEL", size: "9", price: 209, side: "sell" },
];

export const calendar: DropEvent[] = [
  {
    date: "2026-09-12",
    ticker: "WSG.JAZZ",
    name: "Awesome God restock window (Kith EU)",
    channel: "Kith EU",
    status: "shock",
  },
  {
    date: "2026-09-16",
    ticker: "ATM.SB",
    name: "atmos Tokyo safari makeup",
    channel: "atmos",
    status: "shock",
  },
  {
    date: "2026-09-18",
    ticker: "BRN.1906",
    name: "Concepts makeup raffle",
    channel: "Concepts",
    status: "raffle",
  },
  {
    date: "2026-09-25",
    ticker: "JND.2160",
    name: "JJJJound GT-2160 EU restock",
    channel: "JJJJound",
    status: "priced",
  },
  {
    date: "2026-10-02",
    ticker: "KTH.GEL",
    name: "Kayano 14 seasonal restock",
    channel: "Kith",
    status: "priced",
  },
  {
    date: "2026-10-08",
    ticker: "PAL.XT6",
    name: "Palace Salomon UK leftover",
    channel: "Palace",
    status: "shock",
  },
  {
    date: "2026-10-15",
    ticker: "JAE.NK",
    name: "Jae Tips x Nike — first last",
    channel: "SNKRS",
    status: "raffle",
  },
  {
    date: "2026-11-01",
    ticker: "KD.NB",
    name: "Durant x New Balance signature",
    channel: "NB",
    status: "raffle",
  },
  {
    date: "2026-08-28",
    ticker: "WSG.JAZZ",
    name: "Grid Jazz 9 Awesome God",
    channel: "Kith / EQL",
    status: "closed",
  },
];

export function getCollab(slug: string) {
  return collabs.find((c) => c.slug === slug);
}

export function listedCollabs() {
  return collabs;
}

export function brandsOnBoard() {
  return Array.from(new Set(collabs.map((c) => c.brand)));
}

export function seatsOnBoard() {
  return seatOrder.filter((seat) => collabs.some((c) => c.seat === seat));
}

export function relatedCollabs(c: Collab) {
  const samePartner = collabs.filter((x) => x.partner === c.partner && x.slug !== c.slug);
  if (samePartner.length) return samePartner;
  return collabs.filter((x) => x.seat === c.seat && x.slug !== c.slug).slice(0, 4);
}

export function premium(c: Collab) {
  if (!c.retail || !c.last) return 0;
  return ((c.last - c.retail) / c.retail) * 100;
}

export function roc(c: Collab) {
  return premium(c);
}

const priced = collabs.filter((c) => c.last > 0);
const premAvg =
  priced.reduce((sum, c) => sum + premium(c), 0) / Math.max(priced.length, 1);
const advSum = priced.reduce((sum, c) => sum + c.volume24h, 0);

export const deskStats = {
  index: 1846.2,
  indexChange: 26.4,
  indexChangePct: 1.45,
  premiumIdx: Math.round(premAvg * 10) / 10,
  adv: advSum,
  openDrops: calendar.filter((e) => e.status !== "closed").length,
  names: collabs.length,
  delay: "15m",
};
