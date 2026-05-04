/**
 * Skeleton de chargement global frontend (cf. audit V20260503 §2.M.1).
 * Affiché par Next.js pendant que le segment async se résout.
 */
export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-mp-cream py-16">
      <div className="container mx-auto max-w-3xl px-4 md:px-6 animate-pulse">
        <div className="h-8 w-32 bg-mp-sand/50 rounded-full mb-6 mx-auto" />
        <div className="h-12 w-3/4 bg-mp-sand/40 rounded-lg mb-4 mx-auto" />
        <div className="h-12 w-2/3 bg-mp-sand/40 rounded-lg mb-8 mx-auto" />
        <div className="space-y-3 max-w-xl mx-auto">
          <div className="h-4 bg-mp-sand/30 rounded" />
          <div className="h-4 bg-mp-sand/30 rounded w-5/6" />
          <div className="h-4 bg-mp-sand/30 rounded w-4/6" />
        </div>
      </div>
    </div>
  );
}
