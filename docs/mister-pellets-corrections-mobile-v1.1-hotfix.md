# Mister Pellets — HOTFIX CRITIQUE Mobile (V1.1)

> **Document de réparation urgent destiné à Claude Code.**
> La dernière vague de modifications a introduit des régressions critiques sur la version mobile. Ce document liste les corrections à appliquer **EN PRIORITÉ ABSOLUE**, avant toute autre tâche.
> Ce document complète et corrige le V1 (`mister-pellets-corrections-mobile-v1.md`).
> Date : mai 2026.

---

## ⚠️ AVERTISSEMENT PRÉALABLE

**Avant toute nouvelle modification :**

1. **Identifier le dernier commit qui fonctionnait correctement** sur mobile (avant la dernière vague de modifications)
2. **Comparer le diff** entre cet état stable et l'état actuel
3. **Comprendre ce qui a été cassé** avant de réparer (ne pas empiler des correctifs sur du code cassé)
4. Si nécessaire : **revert** des changements problématiques et reprendre proprement

**Règle absolue** : à partir de maintenant, **chaque modification touchant à la navbar, au layout mobile ou au footer DOIT être validée visuellement sur preview Vercel mobile AVANT le commit suivant.**

---

## 0. Résumé des régressions critiques

| # | Régression | Sévérité |
|---|---|---|
| H1 | Navbar actuelle dégradée — restaurer la version d'avant | 🔴 BLOQUANTE |
| H2 | Site non aligné sur mobile, débordements horizontaux, largeur non respectée | 🔴 BLOQUANTE |
| H3 | Footer : texte de couleur identique au fond (illisible) OU contenu démesurément grand | 🔴 BLOQUANTE |
| H4 | Logo footer incorrect — utiliser le logo Mister Pellets EN COULEUR (pas la version actuelle) | 🔴 BLOQUANTE |

**Aucune autre modification n'est autorisée tant que ces 4 points ne sont pas réglés.**

---

## H1. Navbar — RESTAURER LA VERSION PRÉCÉDENTE

### H1.1 Constat

La navbar actuelle (issue de la dernière modification) est dégradée. La version qui fonctionnait correctement est celle qui était en place **avant la dernière modification**.

### H1.2 Action

1. **Identifier dans l'historique Git** le dernier commit où la navbar fonctionnait correctement
   - Commande utile : `git log --oneline -- components/layout/NavbarSticky.tsx` (adapter au chemin réel)
   - Repérer la version antérieure stable
2. **Restaurer cette version** de la navbar :
   - Soit via `git checkout <commit-hash> -- <chemin-du-fichier-navbar>` pour récupérer uniquement ce fichier
   - Soit en revenant manuellement au code précédent
3. **Tester en preview Vercel mobile** que la navbar restaurée fonctionne correctement (apparition au scroll, 4 actions, bouton central surélevé orange, safe-area iOS, etc.)
4. **Commit isolé** : "revert: restore previous working mobile navbar"

### H1.3 Spécifications de la navbar attendue (rappel)

La navbar flottante mobile sticky bottom comporte **4 actions**, dans cet ordre :
- 🏠 **Accueil**
- 🛒 **Boutique**
- 🔥 **Devis** (bouton **central surélevé**, orange flame `#F28A20`, plus gros, ressort visuellement type apps Revolut/Uber)
- 📅 **Rendez-vous**

**Caractéristiques techniques** :
- Position : `fixed`, `bottom: 0`
- Hauteur : 72 px
- Fond : beige/cream `#FAF7F0` avec ombre vers le haut (`box-shadow: 0 -4px 16px rgba(20, 36, 27, 0.08)`)
- Largeur : 100 % de la viewport (jamais de débordement)
- Item actif : souligné en vert deep `#174724`
- Icônes : Lucide React (`Home`, `ShoppingBag`, `Flame`, `Calendar`)
- Safe-area iOS : `padding-bottom: env(safe-area-inset-bottom)` (obligatoire)
- Présente sur **100 % des pages** sans exception (pas de header mobile par-dessus)
- z-index élevé pour passer au-dessus de tout le contenu (recommandation : `z-50` Tailwind ou supérieur)

