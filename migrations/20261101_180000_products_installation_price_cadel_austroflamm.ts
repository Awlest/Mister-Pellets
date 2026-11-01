import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

/**
 * Migration : vide le champ « Prix pose typique » (installation_price) des
 * fiches Cadel et Austroflamm, qui contenait le prix du poêle et non celui de
 * la pose.
 *
 * Le configurateur /estimation se sert de ce champ comme ligne de pose HT et
 * l'utilise À LA PLACE du forfait d'évacuation (lib/pose/moteur.ts,
 * `productPose`). Sur ces 29 fiches, la valeur est le prix TTC du poêle ramené
 * à 6 % de TVA (à 1 € près) : le poêle était donc compté deux fois, et le choix
 * de l'évacuation et la hauteur du conduit n'avaient aucun effet. Exemple relevé
 * en prod le 01/11/2026 : Cadel Prince 11 Autoclean, tubage 10 m, logement de
 * plus de 10 ans, « Pose Cadel Prince 11 Autoclean 3 106 € », total 6 088 €
 * au lieu d'environ 5 252 € avec le forfait de tubage. Champ vide = forfait
 * d'évacuation, comme pour les autres marques.
 *
 * État relevé le 01/11/2026 par l'API publique (qui renvoie aussi les fiches
 * masquées) : ces 29 fiches sont les seules de la base où le champ est rempli.
 * Le `up` ne vide une fiche que si sa valeur est encore celle relevée (une
 * saisie faite depuis dans l'admin est laissée telle quelle) ; le `down` remet
 * exactement ces valeurs sur les fiches restées vides.
 */
const RELEVE: ReadonlyArray<readonly [slug: string, installationPrice: number]> = [
  ["austroflamm-clou-compact-pellet", 5841], // poêle 6 667 € TTC
  ["austroflamm-clou-duo", 8263], // 9 432 €
  ["austroflamm-clou-pellet-10", 6519], // 7 442 €
  ["austroflamm-clou-pellet-8", 6519], // 7 442 €
  ["austroflamm-ella", 7791], // 8 894 €
  ["austroflamm-mo-duo", 9249], // 10 557 €
  ["austroflamm-mo-duo-cook", 9455], // 10 793 €
  ["austroflamm-quadra-duo", 7939], // 9 063 €
  ["austroflamm-scotty-duo", 9731], // 11 108 €
  ["cadel-luce-plus-9", 2661], // 3 037 €
  ["cadel-luce-plus-9-up-twin", 2952], // 3 370 €
  ["cadel-magritte-6", 3334], // 3 805 €
  ["cadel-mithos-plus-12-ps", 4129], // 4 713 €
  ["cadel-mithos-plus-12-up-twin", 4473], // 5 106 €
  ["cadel-mithos-plus-14-up-twin", 4781], // 5 457 €
  ["cadel-perla-7", 1935], // 2 208 €
  ["cadel-ponente-7", 3519], // 4 017 €
  ["cadel-prince-11-autoclean", 3106], // 3 545 €
  ["cadel-quasimodo-9-box-up-twin", 3212], // 3 666 €
  ["cadel-quasimodo-9-up-twin", 3662], // 4 181 €
  ["cadel-sound-5-ps", 2544], // 2 904 €
  ["cadel-sound-5-up-twin", 2878], // 3 285 €
  ["cadel-sound-7-up-twin", 3063], // 3 497 €
  ["cadel-spin-plus-9-ps-autoclean", 3456], // 3 945 €
  ["cadel-spin-plus-9-up-twin-autoclean", 3710], // 4 235 €
  ["cadel-spirit-5", 1966], // 2 245 €
  ["cadel-spirit-5-up", 2141], // 2 444 €
  ["cadel-sweet-7", 2046], // 2 335 €
  ["cadel-vesta-plus-11-up-twin-autoclean", 4065], // 4 640 €
];

export async function up({ db }: MigrateUpArgs): Promise<void> {
  for (const [slug, value] of RELEVE) {
    await db.execute(sql`
      UPDATE "products"
      SET "installation_price" = NULL
      WHERE "slug" = ${slug}
        AND "installation_price" = ${value};
    `);
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  for (const [slug, value] of RELEVE) {
    await db.execute(sql`
      UPDATE "products"
      SET "installation_price" = ${value}
      WHERE "slug" = ${slug}
        AND "installation_price" IS NULL;
    `);
  }
}
