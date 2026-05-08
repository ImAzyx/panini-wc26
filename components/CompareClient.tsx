"use client";
import { useState } from "react";
import Link from "next/link";
import type { Sticker, CollectionEntry } from "@/types";
import { TEAM_ORDER } from "@/data/stickers";
import CompareTeamSection from "./CompareTeamSection";
import CompareGridPanel from "./CompareGridPanel";

interface Props {
  memberName: string;
  memberId: string;
  groupId: string;
  groupName: string;
  myGive: Sticker[];
  myReceive: Sticker[];
  myCollection: CollectionEntry[];
  memberCollection: CollectionEntry[];
}

export default function CompareClient({
  memberName,
  memberId,
  groupId,
  groupName,
  myGive,
  myReceive,
  myCollection,
  memberCollection,
}: Props) {
  const [showAll, setShowAll] = useState(false);

  const canGiveIds = new Set(myGive.map((s) => s.id));
  const canReceiveIds = new Set(myReceive.map((s) => s.id));

  const myCollectionMap = new Map(myCollection.map((e) => [e.stickerId, e.quantity]));
  const memberCollectionMap = new Map(memberCollection.map((e) => [e.stickerId, e.quantity]));

  const teamsWithExchanges = new Set([
    ...myGive.map((s) => s.team),
    ...myReceive.map((s) => s.team),
  ]);

  const getTeamExchangeCount = (team: string) =>
    myGive.filter((s) => s.team === team).length +
    myReceive.filter((s) => s.team === team).length;

  const teamsToShow = showAll
    ? [...TEAM_ORDER].sort(
        (a, b) => getTeamExchangeCount(b) - getTeamExchangeCount(a),
      )
    : [...teamsWithExchanges].sort(
        (a, b) => getTeamExchangeCount(b) - getTeamExchangeCount(a),
      );

  const breadcrumb = (
    <p className="text-[9px] font-title font-semibold uppercase text-text/30 mb-0.5">
      <Link href={`/groups/${groupId}`} className="hover:text-text/60 transition-colors">
        {groupName}
      </Link>
      {" / "}
      <Link href={`/groups/${groupId}/trades`} className="hover:text-text/60 transition-colors">
        Échanges
      </Link>
      {" / "}
      {memberName}
    </p>
  );

  if (myGive.length === 0 && myReceive.length === 0) {
    return (
      <main className="max-w-xl mx-auto px-4 py-5">
        <div className="mb-6">
          {breadcrumb}
          <h1 className="font-title font-bold text-xl text-text">
            Toi vs {memberName}
          </h1>
        </div>
        <div className="text-center py-16 space-y-3">
          <p className="font-title uppercase text-text/25 text-sm">
            Aucun échange possible pour l&apos;instant
          </p>
          <Link
            href={`/groups/${groupId}/trades`}
            className="block text-[10px] font-mono text-text/35 hover:text-text/60 transition-colors"
          >
            ← Retour aux échanges
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-xl md:max-w-6xl mx-auto px-4 md:px-6 py-5">
      <div className="mb-6">
        {breadcrumb}
        <h1 className="font-title font-bold text-xl text-text">
          Toi vs {memberName}
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-8">
        <div className="bg-lime/5 border border-lime/15 rounded-xl p-4 text-center">
          <p className="font-mono text-3xl font-bold text-lime leading-none">
            {myGive.length}
          </p>
          <p className="text-[9px] font-title uppercase text-text/35 mt-2">
            Tu peux donner
          </p>
        </div>
        <div className="bg-sky-400/5 border border-sky-400/15 rounded-xl p-4 text-center">
          <p className="font-mono text-3xl font-bold text-sky-400 leading-none">
            {myReceive.length}
          </p>
          <p className="text-[9px] font-title uppercase text-text/35 mt-2">
            Tu peux recevoir
          </p>
        </div>
      </div>

      {/* Mobile — vue actuelle */}
      <div className="md:hidden space-y-8">
        {teamsToShow.map((team) => (
          <CompareTeamSection
            key={team}
            team={team}
            canGiveIds={canGiveIds}
            canReceiveIds={canReceiveIds}
          />
        ))}
        {!showAll && teamsWithExchanges.size < TEAM_ORDER.length && (
          <button
            onClick={() => setShowAll(true)}
            className="mt-2 w-full text-[10px] font-title font-semibold uppercase text-text/25 hover:text-text/50 transition-colors py-3"
          >
            Voir toutes les équipes
          </button>
        )}
      </div>

      {/* Desktop — côte à côte */}
      <div className="hidden md:block">
        <div className="grid grid-cols-2 gap-6 mb-4">
          <p className="text-[9px] font-title font-semibold uppercase text-sky-400/60">
            Ma collection
            <span className="text-text/25 ml-2">cases bleues = à recevoir</span>
          </p>
          <p className="text-[9px] font-title font-semibold uppercase text-lime/60">
            {memberName}
            <span className="text-text/25 ml-2">cases vertes = à donner</span>
          </p>
        </div>

        <div className="space-y-8">
          {teamsToShow.map((team) => {
            const count = getTeamExchangeCount(team);
            return (
              <section key={team}>
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div className="w-0.5 h-5 rounded-full shrink-0 bg-white/15" />
                  <h2 className="font-title font-bold text-xs text-text/60 uppercase flex-1">
                    {team}
                  </h2>
                  {count > 0 && (
                    <span className="font-mono text-[10px] text-text/35">
                      {count} échange{count > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <CompareGridPanel
                    team={team}
                    collectionMap={myCollectionMap}
                    highlightIds={canReceiveIds}
                    highlightColor="sky"
                  />
                  <CompareGridPanel
                    team={team}
                    collectionMap={memberCollectionMap}
                    highlightIds={canGiveIds}
                    highlightColor="lime"
                  />
                </div>
              </section>
            );
          })}
        </div>

        {!showAll && teamsWithExchanges.size < TEAM_ORDER.length && (
          <button
            onClick={() => setShowAll(true)}
            className="mt-8 w-full text-[10px] font-title font-semibold uppercase text-text/25 hover:text-text/50 transition-colors py-3"
          >
            Voir toutes les équipes
          </button>
        )}
      </div>
    </main>
  );
}
