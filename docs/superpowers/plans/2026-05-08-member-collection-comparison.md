# Member Collection & Trade Comparison Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow group members to view each other's sticker collections (read-only) and compare collections for trades, with a redesigned trades page.

**Architecture:** Three new/redesigned pages reuse existing server actions (`getGroupWithMembers`, `getUserCollectionById`, `getTradeMatrix`) with zero backend changes. `StickerGrid` gains an optional `readOnly` prop. Trade comparison is computed client-side by filtering `TradePair[]` for the relevant user pair.

**Tech Stack:** Next.js 16 App Router (server components + server actions), React 19, Tailwind CSS 4, TypeScript.

---

## File Map

**Modified:**
- `components/StickerGrid.tsx` — add `readOnly?: boolean` prop
- `app/groups/[groupId]/page.tsx` — member names become `<Link>`
- `app/groups/[groupId]/trades/page.tsx` — also fetch session + group for currentUserId and memberStats
- `app/groups/[groupId]/trades/TradesClient.tsx` — full redesign using MemberTradeCard

**Created:**
- `components/MemberTradeCard.tsx` — card for one member in the trades page
- `app/groups/[groupId]/members/[memberId]/page.tsx` — member collection (read-only)
- `components/CompareTeamSection.tsx` — team section in compare view (includes CompareStickerCell)
- `components/CompareClient.tsx` — client component for compare page
- `app/groups/[groupId]/compare/[memberId]/page.tsx` — compare page server component

---

## Task 1: StickerGrid — readOnly mode

**Files:**
- Modify: `components/StickerGrid.tsx`

- [ ] **Step 1: Add readOnly to the props interface, guard localStorage, pass noops as handlers**

Open `components/StickerGrid.tsx`. Make three changes:

Change the props interface (line 16–18):
```typescript
interface StickerGridProps {
  initialCollection: CollectionEntry[];
  readOnly?: boolean;
}
```

Change the function signature (line 20):
```typescript
export default function StickerGrid({ initialCollection, readOnly = false }: StickerGridProps) {
```

Change the localStorage useEffect (lines 33–38):
```typescript
useEffect(() => {
  if (readOnly) return;
  localStorage.setItem(
    "collection",
    JSON.stringify([...collection.entries()]),
  );
}, [collection, readOnly]);
```

Change the two `StickerCard` usages in the grid (lines 144–151):
```tsx
<StickerCard
  key={s.id}
  sticker={s}
  quantity={getQty(s.id)}
  onTap={readOnly ? () => {} : () => handleTap(s)}
  onLongPress={readOnly ? () => {} : () => setModal({ sticker: s, quantity: getQty(s.id) })}
/>
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/StickerGrid.tsx
git commit -m "feat: add readOnly prop to StickerGrid"
```

---

## Task 2: Group page — clickable member names

**Files:**
- Modify: `app/groups/[groupId]/page.tsx`

- [ ] **Step 1: Wrap member username in a Link**

`Link` is already imported in this file. Replace the username `<span>` (line 57–59) with a `<Link>`:

```tsx
{group.memberStats.map((m) => (
  <div
    key={m.userId}
    className="border border-white/[0.07] rounded-xl p-4 bg-surface"
  >
    <div className="flex justify-between items-center mb-2.5">
      <Link
        href={`/groups/${group.id}/members/${m.userId}`}
        className="font-title font-bold text-sm text-text hover:text-lime transition-colors"
      >
        {m.username}
      </Link>
      <span className="font-mono text-[10px] text-text/32">
        {m.collectionCount}
        <span className="text-text/18">/{STICKERS.length}</span>
      </span>
    </div>
    <ProgressBar
      current={m.collectionCount}
      total={STICKERS.length}
      size="sm"
    />
  </div>
))}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add "app/groups/[groupId]/page.tsx"
git commit -m "feat: make member names clickable in group page"
```

---

## Task 3: Member collection page

**Files:**
- Create: `app/groups/[groupId]/members/[memberId]/page.tsx`

- [ ] **Step 1: Create the page file**

