"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { STICKER_MAP } from "@/data/stickers";
import type { TradePair, Sticker } from "@/types";

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non authentifié");
  return session.user;
}

export async function getTradeMatrix(groupId: string): Promise<TradePair[]> {
  const user = await requireUser();

  const membership = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: user.id } },
  });
  if (!membership) throw new Error("Accès refusé");

  const members = await prisma.groupMember.findMany({
    where: { groupId },
    include: { user: { select: { id: true, username: true } } },
  });

  const collections = await prisma.collection.findMany({
    where: { userId: { in: members.map((m) => m.userId) } },
  });

  const byUser = new Map<string, Map<string, number>>();
  for (const m of members) byUser.set(m.userId, new Map());
  for (const c of collections) byUser.get(c.userId)?.set(c.stickerId, c.quantity);

  const pairs: TradePair[] = [];

  for (let i = 0; i < members.length; i++) {
    for (let j = i + 1; j < members.length; j++) {
      const a = members[i];
      const b = members[j];
      const aCol = byUser.get(a.userId)!;
      const bCol = byUser.get(b.userId)!;

      const canGive: Sticker[] = [];
      const canReceive: Sticker[] = [];

      for (const [sid, qty] of aCol) {
        if (qty > 1 && !bCol.has(sid)) {
          const s = STICKER_MAP.get(sid);
          if (s) canGive.push(s);
        }
      }

      for (const [sid, qty] of bCol) {
        if (qty > 1 && !aCol.has(sid)) {
          const s = STICKER_MAP.get(sid);
          if (s) canReceive.push(s);
        }
      }

      pairs.push({
        userAId: a.userId,
        userAName: a.user.username,
        userBId: b.userId,
        userBName: b.user.username,
        canGive,
        canReceive,
      });
    }
  }

  return pairs;
}
