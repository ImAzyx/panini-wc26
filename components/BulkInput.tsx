"use client";
import { useState, useTransition } from "react";
import { bulkUpsertStickers } from "@/lib/actions/collection";

export default function BulkInput() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [result, setResult] = useState<{ added: number; invalid: string[] } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    const codes = text.split(/[\s,;]+/).filter(Boolean);
    startTransition(async () => {
      const res = await bulkUpsertStickers(codes);
      setResult(res);
      setText("");
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-center gap-2 text-[10px] font-title font-semibold tracking-widest uppercase text-text/35 border border-white/[0.07] hover:border-lime/20 hover:text-lime/60 rounded-xl px-4 py-3 w-full transition-all"
      >
        <span className="text-sm font-light leading-none">+</span>
        Ajout en masse (codes)
      </button>
    );
  }

  return (
    <div className="border border-white/[0.07] rounded-xl p-4 space-y-3 bg-surface">
      <p className="text-[10px] font-title font-semibold tracking-widest uppercase text-text/35">
        Codes séparés par virgules ou espaces —{" "}
        <code className="font-mono text-lime/60 tracking-normal normal-case">FRA1, ARG17, FWC4</code>
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        placeholder="FRA1, FRA2, BRA17..."
        className="w-full bg-void border border-white/[0.07] focus:border-lime/35 rounded-lg px-3 py-2.5 text-text/80 text-sm font-mono focus:outline-none resize-none placeholder:text-text/18 transition-colors"
      />
      {result && (
        <div className="text-xs font-mono space-y-1">
          <p className="text-lime">{result.added} autocollant(s) ajouté(s)</p>
          {result.invalid.length > 0 && (
            <p className="text-red/70">Codes invalides : {result.invalid.join(", ")}</p>
          )}
        </div>
      )}
      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          disabled={isPending || !text.trim()}
          className="flex-1 bg-lime text-void font-title font-bold py-2.5 rounded-lg text-xs tracking-widest uppercase disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
        >
          {isPending ? "Ajout..." : "Ajouter"}
        </button>
        <button
          onClick={() => {
            setOpen(false);
            setResult(null);
          }}
          className="px-4 py-2.5 border border-white/[0.07] hover:border-white/15 rounded-lg text-xs text-text/35 transition-colors"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}
