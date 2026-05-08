# Panini WC26 Tracker — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile-first Next.js 14 web app for friends to track Panini FIFA WC 2026 sticker collections, visualize progress, and auto-calculate trades.

**Architecture:** Next.js 14 App Router with TypeScript and Tailwind CSS. Auth via NextAuth v5 (credentials + magic link). Data via Neon PostgreSQL + Prisma ORM using Server Components and Server Actions exclusively — no separate REST API. Realtime via 30s client-side polling on trade pages.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, NextAuth v5, Neon PostgreSQL, Prisma, react-window, canvas-confetti, next-pwa, Resend (magic link email)

---

## File Map

```
panini-wc26/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx          # Login form (credentials + magic link)
│   │   └── register/page.tsx       # Register form
│   ├── collection/page.tsx         # Main sticker grid page
│   ├── groups/
│   │   ├── page.tsx                # List user's groups
│   │   ├── join/page.tsx           # Join via invite code
│   │   └── [groupId]/
│   │       ├── page.tsx            # Group members + stats
│   │       └── trades/page.tsx     # Trade engine (polls 30s)
│   ├── stats/page.tsx              # Personal + group dashboards
│   ├── profile/page.tsx            # Edit username
│   ├── api/auth/[...nextauth]/route.ts
│   ├── layout.tsx                  # Root layout (fonts, Navbar, theme)
│   └── page.tsx                    # Redirect: /collection or /auth/login
├── components/
│   ├── StickerCard.tsx             # Single sticker card (missing/owned/duplicate + foil)
│   ├── StickerGrid.tsx             # Virtualized grid (react-window), grouped by team
│   ├── BulkInput.tsx               # Textarea for bulk codes → batch upsert
│   ├── TradeMatrix.tsx             # Cross-table of member pairs with trade counts
│   ├── TradeDetail.tsx             # Two-column "je peux donner" / "tu peux me donner"
│   ├── ProgressBar.tsx             # Animated XXX/980 bar
│   ├── GroupCard.tsx               # Group summary card
│   └── Navbar.tsx                  # Mobile bottom nav + desktop top nav
├── lib/
│   ├── auth.ts                     # NextAuth config
│   ├── db.ts                       # Prisma client singleton
│   └── actions/
│       ├── collection.ts           # upsertSticker, getCollection, bulkUpsert
│       ├── groups.ts               # createGroup, joinGroup, getGroup, getMembers
│       └── trades.ts               # getTradesForPair, getTradeMatrix
├── data/
│   └── stickers.ts                 # Static array of 980 stickers (id, name, team, isFoil)
├── prisma/
│   └── schema.prisma
├── public/
│   ├── manifest.json
│   └── icons/                      # PWA icons
├── types/
│   └── index.ts                    # Shared TypeScript types
└── tailwind.config.ts
```

---

## Task 1: Project Scaffold

**Files:**
- Create: `panini-wc26/` (Next.js project root, all config files)
- Modify: `tailwind.config.ts` — add custom theme colors and fonts
- Modify: `app/layout.tsx` — add Anton + DM Sans fonts, dark theme wrapper

- [ ] **Step 1: Create Next.js project**

```bash
cd C:\Users\lulub\panini26
npx create-next-app@latest panini-wc26 --typescript --tailwind --eslint --app --src-dir=no --import-alias="@/*"
cd panini-wc26
```

Expected: project created, `npm run dev` starts on port 3000.

- [ ] **Step 2: Install dependencies**

```bash
npm install @prisma/client @auth/prisma-adapter next-auth@beta prisma \
  @neondatabase/serverless @prisma/adapter-neon \
  react-window @types/react-window \
  canvas-confetti @types/canvas-confetti \
  bcryptjs @types/bcryptjs \
  resend \
  next-pwa
```

- [ ] **Step 3: Configure Tailwind with custom theme**

Replace `tailwind.config.ts` with:

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        pitch: "#0D1F0D",
        gold: "#C8A84E",
        "off-white": "#F5F5F0",
        "fifa-blue": "#326295",
      },
      fontFamily: {
        title: ["var(--font-anton)"],
        body: ["var(--font-dm-sans)"],
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 4: Update root layout with fonts and theme**

Replace `app/layout.tsx` with:

```tsx
import type { Metadata } from "next";
import { Anton, DM_Sans } from "next/font/google";
import "./globals.css";

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: "Panini WC26",
  description: "Suivez votre collection Panini FIFA WC 2026",
  manifest: "/manifest.json",
  themeColor: "#0D1F0D",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${anton.variable} ${dmSans.variable}`}>
      <body className="bg-pitch text-off-white font-body min-h-screen">
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 5: Update global CSS**

Replace `app/globals.css` with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * {
    -webkit-tap-highlight-color: transparent;
  }
  body {
    @apply bg-pitch text-off-white;
  }
}

@keyframes shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}

.foil-shimmer {
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(200, 168, 78, 0.6) 50%,
    transparent 100%
  );
  background-size: 200% auto;
  animation: shimmer 2s linear infinite;
}
```

- [ ] **Step 6: Create `.env.local`**

```bash
cat > .env.local << 'EOF'
DATABASE_URL=""
NEXTAUTH_SECRET=""
NEXTAUTH_URL="http://localhost:3000"
RESEND_API_KEY=""
EMAIL_FROM="noreply@panini-wc26.app"
EOF
```

- [ ] **Step 7: Commit**

```bash
git init
git add .
git commit -m "feat: scaffold Next.js 14 project with Tailwind theme and fonts"
```

---

## Task 2: Shared Types

**Files:**
- Create: `types/index.ts`

- [ ] **Step 1: Create shared types**

```ts
// types/index.ts
export type StickerState = "missing" | "owned" | "duplicate";

export interface Sticker {
  id: string;       // e.g. "FRA1", "ARG17", "FWC1"
  name: string;     // e.g. "Kylian Mbappé"
  team: string;     // e.g. "France", "Intro", "FIFA Museum", "Coca-Cola"
  isFoil: boolean;
}

export interface CollectionEntry {
  stickerId: string;
  quantity: number;
}

export interface TradePair {
  userAId: string;
  userAName: string;
  userBId: string;
  userBName: string;
  canGive: Sticker[];   // A can give to B
  canReceive: Sticker[]; // B can give to A
}

export interface GroupWithMembers {
  id: string;
  name: string;
  inviteCode: string;
  createdById: string;
  members: {
    userId: string;
    username: string;
    collectionCount: number;
  }[];
}
```

- [ ] **Step 2: Commit**

```bash
git add types/
git commit -m "feat: add shared TypeScript types"
```

---

## Task 3: Sticker Data

**Files:**
- Create: `data/stickers.ts`

- [ ] **Step 1: Create sticker data file**

This file is the single source of truth for all 980 stickers. It's static — never stored in the DB.

Create `data/stickers.ts`:

```ts
import type { Sticker } from "@/types";

// FIFA WC 2026 has 48 teams × 20 stickers = 960 team stickers
// + 9 intro (FWC1-FWC8 + "00") + 11 FIFA Museum (FWC9-FWC19) + 12 Coca-Cola (CC1-CC12) = 980 total

