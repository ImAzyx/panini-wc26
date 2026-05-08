import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { STICKERS, STICKERS_BY_TEAM, TEAM_ORDER, ALBUM_STICKER_COUNT } from "@/data/stickers";
import ProgressBar from "@/components/ProgressBar";

export default async function StatsPage() {
  const session = await auth();
  if (!session) return null;

  const collection = await prisma.collection.findMany({
    where: { userId: session.user.id },
    select: { stickerId: true, quantity: true },
  });

  const collMap = new Map(collection.map((c) => [c.stickerId, c.quantity]));
  const owned = collection.length;
  const duplicates = collection.filter((c) => c.quantity > 1).length;
  const duplicatesPct = owned > 0 ? Math.round((duplicates / owned) * 100) : 0;
  const missing = ALBUM_STICKER_COUNT - owned;
  const totalPct = Math.round((owned / ALBUM_STICKER_COUNT) * 100);

  const teamRows = TEAM_ORDER
    .filter((t) => t !== "Intro" && t !== "FIFA Museum")
    .map((team) => {
      const stickers = STICKERS_BY_TEAM[team] ?? [];
      const teamOwned = stickers.filter((s) => collMap.has(s.id)).length;
      const pct = stickers.length > 0 ? teamOwned / stickers.length : 0;
      return { team, teamOwned, total: stickers.length, pct };
    })
    .sort((a, b) => b.pct - a.pct);

  return (
    <main className="max-w-xl mx-auto px-4 py-5">
      <h1 className="font-title font-bold text-2xl tracking-widest text-text uppercase mb-6">
        Statistiques
      </h1>

      {/* Big stat scoreboard */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-surface border border-white/[0.07] rounded-xl p-4 text-center">
          <div className="font-mono font-bold text-3xl text-lime leading-none mb-1.5 tabular-nums">
            {owned}
          </div>
          <div className="text-[9px] font-title font-semibold tracking-widest uppercase text-text/35">
            Collés
          </div>
        </div>
        <div className="bg-surface border border-white/[0.07] rounded-xl p-4 text-center">
          <div className="font-mono font-bold text-3xl text-gold leading-none mb-1 tabular-nums">
            {duplicates}
          </div>
          <div className="font-mono text-xs text-gold/50 tabular-nums mb-1">
            {duplicatesPct}%
          </div>
          <div className="text-[9px] font-title font-semibold tracking-widest uppercase text-text/35">
            Doubles
          </div>
        </div>
        <div className="bg-surface border border-white/[0.07] rounded-xl p-4 text-center">
          <div className="font-mono font-bold text-3xl text-red leading-none mb-1.5 tabular-nums">
            {missing}
          </div>
          <div className="text-[9px] font-title font-semibold tracking-widest uppercase text-text/35">
            Manquants
          </div>
        </div>
      </div>

      {/* Total progress */}
      <div className="bg-surface border border-white/[0.07] rounded-xl p-5 mb-6">
        <div className="flex justify-between items-end mb-3">
          <p className="text-[10px] font-title font-semibold tracking-widest uppercase text-text/35">
            Total
          </p>
          <p className="font-mono font-bold text-4xl text-lime leading-none tabular-nums">
            {totalPct}%
          </p>
        </div>
        <ProgressBar current={owned} total={ALBUM_STICKER_COUNT} size="lg" />
      </div>

      {/* Per-team – sorted by completion desc */}
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-0.5 h-5 rounded-full bg-white/15" />
        <h2 className="text-[10px] font-title font-semibold tracking-widest uppercase text-text/35">
          Par équipe
        </h2>
      </div>
      <div className="space-y-1.5">
        {teamRows.map(({ team, teamOwned, total }) => (
          <div
            key={team}
            className="bg-surface border border-white/[0.05] rounded-lg px-3 py-2"
          >
            <ProgressBar current={teamOwned} total={total} label={team} size="sm" />
          </div>
        ))}
      </div>
    </main>
  );
}
