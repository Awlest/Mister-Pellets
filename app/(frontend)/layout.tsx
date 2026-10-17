import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { NavbarSticky } from "@/components/layout/NavbarSticky";
import { Analytics } from "@/components/layout/Analytics";
import { SmoothMotion } from "@/components/layout/SmoothMotion";

export default function FrontendLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      {/* Skip-to-content (audit V20260503 §2.M.5) : visible uniquement au focus
        * clavier, permet aux utilisateurs screen reader de sauter la navigation. */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-mp-orange-flame focus:text-mp-green-darkest focus:px-4 focus:py-2 focus:rounded-full focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-mp-cream"
      >
        Aller au contenu principal
      </a>
      <Header />
      <main id="main-content" className="flex-1">{children}</main>
      <Footer />
      <NavbarSticky />
      <Analytics />
      <SmoothMotion />
    </>
  );
}