const TEAMS: { code: string; name: string }[] = [
  { code: "ARG", name: "Argentine" },
  { code: "AUS", name: "Australie" },
  { code: "AUT", name: "Autriche" },
  { code: "BEL", name: "Belgique" },
  { code: "BOL", name: "Bolivie" },
  { code: "BRA", name: "Brésil" },
  { code: "CAN", name: "Canada" },
  { code: "CHI", name: "Chili" },
  { code: "CMR", name: "Cameroun" },
  { code: "COD", name: "RD Congo" },
  { code: "COL", name: "Colombie" },
  { code: "CRC", name: "Costa Rica" },
  { code: "CRO", name: "Croatie" },
  { code: "CZE", name: "Rép. Tchèque" },
  { code: "DEN", name: "Danemark" },
  { code: "ECU", name: "Équateur" },
  { code: "EGY", name: "Égypte" },
  { code: "ENG", name: "Angleterre" },
  { code: "ESP", name: "Espagne" },
  { code: "FRA", name: "France" },
  { code: "GER", name: "Allemagne" },
  { code: "GHA", name: "Ghana" },
  { code: "GRE", name: "Grèce" },
  { code: "GUA", name: "Guatemala" },
  { code: "HON", name: "Honduras" },
  { code: "HUN", name: "Hongrie" },
  { code: "IRN", name: "Iran" },
  { code: "IRQ", name: "Irak" },
  { code: "ITA", name: "Italie" },
  { code: "JAM", name: "Jamaïque" },
  { code: "JPN", name: "Japon" },
  { code: "KOR", name: "Corée du Sud" },
  { code: "KSA", name: "Arabie Saoudite" },
  { code: "MAR", name: "Maroc" },
  { code: "MEX", name: "Mexique" },
  { code: "NED", name: "Pays-Bas" },
  { code: "NGA", name: "Nigéria" },
  { code: "NZL", name: "Nouvelle-Zélande" },
  { code: "PAR", name: "Paraguay" },
  { code: "PAN", name: "Panama" },
  { code: "POR", name: "Portugal" },
  { code: "QAT", name: "Qatar" },
  { code: "RSA", name: "Afrique du Sud" },
  { code: "SEN", name: "Sénégal" },
  { code: "SRB", name: "Serbie" },
  { code: "SUI", name: "Suisse" },
  { code: "URU", name: "Uruguay" },
  { code: "USA", name: "États-Unis" },
];

// Foil stickers: typically the team badge card (sticker #1 per team) and special cards
const FOIL_POSITIONS = new Set([1]); // position 1 per team is the team badge (foil)

function generateTeamStickers(): Sticker[] {
  const stickers: Sticker[] = [];
  for (const team of TEAMS) {
    for (let i = 1; i <= 20; i++) {
      stickers.push({
        id: `${team.code}${i}`,
        name: `${team.name} ${i}`,
        team: team.name,
        isFoil: FOIL_POSITIONS.has(i),
      });
    }
  }
  return stickers;
}

const INTRO_STICKERS: Sticker[] = [
  { id: "00", name: "Coupe du Monde FIFA", team: "Intro", isFoil: true },
  { id: "FWC1", name: "Bienvenue WC26 - USA", team: "Intro", isFoil: false },
  { id: "FWC2", name: "Bienvenue WC26 - Canada", team: "Intro", isFoil: false },
  { id: "FWC3", name: "Bienvenue WC26 - Mexique", team: "Intro", isFoil: false },
  { id: "FWC4", name: "Trophée FIFA", team: "Intro", isFoil: true },
  { id: "FWC5", name: "Stade AT&T", team: "Intro", isFoil: false },
  { id: "FWC6", name: "Stade BC Place", team: "Intro", isFoil: false },
  { id: "FWC7", name: "Stade Azteca", team: "Intro", isFoil: false },
  { id: "FWC8", name: "Mascotte WC26", team: "Intro", isFoil: true },
];

const FIFA_MUSEUM_STICKERS: Sticker[] = [
  { id: "FWC9", name: "Pelé", team: "FIFA Museum", isFoil: true },
  { id: "FWC10", name: "Diego Maradona", team: "FIFA Museum", isFoil: true },
  { id: "FWC11", name: "Zinedine Zidane", team: "FIFA Museum", isFoil: true },
  { id: "FWC12", name: "Ronaldo (R9)", team: "FIFA Museum", isFoil: true },
  { id: "FWC13", name: "Franz Beckenbauer", team: "FIFA Museum", isFoil: true },
  { id: "FWC14", name: "Johan Cruyff", team: "FIFA Museum", isFoil: true },
  { id: "FWC15", name: "Ronaldo (CR7)", team: "FIFA Museum", isFoil: true },
  { id: "FWC16", name: "Lionel Messi", team: "FIFA Museum", isFoil: true },
  { id: "FWC17", name: "Miroslav Klose", team: "FIFA Museum", isFoil: true },
  { id: "FWC18", name: "Just Fontaine", team: "FIFA Museum", isFoil: true },
  { id: "FWC19", name: "Lev Yachine", team: "FIFA Museum", isFoil: true },
];

const COCA_COLA_STICKERS: Sticker[] = Array.from({ length: 12 }, (_, i) => ({
  id: `CC${i + 1}`,
  name: `Coca-Cola ${i + 1}`,
  team: "Coca-Cola",
  isFoil: false,
}));

export const STICKERS: Sticker[] = [
  ...INTRO_STICKERS,
  ...generateTeamStickers(),
  ...FIFA_MUSEUM_STICKERS,
  ...COCA_COLA_STICKERS,
];

export const STICKER_MAP = new Map<string, Sticker>(
  STICKERS.map((s) => [s.id, s])
);

export const STICKERS_BY_TEAM = STICKERS.reduce<Record<string, Sticker[]>>(
  (acc, s) => {
    (acc[s.team] ??= []).push(s);
    return acc;
  },
  {}
);

export const TEAM_ORDER = [
  "Intro",
  ...TEAMS.map((t) => t.name),
  "FIFA Museum",
  "Coca-Cola",
];
```

- [ ] **Step 2: Verify sticker count**

```bash
node -e "const {STICKERS} = require('./data/stickers.ts'); console.log(STICKERS.length)"
```

Or add a quick assertion in `data/stickers.ts` at module level:

```ts
// At end of file — development sanity check
if (process.env.NODE_ENV === "development") {
  console.assert(STICKERS.length === 980, `Expected 980 stickers, got ${STICKERS.length}`);
}
```

- [ ] **Step 3: Commit**

```bash
git add data/
git commit -m "feat: add static sticker data for 980 WC26 stickers"
```

---

## Task 4: Prisma Schema + Database

**Files:**
- Create: `prisma/schema.prisma`
- Create: `lib/db.ts`

- [ ] **Step 1: Init Prisma**

```bash
npx prisma init --datasource-provider postgresql
```

- [ ] **Step 2: Write schema**

Replace `prisma/schema.prisma` with:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DATABASE_URL")
}

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
  createdGroups Group[]   @relation("GroupCreator")
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

// NextAuth required models
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime

  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

- [ ] **Step 3: Create Prisma client singleton**

Create `lib/db.ts`:

```ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ log: process.env.NODE_ENV === "development" ? ["query"] : [] });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

