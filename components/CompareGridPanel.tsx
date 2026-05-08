import { STICKERS_BY_TEAM } from "@/data/stickers";
import type { Sticker } from "@/types";

interface CellProps {
  sticker: Sticker;
  quantity: number;
  highlighted: boolean;
  highlightColor: "lime" | "sky";
}

function StickerCell({ sticker, quantity, highlighted, highlightColor }: CellProps) {
  if (highlighted && highlightColor === "sky") {
    return (
      <div className="relative rounded-lg flex items-center justify-center min-h-[52px] p-1.5 bg-sky-400/[0.04] border-2 border-sky-400/60">
        <span className="text-[11px] font-mono font-bold leading-tight text-sky-400 text-center">
          {sticker.id}
        </span>
        <span className="absolute -top-1.5 -right-1.5 bg-sky-400 text-void text-[8px] font-mono font-bold rounded-full w-[16px] h-[16px] flex items-center justify-center leading-none">
          ←
        </span>
      </div>
    );
  }

  if (highlighted && highlightColor === "lime") {
    return (
      <div className="relative rounded-lg flex items-center justify-center min-h-[52px] p-1.5 bg-lime/[0.04] border-2 border-lime/60">
        <span className="text-[11px] font-mono font-bold leading-tight text-lime text-center">
          {sticker.id}
        </span>
        <span className="absolute -top-1.5 -right-1.5 bg-lime text-void text-[8px] font-mono font-bold rounded-full w-[16px] h-[16px] flex items-center justify-center leading-none">
          →
        </span>
      </div>
    );
  }

  if (quantity === 0) {
    return (
      <div className="rounded-lg flex items-center justify-center min-h-[52px] p-1.5 border border-dashed border-white/[0.15]">
        <span className="text-[11px] font-mono text-white/35 font-bold leading-tight text-center">
          {sticker.id}
        </span>
      </div>
    );
  }

  if (quantity === 1) {
    return (
      <div className="relative rounded-lg flex items-center justify-center min-h-[52px] p-1.5 bg-cream border border-lime/40 overflow-hidden">
        {sticker.isFoil && (
          <div className="foil-shimmer absolute inset-0 pointer-events-none z-10" />
        )}
        <span className="text-[11px] font-mono font-bold leading-tight text-void relative z-20 text-center">
          {sticker.id}
        </span>
      </div>
    );
  }

  return (
    <div className="relative rounded-lg flex items-center justify-center min-h-[52px] p-1.5 bg-gold/15 border border-gold/50">
      <span className="text-[11px] font-mono font-bold leading-tight text-gold text-center">
        {sticker.id}
      </span>
      <span className="absolute -top-1.5 -right-1.5 bg-gold text-void text-[9px] font-mono font-bold rounded-full w-[18px] h-[18px] flex items-center justify-center z-20 leading-none">
        {quantity}
      </span>
    </div>
  );
}

interface Props {
  team: string;
  collectionMap: Map<string, number>;
  highlightIds: Set<string>;
  highlightColor: "lime" | "sky";
}

export default function CompareGridPanel({ team, collectionMap, highlightIds, highlightColor }: Props) {
  const stickers = STICKERS_BY_TEAM[team] ?? [];
  return (
    <div className="grid grid-cols-5 gap-1.5">
      {stickers.map((s) => (
        <StickerCell
          key={s.id}
          sticker={s}
          quantity={collectionMap.get(s.id) ?? 0}
          highlighted={highlightIds.has(s.id)}
          highlightColor={highlightColor}
        />
      ))}
    </div>
  );
}
