# Mister Pellets — HOTFIX V1.2 Mobile

> **Document de réparation urgent destiné à Claude Code.**
> Suite directe du hotfix V1.1. Trois nouveaux points critiques à traiter.
> Workflow et règles de protection identiques au V1.1 (commits isolés, validation visuelle entre chaque commit, `/humanizer` sur tout texte, `/impeccable` sur la présentation).
> Date : mai 2026.

---

## 0. Résumé des points à traiter

| # | Point | Sévérité |
|---|---|---|
| H5 | Tableau "Poêle à pellets vs autres modes de chauffage" déborde du cadre sur mobile | 🔴 BLOQUANTE |
| H6 | Footer mobile à réduire fortement : minimal, infos essentielles + 3 réseaux sociaux uniquement | 🔴 BLOQUANTE |
| H7 | Informations sur les marques de poêles à rectifier — actuellement fausses ou trop réductrices | 🔴 BLOQUANTE |

**Workflow imposé pour ce hotfix** :
1. **Commit 1** : `fix: prevent comparison table horizontal overflow on mobile` (H5)
2. **Commit 2** : `feat: minimalist mobile footer with essential info and social links` (H6)
3. **Commit 3** : `fix: rectify brand information for Edilkamin, EK63, Dielle, Ferlux` (H7)

Validation visuelle exigée entre chaque commit (capture avant/après + URL preview Vercel).

---

## H5. Tableau comparatif "Poêle à pellets vs autres modes de chauffage" — débordement

### H5.1 Constat

Le tableau présent sur la page d'accueil qui compare le poêle à pellets aux autres modes de chauffage **dépasse légèrement du cadre** sur mobile. Symptôme : scroll horizontal apparaît, ou la dernière colonne est tronquée, ou le contenu touche le bord droit de l'écran.

### H5.2 Causes les plus probables

Par ordre de fréquence :

1. **Tableau HTML classique** (`<table>`) avec colonnes en pixels fixes ou en `min-width` qui forcent l'élargissement
2. **Texte non sécable** dans une cellule (mots longs type "consommation" non coupés)
3. **Padding latéral cellules** trop important pour la largeur disponible
4. **Largeur du conteneur parent** mal calculée (oubli de `max-width: 100%`)
5. **Bordures qui s'ajoutent** au calcul si `box-sizing: content-box` au lieu de `border-box`

### H5.3 Action — solution recommandée

**Option A (préférable) — Conserver le format tableau, le rendre responsive proprement** :

```tsx
<div className="w-full overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
  <div className="min-w-full">
    <table className="w-full text-sm">
      {/* contenu */}
    </table>
  </div>
</div>
```

- `overflow-x-auto` permet un scroll horizontal contrôlé **dans le tableau seul** (pas la page)
- `-mx-4 px-4` permet au tableau de toucher les bords sur mobile pour gagner de la place sans casser le padding du conteneur parent
- Réduire la taille de police à `text-sm` (14px) ou `text-xs` (12px) sur mobile uniquement (`text-sm sm:text-base`)
- Réduire le padding des cellules sur mobile : `px-2 py-2 sm:px-4 sm:py-3`

**Option B (recommandée pour ce cas spécifique) — Convertir le tableau en cards empilées sur mobile** :

Sur mobile (< 640px), abandonner le format tableau et afficher chaque mode de chauffage sous forme de **carte** avec ses caractéristiques en liste interne. Sur tablette / desktop, restaurer le format tableau.

Exemple de structure :

```
┌──────────────────────────────────┐
│ 🔥 Poêle à pellets               │
│ Coût annuel : ~900 €             │
│ CO2 : très faible                │
│ Confort : excellent              │
│ Prime 2026 : jusqu'à 960 €       │
├──────────────────────────────────┤
│ 🛢️ Mazout                        │
│ Coût annuel : ~2 100 €           │
│ ...                              │
└──────────────────────────────────┘
```