- [ ] **Step 4: Set DATABASE_URL in .env.local then push schema**

Add your Neon connection string to `.env.local`, then:

```bash
npx prisma db push
```

Expected output: `Your database is now in sync with your Prisma schema.`

- [ ] **Step 5: Commit**

```bash
git add prisma/ lib/db.ts
git commit -m "feat: add Prisma schema and db client"
```

---

## Task 5: NextAuth v5 Setup

**Files:**
- Create: `lib/auth.ts`
- Create: `app/api/auth/[...nextauth]/route.ts`
- Create: `middleware.ts`

- [ ] **Step 1: Create NextAuth config**

Create `lib/auth.ts`:

```ts
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Resend from "next-auth/providers/resend";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/login",
    newUser: "/collection",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });
        if (!user?.password) return null;
        const valid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );
        if (!valid) return null;
        return { id: user.id, email: user.email, name: user.username };
      },
    }),
    Resend({
      from: process.env.EMAIL_FROM!,
      apiKey: process.env.RESEND_API_KEY!,
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name;
      }
      return session;
    },
  },
});
```

- [ ] **Step 2: Create API route**

Create `app/api/auth/[...nextauth]/route.ts`:

```ts
import { handlers } from "@/lib/auth";
export const { GET, POST } = handlers;
```

- [ ] **Step 3: Create middleware for protected routes**

Create `middleware.ts` at the project root:

```ts
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthPage = req.nextUrl.pathname.startsWith("/auth");

  if (!isLoggedIn && !isAuthPage) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }
  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL("/collection", req.url));
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$|manifest\\.json|sw\\.js).*)"],
};
```

- [ ] **Step 4: Extend NextAuth session type**

Create `types/next-auth.d.ts`:

```ts
import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
    };
  }
}
```

- [ ] **Step 5: Commit**

```bash
git add lib/auth.ts app/api/ middleware.ts types/next-auth.d.ts
git commit -m "feat: add NextAuth v5 with credentials and magic link providers"
```

---

## Task 6: Auth UI (Login + Register)

**Files:**
- Create: `app/(auth)/login/page.tsx`
- Create: `app/(auth)/register/page.tsx`
- Create: `app/(auth)/layout.tsx`

- [ ] **Step 1: Auth layout**

Create `app/(auth)/layout.tsx`:

```tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <h1 className="font-title text-4xl text-gold mb-8 text-center ">
          PANINI WC26
        </h1>
        {children}
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Login page**

Create `app/(auth)/login/page.tsx`:

```tsx
"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [magicSent, setMagicSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      email,
      password,
      redirectTo: "/collection",
    });
    if (res?.error) setError("Email ou mot de passe incorrect");
    setLoading(false);
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await signIn("resend", { email, redirect: false });
    setMagicSent(true);
    setLoading(false);
  }

  if (magicSent) {
    return (
      <p className="text-center text-off-white">
        Lien envoyé à <strong>{email}</strong>. Vérifiez vos emails.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleCredentials} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-off-white focus:outline-none focus:border-gold"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-off-white focus:outline-none focus:border-gold"
          />
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gold text-pitch font-bold py-3 rounded-lg disabled:opacity-50"
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/20" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-pitch px-2 text-white/50">ou</span>
        </div>
      </div>

      <form onSubmit={handleMagicLink}>
        <button
          type="submit"
          disabled={loading || !email}
          className="w-full border border-gold text-gold font-bold py-3 rounded-lg disabled:opacity-50"
        >
          Lien magique par email
        </button>
      </form>

      <p className="text-center text-sm text-white/60">
        Pas de compte ?{" "}
        <Link href="/auth/register" className="text-gold">
          S&apos;inscrire
        </Link>
      </p>
    </div>
  );
}
```

- [ ] **Step 3: Register page with Server Action**

Create `app/(auth)/register/page.tsx`:

```tsx
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import Link from "next/link";

async function registerAction(formData: FormData) {
  "use server";
  const email = formData.get("email") as string;
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!email || !username || !password) return;

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });
  if (existing) {
    // In production handle this with useFormState; for now redirect with error
    redirect("/auth/register?error=exists");
  }

  const hash = await bcrypt.hash(password, 12);
  await prisma.user.create({ data: { email, username, password: hash } });
  redirect("/auth/login?registered=1");
}

export default function RegisterPage({
  searchParams,
}: {
  searchParams: { error?: string; registered?: string };
}) {
  return (
    <form action={registerAction} className="space-y-4">
      <div>
        <label className="block text-sm mb-1">Nom d&apos;utilisateur</label>
        <input
          name="username"
          required
          minLength={2}
          maxLength={20}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-off-white focus:outline-none focus:border-gold"
        />
      </div>
      <div>
        <label className="block text-sm mb-1">Email</label>
        <input
          name="email"
          type="email"
          required
          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-off-white focus:outline-none focus:border-gold"
        />
      </div>
      <div>
        <label className="block text-sm mb-1">Mot de passe</label>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-off-white focus:outline-none focus:border-gold"
        />
      </div>
      {searchParams.error === "exists" && (
        <p className="text-red-400 text-sm">Email ou pseudo déjà utilisé.</p>
      )}
      {searchParams.registered && (
        <p className="text-green-400 text-sm">Compte créé ! Connectez-vous.</p>
      )}
      <button
        type="submit"
        className="w-full bg-gold text-pitch font-bold py-3 rounded-lg"
      >
        Créer mon compte
      </button>
      <p className="text-center text-sm text-white/60">
        Déjà un compte ?{" "}
        <Link href="/auth/login" className="text-gold">
          Se connecter
        </Link>
      </p>
    </form>
  );
}
```

- [ ] **Step 4: Root page redirect**

Replace `app/page.tsx` with:

```tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function RootPage() {
  const session = await auth();
  if (session) redirect("/collection");
  else redirect("/auth/login");
}
```

- [ ] **Step 5: Commit**

```bash
git add app/
git commit -m "feat: add login, register pages and root redirect"
```

---

## Task 7: Collection Server Actions

**Files:**
- Create: `lib/actions/collection.ts`

- [ ] **Step 1: Create collection actions**

Create `lib/actions/collection.ts`:

```ts
"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { STICKER_MAP } from "@/data/stickers";
import type { CollectionEntry } from "@/types";

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non authentifié");
  return session.user.id;
}

export async function getCollection(): Promise<CollectionEntry[]> {
  const userId = await requireUser();
  const rows = await prisma.collection.findMany({
    where: { userId },
    select: { stickerId: true, quantity: true },
  });
  return rows;
}

