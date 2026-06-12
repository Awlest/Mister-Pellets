import { ImageResponse } from "next/og";

/**
 * OG image dynamique générée à la volée via @vercel/og (cf. audit V20260503
 * §1.H.1 et §4.H.2). Remplace le fichier `/public/og-image.jpg` qui
 * n'existait pas. Sert pour Facebook, LinkedIn, WhatsApp, Twitter, Slack, etc.
 *
 * Convention Next.js : ce fichier exporte automatiquement une URL OG
 * /opengraph-image qui est référencée dans la metadata du layout.
 */

export const runtime = "edge"; // ImageResponse requiert l'edge runtime
export const alt = "Mister Pellets — Poêle à pellets en Wallonie depuis 2016";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
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
          background:
            "linear-gradient(135deg, #FAF7F0 0%, #F4F1E8 50%, #EAE0CB 100%)",
          padding: "60px 80px",
          fontFamily: "Georgia, serif",
        }}
      >
        {/* Halo orange flottant en haut à droite */}
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -120,
            width: 480,
            height: 480,
            borderRadius: 9999,
            background:
              "radial-gradient(circle, rgba(242,138,32,0.28) 0%, rgba(242,138,32,0) 70%)",
          }}
        />

        {/* Bandeau identité (logo + wordmark) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            marginBottom: 48,
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 16,
              background: "#F28A20",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 40,
              color: "#FFFFFF",
            }}
          >
            🔥
          </div>
          <div
            style={{
              fontSize: 56,
              fontWeight: 600,
              color: "#102916",
              letterSpacing: "-0.02em",
            }}
          >
            Mister Pellets
          </div>
        </div>

        {/* Titre principal */}
        <div
          style={{
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
          Le bon poêle à pellets,
          <br />
          <span style={{ color: "#F28A20", fontStyle: "italic" }}>
            installé chez vous
          </span>{" "}
          en Wallonie
        </div>

        {/* Sous-titre / preuves */}
        <div
          style={{
            fontSize: 28,
            color: "#4A5A50",
            textAlign: "center",
            marginBottom: 48,
            maxWidth: 900,
            lineHeight: 1.4,
          }}
        >
          Edilkamin · EK63 · Girolami
          <br />
          Pose en 1 jour · Prime Wallonie 2026 jusqu&apos;à 960 €
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
