import Link from "next/link";
import type { Sticker } from "@/types";

interface MemberTradeCardProps {
  memberId: string;
  memberName: string;
  collectionCount: number;
  totalStickers: number;
  myGive: Sticker[];
  myReceive: Sticker[];
  groupId: string;
}

export default function MemberTradeCard({
  memberId,
  memberName,
  collectionCount,
  totalStickers,
  myGive,
  myReceive,
  groupId,
}: MemberTradeCardProps) {
  const hasExchanges = myGive.length + myReceive.length > 0;

  const teamCounts = new Map<string, number>();
  [...myGive, ...myReceive].forEach((s) => {
    teamCounts.set(s.team, (teamCounts.get(s.team) ?? 0) + 1);
  });
  const topTeams = [...teamCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);
  const extraTeams = teamCounts.size - topTeams.length;

  return (
    <div
      className={`border border-white/[0.07] bg-surface rounded-xl p-4 space-y-3 transition-opacity ${
        hasExchanges ? "opacity-100" : "opacity-35"
      }`}
    >
      <div className="flex justify-between items-center">
        <Link
          href={`/groups/${groupId}/members/${memberId}`}
          className="font-title font-bold text-sm text-text hover:text-lime transition-colors"
        >
          {memberName}
        </Link>
        <span className="font-mono text-[10px] text-text/32">
          {collectionCount}
          <span className="text-text/18">/{totalStickers}</span>
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-lime/5 border border-lime/15 rounded-lg p-2.5 text-center">
          <p className="font-mono text-2xl font-bold text-lime leading-none">
            {myGive.length}
          </p>
          <p className="text-[9px] font-title uppercase text-text/35 mt-1">
            Tu peux donner
          </p>
        </div>
        <div className="bg-sky-400/5 border border-sky-400/15 rounded-lg p-2.5 text-center">
          <p className="font-mono text-2xl font-bold text-sky-400 leading-none">
            {myReceive.length}
          </p>
          <p className="text-[9px] font-title uppercase text-text/35 mt-1">
            Tu peux recevoir
          </p>
        </div>
      </div>

      {topTeams.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {topTeams.map(([team, count]) => (
            <span
              key={team}
              className="text-[9px] font-mono bg-white/[0.04] border border-white/[0.08] px-2 py-0.5 rounded-full text-text/40"
            >
              {team.slice(0, 3).toUpperCase()} ×{count}
            </span>
          ))}
          {extraTeams > 0 && (
            <span className="text-[9px] font-mono text-text/25 px-1 py-0.5">
              +{extraTeams}
            </span>
          )}
        </div>
      )}

      {hasExchanges && (
        <Link
          href={`/groups/${groupId}/compare/${memberId}`}
          className="flex items-center justify-between w-full bg-white/[0.03] border border-white/[0.08] hover:border-lime/20 hover:bg-lime/5 text-text/50 hover:text-lime font-title font-bold py-2.5 rounded-lg px-3 transition-all text-[11px] uppercase"
        >
          <span>Voir le comparatif</span>
          <span>→</span>
        </Link>
      )}
    </div>
  );
}
