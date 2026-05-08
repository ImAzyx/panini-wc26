"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { STICKER_MAP } from "@/data/stickers";
import type { CollectionEntry } from "@/types";

async function requireUser(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non authentifié");
  return session.user.id;
}

export async function getCollection(): Promise<CollectionEntry[]> {
  const userId = await requireUser();
  return prisma.collection.findMany({
    where: { userId },
    select: { stickerId: true, quantity: true },
  });
}

export async function upsertSticker(stickerId: string, delta: number): Promise<void> {
  const userId = await requireUser();
  if (!STICKER_MAP.has(stickerId)) throw new Error("Sticker invalide");

  const existing = await prisma.collection.findUnique({
    where: { userId_stickerId: { userId, stickerId } },
  });

  const newQty = Math.max(0, (existing?.quantity ?? 0) + delta);

  if (newQty === 0) {
    await prisma.collection.deleteMany({
      where: { userId, stickerId },
    });
  } else {
    await prisma.collection.upsert({
      where: { userId_stickerId: { userId, stickerId } },
      create: { userId, stickerId, quantity: newQty },
      update: { quantity: newQty },
    });
  }
}

export type BulkStickerEntry = { id: string; received: number };

export async function bulkUpsertStickers(codes: string[]): Promise<{
  newStickers: BulkStickerEntry[];   // not previously owned
  alreadyOwned: BulkStickerEntry[];  // already had at least 1
  invalid: string[];
}> {
  const userId = await requireUser();
  const invalid: string[] = [];
  const counts = new Map<string, number>();

  for (const code of codes) {
    const trimmed = code.trim().toUpperCase();
    if (STICKER_MAP.has(trimmed)) counts.set(trimmed, (counts.get(trimmed) ?? 0) + 1);
    else if (trimmed) invalid.push(trimmed);
  }

  const validIds = [...counts.keys()];

  const existing = await prisma.collection.findMany({
    where: { userId, stickerId: { in: validIds } },
    select: { stickerId: true },
  });
  const existingSet = new Set(existing.map((e) => e.stickerId));

  const newStickers: BulkStickerEntry[] = [];
  const alreadyOwned: BulkStickerEntry[] = [];

  for (const [id, received] of counts) {
    if (existingSet.has(id)) alreadyOwned.push({ id, received });
    else newStickers.push({ id, received });
  }

  for (const [stickerId, received] of counts) {
    await prisma.collection.upsert({
      where: { userId_stickerId: { userId, stickerId } },
      create: { userId, stickerId, quantity: received },
      update: { quantity: { increment: received } },
    });
  }

  return { newStickers, alreadyOwned, invalid };
}

export async function getUserCollectionById(
  targetUserId: string
): Promise<CollectionEntry[]> {
  const requesterId = await requireUser();

  const sharedGroup = await prisma.groupMember.findFirst({
    where: {
      userId: requesterId,
      group: { members: { some: { userId: targetUserId } } },
    },
  });
  if (!sharedGroup) throw new Error("Accès refusé");

  return prisma.collection.findMany({
    where: { userId: targetUserId },
    select: { stickerId: true, quantity: true },
  });
}
