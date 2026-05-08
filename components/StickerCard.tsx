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
        className="relative rounded-lg flex items-center justify-center min-h-[52px] p-1.5 cursor-pointer select-none active:scale-95 transition-transform border border-dashed border-white/[0.15]"
        {...handlers}
      >
        <span className="text-[11px] font-mono text-white/35 font-bold leading-tight text-center">{sticker.id}</span>
      </div>
    );
  }

  if (state === "owned") {
    return (
      <div
        className="relative rounded-lg flex items-center justify-center min-h-[52px] p-1.5 cursor-pointer select-none active:scale-95 transition-transform bg-cream border border-lime/40 sticker-glow overflow-hidden"
        {...handlers}
      >
        {sticker.isFoil && (
          <div className="foil-shimmer absolute inset-0 pointer-events-none z-10" />
        )}
        <span className="text-[11px] font-mono font-bold leading-tight text-void relative z-20 select-none text-center">
          {sticker.id}
        </span>
      </div>
    );
  }

  return (
    <div
      className="relative rounded-lg flex items-center justify-center min-h-[52px] p-1.5 cursor-pointer select-none active:scale-95 transition-transform bg-gold/15 border border-gold/50"
      {...handlers}
    >
      <span className="text-[11px] font-mono font-bold leading-tight text-gold relative z-10 select-none text-center">
        {sticker.id}
      </span>
      <span className="absolute -top-1.5 -right-1.5 bg-gold text-void text-[9px] font-mono font-bold rounded-full w-[18px] h-[18px] flex items-center justify-center z-20 leading-none">
        {quantity}
      </span>
    </div>
  );
}