### H1.4 À NE PAS faire

- Ne pas tenter de "réparer" la navbar actuelle par patches successifs
- Ne pas la reconstruire de zéro si une version précédente fonctionnait
- Ne pas la supprimer même temporairement (la navbar est l'**unique** point de navigation mobile depuis la suppression du header)

---

## H2. Layout mobile — alignement et largeur

### H2.1 Constat

Le site n'est pas correctement aligné sur mobile. Il y a des **débordements horizontaux** et la largeur de la page n'est **pas respectée**. C'est la régression la plus visible et la plus invalidante pour l'expérience utilisateur.

### H2.2 Causes les plus probables (à investiguer)

Par ordre de fréquence, voici ce que Claude Code doit vérifier :

1. **Image ou vidéo sans `max-width: 100%`** qui déborde du conteneur
2. **Largeur fixe en pixels** (ex : `width: 1280px`) au lieu d'une largeur fluide (`width: 100%` ou `max-width: 100vw`)
3. **Padding ou margin négatif** trop large par rapport à l'écran
4. **Un `min-width` sur un élément** qui force la viewport à s'élargir
5. **Une grille (grid/flex) sans `min-width: 0`** sur ses enfants — bug classique qui fait déborder le contenu
6. **Un texte non coupé** (`white-space: nowrap` sans `overflow`) qui pousse le layout
7. **Un composant tiers** (iframe, embed, calendar widget) qui n'est pas responsive
8. **`box-sizing` manquant** sur certains éléments (devrait être `border-box` partout)
9. **`overflow-x: hidden`** appliqué seulement sur le `body` mais pas sur `html` (ou inversement)

### H2.3 Action — diagnostic systématique

**Étape 1 — Identifier la page la plus problématique** :
- Tester chaque page principale en preview Vercel mobile (DevTools iPhone 12/13/14)
- Repérer les pages avec scroll horizontal, débordement visible, ou contenu qui sort des marges

**Étape 2 — Trouver l'élément coupable** :
- Console DevTools, exécuter ce snippet pour identifier les éléments qui débordent :

```javascript
// À coller dans la console du navigateur en mode mobile
[...document.querySelectorAll('*')].forEach(el => {
  if (el.offsetWidth > document.documentElement.offsetWidth) {
    console.log('OVERFLOW:', el, 'width:', el.offsetWidth, 'vs viewport:', document.documentElement.offsetWidth);
  }
});
```

**Étape 3 — Corriger les éléments fautifs** :
- Pour chaque élément débordant, identifier la cause (largeur fixe, padding négatif, image non contrainte, etc.) et corriger à la racine
- **Ne pas masquer le problème avec `overflow-x: hidden`** sur le body — c'est un patch, pas une solution

### H2.4 Règles de protection à mettre en place (préventives)

Ajouter dans le CSS global (`globals.css` ou équivalent), en début de fichier :

```css
/* Protection viewport mobile — empêche tout débordement horizontal */
html, body {
  overflow-x: hidden;
  max-width: 100vw;
}

/* Toutes les images sont fluides par défaut */
img, video, iframe, embed, object {
  max-width: 100%;
  height: auto;
}

/* Box-sizing universel */
*, *::before, *::after {
  box-sizing: border-box;
}

/* Conteneurs principaux ne dépassent jamais la viewport */
.container, main, section, article, header, footer, nav {
  max-width: 100vw;
  overflow-x: clip; /* Plus moderne que hidden, ne crée pas de scroll context */
}
```

**Conteneur de page recommandé** :
- Mobile : `padding-inline: 16px`, `width: 100%`, `max-width: 100%`
- Tablette : `padding-inline: 24px`
- Desktop (à venir) : `padding-inline: 32px`, `max-width: 1280px`, `margin-inline: auto`

### H2.5 Vérification finale

Après correction, faire un tour systématique sur :
- iPhone SE (375×667) — la résolution la plus contraignante
- iPhone 12/13/14 Pro (390×844)
- Pixel 7 (412×915)
- iPad Mini portrait (768×1024)

Sur **chacune des pages principales** : Accueil, Boutique, Page produit, Page marque, Page ville, Devis, Prendre RDV, Blog, Article, À propos, Contact.

**Critère de succès** : aucun scroll horizontal sur aucune de ces pages, sur aucune de ces résolutions.

---

## H3. Footer mobile — bug d'affichage

### H3.1 Constat

Le footer présente un problème grave et incohérent :
- **Soit** le texte est de **couleur identique au fond** (donc invisible / illisible)
- **Soit** son contenu est **démesurément grand** (occupe une portion énorme de l'écran sans justification)

Ces deux symptômes peuvent se présenter alternativement selon les pages, ce qui suggère un problème de **CSS conditionnel mal appliqué** ou de **composant footer non uniformisé**.

### H3.2 Action — refonte propre du composant Footer

**Étape 1 — Auditer l'état actuel** :
- Localiser le composant `<Footer />` dans le code (probablement `components/layout/Footer.tsx`)
- Vérifier s'il existe **plusieurs versions** du footer (un par section, un global) — si oui, en garder un seul
- Vérifier les **classes Tailwind / styles CSS** appliquées : couleurs de fond, couleurs de texte, espacements

**Étape 2 — Spécifications strictes du footer mobile** :

#### Couleurs (NON-NÉGOCIABLES — contraste WCAG AA)

| Élément | Couleur fond | Couleur texte | Ratio contraste |
|---|---|---|---|
| Fond principal du footer | Vert deep `#174724` | Texte beige `#FAF7F0` | 11.8:1 ✅ |
| OU Fond alternatif | Beige `#F4F1E8` | Texte ink `#14241B` | 14.2:1 ✅ |
| Liens | Inherit du parent | Orange flame `#F28A20` au hover | À vérifier |
| Titres de colonnes | Inherit | Plus gras (font-weight: 600) | — |

**Choisir UNE seule combinaison** (recommandation : fond vert deep + texte beige, plus distinctif et marquant). **Ne jamais mixer** les deux dans le même footer.

#### Dimensions

- **Hauteur cible mobile** : 400 à 550 px (compact mais lisible)
- **Padding intérieur** : 32 px en haut et en bas, 16 px sur les côtés
- **Espacement entre blocs** : 24 px
- **Marge entre les liens** : 12 px verticalement
- **Largeur** : 100 % de la viewport (jamais de débordement)

#### Structure verticale (mobile, du haut vers le bas)

```
┌─────────────────────────────────────┐
│ [LOGO MISTER PELLETS COULEUR]       │  ← voir H4 ci-dessous
│                                     │
│ Vente, pose et entretien de poêles  │
│ à pellets en Wallonie depuis 2016   │
├─────────────────────────────────────┤
│ NAVIGATION                          │
│ • Boutique                          │
│ • Nos marques                       │
│ • Demander un devis                 │
│ • Prendre rendez-vous               │
│ • Blog                              │
│ • FAQ                               │
├─────────────────────────────────────┤
│ NOUS CONTACTER                      │
│ 📞 0472 04 32 22                    │
│ ✉️  info@awlest.com                 │
│ 📍 Rue des Fagotis 3A               │
│    5380 Fernelmont                  │
├─────────────────────────────────────┤
│ INFORMATIONS LÉGALES                │
│ • Mentions légales                  │
│ • CGV                               │
│ • Politique de confidentialité      │
│ • Politique cookies                 │
├─────────────────────────────────────┤
│ Awlest SRL · TVA BE 0656.514.212    │
│ © 2026 Mister Pellets               │
│ Tous droits réservés                │
└─────────────────────────────────────┘
                                       ← Espace pour navbar flottante (72px)
```

#### Espace réservé navbar flottante

⚠️ **CRITIQUE** : la navbar flottante prend ~72 px en bas de l'écran. Le footer DOIT inclure un `padding-bottom` de **96 px** (72 px navbar + 24 px de respiration) pour que le contenu du footer ne soit jamais masqué par la navbar.

```css
footer {
  padding-bottom: calc(96px + env(safe-area-inset-bottom));
}
```

### H3.3 Action — composant Footer propre (référence)

**Pseudo-structure recommandée** (à adapter à la stack Next.js + Tailwind) :

```tsx
<footer className="bg-[#174724] text-[#FAF7F0] w-full max-w-[100vw] overflow-x-clip">
  <div className="px-4 pt-8 pb-[calc(96px+env(safe-area-inset-bottom))]">
    
    {/* Bloc logo + tagline */}
    <div className="mb-8">
      <Image 
        src="/logo-mister-pellets-couleur.svg" 
        alt="Mister Pellets" 
        width={180} 
        height={60}
        className="mb-4"
      />
      <p className="text-sm leading-relaxed opacity-90">
        Vente, pose et entretien de poêles à pellets en Wallonie depuis 2016.
      </p>
    </div>

    {/* Navigation */}
    <div className="mb-8">
      <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide opacity-80">Navigation</h3>
      <ul className="space-y-3">
        <li><Link href="/boutique/" className="hover:text-[#F28A20] transition-colors">Boutique</Link></li>
        {/* ... */}
      </ul>
    </div>

    {/* Contact */}
    <div className="mb-8">
      <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide opacity-80">Nous contacter</h3>
      <ul className="space-y-3">
        <li>
          <a href="tel:+32472043222" className="flex items-center gap-2 hover:text-[#F28A20]">
            <Phone size={16} /> 0472 04 32 22
          </a>
        </li>
        {/* ... */}
      </ul>
    </div>

    {/* Mentions */}
    <div className="mb-8">
      <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide opacity-80">Informations légales</h3>
      <ul className="space-y-3 text-sm">
        <li><Link href="/mentions-legales/">Mentions légales</Link></li>
        {/* ... */}
      </ul>
    </div>

    {/* Copyright */}
    <div className="pt-6 border-t border-[#FAF7F0]/20 text-xs opacity-75 leading-relaxed">
      <p>Awlest SRL · TVA BE 0656.514.212</p>
      <p>© 2026 Mister Pellets — Tous droits réservés</p>
    </div>

  </div>
</footer>
```

### H3.4 Tests obligatoires après correction

- ✅ Tout le texte est **lisible** (contraste vérifié)
- ✅ Le footer ne **déborde pas** horizontalement
- ✅ Le footer fait une **hauteur raisonnable** (400-550 px)
- ✅ Le contenu n'est **pas masqué** par la navbar flottante
- ✅ Tous les **liens cliquables** fonctionnent
- ✅ Le téléphone et l'email sont **cliquables** (`tel:` et `mailto:`)
- ✅ Cohérent sur **toutes les pages** du site (un seul composant Footer, partagé)

---

## H4. Logo du footer — utiliser le logo Mister Pellets EN COULEUR

### H4.1 Constat

Le logo actuellement affiché dans le footer n'est **pas le bon**. Le logo demandé est le **logo Mister Pellets EN COULEUR** (pas la version actuellement proposée, quelle qu'elle soit).

### H4.2 Action

1. **Identifier le bon fichier logo** dans `/public/` :
   - Chercher tous les fichiers logo disponibles
   - Identifier celui qui correspond au **logo Mister Pellets en version couleur** (pas la mascotte seule, pas le wordmark mono, pas une version noir et blanc)
   - Si plusieurs candidats : demander confirmation au client avec capture
   - Si introuvable : demander au client le bon fichier

2. **Remplacer dans le composant `<Footer />`** :
   - Mettre à jour le `src` de la balise `<Image />` ou `<img />`
   - Adapter `width` et `height` aux dimensions réelles du logo (le ratio doit être respecté pour éviter toute déformation)
   - **Hauteur recommandée** : 60 à 80 px sur mobile (ni trop petit, ni trop grand)
   - Ajouter `alt="Mister Pellets"` (jamais vide, jamais "logo")

3. **Vérifier la lisibilité** :
   - Si le logo couleur est sur fond vert deep, vérifier que les couleurs du logo restent visibles et lisibles
   - Si problème de contraste : envisager de passer le **fond du footer en beige** plutôt qu'en vert (cf. H3.2)

### H4.3 Distinction des logos disponibles (rappel)

| Fichier | Usage |
|---|---|
| `logo-mister-pellets-wordmark.svg` | Logo texte horizontal (header desktop) |
| `logo-mister-pellets-mascotte.svg` | Mascotte seule (illustrations, pas pour le footer dans cette version) |
| `logo-mister-pellets-full.svg` | Wordmark + mascotte combinés (footer, OG image) — **probablement le bon pour le footer** |
| `logo-mister-pellets-couleur.svg` | Si fichier existant : version couleur dédiée — **à privilégier si disponible** |

**Si Claude Code n'est pas certain du fichier à utiliser** : ne pas deviner. **Demander explicitement au client** quelle version exacte il souhaite, en présentant les fichiers disponibles dans `/public/`.

---

## 1. Workflow imposé pour ce hotfix

### 1.1 Ordre d'exécution OBLIGATOIRE

Ces 4 corrections doivent être appliquées **dans cet ordre précis**, en commits **isolés et testés** :

1. **Commit 1** : `revert: restore previous working mobile navbar` (H1)
2. **Commit 2** : `fix: prevent horizontal overflow on mobile, enforce viewport width` (H2)
3. **Commit 3** : `fix: rebuild mobile footer with proper contrast and dimensions` (H3)
4. **Commit 4** : `fix: use correct color Mister Pellets logo in footer` (H4)

**Entre chaque commit** : **vérification visuelle obligatoire en preview Vercel mobile** avant de passer au suivant.

### 1.2 Tests visuels — capture d'écran exigée

Pour chaque commit, Claude Code doit fournir au client :
- Une **capture d'écran "avant"** de la régression
- Une **capture d'écran "après"** de la correction
- L'**URL de preview Vercel** correspondant au commit

Format de communication souhaité :

> ✅ **Commit 1 — Navbar restaurée**
> Avant : [capture]
> Après : [capture]
> Preview : https://mister-pellets-xxx.vercel.app
> Tests effectués : iPhone SE / iPhone 14 / Pixel 7 — navbar visible et fonctionnelle sur les 3.

### 1.3 Skills à utiliser

- **`/impeccable`** sur chaque modification de présentation (H1, H3, H4 notamment)
- **`/humanizer`** sur tout texte modifié (le footer contient des textes courts mais ils doivent rester naturels — pas d'em-dash, pas de tournures IA)
- **`grep` du caractère `—`** dans le diff avant chaque commit (pour s'assurer qu'aucun em-dash ne se glisse)

### 1.4 Une fois le hotfix terminé

- Mettre à jour le `HANDOVER.md` à la racine du repo avec une nouvelle entrée :
  > **[YYYY-MM-DD]** Hotfix V1.1 appliqué : navbar restaurée, débordement horizontal mobile corrigé, footer refondu, logo couleur dans footer. Validation visuelle effectuée. Reprise des corrections V1 normales possible à partir de maintenant.
- **Reprendre la liste des 23 points du V1** (`mister-pellets-corrections-mobile-v1.md`) **uniquement après** validation du client sur les 4 hotfixes
- **Aucune autre modification** entre-temps : pas de "petits ajouts" en parallèle, pas d'optimisation profitant du commit, rien. Hotfix isolé, validation, ensuite reprise normale.

---

## 2. Règles de protection pour éviter les futures régressions

### 2.1 Règle 1 — Validation visuelle systématique

Toute modification touchant à :
- La navbar (mobile ou desktop)
- Le footer
- Le layout global (containers, padding viewport)
- Les images / médias
- Les composants shared utilisés sur plusieurs pages

…doit être **validée visuellement en preview Vercel mobile** avant le commit suivant. Pas d'exception.

### 2.2 Règle 2 — Pas de modifications en cascade non testées

Si Claude Code travaille sur une session où plusieurs choses sont à modifier :
- **Un commit = une modification** (ou un groupe cohérent et testé ensemble)
- Pas de "je modifie 8 choses puis je teste" — c'est ce qui produit ce genre de régression

### 2.3 Règle 3 — Historique Git propre

- Commits **conventionnels** (`fix:`, `feat:`, `chore:`, `revert:`)
- Messages **explicites** (pas "update", pas "wip")
- Pas de `git push --force` sur `main` ou `develop`
- En cas de doute : créer une **branche** `hotfix/nom-du-fix` et merger après validation

### 2.4 Règle 4 — Tests sur résolutions critiques

Les résolutions de référence pour la validation mobile :
- **iPhone SE (375×667)** — la plus contraignante, à vérifier en priorité
- **iPhone 12/13/14 (390×844)** — résolution la plus courante
- **Pixel 7 (412×915)** — Android moderne typique

Si une page passe sur ces 3 résolutions sans débordement et avec un rendu propre, elle passera partout ailleurs.

### 2.5 Règle 5 — Composants partagés = tests sur plusieurs pages

La navbar et le footer sont sur **toutes les pages**. Toute modification les concernant doit être testée sur **au minimum 4 pages différentes** :
- Page d'accueil
- Une page produit
- La page Devis (formulaire complexe)
- Le Blog (contenu long)

Si ça passe sur ces 4, ça passe partout.

---

## 3. Checklist de validation finale (à cocher après hotfix)

Avant de considérer le hotfix V1.1 comme terminé, vérifier :

**Navbar** (H1)
- [ ] La navbar restaurée s'affiche sur 100 % des pages
- [ ] Les 4 actions sont présentes et cliquables (Accueil / Boutique / Devis / RDV)
- [ ] Le bouton Devis central est surélevé en orange flame
- [ ] Le safe-area iOS est respecté (pas de masquage par la barre Home iPhone)
- [ ] Z-index correct (la navbar passe au-dessus de tout autre contenu)

**Layout mobile** (H2)
- [ ] Aucun scroll horizontal sur l'accueil
- [ ] Aucun scroll horizontal sur la boutique
- [ ] Aucun scroll horizontal sur une page produit
- [ ] Aucun scroll horizontal sur la page Devis
- [ ] Aucun scroll horizontal sur le Blog
- [ ] Test passé sur iPhone SE / iPhone 14 / Pixel 7

**Footer** (H3)
- [ ] Tout le texte est lisible (contraste WCAG AA validé)
- [ ] Le footer ne déborde pas
- [ ] La hauteur est raisonnable (400-550 px)
- [ ] Le contenu n'est pas masqué par la navbar (padding-bottom suffisant)
- [ ] Toutes les coordonnées sont correctes (0472 04 32 22, info@awlest.com, Fernelmont, Awlest SRL, BE 0656.514.212)
- [ ] Tous les liens fonctionnent (mentions, CGV, confidentialité, cookies, navigation)
- [ ] Cohérent sur toutes les pages

**Logo** (H4)
- [ ] Le logo Mister Pellets en couleur est bien affiché dans le footer
- [ ] Sa taille est raisonnable (60-80 px de hauteur)
- [ ] Son alt est correct (`Mister Pellets`)
- [ ] Aucune déformation (ratio respecté)

**Tests généraux**
- [ ] Le site se charge sans erreur console
- [ ] Lighthouse mobile : Performance ≥ 90, Accessibility ≥ 95
- [ ] Aucune régression visible par rapport à l'état stable précédent

---

## 4. Si Claude Code rencontre un blocage

### 4.1 Blocage technique

Si Claude Code ne parvient pas à identifier le commit Git stable précédent :
- **Stop** : ne pas tenter de reconstruire la navbar à l'aveugle
- **Demander au client** un screenshot de la version qui fonctionnait
- **Décrire le diagnostic effectué** dans le message au client

### 4.2 Blocage sur le logo

Si Claude Code ne sait pas quel fichier logo utiliser :
- Lister tous les fichiers logo disponibles dans `/public/`
- Présenter les options au client avec un aperçu visuel si possible
- **Ne pas deviner** : attendre la réponse du client avant de commiter

### 4.3 Blocage sur le débordement horizontal

Si l'élément coupable n'est pas identifié après le snippet console :
- Désactiver chaque section de la page une par une (commenter dans le code)
- Identifier la section qui réintroduit le bug
- Diagnostiquer dans cette section
- Si toujours pas trouvé : **isoler dans un sandbox CodeSandbox / StackBlitz** et demander de l'aide

---

## 5. Reprise des corrections V1 normales

**Une fois ce hotfix V1.1 validé par le client**, Claude Code peut **reprendre la liste des 23 points** du document `mister-pellets-corrections-mobile-v1.md` :

- Points déjà traités (à vérifier qu'ils sont toujours valides après le revert) :
  - Vérifier que le contenu de la page d'accueil enrichi (point 1) est toujours en place
  - Vérifier que le logo central agrandi (point 2) est toujours en place
  - Vérifier les filtres boutique enrichis (point 5)
  - Vérifier la suppression du header mobile (point 8) — qui fait partie du choix maintenu
  - Vérifier les champs obligatoires du devis (point 9)
  - Vérifier la correction des primes Wallonie (point 14) — **CRITIQUE**
  - Vérifier la correction de l'année 2016 et la suppression RGIE (point 16)
- Points encore à traiter selon l'avancement réel
- Audit final (point 22) une fois tout terminé

**Important** : si le revert de la navbar a écrasé d'autres modifications utiles, ne pas les recréer dans le même commit que le revert. Procéder en commits séparés et bien identifiés.

---

## 6. Annexes

### 6.1 Documents de référence

- `HANDOVER.md` (à la racine du repo) — règles de continuité (à mettre à jour après hotfix)
- `docs/mister-pellets-brief-fullcode.md` — brief technique complet
- `docs/mister-pellets-corrections-mobile-v1.md` — corrections mobile V1 (23 points)
- `docs/mister-pellets-corrections-mobile-v1.1-hotfix.md` — **ce document** (hotfix urgent)
- `docs/mister-pellets-corrections-desktop-v2.md` — à venir (corrections desktop)

### 6.2 Coordonnées projet (rappel)

- **Nom commercial** : Mister Pellets
- **Société** : Awlest SRL
- **TVA** : BE 0656.514.212
- **Adresse** : Rue des Fagotis 3A, 5380 Fernelmont
- **Téléphone** : 0472 04 32 22
- **Email** : info@awlest.com
- **Année de création** : **2016**
- **Avis Google** : 4.9★ / 200 avis

### 6.3 Palette officielle (rappel — utile pour le footer)

```
Verts    : #102916 (darkest) · #174724 (deep, principal) · #377038 (mid) · #508943 (light)
Oranges  : #F28A20 (flame, principal) · #FDB842 (warm) · #FFE4D1 (light)
Beiges   : #FAF7F0 (cream, fond dominant) · #F4F1E8 (beige) · #EAE0CB (warm) · #C8B68F (sand)
Neutres  : #14241B (ink) · #4A5A50 (ink-soft) · #2A1F15 (bark, accent rare)
```

---

**Fin du document V1.1 (hotfix mobile).**

*À traiter en priorité absolue, avant toute reprise des corrections normales du V1.*

*Version 1.1 — Mai 2026.*
