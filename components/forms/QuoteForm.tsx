"use client";

import * as React from "react";
import { Check, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "mp_quote_draft";

/**
 * Validation téléphone, uniquement numéros belges (cf. doc §4.1).
 * Accepte : +32… / 0032… / 0X… avec espaces, points, tirets, parenthèses.
 * Refuse : tout autre indicatif international (+33, +352, +49, +31, etc.).
 */
function normalizeBelgianPhone(input: string): string {
  return input.replace(/[\s.\-()/]/g, "");
}

function isValidBelgianPhone(input: string): boolean {
  const cleaned = normalizeBelgianPhone(input);
  if (cleaned === "") return false;
  // Refuser tout indicatif international non-belge
  if (/^\+(?!32)/.test(cleaned)) return false;
  if (/^00(?!32)/.test(cleaned)) return false;
  // Patterns acceptés
  const patterns = [
    /^\+32[1-9]\d{7,8}$/,       // +32 + 8 à 9 chiffres (premier non zéro)
    /^0032[1-9]\d{7,8}$/,       // 0032 + 8 à 9 chiffres
    /^0[1-9]\d{7,8}$/,          // 0X + 8 à 9 chiffres (formats nationaux)
  ];
  return patterns.some((re) => re.test(cleaned));
}

type QuoteState = {
  surface: "moins-80" | "80-120" | "120-180" | "180-plus" | "";
  peb: "A" | "B" | "C" | "D" | "E" | "F" | "G" | "ne-sais-pas" | "";
  chimney: "diam-80" | "diam-100" | "aucune" | "ne-sais-pas" | "";
  style: "moderne" | "classique" | "rustique" | "design" | "scandinave" | "peu-importe" | "";
  budget: "moins-3000" | "3000-5000" | "5000-7500" | "7500-plus" | "";
  postalCode: string;
  delay: "asap" | "1-3-mois" | "3-6-mois" | "+6-mois" | "";
  name: string;
  email: string;
  phone: string;
  message: string;
  consent: boolean;
};

const initialState: QuoteState = {
  surface: "",
  peb: "",
  chimney: "",
  style: "",
  budget: "",
  postalCode: "",
  delay: "",
  name: "",
  email: "",
  phone: "",
  message: "",
  consent: false,
};

const STEPS = [
  { id: 1, label: "Surface" },
  { id: 2, label: "PEB" },
  { id: 3, label: "Cheminée" },
  { id: 4, label: "Style" },
  { id: 5, label: "Budget" },
  { id: 6, label: "Coordonnées" },
];

export function QuoteForm() {
  const [step, setStep] = React.useState(1);
  const [state, setState] = React.useState<QuoteState>(initialState);
  const [submitState, setSubmitState] = React.useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = React.useState<string>("");

  // Charger le brouillon localStorage
  React.useEffect(() => {
    try {
      const draft = localStorage.getItem(STORAGE_KEY);
      if (draft) setState((prev) => ({ ...prev, ...JSON.parse(draft) }));
    } catch {}
  }, []);

  // Sauvegarder le brouillon à chaque changement
  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state]);

  const update = <K extends keyof QuoteState>(key: K, value: QuoteState[K]) => {
    setState((prev) => ({ ...prev, [key]: value }));
  };

  const canGoNext = (): boolean => {
    switch (step) {
      case 1: return state.surface !== "";
      case 2: return state.peb !== "";
      case 3: return state.chimney !== "";
      case 4: return state.style !== "";
      case 5: return state.budget !== "";
      case 6:
        return (
          state.postalCode.length === 4 &&
          /^[1-9]\d{3}$/.test(state.postalCode) && // CP belge plausible (1000-9999)
          state.delay !== "" &&
          state.name.trim().length >= 2 &&
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email) &&
          isValidBelgianPhone(state.phone) &&
          state.consent === true
        );
      default: return false;
    }
  };

  const next = () => {
    if (canGoNext() && step < 6) setStep(step + 1);
    if (step === 6 && canGoNext()) handleSubmit();
  };

  const prev = () => step > 1 && setStep(step - 1);

  async function handleSubmit() {
    setSubmitState("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Erreur lors de l'envoi.");
      }
      setSubmitState("success");
      try { localStorage.removeItem(STORAGE_KEY); } catch {}
    } catch (e) {
      setSubmitState("error");
      setErrorMsg(e instanceof Error ? e.message : "Erreur inconnue");
    }
  }

  if (submitState === "success") {
    return (
      <div className="rounded-3xl bg-mp-green-light/15 border border-mp-green-light/40 p-8 md:p-12 text-mp-green-deep text-center">
        <div className="flex justify-center mb-6">
          <span className="flex items-center justify-center h-16 w-16 rounded-full bg-mp-green-light text-white">
            <Check className="h-8 w-8" />
          </span>
        </div>
        <h2 className="text-3xl md:text-4xl font-semibold mb-4">Demande reçue !</h2>
        <p className="text-lg leading-relaxed mb-6 max-w-2xl mx-auto">
          Merci {state.name}, on a bien reçu ta demande. On revient vers toi par email à <strong>{state.email}</strong> sous 48h ouvrées avec un chiffrage personnalisé. Si c'est urgent, tu peux aussi nous appeler au 0472 04 32 22.
        </p>
        <Button asChild variant="outline" size="default">
          <a href="/">Retour à l'accueil</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-white border border-mp-sand/40 shadow-md overflow-hidden">
      {/* Progress bar */}
      <div className="border-b border-mp-sand/40 bg-mp-cream px-6 md:px-8 py-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs uppercase tracking-wider text-mp-ink-soft font-semibold">
            Étape {step} sur 6
          </span>
          <span className="text-sm font-medium text-mp-green-deep">
            {STEPS[step - 1]?.label}
          </span>
        </div>
        <div className="h-1.5 bg-mp-sand/40 rounded-full overflow-hidden">
          <div
            className="h-full bg-mp-orange-flame rounded-full transition-all duration-500"
            style={{ width: `${(step / 6) * 100}%` }}
          />
        </div>
      </div>

      {/* Step content */}
      <div className="p-6 md:p-10 min-h-[400px]">
        {step === 1 && <Step1 value={state.surface} onChange={(v) => update("surface", v)} />}
        {step === 2 && <Step2 value={state.peb} onChange={(v) => update("peb", v)} />}
        {step === 3 && <Step3 value={state.chimney} onChange={(v) => update("chimney", v)} />}
        {step === 4 && <Step4 value={state.style} onChange={(v) => update("style", v)} />}
        {step === 5 && <Step5 value={state.budget} onChange={(v) => update("budget", v)} />}
        {step === 6 && (
          <Step6
            state={state}
            update={update}
          />
        )}

        {submitState === "error" && (
          <div className="mt-6 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-800">
            {errorMsg}
          </div>
        )}
      </div>

      {/* Footer actions, stack vertical sur mobile pour ne pas déborder, horizontal sm+ */}
      <div className="border-t border-mp-sand/40 px-4 sm:px-6 md:px-8 py-5 bg-mp-cream">
        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <Button
            variant="ghost"
            size="default"
            onClick={prev}
            disabled={step === 1 || submitState === "loading"}
            className={cn(
              "w-full sm:w-auto justify-center",
              step === 1 && "invisible h-0 sm:h-auto"
            )}
          >
            <ArrowLeft className="h-4 w-4" />
            Précédent
          </Button>

          <Button
            variant="primary"
            size="default"
            onClick={next}
            disabled={!canGoNext() || submitState === "loading"}
            className="w-full sm:w-auto justify-center"
          >
            {submitState === "loading" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Envoi…
              </>
            ) : step === 6 ? (
              <>Envoyer la demande <ArrowRight className="h-4 w-4" /></>
            ) : (
              <>Suivant <ArrowRight className="h-4 w-4" /></>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// === Step components ===

function ChoiceGrid<T extends string>({
  options,
  value,
  onChange,
  cols = 2,
}: {
  options: { value: T; label: string; sub?: string }[];
  value: T | "";
  onChange: (v: T) => void;
  cols?: 2 | 3 | 4;
}) {
  return (
    <div className={cn(
      "grid gap-3",
      cols === 2 && "grid-cols-1 sm:grid-cols-2",
      cols === 3 && "grid-cols-2 sm:grid-cols-3",
      cols === 4 && "grid-cols-2 sm:grid-cols-4",
    )}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded-xl border-2 p-4 text-left transition-all",
            value === opt.value
              ? "border-mp-orange-flame bg-mp-orange-light/40 ring-2 ring-mp-orange-flame/20"
              : "border-mp-sand/40 hover:border-mp-orange-flame/50 hover:bg-mp-cream"
          )}
        >
          <span className="block font-semibold text-mp-green-deep mb-0.5">{opt.label}</span>
          {opt.sub && <span className="block text-sm text-mp-ink-soft">{opt.sub}</span>}
        </button>
      ))}
    </div>
  );
}

