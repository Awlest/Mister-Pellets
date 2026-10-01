import {
  belgianWallTimeToInstant, belgianParts, generateCandidateSlots,
  filterAvailable, availableSlots, formatSlotTime, belgianDayKey,
  BUSINESS_HOURS, GAP_AFTER_EVENT_MIN, GAP_BEFORE_EVENT_MIN,
  busyFromEvents, type CalendarEvent,
} from "@/lib/booking";
import { bookingCalendarEntry, buildIcs, googleCalendarUrl, icsDownloadPath } from "@/lib/booking-calendar";

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

// 6. Regle des 30 min, SYMETRIQUE : RDV existant 12:00-13:00 le mardi 08/09.
// On doit avoir 30 min de route avant comme apres.
const jour = belgianWallTimeToInstant(2026, 9, 8, 0, 0);
const busy = [{
  start: belgianWallTimeToInstant(2026, 9, 8, 12, 0),
  end:   belgianWallTimeToInstant(2026, 9, 8, 13, 0),
}];
const libres = filterAvailable(
  generateCandidateSlots(jour, jour + 86400000, 60).filter(s => belgianDayKey(s.start) === "2026-09-08"),
  busy,
).map(s => formatSlotTime(s.start));
check("apres un RDV 12:00-13:00, 13:00 est exclu", libres.includes("13:00"), false);
check("  ... 13:30 est bien propose (30 min apres)", libres.includes("13:30"), true);
check("  ... 11:00 est exclu (finirait a 12:00, sans route)", libres.includes("11:00"), false);
check("  ... 10:30 est bien propose (finit a 11:30)", libres.includes("10:30"), true);
check("  ... 11:30 chevauche le RDV, exclu", libres.includes("11:30"), false);
check("  ... 09:00 reste libre (loin du RDV)", libres.includes("09:00"), true);
check("les deux tampons valent bien 30 min", [GAP_BEFORE_EVENT_MIN, GAP_AFTER_EVENT_MIN], [30, 30]);

// 7. Delai de prevenance : rien dans les 24 h
const now = belgianWallTimeToInstant(2026, 9, 8, 10, 0);
const futurs = availableSlots(now, 60, []);
const tropTot = futurs.filter(s => s.start < now + 24 * 3600000);
check("aucun creneau sous 24 h de prevenance", tropTot.length, 0);
check("horizon : dernier creneau sous 30 jours", futurs[futurs.length - 1]!.start <= now + 30 * 86400000, true);

// 8. Regle « rien dans l'agenda » : tout evenement bloque, quel que soit son
// etat. Le champ « disponible/occupe » n'est meme pas demande a Google : un
// evenement affiche « disponible » arrive comme les autres et bloque.
const rdv = (extra: Partial<CalendarEvent> = {}): CalendarEvent => ({
  start: { dateTime: "2026-09-08T10:00:00+02:00" },
  end: { dateTime: "2026-09-08T11:00:00+02:00" },
  ...extra,
});
const moi = (responseStatus: string) => ({ attendees: [{ self: true, responseStatus }] });
check("evenement pose par Dorian -> occupe", busyFromEvents([rdv()]).length, 1);
check("invitation acceptee -> occupe", busyFromEvents([rdv(moi("accepted"))]).length, 1);
check("invitation SANS reponse -> occupe", busyFromEvents([rdv(moi("needsAction"))]).length, 1);
check("reponse « peut-etre » -> occupe", busyFromEvents([rdv(moi("tentative"))]).length, 1);
check("invitation refusee par Dorian -> libre", busyFromEvents([rdv(moi("declined"))]).length, 0);
check("refus d'un AUTRE invite -> occupe",
  busyFromEvents([rdv({ attendees: [{ responseStatus: "declined" }, { self: true, responseStatus: "needsAction" }] })]).length, 1);
check("evenement annule -> libre", busyFromEvents([rdv({ status: "cancelled" })]).length, 0);
check("absence (outOfOffice) -> occupe", busyFromEvents([rdv({ eventType: "outOfOffice" })]).length, 1);
check("lieu de travail -> libre", busyFromEvents([rdv({ eventType: "workingLocation" })]).length, 0);
check("anniversaire -> libre", busyFromEvents([rdv({ eventType: "birthday" })]).length, 0);
check("bornes illisibles -> ignore", busyFromEvents([rdv({ start: {}, end: {} })]).length, 0);
check("heure precise -> intervalle exact",
  busyFromEvents([rdv()]).map(b => [new Date(b.start).toISOString(), new Date(b.end).toISOString()]),
  [["2026-09-08T08:00:00.000Z", "2026-09-08T09:00:00.000Z"]]);

// Journee entiere : de minuit a minuit en heure belge, y compris la nuit du
// passage a l'heure d'hiver (25/10/2026, journee de 25 h).
const journee = busyFromEvents([{ start: { date: "2026-10-25" }, end: { date: "2026-10-26" } }])[0]!;
check("journee entiere 25/10 -> minuit belge a minuit belge",
  [new Date(journee.start).toISOString(), new Date(journee.end).toISOString()],
  ["2026-10-24T22:00:00.000Z", "2026-10-25T23:00:00.000Z"]);

