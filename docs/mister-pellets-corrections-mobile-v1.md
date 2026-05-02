# Mister Pellets — Corrections & améliorations MOBILE (V1)

> **Document de travail destiné à Claude Code** pour la phase de révision et d'amélioration du site mister-pellets.be.
> Couvre exclusivement la **version mobile**. La version desktop sera traitée dans un document séparé (V2 à venir).
> Ce document complète le brief original `mister-pellets-brief-fullcode.md` et le `HANDOVER.md`. En cas de conflit, **ce document prévaut** pour les points qu'il traite.
> Date : mai 2026.

---

## 0. Synthèse exécutive

23 points de corrections / améliorations identifiés sur la version mobile, regroupés en 9 thématiques :

1. Page d'accueil (contenu, logo, footer)
2. Boutique & filtres
3. Navigation (suppression du header mobile, navbar flottante unique)
4. Formulaire de devis (champs obligatoires, bouton)
5. Page Prendre rendez-vous (showroom, calendrier Easy!Appointments, services)
6. CMS Payload (édition complète du contenu éditorial)
7. Primes Wallonie 2026 (rectification factuelle complète)
8. Page Blog (contraste filtres)
9. Page À propos (faits, certifications, mention Awlest)

**Skills obligatoires** à utiliser pour Claude Code : `/humanizer` (chaque texte) et `/impeccable` (chaque modification de présentation).

**Audit final obligatoire** une fois toutes les corrections appliquées (cohérence, SEO, GEO, performance, accessibilité, éditorial).

---

## 1. Page d'accueil

### 1.1 Enrichissement du contenu (SEO + GEO)

**Constat** : la page d'accueil actuelle est trop légère en contenu. Pour le SEO et le GEO, elle doit être nettement plus fournie.

**Action** :
- Atteindre **1 200 à 1 500 mots minimum** sur la page
- Ajouter de nouvelles sections de contenu textuel riche entre les sections existantes (sans alourdir la sensation visuelle, en exploitant des accordéons et des blocs cards bien structurés)
- Intégrer naturellement les mots-clés transactionnels, locaux et techniques (voir section 6.2 du brief original)
- Chaque H2 doit pouvoir être cité comme réponse autonome (principe GEO) : la première phrase répond, le reste détaille

**Sections à ajouter ou enrichir** (suggestions) :
- "Comment choisir son poêle à pellets en Wallonie ?" (mini-guide en 3-4 paragraphes humains)
- "Poêle à pellets vs autres modes de chauffage" (tableau comparatif court : pellets / mazout / gaz / pompe à chaleur)
- "Combien coûte un poêle à pellets installé ?" (fourchettes de prix concrètes par type de poêle)
- "Délais et déroulement d'une installation Mister Pellets" (texte court + process visuel existant)
- Bloc "Questions fréquentes des Wallons" (5-7 questions, format FAQAccordion existant)

**Ne pas oublier** : tous les nouveaux textes doivent passer par `/humanizer` avant commit.

### 1.2 Logo central de la page d'accueil

**Constat** : le logo qui se trouve au centre de la page est trop petit, avec trop d'espace autour.

**Action** :
- **Doubler la taille** du logo central (référence approximative : passer de ~80px à ~160px de hauteur, à ajuster visuellement)
- **Réduire l'espace blanc** au-dessus et en-dessous du logo
- **Enchaîner directement** avec le texte/contenu suivant pour que l'utilisateur identifie immédiatement la marque et entre dans le contenu sans temps mort visuel
- Le logo doit ressentir comme un "marqueur de bienvenue" fort, pas comme un élément décoratif perdu

### 1.3 Footer mobile — refonte complète

**Constat** : le footer mobile est beaucoup trop grand par rapport au contenu réel qu'il affiche, et globalement vide.

**Action — audit + refonte** :
- Auditer ce qui est **réellement visible** vs **ce qui est invisible** (overflow, opacity 0, visibility hidden, etc.)
- Restructurer les **proportions** : le footer doit être proportionné au contenu qu'il porte, ni excessivement haut ni dispersé
- **Logo footer** : utiliser le **logo mascotte** (le pellet humanisé avec flamme — premier logo fourni `logo-mister-pellets-mascotte.svg`) à une taille raisonnable (ni trop petit ni trop grand, à dimensionner visuellement)
- **Mentions légales complètes** dans le footer :
  - Nom commercial : Mister Pellets
  - Société : Awlest SRL
  - TVA : BE 0656.514.212
  - Adresse : Rue des Fagotis 3A, 5380 Fernelmont
  - Liens vers : Mentions légales · CGV · Politique de confidentialité · Politique cookies
- **Coordonnées de contact** : téléphone (0472 04 32 22, cliquable), email (info@awlest.com, cliquable)
- **Réseaux sociaux** : si comptes existants, icônes vers Facebook / Instagram / Google Business
- **Copyright** : © 2026 Mister Pellets — Tous droits réservés
- Hauteur cible mobile : viser un footer compact mais lisible (estimation 400-500px de hauteur totale, à ajuster selon le contenu)
- Espacement uniforme entre éléments (système 4px du brief)

### 1.4 Espace vide en bas de page

**Constat** : il y a trop d'espace vide entre la fin de la dernière section de contenu (page accueil et pages produits) et le footer.

