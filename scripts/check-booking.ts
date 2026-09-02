import {
  belgianWallTimeToInstant, belgianParts, generateCandidateSlots,
  filterAvailable, availableSlots, formatSlotTime, belgianDayKey,
  BUSINESS_HOURS, GAP_AFTER_EVENT_MIN,
} from "@/lib/booking";

let ko = 0;
function check(label: string, got: unknown, want: unknown) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) ko++;
  console.log(`${ok ? "ok  " : "KO  "} ${label}${ok ? "" : `\n      attendu ${JSON.stringify(want)}\n      obtenu  ${JSON.stringify(got)}`}`);
}

// 1. Heure d'ete (CEST, +2) : 9h locale = 07:00 UTC
const ete = belgianWallTimeToInstant(2026, 7, 15, 9, 0);
check("15/07 09:00 belge -> 07:00 UTC", new Date(ete).toISOString(), "2026-07-15T07:00:00.000Z");

// 2. Heure d'hiver (CET, +1) : 9h locale = 08:00 UTC
const hiver = belgianWallTimeToInstant(2026, 1, 15, 9, 0);
check("15/01 09:00 belge -> 08:00 UTC", new Date(hiver).toISOString(), "2026-01-15T08:00:00.000Z");

// 3. Aller-retour sur la nuit du changement d'heure (25/10/2026)
const bascule = belgianWallTimeToInstant(2026, 10, 26, 9, 0);
check("26/10 09:00 belge relu en local", formatSlotTime(bascule), "09:00");

// 4. Samedi : ferme a 13h, donc dernier creneau de 60 min a 12:00
const sam = belgianWallTimeToInstant(2026, 9, 5, 0, 0);
const samSlots = generateCandidateSlots(sam, sam + 86400000, 60)
  .filter(s => belgianDayKey(s.start) === "2026-09-05").map(s => formatSlotTime(s.start));
check("samedi 05/09, creneaux 60 min", samSlots, ["09:00","09:30","10:00","10:30","11:00","11:30","12:00"]);

// 5. Dimanche : aucun creneau
const dim = belgianWallTimeToInstant(2026, 9, 6, 0, 0);
const dimSlots = generateCandidateSlots(dim, dim + 86400000, 60)
  .filter(s => belgianDayKey(s.start) === "2026-09-06");
check("dimanche 06/09, aucun creneau", dimSlots.length, 0);

// 6. Regle des 30 min : RDV existant 10:00-11:00 le mardi 08/09
const jour = belgianWallTimeToInstant(2026, 9, 8, 0, 0);
const busy = [{
  start: belgianWallTimeToInstant(2026, 9, 8, 10, 0),
  end:   belgianWallTimeToInstant(2026, 9, 8, 11, 0),
}];
const libres = filterAvailable(
  generateCandidateSlots(jour, jour + 86400000, 60).filter(s => belgianDayKey(s.start) === "2026-09-08"),
  busy,
).map(s => formatSlotTime(s.start));
check("apres un RDV 10:00-11:00, premier creneau a 11:30", libres.includes("11:00"), false);
check("  ... et 11:30 est bien propose", libres.includes("11:30"), true);
check("  ... 09:00 reste libre (avant le RDV)", libres.includes("09:00"), true);
check("  ... 09:30 chevauche le RDV de 60 min, exclu", libres.includes("09:30"), false);

// 7. Delai de prevenance : rien dans les 24 h
const now = belgianWallTimeToInstant(2026, 9, 8, 10, 0);
const futurs = availableSlots(now, 60, []);
const tropTot = futurs.filter(s => s.start < now + 24 * 3600000);
check("aucun creneau sous 24 h de prevenance", tropTot.length, 0);
check("horizon : dernier creneau sous 30 jours", futurs[futurs.length - 1]!.start <= now + 30 * 86400000, true);

console.log(ko === 0 ? "\nTOUS OK" : `\n${ko} ECHEC(S)`);
process.exit(ko === 0 ? 0 : 1);