function Step1({ value, onChange }: { value: QuoteState["surface"]; onChange: (v: QuoteState["surface"]) => void }) {
  return (
    <>
      <h2 className="text-2xl md:text-3xl font-semibold text-mp-green-deep mb-2">
        Quelle surface veux-tu chauffer ?
      </h2>
      <p className="text-mp-ink-soft mb-8">
        Si tu hésites, donne plutôt la surface du rez-de-chaussée si tu veux chauffer le bas, ou la surface totale habitable si tu veux du canalisable.
      </p>
      <ChoiceGrid<QuoteState["surface"] & string>
        value={value}
        onChange={onChange}
        cols={2}
        options={[
          { value: "moins-80", label: "Moins de 80 m²", sub: "Studio, T2, petit RDC" },
          { value: "80-120", label: "80 à 120 m²", sub: "Maison ou appart classique" },
          { value: "120-180", label: "120 à 180 m²", sub: "Maison familiale moyenne" },
          { value: "180-plus", label: "Plus de 180 m²", sub: "Grande maison, hydro recommandé" },
        ]}
      />
    </>
  );
}

function Step2({ value, onChange }: { value: QuoteState["peb"]; onChange: (v: QuoteState["peb"]) => void }) {
  return (
    <>
      <h2 className="text-2xl md:text-3xl font-semibold text-mp-green-deep mb-2">
        Quel est le PEB de ta maison ?
      </h2>
      <p className="text-mp-ink-soft mb-8">
        Le PEB (Performance Énergétique du Bâtiment) figure sur ton certificat. Si tu ne sais pas, choisis "Je ne sais pas", on adapte.
      </p>
      <ChoiceGrid<QuoteState["peb"] & string>
        value={value}
        onChange={onChange}
        cols={4}
        options={[
          { value: "A", label: "A", sub: "Très performant" },
          { value: "B", label: "B", sub: "Bon" },
          { value: "C", label: "C", sub: "Moyen" },
          { value: "D", label: "D", sub: "Moyen-faible" },
          { value: "E", label: "E", sub: "Faible" },
          { value: "F", label: "F", sub: "Mauvais (bonus prime)" },
          { value: "G", label: "G", sub: "Très mauvais (bonus prime)" },
          { value: "ne-sais-pas", label: "Je ne sais pas", sub: "On regardera ensemble" },
        ]}
      />
    </>
  );
}

