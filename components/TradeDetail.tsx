"use client";
import type { TradePair } from "@/types";
import { useState } from "react";

interface TradeDetailProps {
  pair: TradePair;
  onClose: () => void;
}

export default function TradeDetail({ pair, onClose }: TradeDetailProps) {
  const [copied, setCopied] = useState(false);

  const exportText = [
    `Échange Panini WC26 — ${pair.userAName} ↔ ${pair.userBName}`,
    "",
    `${pair.userAName} → ${pair.userBName} (${pair.canGive.length}) :`,
    pair.canGive.map((s) => `${s.id} ${s.name}`).join(", ") || "Rien",
    "",
    `${pair.userBName} → ${pair.userAName} (${pair.canReceive.length}) :`,
    pair.canReceive.map((s) => `${s.id} ${s.name}`).join(", ") || "Rien",
  ].join("\n");

  function handleCopy() {
    navigator.clipboard.writeText(exportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className="fixed inset-0 bg-void/92 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-elevated border border-white/[0.10] rounded-2xl p-5 w-full max-w-lg max-h-[80vh] overflow-y-auto"
        style={{ boxShadow: "0 24px 80px rgba(0,0,0,0.85)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-5">
          <div>
            <p className="text-[9px] font-mono text-text/30 tracking-widest uppercase mb-0.5">Échange</p>
            <h2 className="font-title font-bold text-lg text-text tracking-wide">
              {pair.userAName} ↔ {pair.userBName}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-text/30 hover:text-text/60 transition-colors text-lg leading-none mt-0.5"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-5">
          <div>
            <p className="flex items-center gap-1.5 text-[9px] font-title font-bold tracking-widest uppercase text-lime/65 mb-3">
              <span className="w-0.5 h-3 bg-lime/50 rounded-full inline-block" />
              {pair.userAName} ({pair.canGive.length})
            </p>
            <div className="space-y-2">
              {pair.canGive.length === 0 ? (
                <p className="text-[10px] text-text/20 font-mono">Rien</p>
              ) : (
                pair.canGive.map((s) => (
                  <div key={s.id} className="flex items-baseline gap-2">
                    <span className="font-mono text-[10px] font-bold text-lime/75 shrink-0 w-10">
                      {s.id}
                    </span>
                    <span className="text-[10px] text-text/45 truncate leading-tight">{s.name}</span>
                  </div>
                ))
              )}
            </div>
          </div>
          <div>
            <p className="flex items-center gap-1.5 text-[9px] font-title font-bold tracking-widest uppercase text-gold/65 mb-3">
              <span className="w-0.5 h-3 bg-gold/50 rounded-full inline-block" />
              {pair.userBName} ({pair.canReceive.length})
            </p>
            <div className="space-y-2">
              {pair.canReceive.length === 0 ? (
                <p className="text-[10px] text-text/20 font-mono">Rien</p>
              ) : (
                pair.canReceive.map((s) => (
                  <div key={s.id} className="flex items-baseline gap-2">
                    <span className="font-mono text-[10px] font-bold text-gold/75 shrink-0 w-10">
                      {s.id}
                    </span>
                    <span className="text-[10px] text-text/45 truncate leading-tight">{s.name}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className={`w-full font-title font-bold py-3 rounded-xl text-sm tracking-widest uppercase transition-all ${
            copied
              ? "bg-lime/15 border border-lime/30 text-lime"
              : "bg-lime text-void hover:opacity-90"
          }`}
        >
          {copied ? "✓ Copié !" : "Copier le résumé"}
        </button>
      </div>
    </div>
  );
}
