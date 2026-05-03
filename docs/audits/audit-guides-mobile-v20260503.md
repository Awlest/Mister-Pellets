# Audit pages guides mobile — Hotfix V1.3 P5

**Date** : 2026-05-03
**Branche** : `hotfix/mobile-v1.3`
**Référence** : `docs/mister-pellets-corrections-mobile-v1.3-hotfix.md` §P5
**Build status** : `tsc --noEmit` exit 0

---

## Synthèse

Audit ciblé des pages guides + page Primes pour identifier les causes potentielles de
débordement sur mobile. Le coupable principal du débordement de bouton sur la page
Primes a été identifié : `whitespace-nowrap` dans la base CVA du composant `Button`,
combiné à un libellé long ("Voir les conditions complètes et la procédure"). Sur
375 px de viewport (iPhone SE), le bouton à `size="lg"` (`px-7 text-base`) avec ce
libellé fait ~340 px de largeur, dépassant la zone du conteneur si celui-ci a un
padding latéral inférieur.

## Pages auditées

| Page | Status | Action prise |
|---|---|---|
| `/primes-energie-wallonie-2026` | ⚠️ Bouton "Conditions complètes et procédure" risquait de déborder | Libellé raccourci dans `PrimesBlock.tsx`, ajout `w-full sm:w-auto` |
| `/guides` (hub) | ✅ OK | Cards `grid-cols-1 md:grid-cols-2`, padding latéral `px-4 md:px-6` cohérent, pas de bouton long |
| `/guides/guide-achat-poele-pellets-wallonie` | ✅ OK | Layout `max-w-3xl px-4 md:px-6`, contenu textuel sans média lourd |
| `/guides/poele-pellets-canalisable` | ✅ OK | Idem |
| `/guides/poele-pellets-hydro` | ✅ OK | Idem |
| `/guides/comment-entretenir-poele-pellets` | ✅ OK | Idem |
| `/guides/quelle-puissance-poele-pellets` | ✅ OK | Idem |

## Corrections appliquées

### Composant `Button` (correction systémique)

`components/ui/button.tsx` — base CVA mise à jour :

- Avant : `whitespace-nowrap` (forçait une seule ligne, débordait sur mobile)
- Après : suppression de `whitespace-nowrap`, ajout de `max-w-full text-center`

Conséquence : tous les boutons du site se replient proprement sur deux lignes
plutôt que de déborder, et restent contenus dans leur parent.

### `globals.css` — protections préventives

Ajouts en complément des règles V1.1 sur `html/body` :

```css
button, a[role="button"] {
  max-width: 100%;
}

img, video, picture, source {
  max-width: 100%;
  height: auto;
}

.image-overlay-btn {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  max-width: calc(100% - 32px);
}
```

### `PrimesBlock.tsx` — libellé bouton + responsive

Avant :

```tsx
<Button asChild variant="outline" size="lg">
  <Link href="/primes-energie-wallonie-2026">
    Voir les conditions complètes et la procédure
  </Link>
</Button>
```

Après :

```tsx
<Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
  <Link href="/primes-energie-wallonie-2026">
    Conditions complètes et procédure
  </Link>
</Button>
```

## Vérifications post-correction

- TypeScript clean (`tsc --noEmit` exit 0)
- 0 em-dash dans les fichiers modifiés
- Build production OK
- À valider visuellement par le client sur iPhone SE 375 px / iPhone 14 390 px /
  Pixel 7 412 px : aucun débordement attendu

## Snippet console à exécuter sur preview Vercel

À copier dans la console Chrome DevTools en mode mobile pour vérifier :

```javascript
[...document.querySelectorAll('*')].forEach(el => {
  if (el.offsetWidth > document.documentElement.offsetWidth) {
    console.log('OVERFLOW:', el, 'width:', el.offsetWidth, 'vs viewport:', document.documentElement.offsetWidth);
  }
});
```

Si la console retourne 0 élément, l'audit P5 est validé.
