import type { Collab, DropEvent } from "@/data/market";

export type DoorAccess = "in-store" | "online" | "both" | "raffle";

export type DoorGuess = {
  name: string;
  access: DoorAccess;
  line: string;
};

export type WhereCity = "nyc" | "london" | "tokyo";

export type WhereGuess = {
  how: string;
  doors: DoorGuess[];
  follow: string[];
  cityLine?: string;
  next?: { name: string; date: string; status: DropEvent["status"] };
};

export const accessLabel: Record<DoorAccess, string> = {
  "in-store": "In store",
  online: "Online",
  both: "Store + online",
  raffle: "Raffle",
};

export const accessTone: Record<DoorAccess, string> = {
  "in-store": "text-gold",
  online: "text-blue",
  both: "text-ink",
  raffle: "text-warn",
};

type SeedWhere = {
  how: string;
  follow: string[];
  doors: DoorGuess[];
};

const seed: Record<string, SeedWhere> = {
  "wsg-jazz": {
    how: "Kith and Griselda rooms saw the first pairs. Online was EQL and leftovers, not a clean web drop. A restock is more likely to hit Kith EU first than a US app.",
    follow: ["Kith", "Saucony", "Griselda / Westside Gunn"],
    doors: [
      {
        name: "Kith",
        access: "both",
        line: "Stores first, then the site if anything is left. EU has been the restock tell.",
      },
      {
        name: "Griselda / Buffalo",
        access: "in-store",
        line: "The exclusive energy. If a room is involved, you have to be there.",
      },
      {
        name: "EQL",
        access: "raffle",
        line: "Online raffle when they want a wider draw. Not a guarantee of size.",
      },
      {
        name: "Saucony",
        access: "online",
        line: "Brand site or app leftovers. Usually after the boutique window.",
      },
    ],
  },
  "wsg-triumph": {
    how: "More of a Kith + Saucony web story than Jazz 9. Still not a mall shoe — if a store gets it, that store is the real door.",
    follow: ["Kith", "Saucony"],
    doors: [
      {
        name: "Kith",
        access: "both",
        line: "US and EU shops, then kith.com. In-store still beats the site on day one.",
      },
      {
        name: "Saucony",
        access: "online",
        line: "Brand site after the boutique allocation.",
      },
      {
        name: "EQL",
        access: "raffle",
        line: "Used when they want a raffle instead of a queue.",
      },
    ],
  },
  "wsg-omni": {
    how: "Thinner fashion-week door. Boutiques and Saucony, not a full Kith theater. Some pairs only move if you are in the shop.",
    follow: ["Saucony", "Kith"],
    doors: [
      {
        name: "Independent boutiques",
        access: "in-store",
        line: "The hard ones. No app. You hear it from the store or you miss it.",
      },
      {
        name: "Saucony",
        access: "online",
        line: "Brand site is the public door.",
      },
      {
        name: "EQL",
        access: "raffle",
        line: "Online draw if they open it up.",
      },
    ],
  },
  "bronson-1906": {
    how: "Classic split: Concepts and Kith rooms, then geo password pages. Size 12 and the kitchen colorway do not sit on a public SNKRS-style app.",
    follow: ["Concepts", "Kith", "New Balance", "Action Bronson"],
    doors: [
      {
        name: "Concepts",
        access: "raffle",
        line: "Boston raffle / in-store. Makeup windows often start here.",
      },
      {
        name: "Kith",
        access: "both",
        line: "Shop first. Site if they want a wider hit.",
      },
      {
        name: "NB password pages",
        access: "online",
        line: "Localized locks. If your city is not on the list, you are not buying retail.",
      },
      {
        name: "New Balance",
        access: "both",
        line: "Flagship and nb.com leftovers — not the full size run.",
      },
    ],
  },
  "kith-kayano": {
    how: "Kith is the door. US and EU shops plus the site. ASICS is leftovers. This one actually does go online, but small sizes still walk out of the store.",
    follow: ["Kith", "ASICS"],
    doors: [
      {
        name: "Kith US",
        access: "both",
        line: "Stores and kith.com. Seasonal restocks leak EU first.",
      },
      {
        name: "Kith EU",
        access: "both",
        line: "Often the restock tell for the US book.",
      },
      {
        name: "ASICS",
        access: "online",
        line: "Brand site after Kith has taken their cut.",
      },
    ],
  },
  "jae-saucony": {
    how: "That window is closed. What is left is resale. Do not wait on a Saucony restock for Tips — the seat moved to Nike.",
    follow: ["Jae Tips", "Nike SNKRS"],
    doors: [
      {
        name: "Secondary",
        access: "online",
        line: "Resale is the door now. Not a retail hunt.",
      },
    ],
  },
  "jae-nike": {
    how: "First Nike last is still a guess. Expect SNKRS plus a short boutique list that will not be posted until the week of. Boutiques will be in-store or raffle, not a guest checkout.",
    follow: ["Jae Tips", "Nike SNKRS", "Nike"],
    doors: [
      {
        name: "SNKRS",
        access: "raffle",
        line: "The public online draw if Nike wants one.",
      },
      {
        name: "Nike",
        access: "online",
        line: "nike.com geo. Not every region gets it.",
      },
      {
        name: "Boutiques TBD",
        access: "in-store",
        line: "Names will leak late. Hard pairs will be in the shop, not the app.",
      },
    ],
  },
  "cortiez-nike": {
    how: "UK street door. Cortiez rooms and Nike UK, then EQL. US buyers are usually late to the retail window.",
    follow: ["Cortiez", "Nike UK"],
    doors: [
      {
        name: "Cortiez",
        access: "in-store",
        line: "The exclusive. If they do a shop drop, you are in London or you are not in.",
      },
      {
        name: "Nike UK",
        access: "both",
        line: "UK SNKRS / site. US often sits this out.",
      },
      {
        name: "EQL",
        access: "raffle",
        line: "Wider online draw when they want one.",
      },
    ],
  },
  "atmos-sb": {
    how: "Tokyo boutique gravity. The safari makeup is an atmos room story before it is a US app story. JP SNKRS is the online door, not US SNKRS.",
    follow: ["atmos", "Nike SNKRS JP"],
    doors: [
      {
        name: "atmos Tokyo",
        access: "in-store",
        line: "The real exclusive. Shock windows start on the floor.",
      },
      {
        name: "SNKRS JP",
        access: "raffle",
        line: "Japan app. US SNKRS is not the desk guess for this print.",
      },
      {
        name: "EQL",
        access: "raffle",
        line: "Only if they open a global raffle after Tokyo.",
      },
    ],
  },
  "concepts-gel": {
    how: "Boston shop plus Concepts raffle. ASICS site is second. This is a store-as-designer name — being in the room still matters.",
    follow: ["Concepts", "ASICS"],
    doors: [
      {
        name: "Concepts",
        access: "both",
        line: "In-store and their raffle. Makeup windows often start here.",
      },
      {
        name: "ASICS",
        access: "online",
        line: "Brand leftovers after Concepts.",
      },
      {
        name: "EQL",
        access: "raffle",
        line: "Online draw if they extend it.",
      },
    ],
  },
  "bodega-2002r": {
    how: "Bodega password pages and the Boston/LA shops. NB and Kith are extra doors, not the exclusive.",
    follow: ["Bodega", "New Balance", "Kith"],
    doors: [
      {
        name: "Bodega",
        access: "both",
        line: "Shop + bodega.com password. If the page locks to a city, that is the tell.",
      },
      {
        name: "New Balance",
        access: "online",
        line: "nb.com after the boutique cut.",
      },
      {
        name: "Kith",
        access: "both",
        line: "Sometimes in the mix. Not the home door.",
      },
    ],
  },
  "jjjjound-2160": {
    how: "JJJJound site and the Montreal/EU shop. If the site stays up, it is not scarce. Hard sizes still walk out of the store. ASICS is second.",
    follow: ["JJJJound", "ASICS"],
    doors: [
      {
        name: "JJJJound",
        access: "both",
        line: "Their site crashes are the float. EU restock is the next public window.",
      },
      {
        name: "ASICS",
        access: "online",
        line: "Brand site after JJJJound.",
      },
      {
        name: "EQL",
        access: "raffle",
        line: "Only if they want a raffle layer.",
      },
    ],
  },
  "union-jordan1": {
    how: "Union LA raffle and the shop. SNKRS is the national online door. The construction pairs people care about still go through Union first.",
    follow: ["Union LA", "Nike SNKRS", "Jordan"],
    doors: [
      {
        name: "Union LA",
        access: "raffle",
        line: "In-store / Union raffle. That is the boutique door.",
      },
      {
        name: "SNKRS",
        access: "raffle",
        line: "The public app draw.",
      },
      {
        name: "Jordan / Nike",
        access: "online",
        line: "nike.com geo after Union.",
      },
    ],
  },
  "amm-jordan3": {
    how: "A Ma Maniére raffle and Atlanta shop, then SNKRS. AMM does not dump the full run online.",
    follow: ["A Ma Maniére", "Nike SNKRS"],
    doors: [
      {
        name: "A Ma Maniére",
        access: "raffle",
        line: "Their raffle and the shop. Soft pairs, tight draw.",
      },
      {
        name: "SNKRS",
        access: "raffle",
        line: "National app if Jordan wants a wider hit.",
      },
      {
        name: "Jordan",
        access: "online",
        line: "nike.com leftovers.",
      },
    ],
  },
  "patta-airmax": {
    how: "Amsterdam first. Patta shops and Nike EU, then EQL. US retail is usually the lag, not the exclusive.",
    follow: ["Patta", "Nike EU"],
    doors: [
      {
        name: "Patta",
        access: "both",
        line: "Amsterdam and other Patta shops, then patta.nl. In-store still matters.",
      },
      {
        name: "Nike EU",
        access: "online",
        line: "EU SNKRS / site. Do not lift US asks during an EU restock.",
      },
      {
        name: "EQL",
        access: "raffle",
        line: "Wider raffle when they extend it.",
      },
    ],
  },
  "ald-550": {
    how: "ALD shops in NYC plus aldc.store. NB and Kith are extra. Not a secret in-store only, but the good sizes still leave the shop.",
    follow: ["Aimé Leon Dore", "New Balance", "Kith"],
    doors: [
      {
        name: "Aimé Leon Dore",
        access: "both",
        line: "NYC shop and the site. Franchise restocks happen here.",
      },
      {
        name: "New Balance",
        access: "online",
        line: "nb.com after ALD.",
      },
      {
        name: "Kith",
        access: "both",
        line: "Sometimes in the retailer mix.",
      },
    ],
  },
  "salehe-nb": {
    how: "NB plus Salehe’s own channels and a boutique cut. Designer pairs often skip the hype app and sit in shops that actually carry Salehe.",
    follow: ["Salehe Bembury", "New Balance"],
    doors: [
      {
        name: "New Balance",
        access: "both",
        line: "Flagship and nb.com. Not always the full wrap run.",
      },
      {
        name: "Salehe",
        access: "online",
        line: "His own site / list if he opens one.",
      },
      {
        name: "Boutiques",
        access: "in-store",
        line: "The hard construction pairs. Follow the shops that carry him.",
      },
    ],
  },
  "sacai-vaporwaffle": {
    how: "SNKRS and Nike are the public doors. sacai’s own channels are fashion-week, not a mall drop. Restocks have trained people to use the app.",
    follow: ["Nike SNKRS", "sacai", "Nike"],
    doors: [
      {
        name: "SNKRS",
        access: "raffle",
        line: "The main online draw. Restocks come back here.",
      },
      {
        name: "Nike",
        access: "online",
        line: "nike.com geo.",
      },
      {
        name: "sacai",
        access: "in-store",
        line: "House / Dover-style rooms. Not the volume door.",
      },
    ],
  },
  "kiko-gel": {
    how: "Not a hype-app shoe. Dover Street, Kiko, ASICS. You hear the drop from the shop or you do not hear it.",
    follow: ["Kiko Kostadinov", "ASICS", "Dover Street Market"],
    doors: [
      {
        name: "Dover Street Market",
        access: "in-store",
        line: "The room. Online if DSM lists it — often they do not on day one.",
      },
      {
        name: "Kiko",
        access: "both",
        line: "Studio / selected stockists. Follow him, not SNKRS.",
      },
      {
        name: "ASICS",
        access: "online",
        line: "Brand site for the public leftover.",
      },
    ],
  },
  "palace-xt6": {
    how: "Palace London first. UK leftover is a shop and palace skateboards site story, then Salomon and EQL. US is second.",
    follow: ["Palace", "Salomon"],
    doors: [
      {
        name: "Palace",
        access: "both",
        line: "London shop and the site. UK leftover windows start here.",
      },
      {
        name: "Salomon",
        access: "online",
        line: "Brand site after Palace.",
      },
      {
        name: "EQL",
        access: "raffle",
        line: "Wider raffle if they open one.",
      },
    ],
  },
  "kd-nb": {
    how: "Still a guess until the last is real. Desk guess is NB basketball retail and an app raffle, not a boutique art object. Big sizes at hoop shops.",
    follow: ["New Balance", "Kevin Durant"],
    doors: [
      {
        name: "New Balance",
        access: "both",
        line: "nb.com and flagship. Performance doors, not vault lifestyle.",
      },
      {
        name: "Basketball retail",
        access: "in-store",
        line: "Hoop shops if it is a real signature. Size 12 lives here.",
      },
      {
        name: "App raffle",
        access: "raffle",
        line: "SNKRS-equivalent if NB wants a national draw.",
      },
    ],
  },
};