Avantages de l'option B :
- **Aucun risque de débordement** sur mobile, quelle que soit la résolution
- **Lisibilité supérieure** sur petit écran (pas besoin de scroller horizontalement, pas de texte minuscule)
- **Meilleur SEO/GEO** : chaque ligne devient un bloc autonome, plus facile à indexer

**Choix recommandé pour Mister Pellets** : **Option B** sur mobile, format tableau classique conservé sur desktop.

### H5.4 Données à afficher (rappel)

Modes de chauffage à comparer :
- 🔥 **Poêle à pellets** (Mister Pellets)
- 🛢️ **Mazout**
- ⛽ **Gaz naturel**
- 💨 **Pompe à chaleur**

Critères de comparaison (4-5 lignes max) :
- **Coût annuel moyen** (maison 150 m², Wallonie, prix 2026)
- **Émissions CO2**
- **Investissement initial**
- **Prime régionale 2026** (montants exacts du V1)
- **Confort thermique**

**Source des chiffres** : doivent être vérifiés et sourcés. Si Claude Code n'a pas de source fiable, utiliser une fourchette ("environ" / "à partir de") plutôt qu'un chiffre précis inventé.

### H5.5 Test après correction

- Tester sur iPhone SE (375 px) : aucun débordement, lisibilité confortable
- Tester sur iPhone 14 (390 px) et Pixel 7 (412 px) : idem
- Tester sur tablette (768 px) et desktop : tableau classique propre

---

## H6. Footer mobile — version minimaliste

### H6.1 Nouvelle directive

**Annule et remplace** la spécification du footer du V1.1 (qui prévoyait 4 sections : Logo, Navigation, Contact, Légal).

**Nouveau cahier des charges** : footer **minimaliste**, **bcp plus petit**, contenant **uniquement les informations essentielles** et les **3 réseaux sociaux**.

### H6.2 Contenu strict du nouveau footer mobile

Ordre vertical :

```
┌─────────────────────────────────────┐
│ [LOGO MISTER PELLETS COULEUR]       │  ← taille modérée (50-60px de hauteur)
│                                     │
│ 📞 0472 04 32 22                    │  ← cliquable
│ ✉️  info@awlest.com                 │  ← cliquable
│ 📍 Rue des Fagotis 3A, Fernelmont   │
│                                     │
│ ─── Suivez-nous ───                 │
│ [TikTok] [Instagram] [YouTube]      │  ← 3 icônes alignées
│                                     │
│ ─────────────────────────           │
│ Mentions · CGV · Confidentialité    │  ← liens compacts en ligne, séparés par "·"
│                                     │
│ Awlest SRL · TVA BE 0656.514.212    │  ← très petit, en bas
│ © 2026 Mister Pellets               │
└─────────────────────────────────────┘
                                       ← Padding-bottom navbar (96px)
```

### H6.3 Ce qui est retiré par rapport au V1.1

❌ **Bloc Navigation** (Boutique, Nos marques, Devis, RDV, Blog, FAQ) — la navbar flottante remplit déjà ce rôle, doublon inutile
❌ **Tagline descriptive** ("Vente, pose et entretien de poêles à pellets en Wallonie depuis 2016") — supprimée pour alléger
❌ **Titres de sections** ("NAVIGATION", "NOUS CONTACTER", "INFORMATIONS LÉGALES") — pas nécessaires en version compacte

### H6.4 Ce qui est ajouté

✅ **3 icônes réseaux sociaux** alignées horizontalement :
- **TikTok** (icône officielle TikTok)
- **Instagram** (icône Instagram, dégradé orange/rose ou monochrome selon le fond)
- **YouTube** (icône YouTube, rouge ou monochrome selon le fond)

**Comportement des icônes** :
- Taille : 32×32 px
- Espacement entre icônes : 16-20 px
- Au clic : ouverture du profil correspondant dans un **nouvel onglet** (`target="_blank" rel="noopener noreferrer"`)
- Hover : transition de couleur subtile (200ms)
- Aria-label sur chaque icône : "Mister Pellets sur TikTok", "Mister Pellets sur Instagram", "Mister Pellets sur YouTube"

