import { ImageResponse } from "next/og";
import { brandPng } from "@/lib/brand-images";

/**
 * Image Open Graph par défaut (DEFAULT_OG_IMAGE dans lib/seo.ts), cf. audit
 * V20260503 §1.H.1 et §4.H.2. Sert pour Facebook, LinkedIn, WhatsApp, Twitter,
 * Slack, etc.
 *
 * Route statique : l'image est générée une seule fois au build puis servie
 * comme un fichier. L'ancien runtime edge empêchait cette génération et
 * rendait l'image à chaque requête.
 *
 * Règles de Satori, le moteur de next/og :
 * - toute <div> qui a plus d'un enfant doit déclarer display: flex, sinon le
 *   rendu échoue et la route renvoie un PNG vide (constaté en prod le
 *   11/10/2026) ;
 * - <br /> ne passe pas à la ligne et le texte ne coule pas en ligne : chaque
 *   ligne est une <div>, chaque couleur un élément à part ;
 * - sans police fournie, seule Geist Regular est disponible : Georgia, le gras
 *   et l'italique ne s'appliquent pas ;
 * - une image se passe en data URI avec sa largeur et sa hauteur : le logo
 *   est le PNG de public/brand, lu au build (lib/brand-images.ts).
 *
 * Fond crème uni, sans dégradé ni halo (DESIGN.md, 17/10/2026). Couleurs en
 * dur : Satori ne lit pas les variables CSS, ce sont les valeurs des jetons
 * --mp-* de globals.css (crème, vert le plus sombre, orange, encre douce).
 */

export const alt = "Mister Pellets, poêle à pellets en Wallonie depuis 2016";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const logo = brandPng("full", 120);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#F4EDE1",
          padding: "60px 80px",
          fontFamily: "Georgia, serif",
        }}
      >
        {/* Logo complet de la mascotte (public/brand, lib/brand-images.ts). */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img {...logo} alt="Mister Pellets" style={{ marginBottom: 36 }} />

        {/* Titre principal */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            fontSize: 64,
            fontWeight: 600,
            color: "#102916",
            textAlign: "center",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            marginBottom: 32,
            maxWidth: 1000,
          }}
        >
          <div>Le bon poêle à pellets,</div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              // Satori supprime l'espace en tête d'un texte : le gap la remplace
              // (0,25 em, largeur d'une espace dans Geist).
              columnGap: "0.25em",
            }}
          >
            <span style={{ color: "#C2680A", fontStyle: "italic" }}>
              installé chez vous
            </span>
            en Wallonie
          </div>
        </div>

        {/* Sous-titre / preuves */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            fontSize: 28,
            color: "#4A5A50",
            textAlign: "center",
            marginBottom: 48,
            maxWidth: 900,
            lineHeight: 1.4,
          }}
        >
          <div>Edilkamin · EK63 · Girolami</div>
          <div>Pose en 1 jour · TVA à 6 % en rénovation</div>
        </div>

        {/* Bandeau footer (identité Awlest + URL) */}
        <div
          style={{
            position: "absolute",
            bottom: 32,
            display: "flex",
            justifyContent: "space-between",
            width: 1040,
            fontSize: 20,
            color: "#4A5A50",
          }}
        >
          <div>+800 poêles vendus et installés depuis 2016</div>
          <div style={{ color: "#102916", fontWeight: 600 }}>
            mister-pellets.be
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