function doorFromChannel(raw: string): DoorGuess {
  const name = raw.trim();
  const n = name.toLowerCase();
  if (/snkrs|eql|password|raffle/.test(n)) {
    return {
      name,
      access: "raffle",
      line: "Online draw. Not a walk-in. Follow them — the time posts there.",
    };
  }
  if (/secondary|resale/.test(n)) {
    return {
      name,
      access: "online",
      line: "Resale, not retail. The retail window is already gone.",
    };
  }
  if (
    /boutique|dover|tokyo|london|buffalo|in-store|shop drop|tbd/.test(n)
  ) {
    return {
      name,
      access: "in-store",
      line: "Desk guess: you have to be in the room. Online is leftover if anything.",
    };
  }
  if (/kith|concepts|union|bodega|patta|palace|jjjjound|ald|amm|atmos|griselda/.test(n)) {
    return {
      name,
      access: "both",
      line: "Store first is the usual pattern. Site or raffle if they open it up.",
    };
  }
  return {
    name,
    access: "online",
    line: "Public web door. Still a guess — follow them for the real time.",
  };
}

const cityHint: Record<WhereCity, { lift: RegExp; sink: RegExp; line: string }> = {
  nyc: {
    lift: /kith us|aimé|ald|union|griselda|bodega|concepts|new balance|\bnb\b|amm|a ma/i,
    sink: /tokyo|jp\b|london|amsterdam|\buk\b|\beu\b/i,
    line: "From NYC: local shops and US sites first. EU leftover windows are a tell, not your door.",
  },
  london: {
    lift: /palace|kith eu|cortiez|dover|dsm|nike uk|london|patta/i,
    sink: /tokyo|jp\b|snkrs jp|kith us/i,
    line: "From London: UK shop and site first. US SNKRS is usually late.",
  },
  tokyo: {
    lift: /atmos|tokyo|snkrs jp|dover|dsm|jjjjound/i,
    sink: /us snkrs|nike uk|kith us/i,
    line: "From Tokyo: JP shop and JP app first. US SNKRS is usually not the door.",
  },
};

