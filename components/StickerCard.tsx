"use client";
import { useRef } from "react";
import type { Sticker } from "@/types";

interface StickerCardProps {
  sticker: Sticker;
  quantity: number;
  onTap: () => void;
  onLongPress: () => void;
}

export default function StickerCard({ sticker, quantity, onTap, onLongPress }: StickerCardProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLongPress = useRef(false);

  const state = quantity === 0 ? "missing" : quantity === 1 ? "owned" : "duplicate";

  function startPress() {
    didLongPress.current = false;
    timerRef.current = setTimeout(() => {
      didLongPress.current = true;
      onLongPress();
    }, 500);
  }

  function cancelPress() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  function handleClick() {
    if (!didLongPress.current) onTap();
    didLongPress.current = false;
  }

  const handlers = {
    onClick: handleClick,
    onMouseDown: startPress,
    onMouseUp: cancelPress,
    onMouseLeave: cancelPress,
    onTouchStart: startPress,
    onTouchEnd: cancelPress,
    onTouchMove: cancelPress,
  };

  if (state === "missing") {
    return (
      <div
        className="relative rounded flex flex-col items-center justify-center min-h-[44px] min-w-[44px] p-1.5 cursor-pointer select-none active:scale-95 transition-transform border border-dashed border-white/[0.09]"
        {...handlers}
      >
        <span className="text-[9px] font-mono text-white/12 font-bold leading-tight">{sticker.id}</span>
      </div>
    );
  }

  if (state === "owned") {
    return (
      <div
        className={`relative rounded flex flex-col items-center justify-center min-h-[44px] min-w-[44px] p-1.5 cursor-pointer select-none active:scale-95 transition-transform bg-cream border border-lime/35 sticker-glow overflow-hidden`}
        {...handlers}
      >
        {sticker.isFoil && (
          <div className="foil-shimmer absolute inset-0 pointer-events-none z-10" />
        )}
        <span className="text-[9px] font-mono font-bold leading-tight text-void/70 relative z-20 select-none">
          {sticker.id}
        </span>
      </div>
    );
  }

  return (
    <div
      className="relative rounded flex flex-col items-center justify-center min-h-[44px] min-w-[44px] p-1.5 cursor-pointer select-none active:scale-95 transition-transform bg-gold/10 border border-gold/40"
      {...handlers}
    >
      <span className="text-[9px] font-mono font-bold leading-tight text-gold relative z-10 select-none">
        {sticker.id}
      </span>
      <span className="absolute -top-1.5 -right-1.5 bg-gold text-void text-[8px] font-mono font-bold rounded-full w-4 h-4 flex items-center justify-center z-20 leading-none">
        {quantity}
      </span>
    </div>
  );
}
