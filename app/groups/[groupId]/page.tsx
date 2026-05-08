import { getGroupWithMembers } from "@/lib/actions/groups";
import ProgressBar from "@/components/ProgressBar";
import Link from "next/link";
import { STICKERS } from "@/data/stickers";

export default async function GroupPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  const group = await getGroupWithMembers(groupId);

  return (
    <main className="max-w-xl mx-auto px-4 py-5">
      <div className="flex justify-between items-start mb-6">
        <div>
          <p className="text-[9px] font-title font-semibold tracking-widest uppercase text-text/30 mb-0.5">
            Groupe
          </p>
          <h1 className="font-title font-bold text-xl tracking-wide text-text">{group.name}</h1>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-title tracking-widest uppercase text-text/28 mb-1">
            Code d&apos;invitation
          </p>
          <span className="text-sm font-mono font-bold text-lime/65 bg-lime/5 border border-lime/15 px-3 py-1 rounded-lg tracking-[0.2em] uppercase">
            {group.inviteCode}
          </span>
        </div>
      </div>

      <Link
        href={`/groups/${group.id}/trades`}
        className="flex items-center justify-between w-full bg-lime/8 border border-lime/20 hover:bg-lime/12 hover:border-lime/35 text-lime font-title font-bold py-3.5 rounded-xl mb-6 px-5 transition-all text-sm tracking-widest uppercase"
      >
        <span>Voir les échanges possibles</span>
        <span className="text-lime/50">→</span>
      </Link>

      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-0.5 h-5 rounded-full bg-white/15" />
        <h2 className="text-[10px] font-title font-semibold tracking-widest uppercase text-text/35">
          Membres
        </h2>
      </div>
      <div className="space-y-2">
        {group.memberStats.map((m) => (
          <div key={m.userId} className="border border-white/[0.07] rounded-xl p-4 bg-surface">
            <div className="flex justify-between items-center mb-2.5">
              <span className="font-title font-bold text-sm text-text">{m.username}</span>
              <span className="font-mono text-[10px] text-text/32">
                {m.collectionCount}
                <span className="text-text/18">/{STICKERS.length}</span>
              </span>
            </div>
            <ProgressBar current={m.collectionCount} total={STICKERS.length} size="sm" />
          </div>
        ))}
      </div>
    </main>
  );
}
