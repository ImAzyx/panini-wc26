export type StickerState = "missing" | "owned" | "duplicate";

export interface Sticker {
  id: string;       // e.g. "FRA1", "ARG17", "FWC1"
  name: string;     // e.g. "Kylian Mbappé"
  team: string;     // e.g. "France", "Intro", "FIFA Museum", "Coca-Cola"
  isFoil: boolean;
}

export interface CollectionEntry {
  stickerId: string;
  quantity: number;
}

export interface TradePair {
  userAId: string;
  userAName: string;
  userBId: string;
  userBName: string;
  canGive: Sticker[];    // A can give to B (A has duplicates, B is missing)
  canReceive: Sticker[]; // B can give to A (B has duplicates, A is missing)
}

export interface GroupWithMembers {
  id: string;
  name: string;
  inviteCode: string;
  createdById: string;
  members: {
    userId: string;
    username: string;
    collectionCount: number;
  }[];
}
