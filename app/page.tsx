import Image from "next/image";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-16 gap-10">
      <div className="flex items-center gap-4">
        <Image
          src="/logo-mister-pellets-mascotte.svg"
          alt="Mister Pellets"
          width={96}
          height={96}
          priority
        />
        <span className="text-3xl font-semibold text-mp-green-deep" style={{ fontFamily: "var(--font-display)" }}>
          Mister Pellets
        </span>
      </div>

      <div className="max-w-2xl text-center space-y-4">
        <h1 className="text-4xl md:text-6xl">
          Le bon poêle à pellets, <span className="mp-italic">installé chez vous</span> en Wallonie.
        </h1>
        <p className="text-lg text-mp-ink-soft">
          Edilkamin, EK63, Dielle, Ferlux. Conseils d&apos;experts, pose soignée, primes incluses.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <button
          type="button"
          className="rounded-full bg-mp-orange-flame px-7 py-4 text-white font-semibold shadow-md hover:bg-mp-orange-warm hover:shadow-lg transition-all duration-200"
        >
          Devis en 60 sec
        </button>
        <button
          type="button"
          className="rounded-full border-2 border-mp-green-deep px-7 py-4 text-mp-green-deep font-semibold hover:bg-mp-green-deep hover:text-white transition-all duration-200"
        >
          Voir la boutique
        </button>
      </div>

      <p className="text-sm text-mp-ink-soft mt-8 text-center max-w-2xl">
        🚧 <strong>Phase 1</strong> — Setup &amp; design tokens. Site en construction.
        <br />
        Prochaine étape : Phase 2 — composants UI (Header, Footer, Sticky Nav mobile).
      </p>

      {/* Vérification visuelle de la palette officielle (à supprimer après Phase 2) */}
      <section className="w-full max-w-4xl mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Cream (60%)", className: "bg-mp-cream", text: "text-mp-ink" },
          { label: "Beige", className: "bg-mp-beige", text: "text-mp-ink" },
          { label: "Beige warm", className: "bg-mp-beige-warm", text: "text-mp-ink" },
          { label: "Sand", className: "bg-mp-sand", text: "text-mp-ink" },
          { label: "Green deep (30%)", className: "bg-mp-green-deep", text: "text-white" },
          { label: "Green mid", className: "bg-mp-green-mid", text: "text-white" },
          { label: "Green light", className: "bg-mp-green-light", text: "text-white" },
          { label: "Green darkest", className: "bg-mp-green-darkest", text: "text-white" },
          { label: "Orange flame (10%)", className: "bg-mp-orange-flame", text: "text-white" },
          { label: "Orange warm", className: "bg-mp-orange-warm", text: "text-mp-ink" },
          { label: "Orange light", className: "bg-mp-orange-light", text: "text-mp-ink" },
          { label: "Bark (<1%)", className: "bg-mp-bark", text: "text-white" },
        ].map((c) => (
          <div
            key={c.label}
            className={`${c.className} ${c.text} rounded-md p-3 text-xs font-medium border border-mp-sand/40`}
          >
            {c.label}
          </div>
        ))}
      </section>
    </main>
  );
}