function Step3({ value, onChange }: { value: QuoteState["chimney"]; onChange: (v: QuoteState["chimney"]) => void }) {
  return (
    <>
      <h2 className="text-2xl md:text-3xl font-semibold text-mp-green-deep mb-2">
        Tu as déjà une cheminée ?
      </h2>
      <p className="text-mp-ink-soft mb-8">
        Si oui, son diamètre intérieur. Sinon, pas de souci, on peut tirer une ventouse en façade ou en toiture.
      </p>
      <ChoiceGrid<QuoteState["chimney"] & string>
        value={value}
        onChange={onChange}
        cols={2}
        options={[
          { value: "diam-80", label: "Oui, diamètre 80 mm", sub: "Standard moderne" },
          { value: "diam-100", label: "Oui, diamètre 100 mm", sub: "Cheminée plus ancienne" },
          { value: "aucune", label: "Non, pas de cheminée", sub: "Ventouse en façade ou toiture" },
          { value: "ne-sais-pas", label: "Je ne sais pas", sub: "Diagnostic gratuit sur place" },
        ]}
      />
    </>
  );
}

function Step4({ value, onChange }: { value: QuoteState["style"]; onChange: (v: QuoteState["style"]) => void }) {
  return (
    <>
      <h2 className="text-2xl md:text-3xl font-semibold text-mp-green-deep mb-2">
        Quel style esthétique tu préfères ?
      </h2>
      <p className="text-mp-ink-soft mb-8">
        Pour orienter notre sélection. Tu pourras affiner sur les modèles précis ensuite.
      </p>
      <ChoiceGrid<QuoteState["style"] & string>
        value={value}
        onChange={onChange}
        cols={3}
        options={[
          { value: "moderne", label: "Moderne", sub: "Lignes épurées, vitre large" },
          { value: "classique", label: "Classique", sub: "Forme traditionnelle, fonte" },
          { value: "rustique", label: "Rustique", sub: "Pierre, céramique chaude" },
          { value: "design", label: "Design", sub: "Pièce d'architecte" },
          { value: "scandinave", label: "Scandinave", sub: "Bois clair, formes douces" },
          { value: "peu-importe", label: "Peu importe", sub: "Surprends-moi" },
        ]}
      />
    </>
  );
}

