import { CategoryLanding } from "@/components/sections/CategoryLanding";
import { getCategory } from "@/lib/categories";
import { buildPageMetadata } from "@/lib/seo";

const category = getCategory("poeles-a-pellets-hydro");

export const metadata = buildPageMetadata({
  title: category.metaTitle,
  description: category.metaDescription,
  path: category.path,
});

/** Régénération horaire : prix du bonus de saison et fiches ajoutées dans l'admin. */
export const revalidate = 3600;

export default function Page() {
  return <CategoryLanding category={category} />;
}
