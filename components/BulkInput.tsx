"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  bulkUpsertStickers,
  type BulkStickerEntry,
} from "@/lib/actions/collection";
import { STICKERS } from "@/data/stickers";

type BulkResult = {
  newStickers: BulkStickerEntry[];
  alreadyOwned: BulkStickerEntry[];
  invalid: string[];
};

const stickerAlbumIndex = new Map(STICKERS.map((s, i) => [s.id, i]));
const sortByAlbum = (entries: BulkStickerEntry[]) =>
  [...entries].sort(
    (a, b) =>
      (stickerAlbumIndex.get(a.id) ?? 9999) -
      (stickerAlbumIndex.get(b.id) ?? 9999),
  );

function StickerBadge({
  entry,
  color,
}: {
  entry: BulkStickerEntry;
  color: "lime" | "gold" | "red";
}) {
  const extras = entry.received - 1;
  const colorMap = {
    lime: "text-lime bg-lime/10 border-lime/25",
    gold: "text-gold bg-gold/10 border-gold/25",
    red: "text-red/70 bg-red/10 border-red/25",
  };
  return (
    <span
      className={`relative inline-flex items-center font-mono text-[10px] font-bold border rounded px-1.5 py-0.5 ${colorMap[color]}`}
    >
      {entry.id}
      {extras > 0 && (
        <span className="ml-1 text-[9px] opacity-60">×{entry.received}</span>
      )}
    </span>
  );
}

export default function BulkInput() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [result, setResult] = useState<BulkResult | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    const codes = text.split(/[\s,;]+/).filter(Boolean);
    startTransition(async () => {
      const res = await bulkUpsertStickers(codes);
      setResult({
        newStickers: sortByAlbum(res.newStickers),
        alreadyOwned: sortByAlbum(res.alreadyOwned),
        invalid: res.invalid,
      });
      setText("");
      router.refresh();
    });
  }

  function handleClose() {
    setOpen(false);
    setResult(null);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-center gap-2 text-[10px] font-title font-semibold  uppercase text-text/35 border border-white/[0.07] hover:border-lime/20 hover:text-lime/60 rounded-xl px-4 py-3 w-full transition-all"
      >
        <span className="text-sm font-light leading-none">+</span>
        Ajout en masse (codes)
      </button>
    );
  }

  // compute extra counts for the summary hint
  const newWithExtras = result?.newStickers.filter((e) => e.received > 1) ?? [];
  const totalNewExtras = newWithExtras.reduce((s, e) => s + e.received - 1, 0);
  const totalOwnedExtras =
    result?.alreadyOwned.reduce((s, e) => s + e.received, 0) ?? 0;

  return (
    <div className="border border-white/[0.07] rounded-xl p-4 space-y-3 bg-surface">
      {!result ? (
        <>
          <p className="text-[10px] font-title font-semibold  uppercase text-text/35">
            Codes séparés par virgules ou espaces —{" "}
            <code className="font-mono text-lime/60 normal-case">
              FRA1, ARG17, FWC4
            </code>
          </p>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder="FRA1, FRA2, BRA17..."
            className="w-full bg-void border border-white/[0.07] focus:border-lime/35 rounded-lg px-3 py-2.5 text-text/80 text-sm font-mono focus:outline-none resize-none placeholder:text-text/18 transition-colors"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={isPending || !text.trim()}
              className="flex-1 bg-lime text-void font-title font-bold py-2.5 rounded-lg text-xs  uppercase disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
            >
              {isPending ? "Ajout..." : "Ajouter"}
            </button>
            <button
              onClick={handleClose}
              className="px-4 py-2.5 border border-white/[0.07] hover:border-white/15 rounded-lg text-xs text-text/35 transition-colors"
            >
              Annuler
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="text-[10px] font-title font-semibold  uppercase text-text/40">
            Résultat
          </div>

          {/* Nouveaux — à coller */}
          {result.newStickers.length > 0 && (
            <div className="rounded-lg border border-lime/20 bg-lime/5 p-3 space-y-2">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-[9px] font-title font-semibold  uppercase text-lime/70">
                  ✓ {result.newStickers.length} nouveau
                  {result.newStickers.length > 1 ? "x" : ""} — à coller
                </p>
                {totalNewExtras > 0 && (
                  <p className="text-[9px] font-mono text-lime/40 shrink-0">
                    +{totalNewExtras} extra{totalNewExtras > 1 ? "s" : ""} à
                    garder
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-1">
                {result.newStickers.map((e) => (
                  <StickerBadge key={e.id} entry={e} color="lime" />
                ))}
              </div>
              {newWithExtras.length > 0 && (
                <p className="text-[9px] font-mono text-lime/35 leading-relaxed">
                  {newWithExtras
                    .map(
                      (e) =>
                        `${e.id} ×${e.received} → coller 1, garder ${e.received - 1} de côté`,
                    )
                    .join(" · ")}
                </p>
              )}
            </div>
          )}

          {/* Déjà en collection — tous en double */}
          {result.alreadyOwned.length > 0 && (
            <div className="rounded-lg border border-gold/20 bg-gold/5 p-3 space-y-2">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-[9px] font-title font-semibold  uppercase text-gold/70">
                  ↑ {result.alreadyOwned.length} déjà collé
                  {result.alreadyOwned.length > 1 ? "s" : ""} — à garder de côté
                </p>
                {totalOwnedExtras > 0 && (
                  <p className="text-[9px] font-mono text-gold/40 shrink-0">
                    {totalOwnedExtras} double{totalOwnedExtras > 1 ? "s" : ""}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-1">
                {result.alreadyOwned.map((e) => (
                  <StickerBadge key={e.id} entry={e} color="gold" />
                ))}
              </div>
            </div>
          )}

          {/* Invalides */}
          {result.invalid.length > 0 && (
            <div className="rounded-lg border border-red/20 bg-red/5 p-3 space-y-2">
              <p className="text-[9px] font-title font-semibold  uppercase text-red/60">
                ✕ {result.invalid.length} code
                {result.invalid.length > 1 ? "s" : ""} invalide
                {result.invalid.length > 1 ? "s" : ""}
              </p>
              <div className="flex flex-wrap gap-1">
                {result.invalid.map((id) => (
                  <StickerBadge
                    key={id}
                    entry={{ id, received: 1 }}
                    color="red"
                  />
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              onClick={() => setResult(null)}
              className="flex-1 bg-lime/10 border border-lime/25 text-lime font-title font-bold py-2.5 rounded-lg text-xs  uppercase hover:bg-lime/15 transition-colors"
            >
              Nouvel ajout
            </button>
            <button
              onClick={handleClose}
              className="px-4 py-2.5 border border-white/[0.07] hover:border-white/15 rounded-lg text-xs text-text/35 transition-colors"
            >
              Fermer
            </button>
          </div>
        </>
      )}
    </div>
  );
}
