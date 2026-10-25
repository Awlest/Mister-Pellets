import { VERCEL } from "./company";
import type { LegalSite } from "./types";

/**
 * Ce qui est propre à mister-pellets.be dans les pages légales communes aux
 * quatre sites d'AWLEST SRL (lib/legal/*.ts, identiques dans les quatre dépôts).
 *
 * Relevé dans le code et les outils le 19/10/2026, revu le 25/10/2026 :
 * - formulaires : app/api/{estimation,quote,rappel,contact,rdv/book}, base
 *   Supabase eu-west-1, fonctions Vercel dub1 (vercel.json), photos dans le
 *   store Blob mister-pellets-next-blob en fra1, e-mails Resend (eu-west-1)
 *   vers info@awlest.com, rendez-vous dans Google Agenda ;
 * - mesure : G-XZH50KSFW4, G-S7R1T5NQ58 (propriété liée à la balise Ads) et
 *   AW-17614035512, mode consentement avancé et url_passthrough
 *   (lib/analytics.ts), ad_personalization toujours refusé ; conservation GA
 *   réglée à 2 mois (événements) et 14 mois (utilisateur) ;
 * - stockage : mp-consent, mp_estimate_draft, mp_quote_draft ; le cookie
 *   payload-token ne sert qu'à l'équipe sur /admin.
 * Panier et paiement en ligne retirés le 04/09/2026 ; aucune newsletter.
 */
