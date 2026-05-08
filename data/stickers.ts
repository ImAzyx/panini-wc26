import type { Sticker } from "@/types";

const TEAMS: { code: string; name: string }[] = [
  { code: "ARG", name: "Argentine" },
  { code: "AUS", name: "Australie" },
  { code: "AUT", name: "Autriche" },
  { code: "BEL", name: "Belgique" },
  { code: "BOL", name: "Bolivie" },
  { code: "BRA", name: "Brésil" },
  { code: "CAN", name: "Canada" },
  { code: "CHI", name: "Chili" },
  { code: "CMR", name: "Cameroun" },
  { code: "COD", name: "RD Congo" },
  { code: "COL", name: "Colombie" },
  { code: "CRC", name: "Costa Rica" },
  { code: "CRO", name: "Croatie" },
  { code: "CZE", name: "Rép. Tchèque" },
  { code: "DEN", name: "Danemark" },
  { code: "ECU", name: "Équateur" },
  { code: "EGY", name: "Égypte" },
  { code: "ENG", name: "Angleterre" },
  { code: "ESP", name: "Espagne" },
  { code: "FRA", name: "France" },
  { code: "GER", name: "Allemagne" },
  { code: "GHA", name: "Ghana" },
  { code: "GRE", name: "Grèce" },
  { code: "GUA", name: "Guatemala" },
  { code: "HON", name: "Honduras" },
  { code: "HUN", name: "Hongrie" },
  { code: "IRN", name: "Iran" },
  { code: "IRQ", name: "Irak" },
  { code: "ITA", name: "Italie" },
  { code: "JAM", name: "Jamaïque" },
  { code: "JPN", name: "Japon" },
  { code: "KOR", name: "Corée du Sud" },
  { code: "KSA", name: "Arabie Saoudite" },
  { code: "MAR", name: "Maroc" },
  { code: "MEX", name: "Mexique" },
  { code: "NED", name: "Pays-Bas" },
  { code: "NGA", name: "Nigéria" },
  { code: "NZL", name: "Nouvelle-Zélande" },
  { code: "PAR", name: "Paraguay" },
  { code: "PAN", name: "Panama" },
  { code: "POR", name: "Portugal" },
  { code: "QAT", name: "Qatar" },
  { code: "RSA", name: "Afrique du Sud" },
  { code: "SEN", name: "Sénégal" },
  { code: "SRB", name: "Serbie" },
  { code: "SUI", name: "Suisse" },
  { code: "URU", name: "Uruguay" },
  { code: "USA", name: "États-Unis" },
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

const COCA_COLA_STICKERS: Sticker[] = Array.from({ length: 12 }, (_, i) => ({
  id: `CC${i + 1}`,
  name: `Coca-Cola ${i + 1}`,
  team: "Coca-Cola",
  isFoil: false,
}));

export const STICKERS: Sticker[] = [
  ...INTRO_STICKERS,
  ...generateTeamStickers(),
  ...FIFA_MUSEUM_STICKERS,
  ...COCA_COLA_STICKERS,
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
  "Coca-Cola",
];