**URLs des profils** : à fournir par le client. En attendant, utiliser des liens placeholder (`#tiktok`, `#instagram`, `#youtube`) avec un commentaire dans le code `// TODO: remplacer par les vraies URLs des profils Mister Pellets`.

### H6.5 Spécifications techniques (rappel et précision)

**Couleurs** (NON-NÉGOCIABLES — contraste WCAG AA) :
- **Fond du footer** : vert deep `#174724`
- **Texte principal** : beige `#FAF7F0`
- **Liens (Mentions, CGV, etc.)** : beige `#FAF7F0` avec opacity 80%, hover orange flame `#F28A20`
- **Icônes sociales** : beige `#FAF7F0`, hover orange flame `#F28A20`
- **Texte légal en bas** : beige `#FAF7F0` avec opacity 60%

**Dimensions cibles** :
- **Hauteur totale** : 280 à 350 px (vs 400-550 px en V1.1)
- **Padding intérieur** : 24 px en haut, 24 px en bas (avant le calcul navbar)
- **Padding latéral** : 16 px
- **Espacement entre blocs** : 20 px
- **Largeur** : 100 % de la viewport, jamais de débordement

**Espace navbar** :
```css
footer {
  padding-bottom: calc(96px + env(safe-area-inset-bottom));
}
```

### H6.6 Composant Footer minimaliste — pseudo-structure

```tsx
<footer className="bg-[#174724] text-[#FAF7F0] w-full max-w-[100vw] overflow-x-clip">
  <div className="px-4 pt-6 pb-[calc(96px+env(safe-area-inset-bottom))] flex flex-col items-center text-center gap-5">
    
    {/* Logo */}
    <Image 
      src="/logo-mister-pellets-couleur.svg" 
      alt="Mister Pellets" 
      width={160} 
      height={54}
    />
    
    {/* Coordonnées */}
    <div className="flex flex-col gap-2 text-sm">
      <a href="tel:+32472043222" className="flex items-center justify-center gap-2 hover:text-[#F28A20] transition-colors">
        <Phone size={16} /> 0472 04 32 22
      </a>
      <a href="mailto:info@awlest.com" className="flex items-center justify-center gap-2 hover:text-[#F28A20] transition-colors">
        <Mail size={16} /> info@awlest.com
      </a>
      <p className="flex items-center justify-center gap-2 opacity-90">
        <MapPin size={16} /> Rue des Fagotis 3A, 5380 Fernelmont
      </p>
    </div>
    
    {/* Réseaux sociaux */}
    <div className="flex items-center gap-5 pt-2">
      <a href="#tiktok" target="_blank" rel="noopener noreferrer" aria-label="Mister Pellets sur TikTok" className="hover:text-[#F28A20] transition-colors">
        <TikTokIcon size={32} />
      </a>
      <a href="#instagram" target="_blank" rel="noopener noreferrer" aria-label="Mister Pellets sur Instagram" className="hover:text-[#F28A20] transition-colors">
        <Instagram size={32} />
      </a>
      <a href="#youtube" target="_blank" rel="noopener noreferrer" aria-label="Mister Pellets sur YouTube" className="hover:text-[#F28A20] transition-colors">
        <Youtube size={32} />
      </a>
    </div>
    
    {/* Liens légaux compacts */}
    <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs opacity-80 pt-2 border-t border-[#FAF7F0]/20 w-full">
      <Link href="/mentions-legales/" className="hover:text-[#F28A20]">Mentions légales</Link>
      <span>·</span>
      <Link href="/cgv/" className="hover:text-[#F28A20]">CGV</Link>
      <span>·</span>
      <Link href="/politique-confidentialite/" className="hover:text-[#F28A20]">Confidentialité</Link>
      <span>·</span>
      <Link href="/politique-cookies/" className="hover:text-[#F28A20]">Cookies</Link>
    </div>
    
    {/* Copyright minimal */}
    <div className="text-[10px] opacity-60 leading-relaxed">
      <p>Awlest SRL · TVA BE 0656.514.212</p>
      <p>© 2026 Mister Pellets</p>
    </div>
    
  </div>
</footer>
```

