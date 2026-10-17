"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import type Lenis from "lenis";
import "lenis/dist/lenis.css";

// Défilement doux (Lenis) et apparitions au défilement (GSAP ScrollTrigger).
//
// - Rien n'est chargé avant la fin du chargement de la page : GSAP et Lenis
//   arrivent par import() pendant un temps mort, hors du chemin du LCP.
// - Rien n'est caché dans le HTML : seuls les blocs encore SOUS l'écran au
//   moment du montage passent en opacité 0, juste avant d'être vus. Le héros
//   et tout ce qui est déjà affiché ne bougent jamais.
// - Lenis seulement à la souris (pointeur fin) : au doigt, le défilement natif
//   du téléphone est déjà le bon.
// - prefers-reduced-motion : rien n'est chargé, rien ne bouge.
// - Un bloc précis peut sortir du système avec data-reveal="off".

type Engine = {
  gsap: typeof import("gsap").gsap;
  ScrollTrigger: typeof import("gsap/ScrollTrigger").ScrollTrigger;
  lenis: Lenis | null;
};

// Apparition : 14 px et un fondu, courbe proche de --mp-ease-out, une seule fois.
const REVEAL = { y: 14, duration: 0.55, stagger: 0.06, ease: "power3.out" } as const;
// Changement de page : fondu du contenu seul (une transformation sur <main>
// décalerait les barres fixes qu'il contient). Animation native : elle tourne
// sur le compositeur, même quand le rendu de la nouvelle page occupe le fil
// principal (un tween GSAP restait figé à 0 pendant ce temps).
const PAGE_FADE = { duration: 280, easing: "cubic-bezier(0.22, 1, 0.36, 1)" } as const;
// Une grille plus longue apparaît d'un bloc (boutique : tri et filtres
// réordonnent les cartes).
const MAX_SPLIT = 12;

// Volet, menu ou visionneuse ouverts : le site bloque le défilement de body
// (style inline, ou data-scroll-locked de Radix). Lenis s’arrête alors : la
// molette ne fait plus bouger la page, mais le contenu du volet défile encore.
function scrollLocked() {
  const body = document.body;
  return body.style.overflow === "hidden" || body.hasAttribute("data-scroll-locked");
}

function isList(el: Element) {
  return el.tagName === "UL" || el.tagName === "OL" || el.classList.contains("grid");
}

function skip(el: HTMLElement) {
  if (el.closest("[data-reveal='off']")) return true;
  if (/^(SCRIPT|STYLE|TEMPLATE|NOSCRIPT)$/.test(el.tagName)) return true;
  const style = getComputedStyle(el);
  return style.display === "none" || style.position === "fixed" || style.position === "sticky";
}

// Les blocs à faire apparaître : dans chaque <section> de premier niveau, on
// descend dans le conteneur jusqu'au contenu (titre, chapô, grille, bouton) ;
// une grille ou une liste courte apparaît carte par carte.
function revealTargets(main: HTMLElement) {
  const out: HTMLElement[] = [];
  const add = (el: Element) => {
    if (!(el instanceof HTMLElement) || skip(el)) return;
    if (isList(el) && el.children.length > 1 && el.children.length <= MAX_SPLIT) {
      for (const child of Array.from(el.children)) {
        if (child instanceof HTMLElement && !skip(child)) out.push(child);
      }
    } else {
      out.push(el);
    }
  };
  const sections = Array.from(main.querySelectorAll<HTMLElement>("section")).filter(
    (s) => !s.parentElement?.closest("section"),
  );
  for (const section of sections) {
    if (section.closest("[data-reveal='off']")) continue;
    let root: Element = section;
    while (root.children.length === 1 && root.firstElementChild && !isList(root.firstElementChild)) {
      root = root.firstElementChild;
    }
    for (const child of Array.from(root.children)) add(child);
  }
  return out;
}

function whenIdle(run: () => void) {
  const idle = () => {
    if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(run, { timeout: 1500 });
    else setTimeout(run, 200);
  };
  if (document.readyState === "complete") idle();
  else window.addEventListener("load", idle, { once: true });
}