function Step5({ value, onChange }: { value: QuoteState["budget"]; onChange: (v: QuoteState["budget"]) => void }) {
  return (
    <>
      <h2 className="text-2xl md:text-3xl font-semibold text-mp-green-deep mb-2">
        Quel budget total (poêle + pose) ?
      </h2>
      <p className="text-mp-ink-soft mb-8">
        Hors prime, on calcule la prime ensuite et on te montre le net après déduction.
      </p>
      <ChoiceGrid<QuoteState["budget"] & string>
        value={value}
        onChange={onChange}
        cols={2}
        options={[
          { value: "moins-3000", label: "Moins de 3 000 €", sub: "Ferlux ou EK63 entrée gamme" },
          { value: "3000-5000", label: "3 000 à 5 000 €", sub: "Best-sellers EK63 / Edilkamin" },
          { value: "5000-7500", label: "5 000 à 7 500 €", sub: "Edilkamin premium ou hydro" },
          { value: "7500-plus", label: "Plus de 7 500 €", sub: "Hydros puissants, design premium" },
        ]}
      />
    </>
  );
}

function Step6({
  state,
  update,
}: {
  state: QuoteState;
  update: <K extends keyof QuoteState>(key: K, value: QuoteState[K]) => void;
}) {
  const inputClass = cn(
    "w-full rounded-xl border border-mp-sand bg-white px-4 py-3 text-mp-ink",
    "placeholder:text-mp-ink-soft/60 outline-none transition-colors",
    "focus:border-mp-orange-flame focus:ring-2 focus:ring-mp-orange-flame/20"
  );

  // Validation temps réel, on n'affiche l'erreur que si le champ a été touché
  const [touched, setTouched] = React.useState({
    postalCode: false,
    name: false,
    email: false,
    phone: false,
  });
  const markTouched = (field: keyof typeof touched) =>
    setTouched((p) => ({ ...p, [field]: true }));

  const errPostal =
    touched.postalCode && state.postalCode !== "" && !/^[1-9]\d{3}$/.test(state.postalCode)
      ? "Code postal belge invalide (4 chiffres entre 1000 et 9999)."
      : "";
  const errName =
    touched.name && state.name !== "" && state.name.trim().length < 2
      ? "Indique au moins ton prénom et ton nom."
      : "";
  const errEmail =
    touched.email && state.email !== "" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)
      ? "Format email invalide (exemple : prenom@domaine.be)."
      : "";
  const errPhone =
    touched.phone && state.phone !== "" && !isValidBelgianPhone(state.phone)
      ? "Nous ne desservons que la Belgique. Merci de saisir un numéro belge (ex. 0470 12 34 56 ou +32 470 12 34 56)."
      : "";

  const errorClass = "mt-1.5 text-xs text-red-600 leading-relaxed";

  return (
    <>
      <h2 className="text-2xl md:text-3xl font-semibold text-mp-green-deep mb-2">
        Comment on te recontacte ?
      </h2>
      <p className="text-mp-ink-soft mb-6">
        Réponse sous 48h ouvrées par email ou téléphone. Promis, pas de spam, pas de vente forcée.
      </p>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="postalCode" className="block text-sm font-medium text-mp-ink mb-2">
              Code postal <span className="text-mp-orange-flame">*</span>
            </label>
            <input
              id="postalCode"
              type="text"
              required
              maxLength={4}
              pattern="[0-9]{4}"
              inputMode="numeric"
              value={state.postalCode}
              onChange={(e) => update("postalCode", e.target.value.replace(/[^0-9]/g, ""))}
              onBlur={() => markTouched("postalCode")}
              className={cn(inputClass, errPostal && "border-red-400 focus:border-red-500 focus:ring-red-200")}
              placeholder="5380"
              autoComplete="postal-code"
              aria-invalid={Boolean(errPostal)}
              aria-describedby={errPostal ? "postalCode-error" : undefined}
            />
            {errPostal && <p id="postalCode-error" className={errorClass}>{errPostal}</p>}
          </div>
          <div>
            <label htmlFor="delay" className="block text-sm font-medium text-mp-ink mb-2">
              Délai souhaité <span className="text-mp-orange-flame">*</span>
            </label>
            <select
              id="delay"
              required
              value={state.delay}
              onChange={(e) => update("delay", e.target.value as QuoteState["delay"])}
              className={inputClass}
            >
              <option value="" disabled>Choisis…</option>
              <option value="asap">Le plus vite possible</option>
              <option value="1-3-mois">Dans 1 à 3 mois</option>
              <option value="3-6-mois">Dans 3 à 6 mois</option>
              <option value="+6-mois">Plus de 6 mois (je me renseigne)</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-mp-ink mb-2">
            Nom complet <span className="text-mp-orange-flame">*</span>
          </label>
          <input
            id="name"
            type="text"
            required
            minLength={2}
            value={state.name}
            onChange={(e) => update("name", e.target.value)}
            onBlur={() => markTouched("name")}
            className={cn(inputClass, errName && "border-red-400 focus:border-red-500 focus:ring-red-200")}
            autoComplete="name"
            placeholder="Sophie Dupont"
            aria-invalid={Boolean(errName)}
            aria-describedby={errName ? "name-error" : undefined}
          />
          {errName && <p id="name-error" className={errorClass}>{errName}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-mp-ink mb-2">
              Email <span className="text-mp-orange-flame">*</span>
            </label>
            <input
              id="email"
              type="email"
              required
              value={state.email}
              onChange={(e) => update("email", e.target.value)}
              onBlur={() => markTouched("email")}
              className={cn(inputClass, errEmail && "border-red-400 focus:border-red-500 focus:ring-red-200")}
              autoComplete="email"
              placeholder="sophie@exemple.be"
              aria-invalid={Boolean(errEmail)}
              aria-describedby={errEmail ? "email-error" : undefined}
            />
            {errEmail && <p id="email-error" className={errorClass}>{errEmail}</p>}
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-mp-ink mb-2">
              Téléphone <span className="text-mp-orange-flame">*</span>
              <span className="text-xs text-mp-ink-soft font-normal ml-1">(BE uniquement)</span>
            </label>
            <input
              id="phone"
              type="tel"
              required
              value={state.phone}
              onChange={(e) => update("phone", e.target.value)}
              onBlur={() => markTouched("phone")}
              className={cn(inputClass, errPhone && "border-red-400 focus:border-red-500 focus:ring-red-200")}
              autoComplete="tel"
              placeholder="0470 12 34 56"
              aria-invalid={Boolean(errPhone)}
              aria-describedby={errPhone ? "phone-error" : undefined}
            />
            {errPhone && <p id="phone-error" className={errorClass}>{errPhone}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-mp-ink mb-2">
            Message complémentaire (optionnel)
          </label>
          <textarea
            id="message"
            rows={3}
            value={state.message}
            onChange={(e) => update("message", e.target.value)}
            className={cn(inputClass, "resize-y")}
            placeholder="Tout ce qu'on doit savoir : configuration spéciale, projet en cours, etc."
          />
        </div>

        <label htmlFor="consent" className="flex items-start gap-3 cursor-pointer text-sm text-mp-ink-soft">
          <input
            id="consent"
            type="checkbox"
            required
            checked={state.consent}
            onChange={(e) => update("consent", e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-mp-sand text-mp-orange-flame focus:ring-mp-orange-flame"
          />
          <span>
            J'accepte que mes données soient utilisées pour me recontacter, conformément à la{" "}
            <a href="/politique-confidentialite" className="text-mp-orange-flame underline hover:no-underline">
              politique de confidentialité
            </a>
            .
          </span>
        </label>
      </div>
    </>
  );
}