export async function upsertSticker(stickerId: string, delta: number): Promise<void> {
  const userId = await requireUser();
  if (!STICKER_MAP.has(stickerId)) throw new Error("Sticker invalide");

  const existing = await prisma.collection.findUnique({
    where: { userId_stickerId: { userId, stickerId } },
  });

  const newQty = Math.max(0, (existing?.quantity ?? 0) + delta);

  if (newQty === 0) {
    await prisma.collection.deleteMany({
      where: { userId, stickerId },
    });
  } else {
    await prisma.collection.upsert({
      where: { userId_stickerId: { userId, stickerId } },
      create: { userId, stickerId, quantity: newQty },
      update: { quantity: newQty },
    });
  }
}

export async function bulkUpsertStickers(codes: string[]): Promise<{ added: number; invalid: string[] }> {
  const userId = await requireUser();
  const invalid: string[] = [];
  const valid: string[] = [];

  for (const code of codes) {
    const trimmed = code.trim().toUpperCase();
    if (STICKER_MAP.has(trimmed)) valid.push(trimmed);
    else if (trimmed) invalid.push(trimmed);
  }

  for (const stickerId of valid) {
    await prisma.collection.upsert({
      where: { userId_stickerId: { userId, stickerId } },
      create: { userId, stickerId, quantity: 1 },
      update: { quantity: { increment: 1 } },
    });
  }

  return { added: valid.length, invalid };
}