function cityScore(city: WhereCity, door: DoorGuess) {
  const n = `${door.name} ${door.line}`;
  const hint = cityHint[city];
  if (hint.lift.test(n)) return 2;
  if (hint.sink.test(n)) return -1;
  return 0;
}

export function whereFor(
  c: Collab,
  calendar: DropEvent[] = [],
  city: WhereCity | "" = "",
): WhereGuess {
  const next = calendar
    .filter((ev) => ev.ticker === c.ticker && ev.status !== "closed")
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))[0];

  const seeded = seed[c.slug];
  const base: WhereGuess = seeded
    ? {
        ...seeded,
        next: next
          ? { name: next.channel, date: next.date, status: next.status }
          : undefined,
      }
    : (() => {
        const doors = (c.channels.length ? c.channels : ["Desk"]).map(
          doorFromChannel,
        );
        const inStore = doors.some(
          (d) => d.access === "in-store" || d.access === "both",
        );
        return {
          how: inStore
            ? "Desk guess from the doors on file. Some of these only hit in-store. Follow the accounts — the time usually posts there first."
            : "Desk guess from the doors on file. Online does not mean in your size. Follow the accounts for the real time.",
          doors,
          follow: doors.map((d) => d.name).slice(0, 4),
          next: next
            ? { name: next.channel, date: next.date, status: next.status }
            : undefined,
        };
      })();

  if (!city) return base;

  const hint = cityHint[city];
  return {
    ...base,
    cityLine: hint.line,
    doors: [...base.doors].sort(
      (a, b) => cityScore(city, b) - cityScore(city, a),
    ),
  };
}
