import type { Metadata, Viewport } from "next";
import { Fraunces, Inter_Tight } from "next/font/google";
import "./globals.css";

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

export const metadata: Metadata = {
  metadataBase: new URL("https://mister-pellets.be"),
  title: {
    default: "Poêle à pellets en Wallonie — Vente & pose | Mister Pellets",
    template: "%s | Mister Pellets",
  },
  description:
    "61 modèles Edilkamin, EK63, Dielle, Ferlux. Pose en 1 jour, primes incluses, livraison gratuite 50km autour de Fernelmont. Devis en 60 secondes.",
  applicationName: "Mister Pellets",
  authors: [{ name: "Mister Pellets" }],
  generator: "Next.js",
  keywords: [
    "poêle à pellets",
    "Wallonie",
    "Belgique",
    "Edilkamin",
    "EK63",
    "Dielle",
    "Ferlux",
    "primes énergie",
    "Fernelmont",
  ],
  openGraph: {
    type: "website",
    locale: "fr_BE",
    siteName: "Mister Pellets",
    url: "https://mister-pellets.be",
    title: "Poêle à pellets en Wallonie — Vente & pose | Mister Pellets",
    description:
      "61 modèles, pose en 1 jour, primes incluses, livraison gratuite 50km autour de Fernelmont.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Mister Pellets — Poêle à pellets Wallonie",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mister Pellets — Poêle à pellets Wallonie",
    description: "Vente, pose et entretien de poêles à pellets en Wallonie.",
    images: ["/og-image.jpg"],
  },
  alternates: {
    canonical: "https://mister-pellets.be",
  },
  robots: {
    // Pendant la phase preview Vercel, on bloque l'indexation via header dans next.config.
    // En prod, ce sera reactivé via NEXT_PUBLIC_ALLOW_INDEXING.
    index: process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true",
    follow: process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fr-BE"
      className={`${fraunces.variable} ${interTight.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-mp-cream text-mp-ink">
        {children}
      </body>
    </html>
  );
}
