"use client";
import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { TradePair } from "@/types";
import MemberTradeCard from "@/components/MemberTradeCard";
import { STICKERS } from "@/data/stickers";

interface MemberStat {
  userId: string;
  username: string;
  collectionCount: number;
}

interface Props {
  pairs: TradePair[];
  currentUserId: string;
  memberStats: MemberStat[];
  groupId: string;
  groupName: string;
}

export default function TradesClient({
  pairs,
  currentUserId,
  memberStats,
  groupId,
  groupName,
}: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  useEffect(() => {
    const id = setInterval(() => {
      startTransition(() => router.refresh());
    }, 30_000);
    return () => clearInterval(id);
  }, [router]);

  const otherMembers = memberStats.filter((m) => m.userId !== currentUserId);

  const memberCards = otherMembers
    .map((m) => {
      const pair = pairs.find(
        (p) =>
          (p.userAId === currentUserId && p.userBId === m.userId) ||
          (p.userBId === currentUserId && p.userAId === m.userId),
      );
      const myGive = !pair
        ? []
        : pair.userAId === currentUserId
          ? pair.canGive
          : pair.canReceive;
      const myReceive = !pair
        ? []
        : pair.userAId === currentUserId
          ? pair.canReceive
          : pair.canGive;
      return { member: m, myGive, myReceive };
    })
    .sort(
      (a, b) =>
        b.myGive.length +
        b.myReceive.length -
        (a.myGive.length + a.myReceive.length),
    );

  const totalExchanges = memberCards.reduce(
    (sum, c) => sum + c.myGive.length + c.myReceive.length,
    0,
  );

  return (
    <main className="max-w-xl mx-auto px-4 py-5">
      <div className="mb-6">
        <p className="text-[9px] font-title font-semibold uppercase text-text/30 mb-0.5">
          <Link
            href={`/groups/${groupId}`}
            className="hover:text-text/60 transition-colors"
          >
            {groupName}
          </Link>
        </p>
        <div className="flex justify-between items-end">
          <h1 className="font-title font-bold text-2xl text-text uppercase">
            Échanges possibles
          </h1>
          <span className="text-[9px] font-mono text-text/22 border border-white/[0.06] rounded-full px-2.5 py-1">
            {totalExchanges} échange{totalExchanges !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {otherMembers.length === 0 ? (
        <div className="text-center py-16">
          <p className="font-title uppercase text-text/25 text-sm">
            Pas encore assez de membres
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {memberCards.map(({ member, myGive, myReceive }) => (
            <MemberTradeCard
              key={member.userId}
              memberId={member.userId}
              memberName={member.username}
              collectionCount={member.collectionCount}
              totalStickers={STICKERS.length}
              myGive={myGive}
              myReceive={myReceive}
              groupId={groupId}
            />
          ))}
        </div>
      )}
    </main>
  );
}