**Note sur l'icône TikTok** : Lucide React n'inclut pas l'icône TikTok dans ses exports standards. Solutions :
- Importer depuis `react-icons/si` : `import { SiTiktok } from "react-icons/si"`
- Ou utiliser un SVG inline depuis simpleicons.org
- Ou installer `@icons-pack/react-simple-icons`

### H6.7 Tests obligatoires après correction

- [ ] Footer compact (< 350 px de hauteur, hors padding navbar)
- [ ] Aucun débordement horizontal
- [ ] Tout le texte lisible (contraste vérifié)
- [ ] Téléphone + email cliquables
- [ ] Les 3 icônes réseaux ouvrent dans un nouvel onglet
- [ ] Les 4 liens légaux fonctionnent
- [ ] Cohérent sur toutes les pages du site

---

## H7. Informations sur les marques — RECTIFICATION FACTUELLE

### H7.1 Constat

Les positionnements actuels des 4 marques distribuées par Mister Pellets sont **faux ou très réducteurs**. Cas typique : "Dielle = hydro uniquement" — c'est inexact. Dielle propose une gamme complète (air, canalisable, hydro). Idem pour les autres marques.

Une mention erronée sur le site induit le client en erreur et nuit à la crédibilité de Mister Pellets.

### H7.2 Action

Remplacer **toutes les descriptions actuelles** des 4 marques par les fiches rectifiées ci-dessous, sur :
- Page d'accueil (section "Nos marques")
- Pages marques individuelles (`/nos-marques/edilkamin/`, `/nos-marques/ek63/`, `/nos-marques/dielle/`, `/nos-marques/ferlux/`)
- Page hub `/nos-marques/`
- Tout autre endroit où les marques sont mentionnées

**Toutes les rédactions finales doivent passer par `/humanizer`** — les fiches ci-dessous sont des **briefs factuels**, pas des textes prêts à publier.

### H7.3 Fiche Edilkamin — RECTIFIÉE

| Champ | Valeur correcte |
|---|---|
| **Pays** | Italie |
| **Année de création** | **1963** |
| **Siège** | Lainate (Milan), Italie |
| **Positionnement** | Premium reconnu, pionnier italien du chauffage biomasse |
| **Gamme** | **Très large** : poêles à pellets air, canalisables, **hydro** (thermostufas), inserts, poêles à bois, cuisinières (via filiales Italiana Camini et Kitchen Kamin) |

**Faits techniques avérés** :
- Edilkamin propose **toutes les configurations** : air, canalisable, étanche, hydro, inserts
- Modèles connus : **Blade**, **Cherie Up**, **Kira H**, **Vyda H**, etc.
- Gammes hydro (suffixe H) capables d'alimenter radiateurs et plancher chauffant, combinables avec panneaux solaires ou chaudière gaz
- Pilotage Wi-Fi via app dédiée
- Certifications : CE, EN 14785, écodesign 2022

**Brief humain pour la fiche site** (à reformuler avec `/humanizer`) :
> Edilkamin est une référence italienne du chauffage biomasse depuis 1963. La marque couvre toute la gamme : poêles à pellets pour chauffer une pièce, canalisables pour diffuser dans plusieurs pièces, et hydro pour alimenter tout un système de chauffage central avec radiateurs ou plancher chauffant. Le pilotage Wi-Fi est désormais intégré sur la plupart des modèles récents. Côté style, la gamme va du minimal contemporain au plus traditionnel.

### H7.4 Fiche EK63 — RECTIFIÉE

