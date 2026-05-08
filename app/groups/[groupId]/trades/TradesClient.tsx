"use client";
import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { TradePair } from "@/types";
import TradeMatrix from "@/components/TradeMatrix";

interface Props {
  initialPairs: TradePair[];
}

export default function TradesClient({ initialPairs }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  useEffect(() => {
    const id = setInterval(() => {
      startTransition(() => router.refresh());
    }, 30_000);
    return () => clearInterval(id);
  }, [router]);

  return (
    <main className="max-w-xl mx-auto px-4 py-5">
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-title font-bold text-2xl  text-text uppercase">
          Échanges
        </h1>
        <span className="text-[9px] font-mono text-text/22 border border-white/[0.06] rounded-full px-2.5 py-1 ">
          refresh ~30s
        </span>
      </div>
      <TradeMatrix pairs={initialPairs} />
    </main>
  );
}
