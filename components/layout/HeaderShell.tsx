"use client";

import * as React from "react";

/**
 * Seule partie de l'en-tête exécutée dans le navigateur : elle suit le
 * défilement et le publie en `data-scrolled` sur <header>. Hauteur, fond,
 * ombre, logo et nom réagissent en CSS (variantes `data-scrolled:` et
 * `group-data-scrolled/header:` dans Header.tsx), sans nouveau rendu React.
 */
export function HeaderShell({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const ref = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    const header = ref.current;
    if (!header) return;
    const update = () => header.toggleAttribute("data-scrolled", window.scrollY > 100);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <header ref={ref} className={className}>
      {children}
    </header>
  );
}
