import type { Sticker } from "@/types";
import { STICKERS_BY_TEAM } from "@/data/stickers";

interface CompareStickerCellProps {
  sticker: Sticker;
  canGive: boolean;
  canReceive: boolean;
}

function CompareStickerCell({
  sticker,
  canGive,
  canReceive,
}: CompareStickerCellProps) {
  if (canGive) {
    return (
      <div className="relative rounded-lg flex items-center justify-center min-h-[52px] p-1.5 bg-lime/10 border border-lime/50">
        <span className="text-[11px] font-mono font-bold leading-tight text-lime text-center">
          {sticker.id}
        </span>
        <span className="absolute -top-1.5 -right-1.5 bg-lime text-void text-[8px] font-mono font-bold rounded-full w-[16px] h-[16px] flex items-center justify-center leading-none">
          →
        </span>
      </div>
    );
  }

  if (canReceive) {
    return (
      <div className="relative rounded-lg flex items-center justify-center min-h-[52px] p-1.5 bg-sky-400/10 border border-sky-400/50">
        <span className="text-[11px] font-mono font-bold leading-tight text-sky-400 text-center">
          {sticker.id}
        </span>
        <span className="absolute -top-1.5 -right-1.5 bg-sky-400 text-void text-[8px] font-mono font-bold rounded-full w-[16px] h-[16px] flex items-center justify-center leading-none">
          ←
        </span>
      </div>
    );
  }

  return (
    <div className="relative rounded-lg flex items-center justify-center min-h-[52px] p-1.5 border border-white/[0.06] opacity-25">
      <span className="text-[11px] font-mono text-white/40 font-bold leading-tight text-center">
        {sticker.id}
      </span>
    </div>
  );
}

interface CompareTeamSectionProps {
  team: string;
  canGiveIds: Set<string>;
  canReceiveIds: Set<string>;
}

export default function CompareTeamSection({
  team,
  canGiveIds,
  canReceiveIds,
}: CompareTeamSectionProps) {
  const stickers = STICKERS_BY_TEAM[team] ?? [];
  const exchangeCount = stickers.filter(
    (s) => canGiveIds.has(s.id) || canReceiveIds.has(s.id),
  ).length;

  return (
    <section>
      <div className="flex items-center gap-2.5 mb-2.5">
        <div className="w-0.5 h-5 rounded-full shrink-0 bg-white/15" />
        <h2 className="font-title font-bold text-xs text-text/60 uppercase flex-1">
          {team}
        </h2>
        {exchangeCount > 0 && (
          <span className="font-mono text-[10px] text-text/35">
            {exchangeCount} échange{exchangeCount > 1 ? "s" : ""}
          </span>
        )}
      </div>
      <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-5 gap-1.5">
        {stickers.map((s) => (
          <CompareStickerCell
            key={s.id}
            sticker={s}
            canGive={canGiveIds.has(s.id)}
            canReceive={canReceiveIds.has(s.id)}
          />
        ))}
      </div>
    </section>
  );
}
