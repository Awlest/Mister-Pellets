import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "../globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { NavbarSticky } from "@/components/layout/NavbarSticky";
import { PelletPromoBanner } from "@/components/layout/PelletPromoBanner";
import { Analytics } from "@/components/layout/Analytics";
import { SmoothMotion } from "@/components/layout/SmoothMotion";
import { JsonLd, ORGANIZATION_SCHEMA } from "@/components/seo/JsonLd";
import { GA_BOOTSTRAP } from "@/lib/analytics";
import { SITE_URL, SITE_NAME, SITE_LOCALE, DEFAULT_OG_IMAGE } from "@/lib/seo";

// Mise en page racine du site public. Pas d'app/layout.tsx : l'admin Payload
// (app/(payload)) rend son propre <html> dans son RootLayout, et une mise en
// page racine commune l'enveloppait dans celui du site. /admin/login sortait
// alors avec deux balises <html>, d'où l'erreur React #418 (décalage
// d'hydratation) à chaque chargement (constaté le 24/10/2026). Chaque groupe
// porte donc son document, comme sur mister-clim. La 404 des adresses
// inconnues, servie hors de tout layout, reprend celui-ci :
// app/global-not-found.tsx.

// Polices hébergées dans le dépôt (app/fonts) : les fichiers latins que
// next/font/google servait, repris à l'identique. Le 11/10/2026, Google a servi
// par intermittence des adresses de police que Turbopack ne sait pas lire
// (« next/font/google queries have exactly one entry ») : le build Vercel du
// commit a5da23e a échoué sur Fraunces, et mister-clim a eu la même panne le
// même jour. Plus aucune requête vers Google au build. Fichiers variables : un
// seul fichier par style couvre les graisses déclarées. Polices de repli :
// celles que générait next/font/google, déclarées dans globals.css.
const fraunces = localFont({
  variable: "--font-fraunces",
  display: "swap",
  adjustFontFallback: false,
  fallback: ["Fraunces Fallback"],
  src: [
    { path: "../fonts/fraunces-latin.woff2", weight: "400 600", style: "normal" },
    { path: "../fonts/fraunces-italic-latin.woff2", weight: "400 600", style: "italic" },
  ],
});

const interTight = localFont({
  variable: "--font-inter-tight",
  display: "swap",
  adjustFontFallback: false,
  fallback: ["Inter Tight Fallback"],
  src: [{ path: "../fonts/inter-tight-latin.woff2", weight: "400 700", style: "normal" }],
});

export const viewport: Viewport = {
  // check-design: allow (balise meta : valeur littérale du jeton --mp-cream)
  themeColor: "#F4EDE1",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

const allowIndex = process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Poêle à pellets en Wallonie, Vente & pose | Mister Pellets",
    template: "%s | Mister Pellets",
  },
  description:
    "Edilkamin, EK63, Girolami, Austroflamm et Cadel : poêles à pellets vendus et posés en Wallonie. Pose en 1 jour, TVA à 6 % sur les logements de plus de 10 ans, livraison gratuite dans 20 km autour de Fernelmont.",
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  generator: "Next.js",
  publisher: SITE_NAME,
  keywords: [
    "poêle à pellets",
    "poêle pellets Wallonie",
    "poêle pellets Belgique",
    "Edilkamin",
    "EK63",
    "Girolami",
    "Austroflamm",
    "Cadel",
    "aides poêle à pellets Wallonie 2026",
    "installation poêle pellets",
    "Fernelmont",
    "Namur",
    "Charleroi",
    "Liège",
  ],
  category: "Home Improvement",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: SITE_LOCALE,
    siteName: SITE_NAME,
    url: SITE_URL,
    title: "Poêle à pellets en Wallonie, Vente & pose | Mister Pellets",
    description:
      "Edilkamin, EK63, Girolami, Austroflamm et Cadel. Pose en 1 jour, TVA à 6 % sur les logements de plus de 10 ans, livraison gratuite dans 20 km autour de Fernelmont.",
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Mister Pellets, Poêle à pellets Wallonie",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mister Pellets, Poêle à pellets Wallonie",
    description: "Vente, pose et entretien de poêles à pellets en Wallonie.",
    images: [DEFAULT_OG_IMAGE],
  },
  alternates: {
    canonical: SITE_URL,
  },
  robots: {
    index: allowIndex,
    follow: allowIndex,
    googleBot: {
      index: allowIndex,
      follow: allowIndex,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  // Vérification Google Search Console / Merchant Center
  // (injecte <meta name="google-site-verification" content="..." /> dans <head>)
  verification: {
    google: "qEXfmw1AUj80W-8VJGP9Dmabbu3Lomqix0sgGkedpPc",
  },
};

const WEBSITE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: SITE_URL,
  name: SITE_NAME,
  description: "Vente, installation et entretien de poêles à pellets en Wallonie.",
  publisher: { "@id": `${SITE_URL}/#organization` },
  inLanguage: "fr-BE",
  // SearchAction retiré : la page /recherche n'existe pas encore, et un
  // SearchAction qui pointe vers une 404 est signalé en erreur par Google
  // (audit 2026-06-12 §P0-2). À réintroduire le jour où une vraie page de
  // recherche existe.
};

export default function FrontendLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // suppressHydrationWarning : l'amorce du consentement (GA_BOOTSTRAP) pose
    // data-consent sur <html> avant l'hydratation, attribut absent du rendu
    // serveur. Ne vaut que pour les attributs de <html>, pas pour ses enfants.
    <html
      lang="fr-BE"
      className={`${fraunces.variable} ${interTight.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Schemas globaux SSR, chaque page peut ajouter ses propres schemas en plus */}
        <JsonLd data={[ORGANIZATION_SCHEMA, WEBSITE_SCHEMA]} />
        {/* Consentement Google : doit precéder tout chargement de gtag.js. */}
        <script dangerouslySetInnerHTML={{ __html: GA_BOOTSTRAP }} />
      </head>
      <body className="min-h-full flex flex-col bg-mp-cream text-mp-ink">
        {/* Skip-to-content (audit V20260503 §2.M.5) : visible uniquement au focus
          * clavier, permet aux utilisateurs screen reader de sauter la navigation. */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-mp-orange-flame focus:text-mp-green-darkest focus:px-4 focus:py-2 focus:rounded-full focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-mp-cream"
        >
          Aller au contenu principal
        </a>
        {/* Prix de lancement des pellets Comfo : rien hors période (lib/pellets.ts). */}
        <PelletPromoBanner />
        <Header />
        <main id="main-content" className="flex-1">{children}</main>
        <Footer />
        <NavbarSticky />
        <Analytics />
        <SmoothMotion />
      </body>
    </html>
  );
}
