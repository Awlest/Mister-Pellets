"use client";

import * as React from "react";
import { Search, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  FAQS,
  FAQ_CATEGORIES,
  type FaqItem,
  type FaqCategory,
} from "@/lib/faqs";

/**
 * Explorateur FAQ interactif (Hotfix V1.3 §P2).
 *
 * - Recherche en temps réel (titre + réponse, insensible à la casse)
 * - Filtres par catégorie en pills horizontales scrollables sur mobile
 * - Accordéons : un seul ouvert à la fois (UX mobile)
 * - Catégorie + recherche se cumulent
 * - Bouton reset si au moins un filtre actif
 *
 * Composant client (interactivité React state). La page parent /faq fournit
 * le Schema.org FAQPage au build (côté serveur).
 */

type CategoryFilter = "all" | FaqCategory;

function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, ""); // accents
}

export function FaqExplorer() {
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState<CategoryFilter>("all");
  const [openId, setOpenId] = React.useState<string | null>(null);

  const filtered = React.useMemo(() => {
    const q = normalizeText(query);
    return FAQS.filter((f) => {
      if (category !== "all" && f.category !== category) return false;
      if (q === "") return true;
      return (
        normalizeText(f.question).includes(q) ||
        normalizeText(f.answer).includes(q)
      );
    });
  }, [query, category]);

  // Regroupement par catégorie pour l'affichage quand "Toutes" est sélectionnée
  const groupedByCategory = React.useMemo(() => {
    const groups = new Map<FaqCategory, FaqItem[]>();
    for (const item of filtered) {
      const list = groups.get(item.category) ?? [];
      list.push(item);
      groups.set(item.category, list);
    }
    return groups;
  }, [filtered]);

  const hasFilters = query !== "" || category !== "all";

  const reset = () => {
    setQuery("");
    setCategory("all");
    setOpenId(null);
  };

  return (
    <section className="bg-mp-cream py-10 md:py-16">
      <div className="container mx-auto max-w-3xl px-4 md:px-6">
        {/* Recherche */}
        <div className="mb-6">
          <label htmlFor="faq-search" className="sr-only">
            Rechercher dans la FAQ
          </label>
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-mp-ink-soft"
              aria-hidden
            />
            <input
              id="faq-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher dans la FAQ (mot, question, sujet)…"
              className={cn(
                "w-full rounded-full border border-mp-sand bg-white pl-12 pr-12 py-3.5",
                "text-base text-mp-ink placeholder:text-mp-ink-soft/70",
                "outline-none transition-colors",
                "focus:border-mp-orange-flame focus:ring-2 focus:ring-mp-orange-flame/20",
              )}
              autoComplete="off"
            />
            {query !== "" && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center h-8 w-8 rounded-full text-mp-ink-soft hover:bg-mp-beige transition-colors"
                aria-label="Effacer la recherche"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filtres catégories en pills scrollables horizontales */}
        <div className="mb-6 -mx-4 md:mx-0">
          <div className="flex gap-2 overflow-x-auto scrollbar-thin px-4 md:px-0 pb-2">
            <CategoryPill
              active={category === "all"}
              onClick={() => setCategory("all")}
              label={`Toutes`}
              count={FAQS.length}
            />
            {FAQ_CATEGORIES.filter((c) => c.count > 0).map((c) => (
              <CategoryPill
                key={c.value}
                active={category === c.value}
                onClick={() => setCategory(c.value)}
                label={c.label}
                count={c.count}
              />
            ))}
          </div>
        </div>

        {/* Compteur résultats + reset */}
        <div className="mb-5 flex items-center justify-between text-sm">
          <p className="text-mp-ink-soft">
            <strong className="text-mp-green-deep">{filtered.length}</strong>{" "}
            {filtered.length === 1 ? "question" : "questions"}
            {hasFilters && " correspondant à ta recherche"}
          </p>
          {hasFilters && (
            <button
              type="button"
              onClick={reset}
              className="text-xs font-semibold text-mp-orange-flame underline hover:no-underline"
            >
              Réinitialiser
            </button>
          )}
        </div>

        {/* Liste */}
        {filtered.length === 0 ? (
          <div className="rounded-2xl bg-mp-beige border border-mp-sand/40 p-8 text-center">
            <p className="text-mp-ink mb-3">
              Aucune question ne correspond à cette recherche.
            </p>
            <p className="text-sm text-mp-ink-soft">
              Essaie avec un autre mot, ou contacte-nous directement au{" "}
              <a
                href="tel:+32472043222"
                className="text-mp-orange-flame underline hover:no-underline font-semibold"
              >
                0472 04 32 22
              </a>
              .
            </p>
          </div>
        ) : category === "all" && query === "" ? (
          // Vue groupée par catégorie quand pas de filtre actif
          <div className="space-y-8">
            {Array.from(groupedByCategory.entries()).map(([cat, items]) => (
              <div key={cat}>
                <h2 className="text-xs font-bold uppercase tracking-wider text-mp-orange-flame mb-3">
                  {FAQ_CATEGORIES.find((c) => c.value === cat)?.label} ({items.length})
                </h2>
                <ul className="space-y-2">
                  {items.map((item) => (
                    <FaqItemRow
                      key={item.id}
                      item={item}
                      isOpen={openId === item.id}
                      onToggle={() => setOpenId(openId === item.id ? null : item.id)}
                    />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          // Vue à plat quand un filtre est actif
          <ul className="space-y-2">
            {filtered.map((item) => (
              <FaqItemRow
                key={item.id}
                item={item}
                isOpen={openId === item.id}
                onToggle={() => setOpenId(openId === item.id ? null : item.id)}
              />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function CategoryPill({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors shrink-0",
        active
          ? "bg-mp-orange-flame text-white shadow-sm"
          : "bg-white border border-mp-sand text-mp-green-deep hover:bg-mp-orange-light",
      )}
    >
      {label}
      <span className={cn("text-xs", active ? "text-white/85" : "text-mp-ink-soft")}>
        {count}
      </span>
    </button>
  );
}

function FaqItemRow({
  item,
  isOpen,
  onToggle,
}: {
  item: FaqItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <li
      className={cn(
        "rounded-2xl border bg-white transition-colors",
        isOpen ? "border-mp-orange-flame/40 shadow-sm" : "border-mp-sand/40 hover:border-mp-sand",
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-start justify-between gap-3 text-left p-4 md:p-5"
        aria-expanded={isOpen}
      >
        <h3 className="text-base md:text-lg font-semibold text-mp-green-deep leading-snug">
          {item.question}
        </h3>
        <ChevronDown
          className={cn(
            "h-5 w-5 shrink-0 mt-0.5 text-mp-orange-flame transition-transform duration-200",
            isOpen && "rotate-180",
          )}
          aria-hidden
        />
      </button>
      {isOpen && (
        <div className="px-4 md:px-5 pb-5 -mt-1">
          <p className="text-mp-ink leading-relaxed text-sm md:text-base">
            {item.answer}
          </p>
        </div>
      )}
    </li>
  );
}