| Champ | Valeur correcte |
|---|---|
| **Pays** | Italie |
| **Marque rattachée à** | **Groupe Edilkamin** (EK63 est une **marque sœur** d'Edilkamin, pas une marque indépendante) |
| **Positionnement** | **Marque accessible** du groupe Edilkamin, orientée modernité, design contemporain et connectivité, à un rapport qualité/prix optimisé |
| **Gamme** | Poêles à pellets air, étanches, **canalisables**, hydro (thermostoves) |

**Faits techniques avérés** :
- EK63 a été créée par Edilkamin pour offrir des solutions modernes et économiques **sans renoncer à l'efficacité**
- Modèles connus : **Zone80**, **Spy 110+**, **Tweed 90+**, **Entity 90+**, **Maison 80**, **Like 80**, **Metro 110+**
- **Wi-Fi Smart** intégré de série sur la plupart des modèles
- Modèles étanches certifiés (idéaux maisons passives / RT2012 / BBC)
- Modèle Entity 90+ ultra-fin (31 cm de profondeur, idéal couloirs)
- Certifications : CE, EN 14785, écodesign 2022, classe environnementale 5 étoiles

**Brief humain pour la fiche site** :
> EK63 est la marque sœur d'Edilkamin, lancée pour proposer des poêles modernes et connectés à un prix plus accessible. La gamme couvre l'air, le canalisable, l'étanche et l'hydro. Le Wi-Fi Smart est intégré de série, ce qui permet de piloter le poêle depuis un smartphone. Plusieurs modèles sont étanches et donc compatibles avec les maisons basse consommation à VMC double-flux. Modèles emblématiques : Zone80, Tweed, Entity (ultra-fin pour couloirs).

### H7.5 Fiche Dielle — RECTIFIÉE (correction principale)

| Champ | Valeur correcte |
|---|---|
| **Pays** | Italie |
| **Année** | À vérifier (Dielle Spa, basée en Italie, fabricant établi) |
| **Positionnement** | **Marque italienne reconnue pour son système de combustion par alimentation par le bas** (brevet maison), gamme complète |
| **Gamme** | **Air**, **canalisable**, **hydro**, **inserts**, et même **modèles hybrides bois/pellets** |

**Faits techniques avérés** :
- **Système de combustion breveté Dielle** : alimentation des pellets **par le bas** via vis sans fin en inox (pas par le haut comme la majorité des marques)
- Conséquences techniques de ce système :
  - Flamme plus naturelle et stable, comparable à un poêle à bois traditionnel
  - Réduction des déchets et de l'encrassement (auto-nettoyage du brasero)
  - Compatibilité avec une plus grande variété de qualités de pellets (moins sensible que d'autres marques)
  - Fonctionnement plus silencieux
  - Préchauffage et séchage des pellets avant combustion (rendement optimisé)
- Gammes connues :
  - **Round** (gamme Air, design rond)
  - **Grecale** (gamme Air, compact et polyvalent)
  - **FBX** (inserts air, design moderne)
  - **Bump Idro** (gamme Hydro, 20 à 35 kW)
  - **Ghibli Hybrid Idro** (modèle **bois ET pellets** combiné, hydro)
- Made in Italy revendiqué

**Brief humain pour la fiche site** :
> Dielle se distingue par un système de combustion qu'elle a breveté : les pellets sont alimentés par le bas du brasero, et non par le haut comme la majorité des poêles. Concrètement, cela donne une flamme plus naturelle et plus calme, un auto-nettoyage du brasero (moins d'entretien), et une tolérance aux pellets de qualité variable. La gamme est complète : poêles air pour une pièce (séries Round et Grecale), canalisables, hydro pour le chauffage central (série Bump Idro de 20 à 35 kW), inserts (FBX), et même un modèle hybride qui fonctionne au pellets ET au bois (Ghibli Hybrid Idro). Une marque pour ceux qui cherchent une alternative aux systèmes classiques d'alimentation par le haut.

### H7.6 Fiche Ferlux — RECTIFIÉE

| Champ | Valeur correcte |
|---|---|
| **Pays** | **Espagne** |
| **Année de création** | Plus de **28 ans** d'activité (donc création vers **1996-1997**) |
| **Siège** | Polígono El Polear (Andalousie, Espagne) |
| **Distribution** | Plus de **30 pays** |
| **Positionnement** | **Fabricant espagnol** historique de cheminées, barbecues et poêles à pellets — **gamme complète** à un excellent rapport qualité/prix |
| **Gamme** | Air, **canalisable**, **hydro** (gamme "Agua"), inserts, cheminées, barbecues |

**Faits techniques avérés** :
- 3 gammes principales :
  - **Air** : modèles Helen, Venus, Aroa, Flora — convection naturelle ou ventilation forcée
  - **Canalisable (Ducted)** : modèles type Lyra (12 kW), capables de diffuser dans plusieurs pièces
  - **Eau (Agua / Hydro)** : poêles connectables au système de chauffage central
- Rendement annoncé jusqu'à **94 %** (P.T.R.)
- Émissions CO faibles (0,02 % à 13 % O2)
- Télécommande fournie en standard
- Module domotique optionnel "4 HEAT" pour pilotage smartphone
- Made in Spain
- Certifications : CE, EN 13240

**Brief humain pour la fiche site** :
> Ferlux est un fabricant espagnol qui produit des poêles à pellets, des cheminées et des barbecues depuis plus de 28 ans. La marque est présente dans plus de 30 pays. La gamme est complète : modèles à air (avec ou sans ventilation), canalisables jusqu'à 12-15 kW, et hydro pour alimenter le chauffage central. Les rendements affichés sont parmi les meilleurs du marché (jusqu'à 94 %). Côté finitions, plusieurs couleurs disponibles, télécommande fournie de série, et un module domotique optionnel pour piloter le poêle depuis un smartphone. Made in Spain, à un rapport qualité/prix très compétitif.

