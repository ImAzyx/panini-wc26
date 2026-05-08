import type { Sticker } from "@/types";

// 48 qualified nations in Panini WC26 album order (Groups A → L)
const TEAMS: { code: string; name: string }[] = [
  { code: "MEX", name: "Mexique" },
  { code: "RSA", name: "Afrique du Sud" },
  { code: "KOR", name: "Corée du Sud" },
  { code: "CZE", name: "Rép. Tchèque" },
  { code: "CAN", name: "Canada" },
  { code: "BIH", name: "Bosnie-Herzégovine" },
  { code: "QAT", name: "Qatar" },
  { code: "SUI", name: "Suisse" },
  { code: "BRA", name: "Brésil" },
  { code: "MAR", name: "Maroc" },
  { code: "HAI", name: "Haïti" },
  { code: "SCO", name: "Écosse" },
  { code: "USA", name: "États-Unis" },
  { code: "PAR", name: "Paraguay" },
  { code: "AUS", name: "Australie" },
  { code: "TUR", name: "Turquie" },
  { code: "GER", name: "Allemagne" },
  { code: "CUR", name: "Curaçao" },
  { code: "CIV", name: "Côte d'Ivoire" },
  { code: "ECU", name: "Équateur" },
  { code: "NED", name: "Pays-Bas" },
  { code: "JPN", name: "Japon" },
  { code: "SWE", name: "Suède" },
  { code: "TUN", name: "Tunisie" },
  { code: "BEL", name: "Belgique" },
  { code: "EGY", name: "Égypte" },
  { code: "IRN", name: "Iran" },
  { code: "NZL", name: "Nouvelle-Zélande" },
  { code: "ESP", name: "Espagne" },
  { code: "CPV", name: "Cap-Vert" },
  { code: "KSA", name: "Arabie Saoudite" },
  { code: "URU", name: "Uruguay" },
  { code: "FRA", name: "France" },
  { code: "SEN", name: "Sénégal" },
  { code: "IRQ", name: "Irak" },
  { code: "NOR", name: "Norvège" },
  { code: "ARG", name: "Argentine" },
  { code: "ALG", name: "Algérie" },
  { code: "AUT", name: "Autriche" },
  { code: "JOR", name: "Jordanie" },
  { code: "POR", name: "Portugal" },
  { code: "COD", name: "RD Congo" },
  { code: "UZB", name: "Ouzbékistan" },
  { code: "COL", name: "Colombie" },
  { code: "ENG", name: "Angleterre" },
  { code: "CRO", name: "Croatie" },
  { code: "GHA", name: "Ghana" },
  { code: "PAN", name: "Panama" },
];

const FOIL_POSITIONS = new Set([1]);

function generateTeamStickers(): Sticker[] {
  const stickers: Sticker[] = [];
  for (const team of TEAMS) {
    for (let i = 1; i <= 20; i++) {
      stickers.push({
        id: `${team.code}${i}`,
        name: `${team.name} ${i}`,
        team: team.name,
        isFoil: FOIL_POSITIONS.has(i),
      });
    }
  }
  return stickers;
}

const INTRO_STICKERS: Sticker[] = [
  { id: "00", name: "Coupe du Monde FIFA", team: "Intro", isFoil: true },
  { id: "FWC1", name: "Bienvenue WC26 - USA", team: "Intro", isFoil: false },
  { id: "FWC2", name: "Bienvenue WC26 - Canada", team: "Intro", isFoil: false },
  { id: "FWC3", name: "Bienvenue WC26 - Mexique", team: "Intro", isFoil: false },
  { id: "FWC4", name: "Trophée FIFA", team: "Intro", isFoil: true },
  { id: "FWC5", name: "Stade AT&T", team: "Intro", isFoil: false },
  { id: "FWC6", name: "Stade BC Place", team: "Intro", isFoil: false },
  { id: "FWC7", name: "Stade Azteca", team: "Intro", isFoil: false },
  { id: "FWC8", name: "Mascotte WC26", team: "Intro", isFoil: true },
];

const FIFA_MUSEUM_STICKERS: Sticker[] = [
  { id: "FWC9", name: "Pelé", team: "FIFA Museum", isFoil: true },
  { id: "FWC10", name: "Diego Maradona", team: "FIFA Museum", isFoil: true },
  { id: "FWC11", name: "Zinedine Zidane", team: "FIFA Museum", isFoil: true },
  { id: "FWC12", name: "Ronaldo (R9)", team: "FIFA Museum", isFoil: true },
  { id: "FWC13", name: "Franz Beckenbauer", team: "FIFA Museum", isFoil: true },
  { id: "FWC14", name: "Johan Cruyff", team: "FIFA Museum", isFoil: true },
  { id: "FWC15", name: "Ronaldo (CR7)", team: "FIFA Museum", isFoil: true },
  { id: "FWC16", name: "Lionel Messi", team: "FIFA Museum", isFoil: true },
  { id: "FWC17", name: "Miroslav Klose", team: "FIFA Museum", isFoil: true },
  { id: "FWC18", name: "Just Fontaine", team: "FIFA Museum", isFoil: true },
  { id: "FWC19", name: "Lev Yachine", team: "FIFA Museum", isFoil: true },
];

export const STICKERS: Sticker[] = [
  ...INTRO_STICKERS,
  ...generateTeamStickers(),
  ...FIFA_MUSEUM_STICKERS,
];

export const STICKER_MAP = new Map<string, Sticker>(
  STICKERS.map((s) => [s.id, s])
);

export const STICKERS_BY_TEAM = STICKERS.reduce<Record<string, Sticker[]>>(
  (acc, s) => {
    (acc[s.team] ??= []).push(s);
    return acc;
  },
  {}
);

export const TEAM_ORDER = [
  "Intro",
  ...TEAMS.map((t) => t.name),
  "FIFA Museum",
];