export function SmoothMotion() {
  const pathname = usePathname();
  const [engine, setEngine] = useState<Engine | null>(null);
  const shownPath = useRef(pathname);

  // Chargement unique de GSAP et Lenis.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let cancelled = false;
    let teardown = () => {};

    whenIdle(async () => {
      const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
      const [{ gsap }, { ScrollTrigger }, LenisCtor] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
        fine ? import("lenis").then((m) => m.default) : Promise.resolve(null),
      ]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);

      let lenis: Lenis | null = null;
      const tick = (time: number) => lenis?.raf(time * 1000);
      if (LenisCtor) {
        lenis = new LenisCtor({
          lerp: 0.12,
          anchors: true, // respecte les scroll-mt-* déjà posés sous l'en-tête
          allowNestedScroll: true, // listes et volets qui défilent seuls
          stopInertiaOnNavigate: true,
        });
        lenis.on("scroll", ScrollTrigger.update);
        gsap.ticker.add(tick);
        gsap.ticker.lagSmoothing(0);
      }

      // Un filtre, un accordéon ou une image qui arrive change la hauteur de
      // la page : les points de départ sont recalculés.
      const lock = new MutationObserver(() => {
        if (!lenis) return;
        if (scrollLocked()) lenis.stop();
        else if (lenis.isStopped) lenis.start();
      });
      lock.observe(document.body, { attributes: true, attributeFilter: ["style", "data-scroll-locked"] });

      let timer = 0;
      const resize = new ResizeObserver(() => {
        window.clearTimeout(timer);
        timer = window.setTimeout(() => ScrollTrigger.refresh(), 150);
      });
      resize.observe(document.body);

      teardown = () => {
        resize.disconnect();
        lock.disconnect();
        window.clearTimeout(timer);
        gsap.ticker.remove(tick);
        lenis?.destroy();
      };
      setEngine({ gsap, ScrollTrigger, lenis });
    });

    return () => {
      cancelled = true;
      teardown();
    };
  }, []);

  // Changement de page : fondu court du nouveau contenu, avant qu'il soit peint.
  useLayoutEffect(() => {
    if (!engine || shownPath.current === pathname) return;
    shownPath.current = pathname;
    const main = document.getElementById("main-content");
    if (!main) return;
    const fade = main.animate([{ opacity: 0 }, { opacity: 1 }], PAGE_FADE);
    return () => fade.cancel();
  }, [engine, pathname]);

  // Apparitions au défilement, refaites à chaque page.
  useEffect(() => {
    if (!engine) return;
    const main = document.getElementById("main-content");
    if (!main) return;
    const { gsap, ScrollTrigger } = engine;

    const ctx = gsap.context(() => {
      const fold = window.innerHeight;
      const hidden = revealTargets(main).filter((el) => el.getBoundingClientRect().top > fold);
      if (!hidden.length) return;

      const show = (els: Element[]) =>
        gsap.to(els, {
          opacity: 1,
          y: 0,
          duration: REVEAL.duration,
          ease: REVEAL.ease,
          stagger: REVEAL.stagger,
          overwrite: true,
          clearProps: "opacity,transform",
        });

      gsap.set(hidden, { opacity: 0, y: REVEAL.y });
      ScrollTrigger.batch(hidden, {
        start: "top 92%",
        once: true,
        onEnter: show,
        // Saut direct plus bas (ancre, retour arrière) : rien ne reste caché au-dessus.
        onLeave: show,
      });

      // Tabulation vers un bloc pas encore apparu : il apparaît tout de suite.
      const onFocus = (e: FocusEvent) => {
        const target = hidden.find((el) => el.contains(e.target as Node));
        if (target) show([target]);
      };
      main.addEventListener("focusin", onFocus);
      return () => main.removeEventListener("focusin", onFocus);
    }, main);

    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [engine, pathname]);

  return null;
}