export const SITE: LegalSite = {
  brand: "Mister Pellets",
  domain: "mister-pellets.be",
  activity: "vendons, posons et entretenons des poêles à pellets",
  phone: "081 13 83 09",
  phoneHref: "+3281138309",
  email: "info@awlest.com",
  paths: {
    terms: "/cgv",
    legal: "/mentions-legales",
    privacy: "/politique-confidentialite",
    cookies: "/politique-cookies",
  },
  hosting: [
    `Le site est hébergé par ${VERCEL}. Vos formulaires passent par ses serveurs de Dublin, en Irlande, et les photos du site sont stockées chez Vercel, à Francfort.`,
    "La base de données, où nous gardons vos demandes, est hébergée par Supabase, en Irlande.",
  ],
  indicative: [
    "Les prix des poêles affichés sur le site et le résultat de l'estimation en ligne sont indicatifs : ils ne constituent pas une offre. Le prix ferme figure au devis, établi après la visite technique.",
    "Les caractéristiques techniques des poêles sont celles publiées par les fabricants. Elles sont données à titre indicatif et peuvent évoluer.",
  ],
  manufacturers: "Edilkamin, EK63, Girolami, Dielle, Ferlux, Austroflamm, Cadel",
  collected: [
    "**Estimation, demande de devis, demande de rappel, contact et rendez-vous** : nom, e-mail, téléphone, code postal, et l'adresse de la visite quand nous venons chez vous.",
    "**Votre projet** : surface, isolation ou PEB, type de conduit, âge du logement, poêle choisi. Ce sont vos réponses à l'estimation ou à la demande de devis ; sans elles, pas de prix qui tienne la route.",
    "**L'origine d'une demande de rappel** : si vous arrivez par une de nos annonces, le formulaire de rappel ajoute « Google Ads » et le nom de la campagne à votre demande.",
    "**Votre visite sur le site** : pages vues, provenance, type d'appareil et de navigateur. Si vous acceptez les cookies, Google Analytics et Google Ads relient ces informations à un identifiant rangé dans votre navigateur. Si vous refusez, ou tant que vous n'avez pas répondu, Google ne dépose rien sur votre appareil mais reçoit des signaux sans cookie, détaillés dans la politique cookies.",
  ],
  purposes: [
    "**Mesurer l'audience du site pour l'améliorer** : votre consentement aux cookies de mesure d'audience.",
    "**Savoir quelles annonces Google nous amènent des demandes** : votre consentement aux cookies de mesure publicitaire ; pour les signaux sans cookie envoyés sans votre accord, notre intérêt légitime à savoir si nos annonces valent ce qu'elles coûtent. Même si vous acceptez, Google ne peut pas se servir de votre visite pour vous montrer nos annonces sur d'autres sites.",
  ],
  processors: [
    "**Vercel** héberge le site. Vos formulaires passent par ses serveurs de Dublin.",
    "**Supabase** garde notre base de données, en Irlande.",
    "**Resend** envoie les e-mails du site, vos confirmations comme nos notifications internes, depuis l'Irlande.",
    "**OVH** fait suivre les e-mails adressés à info@mister-pellets.be, sans en garder de copie.",
    "**Google** : notre messagerie, où arrivent vos demandes, l'agenda où nous notons vos rendez-vous, et Google Analytics et Google Ads pour la mesure décrite plus haut.",
  ],
  transfers:
    "Vercel, Supabase, Resend et Google sont des sociétés américaines. Vos formulaires sont traités et stockés en Irlande, mais Google peut traiter les données de la messagerie, de l'agenda et de la mesure aux États-Unis. Ces transferts sont encadrés par le Data Privacy Framework, le cadre de transfert entre l'Union européenne et les États-Unis auquel ces prestataires adhèrent, ou par les clauses contractuelles types de la Commission européenne.",
  retention: [
    "**Google Analytics** : 2 mois pour le détail des visites, 14 mois après votre dernière visite pour ce qui est rattaché à votre navigateur.",
    "**Mesure des annonces** : 90 jours (cookies Google Ads).",
  ],
  cookieSummary:
    "Le site lui-même ne vous dépose aucun cookie : il garde trois informations dans le stockage de votre navigateur. Google Analytics et Google Ads ne déposent leurs cookies qu'après un clic sur Accepter, et jamais pour de la publicité personnalisée.",
  storage: [
    {
      title: "Indispensables",
      note: "Rangés dans le stockage de votre navigateur, pas dans un cookie, sauf le dernier, réservé à notre équipe. Ils ne servent qu'au site et ne partent nulle part.",
      items: [
        {
          name: "mp-consent",
          purpose: "Votre réponse au bandeau cookies",
          duration: "Jusqu'à ce que vous cliquiez sur « Gérer les cookies » ou effaciez les données du site",
        },
        {
          name: "mp_estimate_draft",
          purpose: "Vos réponses à l'estimation en ligne, si vous quittez la page avant la fin",
          duration: "Effacé à l'envoi de l'estimation",
        },
        {
          name: "mp_quote_draft",
          purpose: "Votre demande de devis en cours",
          duration: "Effacé à l'envoi de la demande",
        },
        {
          name: "payload-token",
          purpose: "Connexion à l'administration du site. Cookie réservé à notre équipe, jamais déposé chez les visiteurs",
          duration: "La durée de la connexion",
        },
      ],
    },
    {
      title: "Mesure d'audience",
      note: "Cookies déposés par Google Analytics, uniquement si vous acceptez.",
      items: [{ name: "_ga, _ga_*", purpose: "Pages vues, provenance de la visite, parcours sur le site", duration: "Jusqu'à 2 ans" }],
    },
    {
      title: "Mesure des annonces",
      note: "Déposés par Google Ads, uniquement si vous acceptez.",
      items: [
        {
          name: "_gcl_au, _gcl_aw, _gcl_gb",
          purpose: "Relier une demande (estimation, rappel, rendez-vous, appel depuis le site) au clic sur notre annonce",
          duration: "90 jours",
        },
        {
          name: "_gcl_ls",
          purpose: "Le même clic, rangé par Google dans le stockage de votre navigateur plutôt que dans un cookie",
          duration: "90 jours",
        },
      ],
    },
  ],
  measurement: [
    {
      p: "Si vous acceptez, Google peut aussi lire ou déposer ses propres cookies sur ses domaines (google.com, doubleclick.net), selon ses règles. Accepter sert à la mesure, pas à la publicité personnalisée : le site indique à Google qu'il ne peut pas se servir de votre visite pour vous montrer nos annonces ailleurs.",
    },
    { h3: "Ce qui part chez Google sans votre accord" },
    {
      p: "Le site utilise le mode consentement « avancé » de Google. Tant que vous n'avez pas répondu, ou si vous refusez, aucun cookie Google n'est déposé. Les pages envoient quand même à Google des signaux sans cookie : page vue, demande envoyée, heure, type de navigateur et, comme pour toute connexion, votre adresse IP. Google s'en sert pour estimer, quand il a assez de données, les visites et les demandes qu'il ne peut pas compter une à une.",
    },
    {
      p: "Si vous arrivez par une de nos annonces, le numéro de ce clic (gclid) et un code de Google (_gl) peuvent aussi rester dans l'adresse des pages suivantes. Une demande envoyée plus loin dans la visite est ainsi reliée à l'annonce, sans rien enregistrer sur votre appareil.",
    },
  ],
  consentBanner: true,
  consentText: [
    "À votre première visite, un bandeau vous pose la question : Accepter ou Refuser, deux boutons de même taille. Refuser ne bloque rien sur le site.",
    "Pour changer d'avis, cliquez sur « Gérer les cookies » en bas de chaque page, ou sur le bouton ci-dessous. Votre réponse est oubliée et le bandeau revient. Si vous refusez à ce moment-là, nous effaçons aussi ce que Google avait déposé par ce site, cookies et stockage du navigateur.",
  ],
};