**Action** :
- Réduire le `padding-bottom` de la dernière section de contenu
- Ou réduire le `padding-top` du footer
- Vérifier qu'il n'y a pas de marge fantôme ou d'élément vide qui crée le décalage
- **Tenir compte de la navbar flottante** (qui prend ~72px en bas) : ne pas créer de double marge

---

## 2. Boutique & filtres

### 2.1 État global

**Constat** : le shop est globalement bien. Conserver le design actuel.

**Action** : enrichir progressivement les modèles au fur et à mesure (déjà prévu dans le pré-encodage des 61 produits + ajouts ultérieurs). Pas de refonte nécessaire.

### 2.2 Périmètre actuel = pellets uniquement

**Important** : on travaille actuellement **uniquement sur les poêles à pellets**. Les poêles à bois viendront plus tard (pas dans cette itération). Toute information, filtre, contenu rédactionnel concerne **exclusivement les pellets** pour le moment.

### 2.3 Enrichissement des filtres rapides (sélection guidée)

**Action — ajouter ces 3 filtres supplémentaires** dans la section "sélection rapide / guidée" du shop :

#### a) Tranches de puissance

Ajouter un filtre par puissance :
- 6-9 kW (compacts, petits volumes ou pièces uniques)
- 9-12 kW (standards, surfaces moyennes)
- 12-18 kW (puissants, grandes surfaces ou espaces ouverts)
- 18 kW+ (hydros et installations spécifiques)

#### b) Type de diffusion de chaleur

Ajouter un filtre par type de diffusion (terminologie correcte) :
- **Ventilation forcée** : poêles à pellets équipés d'un ventilateur (diffusion rapide et puissante)
- **Canalisable** : diffusion vers plusieurs pièces via un réseau de gaines
- **Convection naturelle** : poêles **sans ventilateur**, qui chauffent par rayonnement et convection naturelle de l'air. C'est le **terme technique correct** (parfois marketé comme "poêles silencieux"). Ces poêles offrent une chaleur douce et homogène, sans bruit de ventilateur.

#### c) Couleur / finition

Ajouter un filtre couleur (utile pour l'esthétique) :
- Noir
- Blanc
- Crème / ivoire
- Bordeaux / rouge
- Gris anthracite
- Beige / sable
- Acier / inox
- Fonte (texture)

→ Ces 3 filtres seront aussi exposés comme **attributs produits** dans Payload (collection Products) pour permettre le filtrage dynamique côté front.

---

## 3. Navigation

### 3.1 Suppression du header mobile sur l'ensemble du site

**DÉCISION VALIDÉE** : aucun header sur la version mobile. Sur **toutes les pages** (accueil incluse), la navigation mobile passe **uniquement par la navbar flottante sticky bottom**.

**Action** :
- **Supprimer** le header mobile (logo + menu hamburger en haut) sur l'ensemble des pages, **y compris la page d'accueil**
- **Conserver et fiabiliser** la navbar flottante sticky bottom comme **unique point de navigation**
- Le logo de marque s'intègre dans le contenu de chaque page (notamment dans le hero d'accueil agrandi — voir point 1.2)