export async function getUserCollectionById(userId: string): Promise<CollectionEntry[]> {
  const requesterId = await requireUser();
  // Verify requester is in the same group as userId
  const sharedGroup = await prisma.groupMember.findFirst({
    where: {
      userId: requesterId,
      group: { members: { some: { userId } } },
    },
  });
  if (!sharedGroup) throw new Error("Accès refusé");

  return prisma.collection.findMany({
    where: { userId },
    select: { stickerId: true, quantity: true },
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/actions/collection.ts
git commit -m "feat: add collection server actions (get, upsert, bulk)"
```

---

## Task 8: Navbar Component

**Files:**
- Create: `components/Navbar.tsx`
- Modify: `app/layout.tsx` — import Navbar

- [ ] **Step 1: Create Navbar**

Create `components/Navbar.tsx`:

```tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/collection", label: "Collection", icon: "🏷️" },
  { href: "/groups", label: "Groupes", icon: "👥" },
  { href: "/stats", label: "Stats", icon: "📊" },
  { href: "/profile", label: "Profil", icon: "👤" },
];

export default function Navbar() {
  const path = usePathname();
  const isAuth = path.startsWith("/auth");
  if (isAuth) return null;

  return (
    <>
      {/* Desktop top nav */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 z-50 bg-pitch/90 backdrop-blur border-b border-white/10 px-6 h-14 items-center justify-between">
        <span className="font-title text-gold text-xl ">PANINI WC26</span>
        <ul className="flex gap-6">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`text-sm font-semibold transition-colors ${
                  path.startsWith(item.href) ? "text-gold" : "text-white/60 hover:text-off-white"
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-pitch/95 backdrop-blur border-t border-white/10">
        <ul className="flex">
          {NAV_ITEMS.map((item) => (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={`flex flex-col items-center py-2 gap-0.5 transition-colors ${
                  path.startsWith(item.href) ? "text-gold" : "text-white/50"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-[10px] font-semibold">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
```

- [ ] **Step 2: Add Navbar to root layout**

Edit `app/layout.tsx` — add `import Navbar` and render it inside `<body>`:

```tsx
import type { Metadata } from "next";
import { Anton, DM_Sans } from "next/font/google";
import Navbar from "@/components/Navbar";
import "./globals.css";

const anton = Anton({ weight: "400", subsets: ["latin"], variable: "--font-anton" });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });

export const metadata: Metadata = {
  title: "Panini WC26",
  description: "Suivez votre collection Panini FIFA WC 2026",
  manifest: "/manifest.json",
  themeColor: "#0D1F0D",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${anton.variable} ${dmSans.variable}`}>
      <body className="bg-pitch text-off-white font-body min-h-screen">
        <Navbar />
        <div className="md:pt-14 pb-16 md:pb-0">
          {children}
        </div>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/Navbar.tsx app/layout.tsx
git commit -m "feat: add mobile bottom nav and desktop top nav"
```

---

## Task 9: ProgressBar Component

**Files:**
- Create: `components/ProgressBar.tsx`

- [ ] **Step 1: Create ProgressBar**

Create `components/ProgressBar.tsx`:

```tsx
interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
  size?: "sm" | "md" | "lg";
}

export default function ProgressBar({ current, total, label, size = "md" }: ProgressBarProps) {
  const pct = total === 0 ? 0 : Math.round((current / total) * 100);
  const heights = { sm: "h-1.5", md: "h-2.5", lg: "h-4" };

  return (
    <div className="w-full">
      {(label || size !== "sm") && (
        <div className="flex justify-between text-xs mb-1 text-white/70">
          <span>{label}</span>
          <span className="font-semibold text-off-white">
            {current}/{total}
            <span className="text-white/50 ml-1">({pct}%)</span>
          </span>
        </div>
      )}
      <div className={`w-full bg-white/10 rounded-full overflow-hidden ${heights[size]}`}>
        <div
          className="bg-gold rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/ProgressBar.tsx
git commit -m "feat: add animated ProgressBar component"
```

---

## Task 10: StickerCard + StickerGrid

**Files:**
- Create: `components/StickerCard.tsx`
- Create: `components/StickerGrid.tsx`
- Create: `app/collection/page.tsx`

- [ ] **Step 1: Create StickerCard**

Create `components/StickerCard.tsx`:

```tsx
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

  const state = quantity === 0 ? "missing" : quantity === 1 ? "owned" : "duplicate";

  const baseClasses = "relative rounded-lg flex flex-col items-center justify-center min-h-[44px] min-w-[44px] p-1.5 cursor-pointer select-none transition-transform active:scale-95";

  const stateClasses = {
    missing: "bg-white/5 border border-white/10 text-white/30",
    owned: "bg-green-900/60 border border-green-500/40 text-off-white",
    duplicate: "bg-yellow-900/60 border border-gold/60 text-gold",
  };

  function handleTouchStart() {
    timerRef.current = setTimeout(onLongPress, 500);
  }

  function handleTouchEnd() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  return (
    <div
      className={`${baseClasses} ${stateClasses[state]} ${sticker.isFoil && state !== "missing" ? "overflow-hidden" : ""}`}
      onClick={onTap}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchEnd}
    >
      {sticker.isFoil && state !== "missing" && (
        <div className="foil-shimmer absolute inset-0 pointer-events-none" />
      )}
      <span className="text-[10px] font-bold leading-tight relative z-10">{sticker.id}</span>
      {quantity >= 2 && (
        <span className="absolute -top-1 -right-1 bg-gold text-pitch text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center z-20">
          {quantity}
        </span>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create StickerGrid**

Create `components/StickerGrid.tsx`:

```tsx
"use client";
import { useState, useTransition, useCallback } from "react";
import StickerCard from "./StickerCard";
import ProgressBar from "./ProgressBar";
import type { Sticker, CollectionEntry } from "@/types";
import { STICKERS_BY_TEAM, TEAM_ORDER, STICKERS } from "@/data/stickers";
import { upsertSticker } from "@/lib/actions/collection";
import confetti from "canvas-confetti";

interface ModalState { sticker: Sticker; quantity: number } | null;
type ModalState = { sticker: Sticker; quantity: number } | null;

interface StickerGridProps {
  initialCollection: CollectionEntry[];
}

export default function StickerGrid({ initialCollection }: StickerGridProps) {
  const [collection, setCollection] = useState<Map<string, number>>(
    () => new Map(initialCollection.map((e) => [e.stickerId, e.quantity]))
  );
  const [modal, setModal] = useState<ModalState>(null);
  const [, startTransition] = useTransition();

  const getQty = (id: string) => collection.get(id) ?? 0;

  const handleTap = useCallback(
    (sticker: Sticker) => {
      const current = getQty(sticker.id);
      const newQty = current === 0 ? 1 : current === 1 ? 2 : 0;
      const delta = newQty - current;

      setCollection((prev) => {
        const next = new Map(prev);
        if (newQty === 0) next.delete(sticker.id);
        else next.set(sticker.id, newQty);
        return next;
      });

      // Check team completion
      if (newQty > 0) {
        const teamStickers = STICKERS_BY_TEAM[sticker.team] ?? [];
        const allOwned = teamStickers.every((s) =>
          s.id === sticker.id ? newQty > 0 : (collection.get(s.id) ?? 0) > 0
        );
        if (allOwned && teamStickers.length > 1) {
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        }
      }

      startTransition(() => {
        upsertSticker(sticker.id, delta);
      });
    },
    [collection]
  );

  const totalOwned = collection.size;

  return (
    <div className="space-y-6">
      <ProgressBar current={totalOwned} total={STICKERS.length} label="Collection totale" size="lg" />

      {TEAM_ORDER.map((team) => {
        const stickers = STICKERS_BY_TEAM[team];
        if (!stickers?.length) return null;
        const teamOwned = stickers.filter((s) => getQty(s.id) > 0).length;

        return (
          <section key={team}>
            <div className="flex items-center justify-between mb-2 px-1">
              <h2 className="font-title text-sm  text-gold uppercase">{team}</h2>
              <span className="text-xs text-white/50">{teamOwned}/{stickers.length}</span>
            </div>
            <div className="grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-10 gap-1.5">
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

      {/* Quantity modal */}
      {modal && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center p-4"
          onClick={() => setModal(null)}
        >
          <div
            className="bg-[#1a3a1a] border border-white/20 rounded-2xl p-6 w-full max-w-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-title text-gold text-lg mb-1">{modal.sticker.id}</h3>
            <p className="text-sm text-white/60 mb-4">{modal.sticker.name}</p>
            <div className="flex items-center justify-center gap-4">
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
                className="w-12 h-12 rounded-full bg-white/10 text-2xl flex items-center justify-center"
              >
                −
              </button>
              <span className="text-3xl font-bold w-12 text-center">{modal.quantity}</span>
              <button
                onClick={() => {
                  const qty = modal.quantity + 1;
                  setModal({ ...modal, quantity: qty });
                  setCollection((prev) => new Map(prev).set(modal.sticker.id, qty));
                  startTransition(() => upsertSticker(modal.sticker.id, 1));
                }}
                className="w-12 h-12 rounded-full bg-white/10 text-2xl flex items-center justify-center"
              >
                +
              </button>
            </div>
            <button
              onClick={() => setModal(null)}
              className="mt-4 w-full text-sm text-white/40"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Create collection page**

Create `app/collection/page.tsx`:

```tsx
import { getCollection } from "@/lib/actions/collection";
import StickerGrid from "@/components/StickerGrid";
import BulkInput from "@/components/BulkInput";

export default async function CollectionPage() {
  const collection = await getCollection();

  return (
    <main className="max-w-4xl mx-auto px-3 py-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-title text-2xl text-gold ">MA COLLECTION</h1>
      </div>
      <BulkInput />
      <div className="mt-4">
        <StickerGrid initialCollection={collection} />
      </div>
    </main>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add components/StickerCard.tsx components/StickerGrid.tsx app/collection/
git commit -m "feat: add sticker grid with tap-to-cycle, long-press modal, confetti on team complete"
```

---

## Task 11: BulkInput Component

**Files:**
- Create: `components/BulkInput.tsx`

- [ ] **Step 1: Create BulkInput**

Create `components/BulkInput.tsx`:

```tsx
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
        className="text-sm text-gold border border-gold/40 rounded-lg px-3 py-2 w-full"
      >
        + Ajout en masse (codes)
      </button>
    );
  }

  return (
    <div className="border border-white/20 rounded-xl p-4 space-y-3">
      <p className="text-sm text-white/60">
        Entrez des codes séparés par des virgules ou espaces. Ex: <code className="text-gold">FRA1, ARG17, FWC4</code>
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        placeholder="FRA1, FRA2, BRA17..."
        className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-off-white text-sm focus:outline-none focus:border-gold resize-none"
      />
      {result && (
        <div className="text-sm">
          <p className="text-green-400">{result.added} sticker(s) ajouté(s)</p>
          {result.invalid.length > 0 && (
            <p className="text-red-400">Codes invalides : {result.invalid.join(", ")}</p>
          )}
        </div>
      )}
      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          disabled={isPending || !text.trim()}
          className="flex-1 bg-gold text-pitch font-bold py-2 rounded-lg text-sm disabled:opacity-50"
        >
          {isPending ? "Ajout..." : "Ajouter"}
        </button>
        <button
          onClick={() => { setOpen(false); setResult(null); }}
          className="px-4 py-2 border border-white/20 rounded-lg text-sm"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/BulkInput.tsx
git commit -m "feat: add BulkInput component for batch sticker entry"
```

---

## Task 12: Groups Server Actions + UI

**Files:**
- Create: `lib/actions/groups.ts`
- Create: `app/groups/page.tsx`
- Create: `app/groups/join/page.tsx`
- Create: `app/groups/[groupId]/page.tsx`
- Create: `components/GroupCard.tsx`

- [ ] **Step 1: Create group actions**

Create `lib/actions/groups.ts`:

```ts
"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { nanoid } from "nanoid";

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non authentifié");
  return session.user;
}

export async function createGroup(name: string) {
  const user = await requireUser();
  const inviteCode = nanoid(6).toUpperCase();
  const group = await prisma.group.create({
    data: {
      name,
      inviteCode,
      createdById: user.id,
      members: { create: { userId: user.id } },
    },
  });
  return group;
}

export async function joinGroup(inviteCode: string) {
  const user = await requireUser();
  const group = await prisma.group.findUnique({ where: { inviteCode } });
  if (!group) throw new Error("Code invalide");

  await prisma.groupMember.upsert({
    where: { groupId_userId: { groupId: group.id, userId: user.id } },
    create: { groupId: group.id, userId: user.id },
    update: {},
  });
  return group;
}

export async function getUserGroups() {
  const user = await requireUser();
  return prisma.group.findMany({
    where: { members: { some: { userId: user.id } } },
    include: {
      members: { include: { user: { select: { id: true, username: true } } } },
      _count: { select: { members: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getGroupWithMembers(groupId: string) {
  const user = await requireUser();
  const membership = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: user.id } },
  });
  if (!membership) throw new Error("Accès refusé");

  const group = await prisma.group.findUniqueOrThrow({
    where: { id: groupId },
    include: {
      members: { include: { user: { select: { id: true, username: true } } } },
    },
  });

  const memberStats = await Promise.all(
    group.members.map(async (m) => {
      const count = await prisma.collection.count({ where: { userId: m.userId } });
      return { userId: m.userId, username: m.user.username, collectionCount: count };
    })
  );

  return { ...group, memberStats };
}
```

- [ ] **Step 2: Install nanoid**

```bash
npm install nanoid
```

- [ ] **Step 3: Create GroupCard component**

Create `components/GroupCard.tsx`:

```tsx
import Link from "next/link";
import ProgressBar from "./ProgressBar";
import { STICKERS } from "@/data/stickers";

interface GroupCardProps {
  id: string;
  name: string;
  inviteCode: string;
  memberCount: number;
}

export default function GroupCard({ id, name, inviteCode, memberCount }: GroupCardProps) {
  return (
    <Link href={`/groups/${id}`}>
      <div className="border border-white/20 rounded-xl p-4 hover:border-gold/50 transition-colors">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-title text-lg text-gold ">{name}</h3>
          <span className="text-xs text-white/40 bg-white/5 px-2 py-1 rounded font-mono">
            {inviteCode}
          </span>
        </div>
        <p className="text-sm text-white/50">{memberCount} membre{memberCount > 1 ? "s" : ""}</p>
      </div>
    </Link>
  );
}
```

- [ ] **Step 4: Create groups list page**

Create `app/groups/page.tsx`:

```tsx
import { getUserGroups } from "@/lib/actions/groups";
import GroupCard from "@/components/GroupCard";
import Link from "next/link";

export default async function GroupsPage() {
  const groups = await getUserGroups();

  return (
    <main className="max-w-xl mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-title text-2xl text-gold ">MES GROUPES</h1>
        <Link
          href="/groups/join"
          className="text-sm border border-gold/40 text-gold px-3 py-2 rounded-lg"
        >
          + Rejoindre
        </Link>
      </div>

      {groups.length === 0 && (
        <div className="text-center py-16 text-white/40">
          <p className="mb-4">Aucun groupe pour l&apos;instant.</p>
        </div>
      )}

      <div className="space-y-3">
        {groups.map((g) => (
          <GroupCard
            key={g.id}
            id={g.id}
            name={g.name}
            inviteCode={g.inviteCode}
            memberCount={g._count.members}
          />
        ))}
      </div>

      <CreateGroupForm />
    </main>
  );
}

function CreateGroupForm() {
  async function action(formData: FormData) {
    "use server";
    const { createGroup } = await import("@/lib/actions/groups");
    const { redirect } = await import("next/navigation");
    const name = formData.get("name") as string;
    if (!name?.trim()) return;
    const group = await createGroup(name.trim());
    redirect(`/groups/${group.id}`);
  }

  return (
    <form action={action} className="mt-6 flex gap-2">
      <input
        name="name"
        placeholder="Nom du groupe..."
        required
        className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-off-white focus:outline-none focus:border-gold"
      />
      <button type="submit" className="bg-gold text-pitch font-bold px-4 py-2.5 rounded-lg text-sm">
        Créer
      </button>
    </form>
  );
}
```

- [ ] **Step 5: Create join page**

Create `app/groups/join/page.tsx`:

```tsx
import { redirect } from "next/navigation";
import { joinGroup } from "@/lib/actions/groups";

async function joinAction(formData: FormData) {
  "use server";
  const code = (formData.get("code") as string)?.trim().toUpperCase();
  if (!code) return;
  const group = await joinGroup(code);
  redirect(`/groups/${group.id}`);
}

export default function JoinGroupPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <main className="max-w-sm mx-auto px-4 py-16">
      <h1 className="font-title text-2xl text-gold mb-8 text-center ">
        REJOINDRE UN GROUPE
      </h1>
      <form action={joinAction} className="space-y-4">
        <input
          name="code"
          placeholder="Code d'invitation (6 caractères)"
          maxLength={6}
          required
          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-off-white uppercase  text-center text-lg focus:outline-none focus:border-gold"
        />
        {searchParams.error && (
          <p className="text-red-400 text-sm text-center">Code invalide.</p>
        )}
        <button type="submit" className="w-full bg-gold text-pitch font-bold py-3 rounded-lg">
          Rejoindre
        </button>
      </form>
    </main>
  );
}
```

- [ ] **Step 6: Create group detail page**

Create `app/groups/[groupId]/page.tsx`:

```tsx
import { getGroupWithMembers } from "@/lib/actions/groups";
import ProgressBar from "@/components/ProgressBar";
import Link from "next/link";
import { STICKERS } from "@/data/stickers";

export default async function GroupPage({ params }: { params: { groupId: string } }) {
  const group = await getGroupWithMembers(params.groupId);

  return (
    <main className="max-w-xl mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-title text-xl text-gold ">{group.name}</h1>
        <span className="text-xs text-white/40 bg-white/5 px-2 py-1 rounded font-mono">
          {group.inviteCode}
        </span>
      </div>

      <Link
        href={`/groups/${group.id}/trades`}
        className="block w-full bg-fifa-blue text-white font-bold py-3 rounded-xl text-center mb-6"
      >
        Voir les échanges possibles →
      </Link>

      <h2 className="text-sm text-white/50 uppercase  mb-3">Membres</h2>
      <div className="space-y-3">
        {group.memberStats.map((m) => (
          <div key={m.userId} className="border border-white/10 rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">{m.username}</span>
              <span className="text-sm text-white/50">
                {m.collectionCount}/{STICKERS.length}
              </span>
            </div>
            <ProgressBar current={m.collectionCount} total={STICKERS.length} size="sm" />
          </div>
        ))}
      </div>
    </main>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add lib/actions/groups.ts components/GroupCard.tsx app/groups/
git commit -m "feat: add groups (create, join, member list with progress)"
```

---

## Task 13: Trade Engine

**Files:**
- Create: `lib/actions/trades.ts`
- Create: `components/TradeMatrix.tsx`
- Create: `components/TradeDetail.tsx`
- Create: `app/groups/[groupId]/trades/page.tsx`

- [ ] **Step 1: Create trade actions**

Create `lib/actions/trades.ts`:

```ts
"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { STICKER_MAP } from "@/data/stickers";
import type { TradePair, Sticker } from "@/types";

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non authentifié");
  return session.user;
}

export async function getTradeMatrix(groupId: string): Promise<TradePair[]> {
  const user = await requireUser();

  const membership = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: user.id } },
  });
  if (!membership) throw new Error("Accès refusé");

  const members = await prisma.groupMember.findMany({
    where: { groupId },
    include: { user: { select: { id: true, username: true } } },
  });

  const collections = await prisma.collection.findMany({
    where: { userId: { in: members.map((m) => m.userId) } },
  });

  const byUser = new Map<string, Map<string, number>>();
  for (const m of members) byUser.set(m.userId, new Map());
  for (const c of collections) byUser.get(c.userId)?.set(c.stickerId, c.quantity);

  const pairs: TradePair[] = [];

  for (let i = 0; i < members.length; i++) {
    for (let j = i + 1; j < members.length; j++) {
      const a = members[i];
      const b = members[j];
      const aCol = byUser.get(a.userId)!;
      const bCol = byUser.get(b.userId)!;

      const canGive: Sticker[] = [];
      const canReceive: Sticker[] = [];

      for (const [sid, qty] of aCol) {
        if (qty > 1 && !bCol.has(sid)) {
          const s = STICKER_MAP.get(sid);
          if (s) canGive.push(s);
        }
      }

      for (const [sid, qty] of bCol) {
        if (qty > 1 && !aCol.has(sid)) {
          const s = STICKER_MAP.get(sid);
          if (s) canReceive.push(s);
        }
      }

      pairs.push({
        userAId: a.userId,
        userAName: a.user.username,
        userBId: b.userId,
        userBName: b.user.username,
        canGive,
        canReceive,
      });
    }
  }

  return pairs;
}
```

- [ ] **Step 2: Create TradeDetail component**

Create `components/TradeDetail.tsx`:

```tsx
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
    `🔄 Échange Panini WC26 — ${pair.userAName} ↔ ${pair.userBName}`,
    "",
    `${pair.userAName} peut donner à ${pair.userBName} (${pair.canGive.length}) :`,
    pair.canGive.map((s) => `${s.id} ${s.name}`).join(", ") || "Rien",
    "",
    `${pair.userBName} peut donner à ${pair.userAName} (${pair.canReceive.length}) :`,
    pair.canReceive.map((s) => `${s.id} ${s.name}`).join(", ") || "Rien",
  ].join("\n");

  function handleCopy() {
    navigator.clipboard.writeText(exportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#1a3a1a] border border-white/20 rounded-2xl p-5 w-full max-w-lg max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <h2 className="font-title text-gold text-lg">
            {pair.userAName} ↔ {pair.userBName}
          </h2>
          <button onClick={onClose} className="text-white/40 text-xl">✕</button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-5">
          <div>
            <h3 className="text-xs text-white/50 uppercase r mb-2">
              {pair.userAName} donne ({pair.canGive.length})
            </h3>
            <div className="space-y-1">
              {pair.canGive.length === 0 ? (
                <p className="text-sm text-white/30">Rien</p>
              ) : (
                pair.canGive.map((s) => (
                  <div key={s.id} className="text-sm">
                    <span className="text-gold font-bold">{s.id}</span>{" "}
                    <span className="text-white/70">{s.name}</span>
                  </div>
                ))
              )}
            </div>
          </div>
          <div>
            <h3 className="text-xs text-white/50 uppercase r mb-2">
              {pair.userBName} donne ({pair.canReceive.length})
            </h3>
            <div className="space-y-1">
              {pair.canReceive.length === 0 ? (
                <p className="text-sm text-white/30">Rien</p>
              ) : (
                pair.canReceive.map((s) => (
                  <div key={s.id} className="text-sm">
                    <span className="text-gold font-bold">{s.id}</span>{" "}
                    <span className="text-white/70">{s.name}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="w-full bg-gold text-pitch font-bold py-2.5 rounded-xl text-sm"
        >
          {copied ? "Copié !" : "Copier le résumé"}
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create TradeMatrix component**

Create `components/TradeMatrix.tsx`:

```tsx
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
    return <p className="text-white/40 text-center py-8">Pas encore assez de membres.</p>;
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
              className="w-full border border-white/20 rounded-xl p-4 text-left hover:border-gold/50 transition-colors"
            >
              <div className="flex justify-between items-center">
                <span className="font-semibold">
                  {pair.userAName} ↔ {pair.userBName}
                </span>
                <span className={`text-sm font-bold ${total > 0 ? "text-gold" : "text-white/30"}`}>
                  {total} échange{total !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex gap-4 mt-1 text-sm text-white/50">
                <span>{pair.userAName} → {pair.canGive.length}</span>
                <span>{pair.userBName} → {pair.canReceive.length}</span>
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
```

- [ ] **Step 4: Create trades page with 30s polling**

Create `app/groups/[groupId]/trades/page.tsx`:

```tsx
import { getTradeMatrix } from "@/lib/actions/trades";
import TradesClient from "./TradesClient";

export default async function TradesPage({ params }: { params: { groupId: string } }) {
  const pairs = await getTradeMatrix(params.groupId);
  return <TradesClient groupId={params.groupId} initialPairs={pairs} />;
}
```

Create `app/groups/[groupId]/trades/TradesClient.tsx`:

```tsx
"use client";
import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { TradePair } from "@/types";
import TradeMatrix from "@/components/TradeMatrix";

interface Props {
  groupId: string;
  initialPairs: TradePair[];
}

export default function TradesClient({ groupId, initialPairs }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  useEffect(() => {
    const id = setInterval(() => {
      startTransition(() => router.refresh());
    }, 30_000);
    return () => clearInterval(id);
  }, [router]);

  return (
    <main className="max-w-xl mx-auto px-4 py-6">
      <h1 className="font-title text-2xl text-gold  mb-6">ÉCHANGES POSSIBLES</h1>
      <TradeMatrix pairs={initialPairs} />
    </main>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add lib/actions/trades.ts components/TradeMatrix.tsx components/TradeDetail.tsx app/groups/
git commit -m "feat: add trade engine with matrix view, detail modal, copy export, 30s polling"
```

---

## Task 14: Stats Page

**Files:**
- Create: `app/stats/page.tsx`

- [ ] **Step 1: Create stats page**

Create `app/stats/page.tsx`:

```tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { STICKERS, STICKERS_BY_TEAM, TEAM_ORDER } from "@/data/stickers";
import ProgressBar from "@/components/ProgressBar";

export default async function StatsPage() {
  const session = await auth();
  if (!session) return null;

  const collection = await prisma.collection.findMany({
    where: { userId: session.user.id },
    select: { stickerId: true, quantity: true },
  });

  const collMap = new Map(collection.map((c) => [c.stickerId, c.quantity]));
  const owned = collection.length;
  const duplicates = collection.filter((c) => c.quantity > 1).length;
  const missing = STICKERS.length - owned;

  return (
    <main className="max-w-xl mx-auto px-4 py-6">
      <h1 className="font-title text-2xl text-gold  mb-6">STATISTIQUES</h1>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Collés", value: owned, color: "text-green-400" },
          { label: "Doubles", value: duplicates, color: "text-gold" },
          { label: "Manquants", value: missing, color: "text-red-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="border border-white/20 rounded-xl p-3 text-center">
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="text-xs text-white/50 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <ProgressBar current={owned} total={STICKERS.length} label="Total" size="lg" />

      <h2 className="text-sm text-white/50 uppercase  mt-6 mb-3">Par équipe</h2>
      <div className="space-y-2">
        {TEAM_ORDER.filter((t) => t !== "Intro" && t !== "Coca-Cola" && t !== "FIFA Museum").map(
          (team) => {
            const stickers = STICKERS_BY_TEAM[team] ?? [];
            const teamOwned = stickers.filter((s) => collMap.has(s.id)).length;
            return (
              <div key={team}>
                <ProgressBar current={teamOwned} total={stickers.length} label={team} size="sm" />
              </div>
            );
          }
        )}
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/stats/
git commit -m "feat: add stats page with per-team progress bars"
```

---

## Task 15: Profile Page

**Files:**
- Create: `app/profile/page.tsx`

- [ ] **Step 1: Create profile page**

Create `app/profile/page.tsx`:

```tsx
import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

async function updateUsername(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user?.id) return;
  const username = (formData.get("username") as string)?.trim();
  if (!username || username.length < 2) return;

  await prisma.user.update({
    where: { id: session.user.id },
    data: { username },
  });
  redirect("/profile?saved=1");
}

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: { saved?: string };
}) {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: { username: true, email: true, createdAt: true },
  });

  return (
    <main className="max-w-sm mx-auto px-4 py-8">
      <h1 className="font-title text-2xl text-gold  mb-6">PROFIL</h1>

      <form action={updateUsername} className="space-y-4 mb-8">
        <div>
          <label className="block text-sm mb-1 text-white/60">Nom d&apos;utilisateur</label>
          <input
            name="username"
            defaultValue={user.username}
            required
            minLength={2}
            maxLength={20}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-off-white focus:outline-none focus:border-gold"
          />
        </div>
        <div>
          <label className="block text-sm mb-1 text-white/60">Email</label>
          <input
            value={user.email}
            readOnly
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white/40 cursor-not-allowed"
          />
        </div>
        {searchParams.saved && (
          <p className="text-green-400 text-sm">Pseudo mis à jour !</p>
        )}
        <button type="submit" className="w-full bg-gold text-pitch font-bold py-3 rounded-lg">
          Sauvegarder
        </button>
      </form>

      <form action={async () => { "use server"; await signOut({ redirectTo: "/auth/login" }); }}>
        <button type="submit" className="w-full border border-red-500/40 text-red-400 py-3 rounded-lg text-sm">
          Se déconnecter
        </button>
      </form>
    </main>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/profile/
git commit -m "feat: add profile page with username edit and sign out"
```

---

## Task 16: PWA Setup

**Files:**
- Create: `public/manifest.json`
- Modify: `next.config.ts` — add next-pwa
- Create: `public/icons/` — placeholder icons

- [ ] **Step 1: Create manifest**

Create `public/manifest.json`:

```json
{
  "name": "Panini WC26",
  "short_name": "Panini",
  "description": "Suivez votre collection Panini FIFA WC 2026",
  "start_url": "/collection",
  "display": "standalone",
  "background_color": "#0D1F0D",
  "theme_color": "#0D1F0D",
  "orientation": "portrait",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

- [ ] **Step 2: Configure next-pwa**

Replace `next.config.ts` with:

```ts
import type { NextConfig } from "next";
const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

const nextConfig: NextConfig = {
  // no extra config needed
};

module.exports = withPWA(nextConfig);
```

- [ ] **Step 3: Add PWA icon placeholders**

```bash
mkdir -p public/icons
# Add 192x192 and 512x512 PNG icons to public/icons/
# You can generate them from any image editor or use a generator like https://maskable.app
```

- [ ] **Step 4: Add offline localStorage cache to StickerGrid**

In `components/StickerGrid.tsx`, add localStorage sync after the collection state initialization:

```tsx
// After the collection useState, add:
useEffect(() => {
  localStorage.setItem("collection", JSON.stringify([...collection.entries()]));
}, [collection]);

// In the useState initializer, try localStorage first:
const [collection, setCollection] = useState<Map<string, number>>(() => {
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem("collection");
      if (cached) return new Map(JSON.parse(cached));
    } catch {}
  }
  return new Map(initialCollection.map((e) => [e.stickerId, e.quantity]));
});
```

- [ ] **Step 5: Commit**

```bash
git add public/ next.config.ts components/StickerGrid.tsx
git commit -m "feat: add PWA manifest, service worker, offline localStorage cache"
```

---

## Task 17: Final Polish + Deploy Prep

**Files:**
- Modify: `app/layout.tsx` — add viewport meta, apple-mobile-web-app tags
- Create: `vercel.json` (optional env pointer)

- [ ] **Step 1: Add PWA meta to layout**

Add to `app/layout.tsx` metadata:

```tsx
export const metadata: Metadata = {
  title: "Panini WC26",
  description: "Suivez votre collection Panini FIFA WC 2026",
  manifest: "/manifest.json",
  themeColor: "#0D1F0D",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Panini WC26",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
};
```

- [ ] **Step 2: Production build check**

```bash
npm run build
```

Expected: build completes with no errors. Fix any type errors before proceeding.

- [ ] **Step 3: Set environment variables on Vercel**

In the Vercel dashboard (or via `vercel env add`):
- `DATABASE_URL` — Neon pooled connection string
- `NEXTAUTH_SECRET` — `openssl rand -base64 32` output
- `NEXTAUTH_URL` — your Vercel deployment URL
- `RESEND_API_KEY` — from resend.com dashboard
- `EMAIL_FROM` — verified sender address

- [ ] **Step 4: Deploy**

```bash
npx vercel --prod
```

- [ ] **Step 5: Final commit**

```bash
git add .
git commit -m "feat: production polish, PWA meta, deploy config"
```

---

## Spec Coverage Check

| Spec Requirement | Task |
|---|---|
| Next.js 14 App Router + TypeScript | Task 1 |
| Tailwind CSS with custom dark theme | Task 1 |
| Anton + DM Sans fonts | Task 1 |
| Prisma + Neon schema | Task 4 |
| NextAuth credentials + magic link | Task 5 |
| 980 static sticker data | Task 3 |
| StickerCard (missing/owned/duplicate/foil) | Task 10 |
| StickerGrid virtualized by team | Task 10 |
| Tap cycles quantity, long-press opens modal | Task 10 |
| BulkInput textarea | Task 11 |
| Groups create/join/list/members | Task 12 |
| Trade engine query logic | Task 13 |
| TradeMatrix cross-table | Task 13 |
| TradeDetail two-column + copy export | Task 13 |
| 30s polling on trade page | Task 13 |
| ProgressBar animated | Task 9 |
| Team confetti on 20/20 | Task 10 |
| Stats page per-team bars | Task 14 |
| Profile page edit username | Task 15 |
| Navbar mobile bottom + desktop top | Task 8 |
| PWA manifest + service worker | Task 16 |
| Offline localStorage cache | Task 16 |
| French UI | All tasks |
| Server Actions replace RLS | Tasks 7, 12, 13 |
