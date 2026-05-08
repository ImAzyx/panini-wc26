# Panini WC26 Tracker — Design Spec

**Date:** 2026-05-08  
**Status:** Approved

---

## Overview

A mobile-first web app for a group of friends to track their Panini FIFA World Cup 2026 sticker collections (980 stickers), visualize progress, and automatically calculate possible trades between duplicates and missing stickers.

---

## Stack

| Concern | Choice |
|---|---|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Auth | NextAuth.js v5 (Auth.js) |
| Database | Neon PostgreSQL (serverless) |
| ORM | Prisma + `@prisma/adapter-neon` |
| Data layer | React Server Components + Server Actions |
| Realtime | Client-side polling (30s) on trade pages |
| PWA | `next-pwa` |
| Deployment | Vercel |
| UI language | French |

**No Supabase.** Auth, RLS, and realtime are all replaced: NextAuth handles sessions, Server Action guards replace RLS, polling replaces Supabase Realtime.

---

## Architecture

```
Next.js 14 (App Router) + TypeScript + Tailwind CSS
  │
  ├── Auth: NextAuth.js v5
  │     ├── Credentials provider (email + bcrypt password)
  │     └── Email provider (magic link via Resend)
  │
  ├── Database: Neon PostgreSQL (serverless)
  │     └── ORM: Prisma (schema + migrations)
  │
  ├── Data layer: Server Components + Server Actions
  │     └── No REST API layer (except NextAuth /api/auth callbacks)
  │
  ├── Realtime: 30s polling on /groups/[groupId]/trades
  │
  └── Deployment: Vercel + Neon (DATABASE_URL pooled connection)
```

---

## Database Schema

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String?
  username      String    @unique
  createdAt     DateTime  @default(now())

  accounts      Account[]
  sessions      Session[]
  collections   Collection[]
  groupMembers  GroupMember[]
  createdGroups Group[]       @relation("GroupCreator")
}

model Collection {
  id        String   @id @default(cuid())
  userId    String
  stickerId String
  quantity  Int      @default(1)
  updatedAt DateTime @updatedAt

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, stickerId])
  @@index([userId])
  @@index([stickerId])
  @@index([userId, quantity])
}

model Group {
  id          String        @id @default(cuid())
  name        String
  inviteCode  String        @unique
  createdById String
  createdAt   DateTime      @default(now())

  createdBy   User          @relation("GroupCreator", fields: [createdById], references: [id])
  members     GroupMember[]
}

model GroupMember {
  groupId  String
  userId   String
  joinedAt DateTime @default(now())

  group    Group    @relation(fields: [groupId], references: [id], onDelete: Cascade)
  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@id([groupId, userId])
}

// Standard NextAuth models: Account, Session, VerificationToken
```

**Access control (replacing Supabase RLS):**
- Every Server Action calls `auth()` and throws if no session
- Group reads verify current user is a `GroupMember` before returning other users' collections
- Group delete / member kick verify current user is `createdById`

---

## Routes

| Path | Description |
|---|---|
| `/` | Redirect: `/collection` if authed, `/auth/login` otherwise |
| `/auth/login` | Email+password form + magic link option |
| `/auth/register` | Username + email + password |
| `/collection` | Main page — sticker grid by team |
| `/groups` | List user's groups |
| `/groups/join` | Enter 6-char invite code |
| `/groups/[groupId]` | Group members + stats |
| `/groups/[groupId]/trades` | Trade engine (polls every 30s) |
| `/stats` | Personal + group dashboards |
| `/profile` | Edit username, view stats |

---

## Components

| Component | Purpose |
|---|---|
| `StickerCard` | Single sticker — shows state (missing/owned/duplicate), click cycles quantity, long-press opens exact-count modal |
| `StickerGrid` | Virtualized grid (react-window) grouped by team, 980 stickers |
| `BulkInput` | Textarea for bulk codes (`FRA1, BRA14`) → batch Server Action upsert |
| `TradeMatrix` | Cross-table of member pairs with trade counts; click a cell opens TradeDetail |
| `TradeDetail` | Two-column view: "je peux donner" / "tu peux me donner"; copy-to-clipboard export |
| `ProgressBar` | Animated `XXX/980` bar; also per-team mini bars on stats page |
| `GroupCard` | Group summary card with member avatars and progress |
| `Navbar` | Mobile-first bottom nav + desktop top nav |

---

## Sticker Data

- `data/stickers.ts` — static TypeScript constant, 980 entries
- Shape: `{ id: string, name: string, team: string, isFoil: boolean }`
- Populated by scraping the checklist URL once during development and committed to the repo; never stored in the DB (pure reference data, never changes at runtime)
- Sections: 9 intro (FWC1–FWC8 + `00`), 48 teams × 20 stickers, 11 FIFA Museum (FWC9–FWC19), 12 Coca-Cola (CC1–CC12)

---

## Trade Engine

**Query logic (Server Action, Prisma):**

"What can User A give User B":
```
A.collections WHERE quantity > 1
  AND stickerId NOT IN B.collections
```

"What can User B give User A":
```
B.collections WHERE quantity > 1
  AND stickerId NOT IN A.collections
```

Computed server-side per request. The trade page re-fetches every 30 seconds via `router.refresh()` called inside a `useEffect` / `setInterval` — this re-runs the Server Component and gets fresh Prisma data without a separate API route.

**Trade export format:**
```
🔄 Échange Panini WC26 — Lucas ↔ Maxime

Lucas peut donner à Maxime (12) :
FRA3 Theo Hernandez, FRA9 Tchouaméni...

Maxime peut donner à Lucas (8) :
ARG17 Messi, ESP15 Lamine Yamal...
```

---

## UI / UX

**Theme (dark, "stade de foot"):**
- Background: `#0D1F0D`
- Gold: `#C8A84E`
- Off-white: `#F5F5F0`
- FIFA blue: `#326295`

**Typography:**
- Titles: Anton (via `next/font/google`)
- Body: DM Sans (via `next/font/google`)

**Sticker states:**
- Missing: grey/transparent card
- Owned (×1): green card
- Duplicate (×2+): gold card with quantity badge

**Foil effect:** CSS shimmer animation (`@keyframes shimmer` + `background: linear-gradient`) on hover for `isFoil` stickers.

**Team completion:** `canvas-confetti` fires when a team reaches 20/20.

**Responsive grid:** `grid-cols-3 sm:grid-cols-5 lg:grid-cols-8`

**Touch targets:** min `44×44px`, tap increments, long-press opens modal.

---

## PWA

- `public/manifest.json` — standalone display, theme `#0D1F0D`
- `next-pwa` generates service worker
- Offline: last-known collection cached in `localStorage`; writes queue locally and sync on `online` event

---

## Environment Variables

```
DATABASE_URL=          # Neon pooled connection string
NEXTAUTH_SECRET=       # random secret
NEXTAUTH_URL=          # e.g. https://panini-wc26.vercel.app
RESEND_API_KEY=        # for magic link emails
EMAIL_FROM=            # sender address
```

---

## Out of Scope

- Push notifications (badge on trade page is sufficient)
- Native mobile app
- Admin panel