// Effet sur les creneaux : une journee entiere vide la journee, et une
// invitation sans reponse de 14:00 a 15:00 ferme tous les departs de 13:00 a
// 15:00 (60 min de visite, 30 min de route de chaque cote).
const mardi = belgianWallTimeToInstant(2026, 9, 8, 0, 0);
const creneauxMardi = generateCandidateSlots(mardi, mardi + 86400000, 60)
  .filter(s => belgianDayKey(s.start) === "2026-09-08");
check("journee entiere -> aucun creneau ce jour-la",
  filterAvailable(creneauxMardi, busyFromEvents([{ start: { date: "2026-09-08" }, end: { date: "2026-09-09" } }])).length, 0);
const autourInvitation = filterAvailable(creneauxMardi,
  busyFromEvents([{ start: { dateTime: "2026-09-08T14:00:00+02:00" }, end: { dateTime: "2026-09-08T15:00:00+02:00" }, ...moi("needsAction") }]))
  .map(s => formatSlotTime(s.start));
check("invitation sans reponse 14:00-15:00 : 12:30 et 15:30 restent, 13:00-15:00 fermes",
  ["12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30"].filter(h => autourInvitation.includes(h)),
  ["12:30", "15:30"]);

// --- Entree d'agenda du client (e-mail de confirmation, /api/rdv/ics) ---
const debutRdv = belgianWallTimeToInstant(2026, 10, 8, 10, 30);
const domicile = bookingCalendarEntry({ slug: "devis-sur-place", name: "Devis sur place", location: "domicile" }, debutRdv, 60);
check("entree : 10:30 belge (CEST) -> 08:30 UTC, fin 60 min plus tard",
  [new Date(domicile.start).toISOString(), new Date(domicile.end).toISOString()],
  ["2026-10-08T08:30:00.000Z", "2026-10-08T09:30:00.000Z"]);
check("entree a domicile : pas d'adresse, juste « À votre domicile »", domicile.location, "À votre domicile");
const showroom = bookingCalendarEntry({ slug: "visite-showroom", name: "Visite showroom + conseils", location: "showroom" }, debutRdv, 45);
check("entree showroom : adresse du showroom", showroom.location, "Showroom Mister Pellets, Rue des Fagotis 3A, 5380 Fernelmont");

const ics = buildIcs(showroom, Date.UTC(2026, 9, 1, 9, 0));
check("ics : fins de ligne CRLF uniquement", ics.replace(/\r\n/g, "").includes("\n"), false);
check("ics : aucune ligne de plus de 75 octets",
  ics.split("\r\n").filter(l => new TextEncoder().encode(l).length > 75).length, 0);
const unfolded = ics.replace(/\r\n /g, "");
check("ics : debut et fin en UTC",
  ["DTSTART:20261008T083000Z", "DTEND:20261008T091500Z"].every(l => unfolded.includes(l)), true);
check("ics : virgules echappees dans le lieu",
  unfolded.includes("LOCATION:Showroom Mister Pellets\\, Rue des Fagotis 3A\\, 5380 Fernelmont"), true);
check("ics : sauts de ligne de la description echappes", /DESCRIPTION:[^\r\n]*\\n/.test(unfolded), true);
check("ics : PUBLISH, sans organisateur (pas une invitation)",
  [unfolded.includes("METHOD:PUBLISH"), unfolded.includes("ORGANIZER")], [true, false]);
check("ics : UID stable", unfolded.includes(`UID:rdv-visite-showroom-${debutRdv}@mister-pellets.be`), true);

// Un caractere accentue a cheval sur la limite des 75 octets ne doit pas etre
// coupe en deux : une fois les lignes recollees, on retrouve le texte d'origine.
const longue = bookingCalendarEntry({ slug: "devis-sur-place", name: "é".repeat(60), location: "domicile" }, debutRdv, 60);
const icsLong = buildIcs(longue, 0);
check("ics : repli sans casser les caracteres accentues",
  icsLong.replace(/\r\n /g, "").includes(`SUMMARY:Mister Pellets · ${"é".repeat(60)}`), true);
check("ics : lignes repliees <= 75 octets avec accents",
  icsLong.split("\r\n").filter(l => new TextEncoder().encode(l).length > 75).length, 0);

const gcal = new URL(googleCalendarUrl(domicile));
check("google agenda : dates en UTC", gcal.searchParams.get("dates"), "20261008T083000Z/20261008T093000Z");
check("google agenda : espaces en %20, jamais en +", googleCalendarUrl(domicile).includes("+"), false);
check("lien .ics : service et instant seulement",
  icsDownloadPath("devis-sur-place", debutRdv), `/api/rdv/ics?service=devis-sur-place&start=${debutRdv}`);

console.log(ko === 0 ? "\nTOUS OK" : `\n${ko} ECHEC(S)`);
process.exit(ko === 0 ? 0 : 1);
