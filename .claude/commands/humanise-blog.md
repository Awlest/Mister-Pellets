---
description: Passe d'humanisation anti-IA des articles de blog (lib/articles.ts)
---

Tu réalises une passe d'humanisation anti-IA sur les articles de blog du site
Mister Pellets. La méthode reprend exactement celle des lots 1 à 4 (voir
`git log --oneline --grep "humanisation"`).

## Périmètre

Fichier unique : `lib/articles.ts`. Audite **tous** les articles du tableau
`ARTICLES` à chaque exécution. La passe est idempotente : un texte déjà
humanisé ne redéclenche pas de correction, donc il est sûr de tout réauditer.

## Tics IA à corriger (et seulement ceux-là)

1. **Règle de trois mécanique** — trois propositions parallèles qui se suivent
   avec la même structure (« par X si Y, par X si Y, et par X si Y », « Pour A…
   Pour B… Pour C… »). Casse le parallélisme, varie les connecteurs et le
   rythme. Ne touche pas une antithèse courte volontaire (ex. « sous-dimensionner
   brûle le matériel ; sur-dimensionner encrasse »).
2. **Amorce qui annonce un décompte** — phrase de transition du type « Voici les
   repères. », « Il y a trois situations… », « Quatre éléments se cumulent… »,
   « Si on devait résumer en trois phrases… » placée juste avant une liste ou un
   tableau. Supprime le décompte ou fonds-la dans une phrase porteuse de sens.
3. **Parallélisme négatif + chute sèche** — « Tu n'ouvres aucun menu, tu ne
   changes aucun paramètre. … point. ». Réécris en variant.
4. **Vocabulaire / rythme IA** — phrases parallèles trop régulières, transitions
   creuses. Varie la longueur des phrases.

## Ce qu'il ne faut PAS toucher

- Les **listicles éditoriaux assumés** (« 7 causes », « Cause n°1…n°7 »,
  « Erreur 1 / 2 / 3 ») : ce sont des formats SEO volontaires, pas des tics.
- Les **comptes dans les titres de section** (H2).
- Les **données chiffrées, prix, références modèles, conditions légales**.
- Un article déjà naturel : si rien ne se déclenche, ne force aucune édition.
  Mentionne-le dans le commit.

## Style Mister Pellets (rappel)

Tutoiement, ton direct et concret, français de Belgique. Pas de promesse
marketing creuse. Règles complètes : section 6.1 du brief.

## Livraison

- Édits chirurgicaux (Edit), jamais de réécriture massive.
- Vérifie que `lib/articles.ts` compile toujours (édits de chaînes uniquement,
  pas de risque de syntaxe — relis quand même le diff).
- Commit **direct sur `main`** (autorisé pour cette routine), message :
  `chore(blog): passe d'humanisation lot N (<portée>)` en suivant le format des
  lots précédents, avec le `Co-Authored-By`. N = numéro du lot suivant.
- `git push` vers `origin main`.
- Si aucun tic trouvé sur aucun article : pas de commit, signale-le simplement.