### H7.7 Tableau récapitulatif corrigé (à utiliser sur la page d'accueil section "Nos marques")

| Marque | Pays | Depuis | Spécificité | Gamme |
|---|---|---|---|---|
| **Edilkamin** | Italie | 1963 | Pionnier italien, gamme premium très large, Wi-Fi de série | Air, canalisable, étanche, hydro, inserts, bois |
| **EK63** | Italie | Marque du groupe Edilkamin | Design moderne et connecté, accessible | Air, canalisable, étanche, hydro |
| **Dielle** | Italie | (à confirmer) | Combustion brevetée par alimentation par le bas, flamme naturelle | Air, canalisable, hydro, inserts, hybride bois/pellets |
| **Ferlux** | Espagne | ~1996 | Fabricant historique, excellent rapport qualité/prix | Air, canalisable, hydro, inserts |

### H7.8 Suppression des affirmations fausses

À chercher et **supprimer/rectifier partout** :

❌ "Dielle = hydro uniquement / 100 % hydro" → FAUX, gamme complète
❌ "Ferlux = budget / mécanique simple" → réducteur, c'est un fabricant complet avec un excellent rapport qualité/prix
❌ "EK63 = marque indépendante" → FAUX, c'est une marque du groupe Edilkamin
❌ "Edilkamin = durabilité 15-20 ans" → affirmation marketing non sourçable, à éviter (sauf si garantie officielle constructeur précise)
❌ Toute affirmation chiffrée (durabilité, pourcentage, classement) qui n'est pas sourçable doit être **retirée ou nuancée**

### H7.9 Règle générale renforcée

**À partir de maintenant, aucune affirmation factuelle sur une marque ne peut être publiée sans avoir été vérifiée à la source officielle** (site du fabricant, fiche produit constructeur, certifications officielles).

Si Claude Code n'a pas de source pour étayer une affirmation, **deux options** :
1. Ne pas l'inclure
2. Demander confirmation au client avant publication

Pas de "remplissage marketing" inventé. C'est ce qui a produit les erreurs actuelles.

### H7.10 Schemas Schema.org Brand à mettre à jour

Pour chaque page marque, le schema doit refléter les vrais infos :

```json
{
  "@context": "https://schema.org",
  "@type": "Brand",
  "name": "Dielle",
  "logo": "https://mister-pellets.be/images/brands/dielle-logo.svg",
  "description": "Fabricant italien de poêles à pellets reconnu pour son système breveté de combustion par alimentation par le bas. Gamme complète : air, canalisable, hydro, inserts, hybride bois-pellets.",
  "url": "https://mister-pellets.be/nos-marques/dielle/",
  "sameAs": ["https://www.diellespa.it/"]
}
```

