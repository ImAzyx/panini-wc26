"use client";
import { useState, useTransition, useCallback, useEffect } from "react";
import StickerCard from "./StickerCard";
import type { Sticker, CollectionEntry } from "@/types";
import { STICKERS_BY_TEAM, TEAM_ORDER, STICKERS } from "@/data/stickers";
import { upsertSticker } from "@/lib/actions/collection";
import confetti from "canvas-confetti";

type ModalState = { sticker: Sticker; quantity: number } | null;

interface StickerGridProps {
  initialCollection: CollectionEntry[];
}

export default function StickerGrid({ initialCollection }: StickerGridProps) {
  const [collection, setCollection] = useState<Map<string, number>>(
    () => new Map(initialCollection.map((e) => [e.stickerId, e.quantity]))
  );

  useEffect(() => {
    setCollection(new Map(initialCollection.map((e) => [e.stickerId, e.quantity])));
  }, [initialCollection]);
  const [modal, setModal] = useState<ModalState>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    localStorage.setItem("collection", JSON.stringify([...collection.entries()]));
  }, [collection]);

  const getQty = (id: string) => collection.get(id) ?? 0;

  const handleTap = useCallback(
    (sticker: Sticker) => {
      const current = collection.get(sticker.id) ?? 0;
      const newQty = current === 0 ? 1 : current === 1 ? 2 : 0;
      const delta = newQty - current;

      setCollection((prev) => {
        const next = new Map(prev);
        if (newQty === 0) next.delete(sticker.id);
        else next.set(sticker.id, newQty);
        return next;
      });

      if (newQty > 0) {
        const teamStickers = STICKERS_BY_TEAM[sticker.team] ?? [];
        const allOwned = teamStickers.every((s) =>
          s.id === sticker.id ? newQty > 0 : (collection.get(s.id) ?? 0) > 0
        );
        if (allOwned && teamStickers.length > 1) {
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.6 },
            colors: ["#A8FF3E", "#F0C040", "#38BEFF", "#FF3D5A"],
          });
        }
      }

      startTransition(() => {
        upsertSticker(sticker.id, delta);
      });
    },
    [collection]
  );

  const totalOwned = collection.size;
  const totalPct = Math.round((totalOwned / STICKERS.length) * 100);

  return (
    <div className="space-y-8">
      {/* Total progress hero card */}
      <div className="relative overflow-hidden rounded-2xl bg-surface border border-white/[0.06] p-5">
        <div className="flex justify-between items-end mb-3">
          <div>
            <p className="text-[10px] font-title font-semibold tracking-widest text-text/35 uppercase mb-1">
              Progression totale
            </p>
            <p className="font-mono font-bold text-4xl text-lime leading-none">{totalPct}%</p>
          </div>
          <p className="font-mono text-text/40 text-sm">
            {totalOwned}
            <span className="text-text/20">/{STICKERS.length}</span>
          </p>
        </div>
        <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
          <div
            className="h-full bg-lime rounded-full transition-all duration-700"
            style={{ width: `${totalPct}%`, boxShadow: "0 0 10px rgba(168,255,62,0.6)" }}
          />
        </div>
      </div>

      {/* Team sections – 2 columns on desktop */}
      <div className="md:grid md:grid-cols-2 md:gap-x-6 md:gap-y-8 md:items-start space-y-8 md:space-y-0">
      {TEAM_ORDER.map((team) => {
        const stickers = STICKERS_BY_TEAM[team];
        if (!stickers?.length) return null;
        const teamOwned = stickers.filter((s) => getQty(s.id) > 0).length;
        const complete = teamOwned === stickers.length;
        const pct = Math.round((teamOwned / stickers.length) * 100);

        return (
          <section key={team}>
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className={`w-0.5 h-5 rounded-full shrink-0 ${complete ? "bg-lime" : "bg-white/15"}`} />
              <h2 className="font-title font-bold text-xs tracking-widest text-text/60 uppercase flex-1">
                {team}
              </h2>
              {complete && (
                <span className="text-lime text-[9px] font-mono font-bold tracking-widest">✓ COMPLET</span>
              )}
              <span className="font-mono text-[10px] text-text/25">{teamOwned}/{stickers.length}</span>
              <div className="w-14 h-0.5 bg-white/[0.05] rounded-full overflow-hidden shrink-0">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${complete ? "bg-lime" : "bg-gold/50"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-5 gap-1.5">
              {stickers.map((s) => (
                <StickerCard
                  key={s.id}
                  sticker={s}
                  quantity={getQty(s.id)}
                  onTap={() => handleTap(s)}
                  onLongPress={() => setModal({ sticker: s, quantity: getQty(s.id) })}
                />
              ))}
            </div>
          </section>
        );
      })}
      </div>

      {/* Quantity modal */}
      {modal && (
        <div
          className="fixed inset-0 bg-void/92 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
          onClick={() => setModal(null)}
        >
          <div
            className="bg-elevated border border-white/[0.10] rounded-2xl p-6 w-full max-w-xs"
            style={{ boxShadow: "0 24px 80px rgba(0,0,0,0.85)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5">
              <p className="text-[9px] font-mono text-text/30 tracking-widest uppercase mb-1">Autocollant</p>
              <h3 className="font-title font-bold text-xl text-lime tracking-wide">{modal.sticker.id}</h3>
              <p className="text-xs text-text/50 mt-0.5">{modal.sticker.name}</p>
            </div>
            <div className="flex items-center justify-center gap-5">
              <button
                onClick={() => {
                  const qty = Math.max(0, modal.quantity - 1);
                  setModal({ ...modal, quantity: qty });
                  setCollection((prev) => {
                    const next = new Map(prev);
                    if (qty === 0) next.delete(modal.sticker.id);
                    else next.set(modal.sticker.id, qty);
                    return next;
                  });
                  startTransition(() => upsertSticker(modal.sticker.id, -1));
                }}
                className="w-11 h-11 rounded-full bg-white/[0.05] border border-white/[0.08] text-xl text-text/50 flex items-center justify-center hover:bg-white/[0.09] transition-colors"
              >
                −
              </button>
              <span className="font-mono text-4xl font-bold text-text w-12 text-center tabular-nums">
                {modal.quantity}
              </span>
              <button
                onClick={() => {
                  const qty = modal.quantity + 1;
                  setModal({ ...modal, quantity: qty });
                  setCollection((prev) => new Map(prev).set(modal.sticker.id, qty));
                  startTransition(() => upsertSticker(modal.sticker.id, 1));
                }}
                className="w-11 h-11 rounded-full bg-lime/10 border border-lime/30 text-xl text-lime flex items-center justify-center hover:bg-lime/18 transition-colors"
              >
                +
              </button>
            </div>
            <button
              onClick={() => setModal(null)}
              className="mt-5 w-full text-[10px] font-title font-semibold tracking-widest uppercase text-text/25 hover:text-text/50 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
