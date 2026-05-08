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

export async function bulkUpsertStickers(
  codes: string[]
): Promise<{ added: number; invalid: string[] }> {
  const userId = await requireUser();
  const invalid: string[] = [];
  const valid: string[] = [];

  for (const code of codes) {
    const trimmed = code.trim().toUpperCase();
    if (STICKER_MAP.has(trimmed)) valid.push(trimmed);
    else if (trimmed) invalid.push(trimmed);
  }

  for (const stickerId of valid) {
    await prisma.collection.upsert({
      where: { userId_stickerId: { userId, stickerId } },
      create: { userId, stickerId, quantity: 1 },
      update: { quantity: { increment: 1 } },
    });
  }

  return { added: valid.length, invalid };
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