Idem pour Edilkamin, EK63 et Ferlux.

---

## 1. Workflow imposé pour ce hotfix V1.2

### 1.1 Ordre d'exécution

1. **Commit 1** : `fix: prevent comparison table horizontal overflow on mobile` (H5)
   - Implémenter la solution (option B recommandée : cards mobiles + tableau desktop)
   - Tester sur iPhone SE / 14 / Pixel 7
   - Capture avant/après

2. **Commit 2** : `feat: minimalist mobile footer with 3 social icons` (H6)
   - Refonte complète du composant Footer selon nouvelle spec (annule V1.1 footer)
   - URLs sociaux en placeholder avec TODO
   - Demander au client les vraies URLs des profils TikTok / Instagram / YouTube avant le merge final
   - Capture avant/après

3. **Commit 3** : `fix: rectify brand information based on official sources` (H7)
   - Mettre à jour les 4 fiches marques (page d'accueil + pages individuelles)
   - Passer chaque texte rédigé par `/humanizer` avant commit
   - Mettre à jour les schemas Schema.org Brand
   - Vérifier `grep '—'` zéro em-dash dans le diff
   - Capture avant/après

### 1.2 Skills

- **`/humanizer`** : sur **chaque texte** des fiches marques (H7) — c'est le plus gros volume de texte de ce hotfix
- **`/impeccable`** : sur le tableau comparatif (H5) et le footer (H6)
- **`grep '—'`** sur chaque diff avant commit — zéro em-dash toléré

### 1.3 Validation client

Avant de considérer le hotfix V1.2 comme terminé :
- Capture mobile du tableau comparatif (avant/après)
- Capture mobile du footer (avant/après)
- Validation du contenu rédactionnel des 4 fiches marques (le client peut souhaiter ajuster le ton, ajouter ou retirer des infos)
- URLs réelles des profils sociaux (TikTok / Instagram / YouTube) à fournir par le client

---

## 2. Données client à fournir pour finaliser

Après ce hotfix, Claude Code doit demander au client :

1. **URLs des 3 profils sociaux** (TikTok, Instagram, YouTube) — actuellement placeholders
2. **Année de création de Dielle** — à confirmer si possible (sinon retirer l'année dans la fiche)
3. **Validation des 4 fiches marques** rédigées (le client est mieux placé pour valider la justesse commerciale)

---

## 3. Annexes

### 3.1 Sources officielles consultées (H7)

- **Edilkamin** : edilkamin.com (site officiel)
- **EK63** : ek-63.com (site officiel) + xodostore.com (revendeur officiel)
- **Dielle** : diellespa.it (site officiel)
- **Ferlux** : ferlux.es (site officiel)

### 3.2 Documents de référence du projet

- `HANDOVER.md` (à la racine du repo)
- `docs/mister-pellets-brief-fullcode.md` — brief technique complet
- `docs/mister-pellets-corrections-mobile-v1.md` — corrections V1 (23 points)
- `docs/mister-pellets-corrections-mobile-v1.1-hotfix.md` — hotfix V1.1 (navbar, layout, footer, logo)
- `docs/mister-pellets-corrections-mobile-v1.2-hotfix.md` — **ce document** (tableau, footer minimaliste, marques)
- `docs/mister-pellets-corrections-desktop-v2.md` — à venir

### 3.3 Coordonnées projet (rappel)

- **Nom commercial** : Mister Pellets
- **Société** : Awlest SRL
- **TVA** : BE 0656.514.212
- **Adresse** : Rue des Fagotis 3A, 5380 Fernelmont
- **Téléphone** : 0472 04 32 22
- **Email** : info@awlest.com
- **Année de création** : 2016
- **Avis Google** : 4.9★ / 200 avis

---

**Fin du document V1.2 (hotfix mobile).**

*À traiter après validation du V1.1, dans l'ordre des 3 commits indiqués.*

*Version 1.2 — Mai 2026.*
