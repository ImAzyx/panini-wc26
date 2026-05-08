# 🏆 Panini WC26 Tracker

> Suivez votre collection de stickers Panini FIFA World Cup 2026 — en ligne, en temps réel, et partagée avec vos amis.

---

## ✨ Présentation

**Panini WC26 Tracker** est une Progressive Web App conçue pour les collectionneurs de l'album officiel Panini de la Coupe du Monde FIFA 2026. Fini les listes papier et les tableurs : gérez vos stickers collés, vos doubles, et vos échanges depuis n'importe quel appareil, instantanément synchronisés.

---

## 🎯 Fonctionnalités

### 📋 Collection
- Vue complète des **980 stickers officiels** (48 équipes × 20 stickers + intro + FIFA Museum) dans l'ordre exact de l'album
- Affichage adaptatif : **2 colonnes sur desktop**, 1 colonne sur mobile
- Tap pour **coller / mettre en double** — appui long pour régler la quantité précise
- Confettis 🎉 quand une équipe est complète
- **Ajout en masse** par saisie de codes (`FRA1 FRA2 BRA17…`) avec rapport détaillé :
  - ✅ Nouveaux à coller (avec détection des extras dans la même saisie)
  - 🟡 Déjà en collection (doubles incrémentés)
  - ❌ Codes invalides
- Résultats affichés dans l'ordre de l'album

### 📊 Statistiques
- Progression globale en % sur les 980 stickers officiels
- Compteur de collés / doubles (avec %) / manquants
- Complétion **par équipe**, triée de la plus complète à la moins avancée
- Stickers Coca-Cola extra trackables séparément (hors comptage officiel)

### 👥 Groupes & Échanges
- Créez des **groupes privés** avec code d'invitation
- Visualisez la progression de chaque membre
- Matrice d'**échanges possibles** : qui peut donner quoi à qui, automatiquement calculée

### 👤 Profil
- Connexion par email (magic link via Resend) ou identifiants
- Modification du nom d'utilisateur

### 📱 PWA
- Installable sur mobile et desktop (Android, iOS, macOS, Windows)
- Service worker pour une navigation fluide

---

## 🛠 Stack technique

| Couche | Technologie |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) — App Router, Turbopack |
| Langage | TypeScript 5 |
| Base de données | PostgreSQL serverless via [Neon](https://neon.tech) |
| ORM | [Prisma 7](https://prisma.io) avec `@prisma/adapter-neon` |
| Auth | [NextAuth v5](https://authjs.dev) (JWT + Credentials + Resend magic link) |
| Styles | [Tailwind CSS v4](https://tailwindcss.com) |
| Emails | [Resend](https://resend.com) (optionnel) |
| Déploiement | [Vercel](https://vercel.com) (recommandé) |

---

## 🚀 Démarrage rapide

### Prérequis

- Node.js ≥ 20
- Une base de données PostgreSQL (ex. [Neon](https://neon.tech) — free tier suffisant)
- Optionnel : compte [Resend](https://resend.com) pour les magic links

### Installation

```bash
git clone https://github.com/ImAzyx/panini-wc26.git
cd panini-wc26
npm install
```

### Variables d'environnement

Créez un fichier `.env.local` à la racine :

```env
# Base de données (Neon ou tout PostgreSQL)
DATABASE_URL="postgresql://user:password@host/db?sslmode=require"

# NextAuth
NEXTAUTH_SECRET="une-chaine-secrete-longue-et-aleatoire"
NEXTAUTH_URL="http://localhost:3000"   # URL de prod en déploiement

# Resend (optionnel — pour les magic links email)
RESEND_API_KEY="re_..."
EMAIL_FROM="noreply@votre-domaine.com"
```

### Base de données

```bash
# Générer le client Prisma et appliquer le schéma
npx prisma generate
npx prisma migrate deploy
```

### Lancer en développement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000).

---

## 📦 Scripts

| Commande | Description |
|---|---|
| `npm run dev` | Serveur de développement (Turbopack) |
| `npm run build` | Build de production (`prisma generate` inclus) |
| `npm run start` | Démarre le serveur de production |
| `npm run lint` | Vérification ESLint |

---

## 🌍 Déploiement (Vercel)

1. Importez le repo sur [vercel.com](https://vercel.com)
2. Ajoutez les variables d'environnement dans les settings du projet :
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` ← **votre URL de production** (ex. `https://panini-wc26.vercel.app`)
   - `RESEND_API_KEY` et `EMAIL_FROM` (si magic link activé)
3. Déployez — le build script `prisma generate && next build` s'exécute automatiquement

---

## 🗂 Structure du projet

```
panini-wc26/
├── app/                    # Pages Next.js (App Router)
│   ├── collection/         # Vue principale de la collection
│   ├── groups/             # Groupes et échanges
│   ├── stats/              # Statistiques personnelles
│   ├── profile/            # Profil utilisateur
│   └── auth/               # Login / Register
├── components/             # Composants React réutilisables
│   ├── StickerGrid.tsx     # Grille principale de stickers
│   ├── StickerCard.tsx     # Carte individuelle (tap / long-press)
│   ├── BulkInput.tsx       # Ajout en masse par codes
│   └── ...
├── data/
│   └── stickers.ts         # Référentiel complet des 980 + 12 stickers
├── lib/
│   ├── actions/            # Server Actions (collection, groupes, trades)
│   ├── auth.ts             # Configuration NextAuth
│   └── db.ts               # Client Prisma + adaptateur Neon
└── prisma/
    └── schema.prisma       # Modèles de données
```

---

## 📖 L'album en chiffres

| Section | Stickers |
|---|---|
| Intro (FWC) | 9 |
| 48 équipes × 20 | 960 |
| FIFA Museum | 11 |
| **Total officiel** | **980** |
| Coca-Cola (extras) | +12 |

Les équipes sont affichées dans l'**ordre exact du livret Panini WC26** (Groupe A → Groupe L).

---

## 📄 Licence

MIT — Projet personnel, non affilié à Panini ou à la FIFA.
