/**
 * Relance un build de production par le Deploy Hook Vercel.
 *
 * Les pages /produit/[slug] sont construites au build, fiches masquées
 * comprises, et la route refuse tout autre slug (dynamicParams = false) :
 * c'est ce qui donne aux slugs inconnus la vraie page 404 du site, rendue par
 * le serveur. Un produit créé, supprimé ou dont le slug change dans l'admin ne
 * modifie donc la liste des pages en ligne qu'au build suivant, que ce module
 * déclenche (collections/Products.ts).
 *
 * DEPLOY_HOOK_URL : l'URL du hook (Vercel, Settings > Git > Deploy Hooks,
 * branche main). Elle est secrète : qui la connaît peut lancer des builds.
 * Sans elle (poste local, scripts), rien n'est envoyé et un avertissement
 * rappelle que le changement attendra le prochain déploiement.
 *
 * Ne lève jamais : un hook injoignable ne doit pas faire échouer
 * l'enregistrement dans l'admin. Les échecs restent visibles dans les logs.
 */
export async function triggerDeployHook(reason: string): Promise<void> {
  const url = process.env.DEPLOY_HOOK_URL;
  if (!url) {
    console.warn(
      `[deploy-hook] DEPLOY_HOOK_URL absente, aucun build lancé (${reason}) : la liste des pages produit attendra le prochain déploiement.`,
    );
    return;
  }
  try {
    const res = await fetch(url, { method: "POST", signal: AbortSignal.timeout(10_000) });
    if (res.ok) {
      console.info(`[deploy-hook] build lancé (${reason})`);
    } else {
      console.error(`[deploy-hook] build refusé par Vercel : HTTP ${res.status} (${reason})`);
    }
  } catch (err) {
    console.error(`[deploy-hook] Vercel injoignable, aucun build lancé (${reason}) :`, err);
  }
}
