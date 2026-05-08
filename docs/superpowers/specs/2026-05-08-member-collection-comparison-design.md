# Design : Collection des membres & Comparatif d'échanges

**Date :** 2026-05-08  
**Statut :** Approuvé

---

## Contexte

Les membres d'un groupe ne peuvent pas voir la collection des autres ni avoir une vue claire des échanges possibles. La page de trades existante est fonctionnellement correcte mais visuellement inutilisable.

---

## Objectifs

1. Permettre à un membre de voir la collection d'un autre membre du même groupe (lecture seule).
2. Fournir un comparatif visuel entre sa propre collection et celle d'un autre membre, montrant les échanges possibles avec leur emplacement dans la collection.
3. Redesigner la page trades pour en faire un point d'entrée agréable et lisible.

---

## Architecture

### Nouvelles routes

| Route | Statut | Description |
|---|---|---|
| `/groups/[groupId]/trades` | Existante — redesign | Vue d'ensemble des échanges par membre |
| `/groups/[groupId]/members/[memberId]` | Nouvelle | Collection d'un membre en lecture seule |
| `/groups/[groupId]/compare/[memberId]` | Nouvelle | Comparatif détaillé entre soi et un membre |

### Server Actions

Aucune nouvelle server action nécessaire. Les actions existantes suffisent :

- `getGroupWithMembers(groupId)` — liste des membres avec stats
- `getUserCollectionById(targetUserId)` — collection d'un autre membre (avec vérification de membership partagé)
- `getTradeMatrix(groupId)` — matrice d'échanges pour toutes les paires du groupe

### Contrôle d'accès

Toutes les pages vérifient que l'utilisateur courant appartient au même groupe que le membre cible. Cette logique est déjà encapsulée dans les server actions existantes.

---

## Page 1 — Redesign de la page Trades

**Route :** `/groups/[groupId]/trades`

### Header
- Titre : "Échanges possibles"
- Résumé global : "X échanges potentiels dans le groupe"

### Cartes membres
Une carte par membre du groupe (hors soi-même), en grille responsive.

Chaque carte affiche :
- Nom du membre + nombre de stickers collectés
- Compteur **"Tu peux lui donner : N"**
- Compteur **"Tu peux recevoir : N"**
- Mini-barres par équipe indiquant où se concentrent les échanges
- Lien "Voir le comparatif" → `/groups/[groupId]/compare/[memberId]`

### Tri
Cartes triées par nombre total d'échanges possibles décroissant.

### État vide
Si aucun échange n'est possible avec un membre, la carte est affichée en atténué (opacity réduite) plutôt que masquée — tous les membres restent visibles.

### Point d'entrée depuis la page groupe

Dans la page `/groups/[groupId]`, les noms des membres dans la liste deviennent des liens cliquables vers `/groups/[groupId]/members/[memberId]`.

---

## Page 2 — Collection d'un membre (lecture seule)

**Route :** `/groups/[groupId]/members/[memberId]`

### Header
- Nom du membre
- Nombre de stickers collectés / total + barre de progression globale
- Breadcrumb : Groupe → [Nom du membre]
- Bouton CTA : "Comparer avec ma collection" → `/groups/[groupId]/compare/[memberId]`

### Grille
Réutilisation du composant `StickerGrid` existant avec un prop `readOnly={true}` qui :
- Désactive le tap (cycle quantité)
- Désactive le long-press (modal quantité)
- Désactive la synchro localStorage
- Ne déclenche pas `upsertSticker`

Les 3 états visuels (manquant / possédé / doublon) restent affichés.

---

## Page 3 — Comparatif

**Route :** `/groups/[groupId]/compare/[memberId]`

### Header
- Titre : "Toi vs [Nom du membre]"
- Deux compteurs côte à côte :
  - **"Tu peux donner : N"**
  - **"Tu peux recevoir : N"**

### Organisation par équipe
Pour chaque équipe ayant au moins un échange possible, une section affiche :
- Nom de l'équipe + compteur d'échanges (ex. "France — 3 échanges")
- Mini-grille des stickers de l'équipe

### Codes couleur par sticker
Chaque sticker affiche deux pastilles (toi / l'autre) :

| Couleur | Signification |
|---|---|
| Vert | Tu peux donner : tu as doublon (≥2), l'autre a 0 |
| Bleu | Tu peux recevoir : l'autre a doublon (≥2), tu as 0 |
| Gris | Pas d'échange possible |

### Tri & filtrage
- Équipes triées par nombre d'échanges décroissant
- Équipes sans échange masquées par défaut
- Toggle "Voir toutes les équipes" pour les afficher

### État vide
Si aucun échange n'est possible entre les deux utilisateurs (ni canGive, ni canReceive), afficher un message "Aucun échange possible pour l'instant" avec un lien retour vers la page trades.

### Données
`getTradeMatrix(groupId)` retourne déjà `canGive[]` et `canReceive[]` pour toutes les paires du groupe. On filtre côté client sur la paire `(currentUser, memberId)` — pas de nouvelle server action nécessaire.

---

## Composants à créer ou modifier

| Composant | Action | Description |
|---|---|---|
| `StickerGrid` | Modifier | Ajouter prop `readOnly?: boolean` |
| `MemberCollectionPage` | Créer | Page `/members/[memberId]` |
| `TradesPage` | Modifier | Redesign complet |
| `MemberTradeCard` | Créer | Carte membre pour la page trades |
| `ComparePage` | Créer | Page `/compare/[memberId]` |
| `CompareTeamSection` | Créer | Section par équipe dans le comparatif |
| `CompareStickerCell` | Créer | Cellule avec deux pastilles (toi / autre) |

---

## Ce qui ne change pas

- La logique serveur (server actions) — aucune modification
- Le schéma de base de données — aucune modification
- Le composant `StickerGrid` en mode normal — uniquement un prop optionnel ajouté
