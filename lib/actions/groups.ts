"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { nanoid } from "nanoid";

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non authentifié");
  return session.user;
}

export async function createGroup(name: string) {
  const user = await requireUser();
  const inviteCode = nanoid(6).toUpperCase();
  const group = await prisma.group.create({
    data: {
      name,
      inviteCode,
      createdById: user.id,
      members: { create: { userId: user.id } },
    },
  });
  return group;
}

export async function joinGroup(inviteCode: string) {
  const user = await requireUser();
  const group = await prisma.group.findUnique({ where: { inviteCode } });
  if (!group) throw new Error("Code invalide");

  await prisma.groupMember.upsert({
    where: { groupId_userId: { groupId: group.id, userId: user.id } },
    create: { groupId: group.id, userId: user.id },
    update: {},
  });
  return group;
}

export async function getUserGroups() {
  const user = await requireUser();
  return prisma.group.findMany({
    where: { members: { some: { userId: user.id } } },
    include: {
      members: { include: { user: { select: { id: true, username: true } } } },
      _count: { select: { members: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getGroupWithMembers(groupId: string) {
  const user = await requireUser();
  const membership = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: user.id } },
  });
  if (!membership) throw new Error("Accès refusé");

  const group = await prisma.group.findUniqueOrThrow({
    where: { id: groupId },
    include: {
      members: { include: { user: { select: { id: true, username: true } } } },
    },
  });

  const memberStats = await Promise.all(
    group.members.map(async (m) => {
      const count = await prisma.collection.count({ where: { userId: m.userId } });
      return { userId: m.userId, username: m.user.username, collectionCount: count };
    })
  );

  return { ...group, memberStats };
}
