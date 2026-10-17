/**
 * Conformité au standard commun des sites Mister (awlest-next,
 * ecosysteme/standard-sites-mister.md, 17/10/2026). Le même contrôle vit dans
 * Mister Bois (lib/famille.test.ts) et Mister Clim : si l'un des trois sites
 * change son menu, ses onglets ou ses liens famille sans changer le standard,
 * le contrôle échoue.
 *
 * pnpm check:famille
 */

import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { FAMILY_NAV_KEYS, MAIN_NAV, MOBILE_TABS, PUBLISHED, ROUTES, visibleNav } from "@/config/navigation";
import { FAMILY_HOSTS, FAMILY_SITES, PARENT_BRAND, PHONE_HREF } from "@/config/site";
import { EVENTS } from "@/lib/analytics";

const checks: [string, () => void][] = [
  [
    "menu principal, clés, ordre et libellés communs",
    () => {
      assert.deepEqual(
        MAIN_NAV.map((e) => e.key),
        [...FAMILY_NAV_KEYS],
      );
      assert.deepEqual(
        MAIN_NAV.map((e) => e.label),
        ["Catalogue", "Marques", "Services", "Aides", "Réalisations", "Conseils", "Contact"],
      );
    },
  ],
  [
    "le menu affiché garde l'ordre commun et ne vise que des pages publiées",
    () => {
      const shown = visibleNav().map((e) => e.key);
      assert.deepEqual(
        shown,
        FAMILY_NAV_KEYS.filter((k) => shown.includes(k)),
      );
      assert.ok(shown.includes("catalogue") && shown.includes("contact"));
    },
  ],
  [
    "chaque route publiée a son page.tsx",
    () => {
      const front = join(process.cwd(), "app", "(frontend)");
      for (const route of PUBLISHED) {
        const dir = route === "/" ? front : join(front, ...route.split("/").filter(Boolean));
        assert.ok(existsSync(join(dir, "page.tsx")), route);
      }
    },
  ],
  [
    "le volet Menu reprend le menu du haut, puis les actions de l'en-tête dans leur ordre",
    () => {
      const sheet = readFileSync(join(process.cwd(), "components", "layout", "MenuSheet.tsx"), "utf8");
      assert.ok(sheet.includes("visibleNav()"));
      const order = ["Appeler le {PHONE_DISPLAY}", "Prendre rendez-vous", "Estimer mon projet"].map((t) => sheet.lastIndexOf(t));
      assert.ok(order.every((i) => i > 0));
      assert.deepEqual([...order].sort((a, b) => a - b), order);
    },
  ],
  [
    "barre mobile, Accueil, Catalogue, Estimer, Appeler, Menu",
    () => {
      assert.deepEqual(
        MOBILE_TABS.map((t) => t.label),
        ["Accueil", "Catalogue", "Estimer", "Appeler", "Menu"],
      );
      assert.equal(MOBILE_TABS.find((t) => t.id === "call")?.href, PHONE_HREF);
      assert.equal(MOBILE_TABS.find((t) => t.id === "estimate")?.href, ROUTES.configurator);
    },
  ],
  [
    "famille, Awlest et les deux autres marques, domaines mesurés",
    () => {
      const hosts = FAMILY_SITES.map((s) => new URL(s.href).hostname.replace(/^www\./, ""));
      for (const h of ["mister-bois.be", "mister-clim.be", "awlest.com"]) assert.ok(hosts.includes(h), h);
      assert.ok(!hosts.includes("mister-pellets.be"));
      assert.deepEqual([...FAMILY_HOSTS].sort(), [...hosts].sort());
      assert.equal(PARENT_BRAND.href, "https://www.awlest.com");
    },
  ],
  [
    "pied de page, bandes Un service Awlest et La famille Awlest, ligne légale",
    () => {
      const footer = readFileSync(join(process.cwd(), "components", "layout", "Footer.tsx"), "utf8");
      assert.ok(footer.includes("Un service {PARENT_BRAND.name}"));
      assert.ok(footer.includes("La famille {PARENT_BRAND.name}"));
      assert.ok(footer.includes("LEGAL_ENTITY.enterpriseNumber"));
    },
  ],
  [
    "plan de marquage commun",
    () => {
      assert.equal(EVENTS.devisChiffre, "generate_lead");
      assert.equal(EVENTS.bookAppointment, "book_appointment");
      assert.equal(EVENTS.clickToCall, "click_to_call");
      assert.equal(EVENTS.crossBrandClick, "cross_brand_click");
    },
  ],
];

let failed = 0;
for (const [name, run] of checks) {
  try {
    run();
    console.log(`ok    ${name}`);
  } catch (e) {
    failed++;
    console.error(`ÉCHEC ${name}\n      ${(e as Error).message}`);
  }
}
if (failed > 0) {
  console.error(`\n${failed} contrôle(s) en échec : le site s'écarte du standard commun.`);
  process.exit(1);
}
console.log(`\nStandard commun respecté (${checks.length} contrôles).`);
