"use client";
import { useState } from "react";
import type { TradePair } from "@/types";
import TradeDetail from "./TradeDetail";

interface TradeMatrixProps {
  pairs: TradePair[];
}

export default function TradeMatrix({ pairs }: TradeMatrixProps) {
  const [selected, setSelected] = useState<TradePair | null>(null);

  if (pairs.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="font-title  uppercase text-text/25 text-sm">
          Pas encore assez de membres
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {pairs.map((pair) => {
          const total = pair.canGive.length + pair.canReceive.length;
          return (
            <button
              key={`${pair.userAId}-${pair.userBId}`}
              onClick={() => setSelected(pair)}
              className="w-full border border-white/[0.07] bg-surface hover:border-lime/20 hover:bg-elevated rounded-xl p-4 text-left transition-all group"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-title font-bold text-sm text-text group-hover:text-lime/90 transition-colors ">
                  {pair.userAName} ↔ {pair.userBName}
                </span>
                <span
                  className={`font-mono text-sm font-bold tabular-nums ${
                    total > 0 ? "text-lime" : "text-text/20"
                  }`}
                >
                  {total}
                </span>
              </div>
              <div className="flex gap-4 text-[9px] font-mono text-text/28">
                <span>
                  ↑ {pair.canGive.length} de {pair.userAName}
                </span>
                <span>
                  ↑ {pair.canReceive.length} de {pair.userBName}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {selected && (
        <TradeDetail pair={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