```tsx
import { getGroupWithMembers } from "@/lib/actions/groups";
import { getUserCollectionById } from "@/lib/actions/collection";
import StickerGrid from "@/components/StickerGrid";
import ProgressBar from "@/components/ProgressBar";
import Link from "next/link";
import { notFound } from "next/navigation";
import { STICKERS } from "@/data/stickers";

export default async function MemberCollectionPage({
  params,
}: {
  params: Promise<{ groupId: string; memberId: string }>;
}) {
  const { groupId, memberId } = await params;

  const [group, collection] = await Promise.all([
    getGroupWithMembers(groupId),
    getUserCollectionById(memberId),
  ]);

  const member = group.memberStats.find((m) => m.userId === memberId);
  if (!member) notFound();

  return (
    <main className="max-w-xl mx-auto px-4 py-5">
      <div className="mb-6">
        <p className="text-[9px] font-title font-semibold uppercase text-text/30 mb-0.5">
          <Link
            href={`/groups/${groupId}`}
            className="hover:text-text/60 transition-colors"
          >
            {group.name}
          </Link>
          {" / "}
          {member.username}
        </p>
        <div className="flex justify-between items-end">
          <h1 className="font-title font-bold text-xl text-text">
            {member.username}
          </h1>
          <span className="font-mono text-[10px] text-text/32">
            {member.collectionCount}
            <span className="text-text/18">/{STICKERS.length}</span>
          </span>
        </div>
        <div className="mt-2.5">
          <ProgressBar
            current={member.collectionCount}
            total={STICKERS.length}
            size="sm"
          />
        </div>
      </div>

      <Link
        href={`/groups/${groupId}/compare/${memberId}`}
        className="flex items-center justify-between w-full bg-sky-400/8 border border-sky-400/20 hover:bg-sky-400/12 hover:border-sky-400/35 text-sky-400 font-title font-bold py-3.5 rounded-xl mb-6 px-5 transition-all text-sm uppercase"
      >
        <span>Comparer avec ma collection</span>
        <span className="text-sky-400/50">→</span>
      </Link>

      <StickerGrid initialCollection={collection} readOnly />
    </main>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Test manually**

```bash
npm run dev
```

Navigate to `/groups/[groupId]`, click a member name — should open their collection in read-only mode (tapping stickers does nothing, no modal on long-press).

- [ ] **Step 4: Commit**

```bash
git add "app/groups/[groupId]/members/[memberId]/page.tsx"
git commit -m "feat: add member collection page (read-only)"
```

---

## Task 4: MemberTradeCard component

**Files:**
- Create: `components/MemberTradeCard.tsx`

- [ ] **Step 1: Create the component**

```tsx
import Link from "next/link";
import type { Sticker } from "@/types";

interface MemberTradeCardProps {
  memberId: string;
  memberName: string;
  collectionCount: number;
  totalStickers: number;
  myGive: Sticker[];
  myReceive: Sticker[];
  groupId: string;
}

