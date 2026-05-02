import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-[80vh] flex-col items-center justify-center px-6 py-16 gap-10">
      <Image
        src="/logo-mister-pellets-full.svg"
        alt="Mister Pellets"
        width={280}
        height={280}
        priority
        className="w-48 md:w-64 h-auto"
      />

      <div className="max-w-2xl text-center space-y-4">
        <h1 className="text-4xl md:text-6xl">
          Le bon poêle à pellets, <span className="mp-italic">installé chez vous</span> en Wallonie.
        </h1>
        <p className="text-lg text-mp-ink-soft">
          Edilkamin, EK63, Dielle, Ferlux. Conseils d&apos;experts, pose soignée, primes incluses.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/demande-de-devis"
          className="rounded-full bg-mp-orange-flame px-7 py-4 text-white font-semibold shadow-md hover:bg-mp-orange-warm hover:shadow-lg transition-all duration-200"
        >
          Devis en 60 sec
        </Link>
        <Link
          href="/boutique"
          className="rounded-full border-2 border-mp-green-deep px-7 py-4 text-mp-green-deep font-semibold hover:bg-mp-green-deep hover:text-white transition-all duration-200"
        >
          Voir la boutique
        </Link>
      </div>
    </main>
  );
}
