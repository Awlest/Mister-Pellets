import { ShoppingBag, FileText, Calendar, Flame, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { HeroSecondary } from "@/components/sections/HeroSecondary";
import { TripleChoice } from "@/components/sections/TripleChoice";
import { StatsGrid } from "@/components/sections/StatsGrid";
import { BrandsGrid } from "@/components/sections/BrandsGrid";
import { ProcessSteps } from "@/components/sections/ProcessSteps";
import { PrimesBlock } from "@/components/sections/PrimesBlock";
import { Testimonials } from "@/components/sections/Testimonials";
import { FAQAccordion } from "@/components/sections/FAQAccordion";
import { CTAFinal } from "@/components/sections/CTAFinal";
import { ProductCard } from "@/components/product/ProductCard";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { Breadcrumb } from "@/components/seo/Breadcrumb";

export const metadata = {
  title: "Styleguide, composants UI",
  robots: { index: false, follow: false },
};

const COLORS = [
  { label: "Cream (60%)", token: "--mp-cream", className: "bg-mp-cream", text: "text-mp-ink" },
  { label: "Beige", token: "--mp-beige", className: "bg-mp-beige", text: "text-mp-ink" },
  { label: "Beige warm", token: "--mp-beige-warm", className: "bg-mp-beige-warm", text: "text-mp-ink" },
  { label: "Sand", token: "--mp-sand", className: "bg-mp-sand", text: "text-mp-ink" },
  { label: "Green deep (30%)", token: "--mp-green-deep", className: "bg-mp-green-deep", text: "text-white" },
  { label: "Green mid", token: "--mp-green-mid", className: "bg-mp-green-mid", text: "text-white" },
  { label: "Green light", token: "--mp-green-light", className: "bg-mp-green-light", text: "text-white" },
  { label: "Green darkest", token: "--mp-green-darkest", className: "bg-mp-green-darkest", text: "text-white" },
  { label: "Orange flame (10%)", token: "--mp-orange-flame", className: "bg-mp-orange-flame", text: "text-white" },
  { label: "Orange warm", token: "--mp-orange-warm", className: "bg-mp-orange-warm", text: "text-mp-ink" },
  { label: "Orange light", token: "--mp-orange-light", className: "bg-mp-orange-light", text: "text-mp-ink" },
  { label: "Bark (<1%)", token: "--mp-bark", className: "bg-mp-bark", text: "text-white" },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="py-12 border-b border-mp-sand/40">
      <h2
        className="text-2xl font-semibold text-mp-green-deep mb-6"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function StyleguidePage() {
  return (
    <>
      <HeroSecondary
        eyebrow="Design system v1"
        title="Styleguide Mister Pellets"
        description="Visualisation de tous les composants UI utilisés sur le site. Cette page n'est pas indexée par Google."
        breadcrumbs={[
          { label: "Accueil", href: "/" },
          { label: "Styleguide" },
        ]}
      />

      <div className="container mx-auto max-w-[1280px] px-4 md:px-6 py-12">
        {/* Couleurs */}
        <Section title="Palette officielle (60/30/10)">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {COLORS.map((c) => (
              <div
                key={c.token}
                className={`${c.className} ${c.text} rounded-xl p-4 text-xs font-medium border border-mp-sand/40 min-h-24 flex flex-col justify-between`}
              >
                <span>{c.label}</span>
                <span className="font-mono opacity-80">{c.token}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Typographie */}
        <Section title="Typographie">
          <div className="space-y-4">
            <div>
              <span className="text-xs uppercase tracking-wider text-mp-ink-soft">H1 Display · Fraunces 600</span>
              <h1 className="text-5xl md:text-6xl">Le bon poêle, <span className="mp-italic">posé chez vous</span></h1>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-mp-ink-soft">H2 · Fraunces 600</span>
              <h2 className="text-3xl md:text-4xl">Pourquoi choisir Mister Pellets</h2>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-mp-ink-soft">H3 · Fraunces 600</span>
              <h3 className="text-xl md:text-2xl">Diagnostic gratuit</h3>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-mp-ink-soft">Body Large · Inter Tight 400</span>
              <p className="text-lg">Edilkamin, EK63, Dielle, Ferlux. Conseils d'experts, pose soignée, primes incluses.</p>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-mp-ink-soft">Body · Inter Tight 400</span>
              <p>Mister Pellets est l'installateur spécialisé poêles à pellets pour la Wallonie. Basé à Fernelmont depuis 2016.</p>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-mp-ink-soft">Caption · Inter Tight 500 uppercase</span>
              <p className="text-xs uppercase tracking-wider font-medium text-mp-ink-soft">Garantie 5 ans incluse</p>
            </div>
          </div>
        </Section>

        {/* Buttons */}
        <Section title="Boutons">
          <div className="space-y-6">
            <div>
              <span className="text-xs uppercase tracking-wider text-mp-ink-soft block mb-3">Variants</span>
              <div className="flex flex-wrap gap-3 items-center">
                <Button variant="primary">Primary CTA</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link button</Button>
                <Button variant="destructive">Destructive</Button>
              </div>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-mp-ink-soft block mb-3">Sizes</span>
              <div className="flex flex-wrap gap-3 items-center">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
                <Button size="icon" aria-label="Icon"><ShoppingBag /></Button>
              </div>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-mp-ink-soft block mb-3">Avec icônes</span>
              <div className="flex flex-wrap gap-3 items-center">
                <Button variant="primary"><Flame /> Devis en 60 sec</Button>
                <Button variant="outline"><ShoppingBag /> Boutique</Button>
                <Button variant="secondary"><Calendar /> Prendre RDV</Button>
              </div>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-mp-ink-soft block mb-3">AddToCartButton (Phase 5 wiring)</span>
              <AddToCartButton
                productId="demo-id"
                productName="Edilkamin Blade 9kW"
                productBrand="Edilkamin"
                productPriceTTC={2890}
              />
            </div>
          </div>
        </Section>

        {/* Badges */}
        <Section title="Badges">
          <div className="flex flex-wrap gap-3 items-center">
            <Badge variant="default">Default</Badge>
            <Badge variant="primary">Primary</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="eyebrow">EYEBROW TAG</Badge>
            <Badge variant="primary"><Star className="h-3 w-3" /> Best-seller</Badge>
          </div>
        </Section>

        {/* Cards */}
        <Section title="Cards">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <CardTitle>Card simple</CardTitle>
              <p className="text-mp-ink-soft mt-2">Card de base avec padding et border-radius MP.</p>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Avec header</CardTitle>
                <CardDescription>Description secondaire</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-mp-ink-soft">Contenu de la card.</p>
              </CardContent>
            </Card>
            <Card className="p-6 ring-2 ring-mp-orange-flame ring-offset-2 ring-offset-mp-cream">
              <CardTitle>Card highlight</CardTitle>
              <p className="text-mp-ink-soft mt-2">Avec ring orange pour mettre en avant.</p>
            </Card>
          </div>
        </Section>

        {/* Breadcrumb */}
        <Section title="Breadcrumb (avec Schema BreadcrumbList)">
          <Breadcrumb
            items={[
              { label: "Accueil", href: "/" },
              { label: "Boutique", href: "/boutique" },
              { label: "Edilkamin", href: "/nos-marques/edilkamin" },
              { label: "Blade 9kW" },
            ]}
          />
        </Section>

        {/* ProductCard */}
        <Section title="ProductCard">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <ProductCard
              product={{
                slug: "edilkamin-blade-9kw",
                name: "Edilkamin Blade 9kW",
                brand: "Edilkamin",
                power: "9 kW",
                surface: "70-130 m²",
                priceTTC: 2890,
                isBestseller: true,
              }}
            />
            <ProductCard
              product={{
                slug: "ek63-tweed-90",
                name: "EK63 Tweed 90+ Canalisable",
                brand: "EK63",
                power: "9 kW",
                surface: "80-140 m²",
                priceTTC: 2390,
                isNew: true,
              }}
            />
            <ProductCard
              product={{
                slug: "dielle-iride-22",
                name: "Dielle Iride 22 Hydro",
                brand: "Dielle",
                power: "22 kW",
                surface: "180-300 m²",
              }}
            />
          </div>
        </Section>
      </div>

      {/* Sections en pleine largeur */}
      <Section title="">
        <div className="text-xs uppercase tracking-wider text-mp-ink-soft px-4 md:px-6 max-w-[1280px] mx-auto mb-2">
          Sections (pleine largeur)
        </div>
      </Section>

      <TripleChoice
        choices={[
          { icon: ShoppingBag, title: "Acheter en boutique", description: "61 modèles, livraison gratuite 20km.", cta: { label: "Voir la boutique", href: "/boutique" } },
          { icon: FileText, title: "Devis avec pose", description: "Chiffrage en 48h, primes incluses.", cta: { label: "Demander un devis", href: "/demande-de-devis" }, highlight: true },
          { icon: Calendar, title: "RDV showroom", description: "Voir les modèles à Fernelmont.", cta: { label: "Prendre RDV", href: "/prendre-rendez-vous" } },
        ]}
      />

      <StatsGrid
        title="StatsGrid (variante light)"
        stats={[
          { value: "−40 %", label: "sur la facture", detail: "vs mazout" },
          { value: "90 %", label: "de rendement", detail: "écodesign 2022" },
          { value: "960 €", label: "prime max", detail: "Wallonie 2026 R1" },
          { value: "−95 %", label: "d'émissions CO2", detail: "vs mazout" },
        ]}
      />

      <BrandsGrid />
      <ProcessSteps
        title="ProcessSteps (fond vert deep)"
        steps={[
          { title: "Diagnostic gratuit", description: "Visite à domicile ou visio." },
          { title: "Devis avec primes", description: "Chiffrage transparent en 48h." },
          { title: "Pose en 1 journée", description: "Équipe Mister Pellets, pose soignée." },
          { title: "Mise en route", description: "Garantie 5 ans pièces et main d'œuvre." },
        ]}
      />
      <PrimesBlock />
      <Testimonials />
      <FAQAccordion
        items={[
          { question: "Combien coûte un poêle pellets installé ?", answer: "Entre 4 500 et 7 500 € pose comprise selon le modèle." },
          { question: "Combien de temps pour la pose ?", answer: "Une journée pour la pose elle-même. 2-4 semaines au total." },
          { question: "Et si je n'ai pas de cheminée ?", answer: "Pas un problème, on tire une ventouse en façade ou toiture." },
        ]}
      />
      <CTAFinal />
    </>
  );
}
