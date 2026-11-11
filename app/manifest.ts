import type { MetadataRoute } from "next";
import { SITE_NAME } from "@/config/site";

/**
 * Manifeste du site (/manifest.webmanifest) : nom, couleurs et icônes pour
 * l'écran d'accueil d'un téléphone et pour les moteurs. Le site reste un site,
 * pas une application : affichage « browser ». Icônes générées par
 * scripts/generate-favicons.ts.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME}, poêles à pellets en Wallonie`,
    short_name: SITE_NAME,
    description: "Vente, pose, entretien et dépannage de poêles à pellets en Wallonie.",
    lang: "fr-BE",
    start_url: "/",
    display: "browser",
    // check-design: allow (couleurs du manifeste, même valeur que --mp-cream et que la balise theme-color)
    background_color: "#F4EDE1",
    // check-design: allow (couleurs du manifeste, même valeur que --mp-cream et que la balise theme-color)
    theme_color: "#F4EDE1",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
