interface Step {
  title: string;
  description: string;
}

interface ProcessStepsProps {
  title?: string;
  steps: Step[];
}

/**
 * Process en 4 étapes numérotées sur fond vert deep. Cf. brief §3.2 sec 7.
 */
export function ProcessSteps({ title = "Comment ça marche", steps }: ProcessStepsProps) {
  return (
    <section className="py-16 md:py-24 bg-mp-green-deep text-white">
      <div className="container mx-auto max-w-[1280px] px-4 md:px-6">
        <h2 className="text-3xl md:text-5xl font-semibold mb-12 max-w-3xl text-white">
          {title}
        </h2>

        <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
          {steps.map((step, i) => (
            <li key={i} className="flex flex-col gap-4 relative">
              {/* Cercle numéroté */}
              <div className="flex items-center justify-center h-14 w-14 rounded-full bg-mp-orange-flame text-white text-xl font-bold shadow-[0_8px_32px_rgba(242,138,32,0.32)]">
                {i + 1}
              </div>

              <h3
                className="text-xl font-semibold text-white"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {step.title}
              </h3>

              <p className="text-mp-cream/80 leading-relaxed text-sm">
                {step.description}
              </p>

              {/* Ligne connector — desktop only */}
              {i < steps.length - 1 && (
                <span
                  aria-hidden
                  className="hidden lg:block absolute top-7 left-[60px] right-[-40px] h-px bg-mp-cream/20"
                />
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