**Conséquences à gérer** :
- Sur les pages internes, prévoir un bouton "retour" contextuel si nécessaire (ou s'appuyer sur la navigation native du navigateur)
- Le breadcrumb existant reste utile pour la navigation et le SEO (à conserver dans le contenu, pas dans le header supprimé)
- Le composant `<NavbarSticky />` doit être **présent sur 100 % des pages** sans exception

### 3.2 Navbar flottante — vérification du doublon de croix dans le menu

**Constat** : le menu déroulant (overlay) affiche **deux croix** pour fermer le menu, créant une redondance.

**Action** :
- **Conserver une seule croix** pour fermer le menu, en haut à droite
- Zone de tap minimum **44×44 px** (standard accessibilité Apple/Google)
- La croix doit être facilement accessible au pouce (zone "thumb-friendly")
- Vérifier en même temps qu'il n'y a pas d'autres doublons (logo, titre du menu, etc.)
- Le bouton de fermeture doit avoir un `aria-label="Fermer le menu"` pour l'accessibilité

### 3.3 Composition de la navbar flottante (rappel)

La navbar flottante mobile sticky bottom comporte **4 actions** :
- 🏠 **Accueil**
- 🛒 **Boutique**
- 🔥 **Devis** (bouton central surélevé en orange flame, plus gros, ressort visuellement)
- 📅 **Rendez-vous**

Hauteur 72px, fond beige/cream avec ombre vers le haut, safe-area iOS respectée.

---

## 4. Formulaire de devis

### 4.1 Champs de contact obligatoires (étape finale)

**Constat** : à la fin du devis rapide, après que l'utilisateur a choisi tous les éléments, il manque les coordonnées du demandeur.

**Action — ajouter en étape finale du formulaire 3 champs obligatoires** :

| Champ | Type | Validation |
|---|---|---|
| **Nom complet** (prénom + nom) | text | Required, min 2 caractères |
| **Email** | email | Required, validation format email standard (regex) |
| **Téléphone** | tel | Required, **uniquement numéros belges** |

**Validation téléphone — uniquement format belge** :
- Acceptés : `+32 XXX XX XX XX`, `0032 XXX XX XX XX`, `04XX XX XX XX`, `02 XXX XX XX`, `03 XXX XX XX`, `04 XXX XX XX`, `09 XXX XX XX`, `010 XX XX XX`, `015 XX XX XX`, `019 XX XX XX`, `056 XX XX XX`, `068 XX XX XX`, `069 XX XX XX`, `071 XX XX XX`, `081 XX XX XX`, `085 XX XX XX`, `087 XX XX XX`, etc.
- **Refusés** : numéros français (+33), luxembourgeois (+352), allemands (+49), néerlandais (+31), ou tout autre indicatif international
- Si l'utilisateur saisit un numéro non belge : message d'erreur clair "Nous ne desservons que la Belgique. Merci de saisir un numéro belge."
- Implémentation recommandée : utiliser une **regex stricte** ou la librairie `libphonenumber-js` avec restriction `country: 'BE'`

**Validation en temps réel** : le bouton de soumission reste désactivé tant que les 3 champs ne sont pas remplis correctement. Messages d'erreur sous chaque champ, en rouge, en français clair.

### 4.2 Bouton de validation — débordement à corriger

**Constat** : le bouton de validation en fin de formulaire **dépasse les extrémités** (déborde du padding du conteneur).

**Action** :
- Centrer le bouton dans son conteneur
- S'assurer qu'il **respecte le padding** latéral du formulaire
- Probable cause à investiguer : `width: 100%` sans `box-sizing: border-box`, ou `margin` négatif, ou `width` calculé en `vw` sans tenir compte du padding parent
- Solution propre : `width: 100%` du conteneur intérieur (qui lui-même a un padding), pas du viewport

### 4.3 Workflow d'envoi (rappel)

À la soumission du devis :
- Sauvegarde dans Payload (collection `Quotes`)
- Email automatique à `info@awlest.com` avec récap structuré
- Email de confirmation au client
- Page de confirmation avec récap des choix + délai de réponse annoncé (24-48h ouvrées)

---

## 5. Page "Prendre rendez-vous" — refonte complète

### 5.1 Contenu informatif à ajouter en haut de page

**Action** : ajouter en intro de la page un bloc clair qui explique :

- Mister Pellets dispose d'un **showroom à Fernelmont** (adresse complète : Rue des Fagotis 3A, 5380 Fernelmont)
- **Plusieurs modèles d'exposition** sont visibles sur place, mais la sélection **tourne régulièrement** : impossible de garantir à l'avance qu'un modèle précis sera physiquement présent au moment de la visite
- Pour être certain d'être reçu et bénéficier de conseils personnalisés, **prendre rendez-vous est fortement recommandé**

Texte à rédiger en version humaine (passer par `/humanizer`).

### 5.2 Système de prise de rendez-vous interactif — Easy!Appointments

**DÉCISION VALIDÉE — Outil retenu : Easy!Appointments** (PAS Cal.com).

Justification :
- 100 % gratuit, open-source, sans branding tiers
- Self-hosté sur Combell (même serveur que le site, pas de coût supplémentaire)
- Léger (~100 MB, PHP + MySQL — supporté nativement par Combell)
- Synchronisation Google Agenda native
- Multi-services et multi-providers
- Notifications email automatiques (client + Mister Pellets)
- Interface admin en français
- Aucun risque SEO/GEO (intégration sur sous-domaine dédié)

### 5.3 Architecture technique d'intégration

**Configuration validée** : Easy!Appointments est installé sur le sous-domaine **`booking.mister-pellets.be`**.

**Workflow client** :
1. Le client navigue sur `mister-pellets.be/prendre-rendez-vous/` (page éditoriale Next.js, optimisée SEO)
2. La page présente les 5 services disponibles avec descriptions, durées, tarifs
3. Au clic sur "Réserver" pour un service donné, le client est redirigé vers `booking.mister-pellets.be` (ou ouverture en modale, à arbitrer en phase de build selon le rendu)
4. Le client choisit son créneau dans l'interface Easy!Appointments
5. Confirmation automatique par email (client + équipe)
6. RDV synchronisé avec l'agenda Google de Mister Pellets

**Avantages SEO/GEO de cette architecture** :
- La page `/prendre-rendez-vous/` reste **100 % éditoriale et indexable** (textes optimisés, schema Service, FAQ, etc.)
- Le booking se fait sur un sous-domaine séparé qui ne pollue pas le site principal
- Aucun iframe lourd qui dégraderait le LCP de la page principale

### 5.4 Les 5 services à configurer

Les 5 sections de service doivent être **configurables dans le CMS Payload** (collection `Services`). Chaque service contient :

```typescript
{
  name: string,                  // Ex: "Devis sur place"
  slug: string,                  // Ex: "devis-sur-place"
  shortDescription: string,      // 1-2 lignes
  longDescription: richText,     // Description détaillée éditable
  duration: number,              // En minutes (Ex: 60)
  price: number,                 // En euros (0 si gratuit)
  priceLabel: string,            // Ex: "Gratuit", "À partir de 89 €"
  location: select,              // "domicile" | "showroom"
  icon: string,                  // Nom d'icône Lucide
  isActive: boolean,             // Visible ou masqué
  easyAppointmentsServiceId: string  // ID du service correspondant dans E!A
}
```

**Les 5 services initiaux** :

| Service | Lieu | Durée | Tarif (à fournir par le client) |
|---|---|---|---|
| **Devis sur place** | Domicile client | 60 min | Gratuit |
| **Visite showroom + conseils** | Fernelmont | 45 min | Gratuit |
| **Entretien annuel** | Domicile client | ~90 min | À fournir |
| **Dépannage** | Domicile client | Variable | À fournir |
| **Ramonage** | Domicile client | ~60 min | À fournir |

→ **Tarifs à fournir par le client** ultérieurement, via l'admin Payload. Pour le lancement initial, afficher "Sur devis" si le tarif n'est pas encore renseigné.

### 5.5 Mention "Pour les poêles à pellets uniquement"

Sur chaque service technique (entretien, dépannage, ramonage), afficher clairement que les services concernent **les poêles à pellets uniquement** (pour éviter les demandes pour d'autres types d'appareils).

---

## 6. CMS Payload — édition complète du contenu éditorial

### 6.1 Principe absolu

**100 % du contenu éditorial du site est éditable depuis l'interface admin Payload, sans toucher au code.**

### 6.2 Liste exhaustive des contenus éditables via Payload

| Type de contenu | Collection / Global Payload | Éditeur |
|---|---|---|
| Pages villes (10 villes) | `Cities` | Rich text par section |
| Guides (canalisable, hydro, puissance, primes, entretien, etc.) | `Pages` (page-builder par blocs) | Blocs flexibles |
| Articles de blog | `Articles` | Rich text complet |
| Descriptions produits | `Products` | Rich text par produit |
| FAQ | `FAQ` | Question / Réponse |
| Témoignages | `Testimonials` | Champs structurés |
| Services RDV | `Services` | Champs structurés |
| Marques | `Brands` | Rich text + champs structurés |
| Footer | Global `Footer` | Champs structurés |
| Header (si réintroduit en desktop) | Global `Header` | Items de menu |
| Page d'accueil — sections | Global `HomePage` | Configuration par blocs |
| Page Primes 2026 | `Pages` (page-builder) | Blocs flexibles |
| Page À propos | `Pages` | Blocs flexibles |
| Page Contact | `Pages` | Blocs flexibles |
| Mentions légales / CGV / Confidentialité / Cookies | `Pages` | Rich text |
| Templates email transactionnels | Global `EmailTemplates` | Rich text |

### 6.3 Workflow d'édition

1. Le client se connecte à `mister-pellets.be/admin`
2. Il accède à la collection ou au global concerné
3. Il modifie le texte via l'éditeur rich text (équivalent Word/Google Docs)
4. Il clique sur "Enregistrer comme brouillon" (pour prévisualiser) ou "Publier"
5. Au clic "Publier", la revalidation ISR Next.js se déclenche → la modification est en ligne en quelques secondes
6. Historique des versions disponible sur tous les contenus éditoriaux (rollback possible)

### 6.4 Règle pour Claude Code

**Aucun texte éditorial ne doit être hardcodé dans les composants React.**

Tout passe par Payload. Si un texte apparaît dans un composant, c'est qu'il vient de Payload via une `query` côté serveur ou client.

Exception tolérée : libellés UI courts non-marketing (ex : "Suivant", "Précédent", "Fermer", "Chargement...") peuvent rester en dur dans les composants.

---

## 7. Primes Wallonie 2026 — RECTIFICATION FACTUELLE COMPLÈTE

### 7.1 Constat critique

Les montants actuellement affichés sur le site (1 500 € / 750 € / 375 €) sont **complètement faux** pour 2026. Une mention erronée engage la responsabilité commerciale de Mister Pellets et peut donner lieu à des plaintes de clients.

### 7.2 Régime en vigueur

Depuis le **14 février 2025**, la Région wallonne applique un **régime temporaire** valable jusqu'au **30 septembre 2026**. Les anciennes "primes Chauffage et Eau Chaude" ont été **supprimées** et remplacées par la **Prime Habitation**.

À partir du **1er octobre 2026**, un nouveau régime global entrera en vigueur (détails non encore publiés au moment de la rédaction).

**Source officielle** : SPW Logement (logement.wallonie.be) et SPW Énergie (energie.wallonie.be).

### 7.3 Montants exacts pour un poêle à pellets en 2026

| Catégorie de revenus | Coefficient | Montant prime poêle à pellets |
|---|---|---|
| **R1** (≤ 24 600 € de revenus de référence) | × 6 | **960 €** |
| **R2** (24 601 € à 39 300 €) | × 4 | **640 €** |
| **R3** (39 301 € à 58 900 €) | × 2 | **320 €** |
| **R4** (> 58 900 €) | × 1 | **160 €** (montant de base) |
| **R5** (> 122 800 €) | — | **Non éligible** (exclus des primes depuis le 14/02/2025) |

**Méthode de calcul** : Prime de base **160 €** × coefficient catégorie de revenus.

**Plafonds en pourcentage** :
- Catégories R1 et R2 : maximum **70 %** du coût total TVAC
- Catégories R3 et R4 : maximum **50 %** du coût total TVAC

Le montant réellement versé est le **plus bas** entre la prime calculée et le plafond en pourcentage.

**Plafond global cumulé** : 50 000 € par logement individuel (toutes primes confondues sur la durée).

### 7.4 Conditions d'éligibilité (vérifiées sur sources officielles)

**Logement** :
- Situé en Région wallonne (hors Communauté germanophone)
- Construit depuis **plus de 15 ans** au moment de la demande
- Destiné principalement à l'habitation (≥ 50 %)

**Demandeur** :
- Personne physique majeure (ou mineur émancipé), ou copropriété
- Titulaire d'un droit réel sur le logement (propriétaire, usufruitier, nu-propriétaire)
- Revenus de référence ≤ 122 800 € (au-delà = catégorie R5, non éligible)

**Travaux** :
- Réalisés par un entrepreneur **inscrit à la Banque-Carrefour des Entreprises (BCE)**
- Le poêle à pellets doit figurer sur la **liste officielle des appareils éligibles** publiée sur logement.wallonie.be (mise à jour régulièrement)
- L'entrepreneur doit disposer des accès à la profession requis

**Audit logement préalable OBLIGATOIRE** :
- Coût : 800 € à 1 200 € TVAC (couvert partiellement par une prime audit séparée)
- Doit être enregistré **avant le début des travaux**
- Dressé par un auditeur agréé
- Liste les travaux à réaliser et leur ordre de priorité
- Validité : 5 ans

### 7.5 Procédure de demande

1. **Faire réaliser l'audit logement** par un auditeur agréé (avant tout devis)
2. **Choisir un poêle éligible** dans la liste officielle SPW
3. **Faire installer** par un entrepreneur inscrit à la BCE
4. **Introduire la demande** de prime via Mon Espace (mon.wallonie.be) ou par courrier postal à :
   > Service public de Wallonie
   > Territoire, Logement, Patrimoine, Énergie
   > Direction des Aides aux Particuliers
   > Rue des Brigades d'Irlande 1
   > 5100 Jambes
5. **Joindre les documents** : rapport d'audit, factures, annexes techniques (Annexe 6 Chauffage et ECS), justificatifs de revenus
6. **Délai d'introduction** : au plus tard **8 mois** après la dernière facture
7. **Délai de traitement** : actuellement 1 à 2 ans (le gouvernement wallon s'est engagé à raccourcir)

**Contact officiel** :
- Numéro gratuit : **1718** (Service public de Wallonie)
- Guichets Énergie Wallonie : energie.wallonie.be/fr/guichets-energie-wallonie.html
- Email : secretariat.primes@spw.wallonie.be

### 7.6 Cumul possible avec d'autres aides

- **TVA réduite à 6 %** pour les logements de plus de 10 ans (au lieu de 21 %)
- **Prêt à taux 0 %** (Renopack ou Rénoprêt) via la Société wallonne du Crédit social (SWCS) ou le Fonds du Logement des Familles nombreuses de Wallonie (FLW) — finance jusqu'à 60 000 €
- Cumul avec **primes isolation** (toiture, murs, sols) et **châssis** sous le même plafond global de 50 000 €

### 7.7 Action pour Claude Code

**Refonte complète de la page Primes** (`/primes-energie-wallonie-2026/`) :

1. **Remplacer tous les anciens montants** par les chiffres exacts ci-dessus
2. **Ajouter le tableau** R1/R2/R3/R4 avec montants et coefficients
3. **Détailler les conditions d'éligibilité** (logement, demandeur, travaux, audit)
4. **Détailler la procédure** étape par étape
5. **Mentionner les cumuls possibles**
6. **Ajouter l'avertissement légal en bas de page** :
   > *Information à titre indicatif, basée sur le régime temporaire en vigueur du 14 février 2025 au 30 septembre 2026. Les montants et conditions peuvent évoluer. Pour un calcul personnalisé et une vérification officielle, consultez le SPW Énergie (1718 ou energie.wallonie.be) ou un Guichet Énergie Wallonie.*
7. **Refonte de tous les blocs Primes** sur la page d'accueil et autres pages où les anciens montants apparaissaient (suppression des "1 500 €" et "+250 € bonus PEB" qui étaient erronés)
8. **Schema.org `Service`** correctement structuré sur la page Primes

### 7.8 Suivi continu

À partir d'octobre 2026 (nouveau régime), toute la page devra être **revue et mise à jour**. Prévoir une **note interne dans le CMS** : "Page à actualiser après publication du régime post-30/09/2026".

---

## 8. Page Blog — bug de contraste

### 8.1 Constat

Dans la page Blog, le sélecteur de **thèmes / catégories** présente un bug d'affichage : texte blanc sur fond blanc (ou quasi), illisible.

### 8.2 Action

- Corriger le contraste pour respecter **WCAG AA minimum** (ratio **4.5:1** pour le texte normal)
- Vérifier **tous les états** des filtres : default, hover, active, focus, disabled
- Sur fond clair comme sur fond foncé
- Pills/boutons de catégorie : utiliser les couleurs du design system (vert deep `#174724` sur fond beige `#F4F1E8` pour l'état actif, ink `#14241B` sur cream `#FAF7F0` pour l'état default, etc.)

### 8.3 Vérification globale

Profiter de cette correction pour faire un **audit accessibilité contrastes sur l'ensemble du site** :
- Outil recommandé : extension Chrome **WAVE** ou **axe DevTools**
- Cible : 0 erreur de contraste sur l'ensemble des pages publiques

---

## 9. Page À propos — corrections factuelles

### 9.1 Année de création — CORRECTION

**Constat** : la page mentionne **2018**, c'est faux.

**Action** : remplacer par **2016** partout où l'année apparaît :
- Page À propos
- Footer (si mentionnée)
- Mentions légales
- Pages locales (si "actif depuis X années" est dérivé)
- Articles blog (si applicable)

### 9.2 Certification RGIE — SUPPRESSION

**Constat** : la mention "certification RGIE" sur le site est **incorrecte**. La RGIE (Règlement Général sur les Installations Électriques) concerne les **installations électriques** et n'est **pas la certification applicable à la pose de poêles à pellets**.

**Action immédiate** : **supprimer toute mention de RGIE** liée à la pose de poêles à pellets.

### 9.3 Certifications réelles à investiguer

Avant d'afficher de nouvelles certifications, **Claude Code doit faire une recherche officielle** sur les certifications réellement applicables à un installateur de poêles à pellets en Belgique francophone.

**Pistes à investiguer** (à valider à la source officielle, pas via blogs marketing) :
- **Qualifications professionnelles** délivrées par l'IFAPME (Institut wallon de Formation en Alternance et des indépendants et Petites et Moyennes Entreprises)
- **Inscription à la Banque-Carrefour des Entreprises (BCE)** avec accès à la profession "chauffagiste" ou "biomasse"
- **Agréments éventuels** spécifiques aux installateurs de chauffage biomasse en Wallonie
- **Conformité des installations** vs **certification de l'installateur** (deux notions distinctes à clarifier)
- **Normes produit** (NF EN 14785, écodesign 2022) — concernent les poêles, pas l'installateur

**Règle absolue** : **aucune mention de certification, agrément ou label** ne doit être affichée sur le site **sans avoir été vérifiée à la source officielle** (site SPW, Moniteur belge, organisme certificateur). Une mention erronée engage la responsabilité commerciale.

### 9.4 Mention de la relation Mister Pellets / Awlest — AUTORISÉE sur 2 pages

**Pages autorisées** : **À propos** et **Contact** uniquement.

**Action** : sur ces 2 pages, expliquer ouvertement et de façon naturelle que **Mister Pellets est l'appellation commerciale spécialisée pellets d'Awlest SRL** (la maison mère). Cela permet aux clients de comprendre pourquoi leur **devis** ou leur **facture** porte le nom Awlest.

**Exemple de formulation** (à passer par `/humanizer` puis valider) :
> "Mister Pellets est la marque commerciale spécialisée dans les poêles à pellets d'Awlest, société active en Wallonie depuis 2016. Concrètement : quand vous recevez un devis ou une facture, le nom Awlest apparaît, parce que c'est la société qui porte juridiquement l'activité. Mister Pellets, c'est le visage métier ; Awlest, c'est la structure légale derrière."

**Sur le reste du site** : aucune mention d'Awlest visible, sauf dans les zones légales obligatoires (mentions légales, CGV, politique de confidentialité, politique cookies, footer en petites lignes).

---

## 10. Règles transversales (à appliquer sur l'ensemble du site)

### 10.1 Textes 100 % humains — utilisation OBLIGATOIRE de `/humanizer`

**Constat** : à travers plusieurs pages, présence de **tirets longs (em-dash —)** et de **tournures typiques IA** détectables. C'est inacceptable.

**Action** :
- **Zéro em-dash (—)** dans les textes du site. Remplacer par : virgule, point, parenthèses, ou reformuler la phrase
- **Zéro tournure IA** : pas de "il est important de noter", "essentiel", "crucial" en abus, phrases en miroir "non seulement... mais aussi", conclusions en "En résumé" / "Pour conclure", "n'hésitez pas à", adjectifs vagues empilés, etc. (cf. section 6.1 du brief original pour la liste complète)
- **Lecture à voix haute** de chaque page : si ça ne sonne pas naturel à l'oral, on reformule
- **Test final** via détecteurs IA (GPTZero, Originality.ai, ZeroGPT) → cible : **0 % détection IA** sur l'ensemble du site

**Workflow obligatoire pour Claude Code** :

> Avant tout commit qui touche du contenu rédactionnel (description produit, page éditoriale, article blog, page locale, FAQ, témoignage reformulé, email transactionnel, etc.) : **passer le texte par `/humanizer`**.

### 10.2 `/impeccable` — utilisation OBLIGATOIRE pour la présentation

**Action** :
- Pour toute modification de **design**, **structure visuelle**, **mise en page**, **animations**, **composants UI** : **utiliser `/impeccable`**
- Garder en respect : palette 60/30/10, polices Fraunces + Inter Tight, mobile-first, navbar flottante unique, règles d'espacement 4px, border-radius cohérents
- Garder en respect : objectifs business (conversion devis, vente boutique, prises de RDV)

### 10.3 Workflow imposé à Claude Code à chaque session de modification

1. Lire `HANDOVER.md` + brief original + ce document de corrections
2. Identifier les pages / composants à modifier
3. Faire les modifications design / structure avec **`/impeccable`**
4. Passer chaque texte rédactionnel modifié dans **`/humanizer`**
5. Vérifier qu'aucun em-dash n'est présent dans le diff (`grep` du `—` avant commit)
6. Commit + preview Vercel avec mot de passe
7. Validation client

---

## 11. Audit complet final

### 11.1 Déclencheur

Quand **l'ensemble des points 1 à 10 est traité**, Claude Code lance un **audit global du site** sur tous les axes ci-dessous.

### 11.2 Axes obligatoires de l'audit

**1. Cohérence visuelle**
- Palette respectée (60 % beige / 30 % vert / 10 % orange, < 1 % bark)
- Typographie cohérente (Fraunces display, Inter Tight body)
- Espacements uniformes (système 4px)
- Composants utilisés sans duplication
- Navbar flottante unique fonctionnelle sur 100 % des pages
- Footer propre et bien proportionné
- Logos correctement affichés (mascotte dans le footer, wordmark agrandi en hero accueil)

**2. SEO technique**
- Titles + meta-descriptions uniques sur 100 % des pages
- Schemas Schema.org valides (test Google Rich Results)
- Sitemap.xml à jour et soumis à GSC + Bing
- robots.txt correct (admin, api, panier, checkout disallow)
- Redirections 301 en place depuis l'ancien site
- Canonical URLs configurées
- Open Graph + Twitter cards présentes
- hreflang `fr-BE` configuré
- Pas d'URLs en double (paramètres normalisés)

**3. GEO (Generative Engine Optimization)**
- Réponses directes en début de chaque H2 (principe : 1ère phrase = réponse autonome)
- Données chiffrées sourcées (prix, délais, primes exactes 2026)
- FAQ riches sur chaque page (5-10 questions, 50-150 mots de réponse)
- Structured data exhaustif (LocalBusiness, Product, Service, Article, FAQPage, BreadcrumbList)
- Maillage sémantique cohérent (marques, villes, types techniques liés entre eux)
- Pages "réponse" en place pour les requêtes long tail
- Mention explicite "Mister Pellets, installateur en Wallonie depuis 2016" sur les pages clés

**4. Performance**
- Lighthouse mobile : **95+** sur Performance / SEO / Accessibility / Best Practices, sur toutes les pages clés
- Core Web Vitals : LCP < 1.5s, CLS < 0.05, INP < 200ms
- Bundle JS initial < 100 KB gzipped
- Images : 100 % WebP/AVIF, lazy loading par défaut
- Polices : `display: swap`, sous-ensembles latin uniquement

**5. Accessibilité**
- Contraste WCAG AA partout (ratio 4.5:1 mini)
- Navigation clavier complète (focus visible, ordre logique)
- Tous les boutons et liens accessibles au clavier
- Tous les formulaires labellisés correctement
- Toutes les images ont un `alt` pertinent (et vide pour les images décoratives)
- `aria-labels` sur les icônes seules (notamment croix de fermeture menu)
- Skip-to-content link présent
- Tap targets ≥ 44×44 px sur mobile

**6. Cohérence éditoriale**
- **Zéro em-dash (—)** sur l'ensemble du site
- **Zéro marqueur IA détectable** (test GPTZero / Originality.ai → 0 %)
- Informations factuelles vérifiées :
  - Année de création : **2016** (pas 2018)
  - **Pas de mention RGIE** pour la pose de poêles
  - Primes Wallonie 2026 exactes (160 € à 960 €, R1 à R4)
  - Coordonnées correctes partout (0472 04 32 22, info@awlest.com, Fernelmont)
  - Note Google : 4.9★ / 200 avis
- Ton uniforme sur l'ensemble du site
- Aucune mention parasite d'Awlest hors pages À propos, Contact, et zones légales

**7. CMS Payload**
- 100 % des contenus éditoriaux éditables sans toucher au code
- Collections bien structurées (Products, Brands, Cities, Articles, Pages, Testimonials, FAQ, Quotes, Orders, Services, Media, Users)
- Globals configurés (SiteSettings, Footer, Header, HomePage, EmailTemplates)
- Permissions correctes (admin protégé, public en lecture seule sur collections publiques)
- Workflow brouillon → publication fonctionnel

**8. E-commerce**
- 61 produits importés depuis Wix, pré-encodés (slug, meta, schema)
- Schemas Product complets sur chaque fiche produit
- Flux Google Merchant Center valide sans erreur
- Parcours achat testé bout en bout (panier → checkout → confirmation)
- TVA correcte (21 % produit, 6 % pose si applicable)
- Stripe en mode production avec vraies clés
- Stocks décrémentés à la commande
- Filtres rapides enrichis : marque, puissance (4 tranches), type de diffusion (ventilation forcée / canalisable / convection naturelle), couleur, prix

**9. Formulaires**
- Devis : nom + email + téléphone (belge uniquement) obligatoires, validation temps réel, bouton non-débordant
- Contact : tous les champs validés, envoi email opérationnel
- RDV : intégration Easy!Appointments fonctionnelle, sync Google Agenda OK, 5 services configurés
- Tous les emails reçus côté Mister Pellets et confirmation côté client

**10. Liens et redirections**
- 0 lien cassé (test crawler type Screaming Frog ou équivalent)
- Maillage interne minimum **3 liens contextuels par page** (hors menu/footer)
- Toutes les redirections 301 testées (depuis ancien WP + ancien Wix)
- Aucune URL indexée ne se retrouve en 404

**11. Mobile-first**
- Test sur iPhone (Safari) + Android (Chrome) + tablette
- Navbar flottante visible et fonctionnelle sur 100 % des pages
- Pas de débordement horizontal (overflow-x: hidden vérifié)
- Tap targets ≥ 44×44 px partout
- Safe-area iOS respectée (env(safe-area-inset-bottom))
- **Zéro header mobile** sur 100 % des pages

**12. RGPD & légal**
- Bandeau cookies fonctionnel (consentement granulaire FR)
- Aucun tracking avant consentement
- Mentions légales complètes (Awlest SRL, TVA, adresse, RPM)
- CGV en ligne et acceptation au checkout
- Politique de confidentialité conforme RGPD
- Politique cookies détaillée
- Formulaires : opt-in clair, pas d'opt-in pré-coché

### 11.3 Livrable attendu de l'audit

Un **rapport markdown structuré** placé dans `docs/audits/audit-mobile-vYYYYMMDD.md`, avec pour chaque axe :
- ✅ Points conformes
- ⚠️ Points à corriger (priorité **Haute / Moyenne / Basse**)
- 🚫 Points **bloquants** (empêchent le déploiement)

**Aucun déploiement en production** tant que les points bloquants ne sont pas réglés.

---

## 12. Récapitulatif des 23 points de correction

| # | Thématique | Point | Priorité |
|---|---|---|---|
| 1 | Accueil | Enrichir contenu pour SEO + GEO (1 200-1 500 mots) | Haute |
| 2 | Accueil | Doubler taille du logo central + réduire espace | Haute |
| 3 | Accueil | Refonte complète footer mobile (proportions + contenu) | Haute |
| 4 | Shop | Ajout progressif des derniers modèles | Moyenne |
| 5 | Shop | Enrichir filtres : puissance + diffusion + couleur | Haute |
| 6 | Périmètre | Pellets uniquement (pas de bois pour le moment) | Information |
| 7 | Accueil/Produits | Réduire espace vide entre dernière section et footer | Moyenne |
| 8 | Navigation | Supprimer header mobile sur 100 % des pages, navbar flottante unique | Haute |
| 9 | Devis | Ajouter nom + email + téléphone (belge uniquement) obligatoires | Haute |
| 10 | Devis | Corriger débordement bouton de validation | Haute |
| 11 | RDV | Showroom + 5 services (devis, showroom, entretien, dépannage, ramonage) + Easy!Appointments | Haute |
| 12 | Footer | Logo mascotte + mentions légales complètes + bonne taille | Haute |
| 13 | CMS | 100 % du contenu éditorial éditable via Payload | Haute |
| 14 | Primes | Rectification factuelle COMPLÈTE (160-960 €, R1-R4, conditions, procédure) | **BLOQUANTE** |
| 15 | Blog | Corriger contraste filtres (WCAG AA) | Haute |
| 16 | À propos | Année 2016 (pas 2018) + suppression RGIE + vraies certifications | **BLOQUANTE** |
| 17 | Transversal | Zéro em-dash, zéro marqueur IA, textes 100 % humains via `/humanizer` | Haute |
| 18 | Navigation | Doublon de croix dans menu déroulant à supprimer | Moyenne |
| 19 | À propos / Contact | Mention Awlest autorisée et naturelle (uniquement ces 2 pages) | Moyenne |
| 20 | Skills | Utilisation obligatoire de `/humanizer` et `/impeccable` | Haute |
| 21 | Skills | Skills à intégrer au workflow Claude Code | Haute |
| 22 | Final | Audit complet sur tous les axes (cohérence, SEO, GEO, perf, a11y, éditorial) | Haute |
| 23 | RDV | Easy!Appointments (PAS Cal.com), self-hosté Combell, sous-domaine booking. | Haute |

---

## 13. Annexes

### 13.1 Sources officielles vérifiées (primes Wallonie)

- **SPW Énergie** : energie.wallonie.be
- **SPW Logement** : logement.wallonie.be
- **Démarche officielle** : wallonie.be/fr/demarches (numéro de démarche 3920)
- **Liste des poêles éligibles** : PDF officiel publié par le SPW Logement (à consulter avant tout devis)
- **Numéro gratuit** : 1718
- **Email primes** : secretariat.primes@spw.wallonie.be

### 13.2 Documents de référence du projet

- `HANDOVER.md` (à la racine du repo) — règles de continuité
- `docs/mister-pellets-brief-fullcode.md` — brief technique complet (1 570 lignes)
- `docs/mister-pellets-corrections-mobile-v1.md` — **ce document** (corrections mobile)
- `docs/mister-pellets-corrections-desktop-v2.md` — **à venir** (corrections desktop)
- `docs/audits/audit-mobile-vYYYYMMDD.md` — rapport d'audit final mobile (à produire par Claude Code)

### 13.3 Skills Claude Code

| Skill | Usage |
|---|---|
| **`/humanizer`** | À invoquer sur **chaque texte rédactionnel** avant publication / commit |
| **`/impeccable`** | À invoquer pour **chaque modification de présentation** (design, structure, animations) |

### 13.4 Coordonnées projet (rappel)

- **Nom commercial** : Mister Pellets
- **Société** : Awlest SRL
- **TVA** : BE 0656.514.212
- **Adresse** : Rue des Fagotis 3A, 5380 Fernelmont
- **Téléphone** : 0472 04 32 22
- **Email** : info@awlest.com
- **Année de création** : **2016** (à corriger partout où apparaît 2018)
- **Avis Google** : 4.9★ / 200 avis

---

**Fin du document V1 (mobile).**

*Version desktop à venir dans un document V2 séparé.*

*Document à valider intégralement avant lancement des corrections. Toute modification ultérieure doit être tracée et versionnée.*

*Version 1.0 — Mai 2026.*
