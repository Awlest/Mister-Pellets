import type { Metadata, Viewport } from "next";
import { Fraunces, Inter_Tight } from "next/font/google";
import "./globals.css";
import { JsonLd, ORGANIZATION_SCHEMA } from "@/components/seo/JsonLd";
import { SITE_URL, SITE_NAME, SITE_LOCALE, DEFAULT_OG_IMAGE } from "@/lib/seo";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#FAF7F0",
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
    "Edilkamin, EK63 et Girolami : poêles à pellets vendus et posés en Wallonie. Pose en 1 jour, prime 2026 jusqu'à 960 €, livraison gratuite 50 km autour de Fernelmont. Devis en 60 secondes.",
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
    "primes énergie Wallonie 2026",
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
      "Edilkamin, EK63 et Girolami. Pose en 1 jour, primes incluses, livraison gratuite 50 km autour de Fernelmont.",
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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fr-BE"
      className={`${fraunces.variable} ${interTight.variable} h-full antialiased`}
    >
      <head>
        {/* Schemas globaux SSR, chaque page peut ajouter ses propres schemas en plus */}
        <JsonLd data={[ORGANIZATION_SCHEMA, WEBSITE_SCHEMA]} />
      </head>
      <body className="min-h-full flex flex-col bg-mp-cream text-mp-ink">
        {children}
      </body>
    </html>
  );
}