export default function MemberTradeCard({
  memberId,
  memberName,
  collectionCount,
  totalStickers,
  myGive,
  myReceive,
  groupId,
}: MemberTradeCardProps) {
  const hasExchanges = myGive.length + myReceive.length > 0;

  const teamCounts = new Map<string, number>();
  [...myGive, ...myReceive].forEach((s) => {
    teamCounts.set(s.team, (teamCounts.get(s.team) ?? 0) + 1);
  });
  const topTeams = [...teamCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);
  const extraTeams = teamCounts.size - topTeams.length;

  return (
    <div
      className={`border border-white/[0.07] bg-surface rounded-xl p-4 space-y-3 transition-opacity ${
        hasExchanges ? "opacity-100" : "opacity-35"
      }`}
    >
      <div className="flex justify-between items-center">
        <Link
          href={`/groups/${groupId}/members/${memberId}`}
          className="font-title font-bold text-sm text-text hover:text-lime transition-colors"
        >
          {memberName}
        </Link>
        <span className="font-mono text-[10px] text-text/32">
          {collectionCount}
          <span className="text-text/18">/{totalStickers}</span>
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-lime/5 border border-lime/15 rounded-lg p-2.5 text-center">
          <p className="font-mono text-2xl font-bold text-lime leading-none">
            {myGive.length}
          </p>
          <p className="text-[9px] font-title uppercase text-text/35 mt-1">
            Tu peux donner
          </p>
        </div>
        <div className="bg-sky-400/5 border border-sky-400/15 rounded-lg p-2.5 text-center">
          <p className="font-mono text-2xl font-bold text-sky-400 leading-none">
            {myReceive.length}
          </p>
          <p className="text-[9px] font-title uppercase text-text/35 mt-1">
            Tu peux recevoir
          </p>
        </div>
      </div>

      {topTeams.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {topTeams.map(([team, count]) => (
            <span
              key={team}
              className="text-[9px] font-mono bg-white/[0.04] border border-white/[0.08] px-2 py-0.5 rounded-full text-text/40"
            >
              {team.slice(0, 3).toUpperCase()} ×{count}
            </span>
          ))}
          {extraTeams > 0 && (
            <span className="text-[9px] font-mono text-text/25 px-1 py-0.5">
              +{extraTeams}
            </span>
          )}
        </div>
      )}

      {hasExchanges && (
        <Link
          href={`/groups/${groupId}/compare/${memberId}`}
          className="flex items-center justify-between w-full bg-white/[0.03] border border-white/[0.08] hover:border-lime/20 hover:bg-lime/5 text-text/50 hover:text-lime font-title font-bold py-2.5 rounded-lg px-3 transition-all text-[11px] uppercase"
        >
          <span>Voir le comparatif</span>
          <span>→</span>
        </Link>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/MemberTradeCard.tsx
git commit -m "feat: add MemberTradeCard component"
```

---

## Task 5: Redesign trades page

**Files:**
- Modify: `app/groups/[groupId]/trades/page.tsx`
- Modify: `app/groups/[groupId]/trades/TradesClient.tsx`

- [ ] **Step 1: Replace TradesPage to also fetch session and group**

Replace `app/groups/[groupId]/trades/page.tsx` entirely:

```tsx
import { getTradeMatrix } from "@/lib/actions/trades";
import { getGroupWithMembers } from "@/lib/actions/groups";
import { auth } from "@/lib/auth";
import TradesClient from "./TradesClient";

export default async function TradesPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;
  const session = await auth();
  const currentUserId = session!.user!.id!;

  const [pairs, group] = await Promise.all([
    getTradeMatrix(groupId),
    getGroupWithMembers(groupId),
  ]);

  return (
    <TradesClient
      pairs={pairs}
      currentUserId={currentUserId}
      memberStats={group.memberStats}
      groupId={groupId}
      groupName={group.name}
    />
  );
}
```

- [ ] **Step 2: Replace TradesClient with the redesigned version**

Replace `app/groups/[groupId]/trades/TradesClient.tsx` entirely:

```tsx
"use client";
import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { TradePair } from "@/types";
import MemberTradeCard from "@/components/MemberTradeCard";
import { STICKERS } from "@/data/stickers";

interface MemberStat {
  userId: string;
  username: string;
  collectionCount: number;
}

interface Props {
  pairs: TradePair[];
  currentUserId: string;
  memberStats: MemberStat[];
  groupId: string;
  groupName: string;
}

export default function TradesClient({
  pairs,
  currentUserId,
  memberStats,
  groupId,
  groupName,
}: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  useEffect(() => {
    const id = setInterval(() => {
      startTransition(() => router.refresh());
    }, 30_000);
    return () => clearInterval(id);
  }, [router]);

  const otherMembers = memberStats.filter((m) => m.userId !== currentUserId);

  const memberCards = otherMembers
    .map((m) => {
      const pair = pairs.find(
        (p) =>
          (p.userAId === currentUserId && p.userBId === m.userId) ||
          (p.userBId === currentUserId && p.userAId === m.userId),
      );
      const myGive = !pair
        ? []
        : pair.userAId === currentUserId
          ? pair.canGive
          : pair.canReceive;
      const myReceive = !pair
        ? []
        : pair.userAId === currentUserId
          ? pair.canReceive
          : pair.canGive;
      return { member: m, myGive, myReceive };
    })
    .sort(
      (a, b) =>
        b.myGive.length +
        b.myReceive.length -
        (a.myGive.length + a.myReceive.length),
    );

  const totalExchanges = memberCards.reduce(
    (sum, c) => sum + c.myGive.length + c.myReceive.length,
    0,
  );

  return (
    <main className="max-w-xl mx-auto px-4 py-5">
      <div className="mb-6">
        <p className="text-[9px] font-title font-semibold uppercase text-text/30 mb-0.5">
          <Link
            href={`/groups/${groupId}`}
            className="hover:text-text/60 transition-colors"
          >
            {groupName}
          </Link>
        </p>
        <div className="flex justify-between items-end">
          <h1 className="font-title font-bold text-2xl text-text uppercase">
            Échanges possibles
          </h1>
          <span className="text-[9px] font-mono text-text/22 border border-white/[0.06] rounded-full px-2.5 py-1">
            {totalExchanges} échange{totalExchanges !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {otherMembers.length === 0 ? (
        <div className="text-center py-16">
          <p className="font-title uppercase text-text/25 text-sm">
            Pas encore assez de membres
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {memberCards.map(({ member, myGive, myReceive }) => (
            <MemberTradeCard
              key={member.userId}
              memberId={member.userId}
              memberName={member.username}
              collectionCount={member.collectionCount}
              totalStickers={STICKERS.length}
              myGive={myGive}
              myReceive={myReceive}
              groupId={groupId}
            />
          ))}
        </div>
      )}
    </main>
  );
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 4: Test manually**

Navigate to `/groups/[groupId]/trades` — should see member cards with give/receive counters, sorted by exchange total, with team badges and faded cards for members with 0 exchanges.

- [ ] **Step 5: Commit**

```bash
git add "app/groups/[groupId]/trades/page.tsx" "app/groups/[groupId]/trades/TradesClient.tsx"
git commit -m "feat: redesign trades page with per-member cards"
```

---

## Task 6: CompareTeamSection component

**Files:**
- Create: `components/CompareTeamSection.tsx`

- [ ] **Step 1: Create the component (includes CompareStickerCell as a local function)**

```tsx
import type { Sticker } from "@/types";
import { STICKERS_BY_TEAM } from "@/data/stickers";

interface CompareStickerCellProps {
  sticker: Sticker;
  canGive: boolean;
  canReceive: boolean;
}

function CompareStickerCell({
  sticker,
  canGive,
  canReceive,
}: CompareStickerCellProps) {
  if (canGive) {
    return (
      <div className="relative rounded-lg flex items-center justify-center min-h-[52px] p-1.5 bg-lime/10 border border-lime/50">
        <span className="text-[11px] font-mono font-bold leading-tight text-lime text-center">
          {sticker.id}
        </span>
        <span className="absolute -top-1.5 -right-1.5 bg-lime text-void text-[8px] font-mono font-bold rounded-full w-[16px] h-[16px] flex items-center justify-center leading-none">
          →
        </span>
      </div>
    );
  }

  if (canReceive) {
    return (
      <div className="relative rounded-lg flex items-center justify-center min-h-[52px] p-1.5 bg-sky-400/10 border border-sky-400/50">
        <span className="text-[11px] font-mono font-bold leading-tight text-sky-400 text-center">
          {sticker.id}
        </span>
        <span className="absolute -top-1.5 -right-1.5 bg-sky-400 text-void text-[8px] font-mono font-bold rounded-full w-[16px] h-[16px] flex items-center justify-center leading-none">
          ←
        </span>
      </div>
    );
  }

  return (
    <div className="relative rounded-lg flex items-center justify-center min-h-[52px] p-1.5 border border-white/[0.06] opacity-25">
      <span className="text-[11px] font-mono text-white/40 font-bold leading-tight text-center">
        {sticker.id}
      </span>
    </div>
  );
}

interface CompareTeamSectionProps {
  team: string;
  canGiveIds: Set<string>;
  canReceiveIds: Set<string>;
}

export default function CompareTeamSection({
  team,
  canGiveIds,
  canReceiveIds,
}: CompareTeamSectionProps) {
  const stickers = STICKERS_BY_TEAM[team] ?? [];
  const exchangeCount = stickers.filter(
    (s) => canGiveIds.has(s.id) || canReceiveIds.has(s.id),
  ).length;

  return (
    <section>
      <div className="flex items-center gap-2.5 mb-2.5">
        <div className="w-0.5 h-5 rounded-full shrink-0 bg-white/15" />
        <h2 className="font-title font-bold text-xs text-text/60 uppercase flex-1">
          {team}
        </h2>
        {exchangeCount > 0 && (
          <span className="font-mono text-[10px] text-text/35">
            {exchangeCount} échange{exchangeCount > 1 ? "s" : ""}
          </span>
        )}
      </div>
      <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-5 gap-1.5">
        {stickers.map((s) => (
          <CompareStickerCell
            key={s.id}
            sticker={s}
            canGive={canGiveIds.has(s.id)}
            canReceive={canReceiveIds.has(s.id)}
          />
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/CompareTeamSection.tsx
git commit -m "feat: add CompareTeamSection with color-coded sticker cells"
```

---

## Task 7: CompareClient component

**Files:**
- Create: `components/CompareClient.tsx`

- [ ] **Step 1: Create the component**

```tsx
"use client";
import { useState } from "react";
import Link from "next/link";
import type { Sticker } from "@/types";
import { TEAM_ORDER } from "@/data/stickers";
import CompareTeamSection from "./CompareTeamSection";

interface Props {
  memberName: string;
  memberId: string;
  groupId: string;
  groupName: string;
  myGive: Sticker[];
  myReceive: Sticker[];
}

export default function CompareClient({
  memberName,
  memberId,
  groupId,
  groupName,
  myGive,
  myReceive,
}: Props) {
  const [showAll, setShowAll] = useState(false);

  const canGiveIds = new Set(myGive.map((s) => s.id));
  const canReceiveIds = new Set(myReceive.map((s) => s.id));

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
      <Link
        href={`/groups/${groupId}`}
        className="hover:text-text/60 transition-colors"
      >
        {groupName}
      </Link>
      {" / "}
      <Link
        href={`/groups/${groupId}/trades`}
        className="hover:text-text/60 transition-colors"
      >
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
    <main className="max-w-xl mx-auto px-4 py-5">
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

      <div className="space-y-8">
        {teamsToShow.map((team) => (
          <CompareTeamSection
            key={team}
            team={team}
            canGiveIds={canGiveIds}
            canReceiveIds={canReceiveIds}
          />
        ))}
      </div>

      {!showAll && teamsWithExchanges.size < TEAM_ORDER.length && (
        <button
          onClick={() => setShowAll(true)}
          className="mt-8 w-full text-[10px] font-title font-semibold uppercase text-text/25 hover:text-text/50 transition-colors py-3"
        >
          Voir toutes les équipes
        </button>
      )}
    </main>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/CompareClient.tsx
git commit -m "feat: add CompareClient with team sections and showAll toggle"
```

---

## Task 8: Compare page server component

**Files:**
- Create: `app/groups/[groupId]/compare/[memberId]/page.tsx`

- [ ] **Step 1: Create the page**

```tsx
import { getTradeMatrix } from "@/lib/actions/trades";
import { getGroupWithMembers } from "@/lib/actions/groups";
import { auth } from "@/lib/auth";
import CompareClient from "@/components/CompareClient";
import { notFound } from "next/navigation";

export default async function ComparePage({
  params,
}: {
  params: Promise<{ groupId: string; memberId: string }>;
}) {
  const { groupId, memberId } = await params;

  const session = await auth();
  const currentUserId = session!.user!.id!;

  const [pairs, group] = await Promise.all([
    getTradeMatrix(groupId),
    getGroupWithMembers(groupId),
  ]);

  const member = group.memberStats.find((m) => m.userId === memberId);
  if (!member) notFound();

  const pair = pairs.find(
    (p) =>
      (p.userAId === currentUserId && p.userBId === memberId) ||
      (p.userBId === currentUserId && p.userAId === memberId),
  );

  const myGive = !pair
    ? []
    : pair.userAId === currentUserId
      ? pair.canGive
      : pair.canReceive;
  const myReceive = !pair
    ? []
    : pair.userAId === currentUserId
      ? pair.canReceive
      : pair.canGive;

  return (
    <CompareClient
      memberName={member.username}
      memberId={memberId}
      groupId={groupId}
      groupName={group.name}
      myGive={myGive}
      myReceive={myReceive}
    />
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Test the complete flow**

```bash
npm run dev
```

Test in order:
1. `/groups/[groupId]` — member names are clickable links
2. Click a member → member collection page loads (read-only, tapping stickers does nothing)
3. Click "Comparer avec ma collection" → compare page opens
4. Green cells = stickers you can give (→ badge), blue cells = stickers you can receive (← badge), grey cells = no exchange (faded)
5. Click "Voir toutes les équipes" — all teams appear, non-exchange stickers greyed out
6. `/groups/[groupId]/trades` → card-based layout, give/receive counters, team badges, sorted by total
7. Members with 0 exchanges show faded cards
8. "Voir le comparatif" on a card → compare page

- [ ] **Step 4: Commit**

```bash
git add "app/groups/[groupId]/compare/[memberId]/page.tsx"
git commit -m "feat: add compare page for member-to-member trade view"
```
