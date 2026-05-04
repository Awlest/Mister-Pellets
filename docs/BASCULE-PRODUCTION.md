# Bascule production Mister Pellets

Guide opérationnel pour ouvrir le site sur `mister-pellets.be` indexable.

---

## État actuel du code (V1.4.1 + wiring Resend/Payload V1.5)

✅ **Code prêt** :
- TypeScript clean, build production 64 pages
- Sécurité durcie : headers HTTP, rate limiting, CSRF, RLS Payload, login lockout 4/15 min, CORS no-wildcard
- SEO + GEO optimisés, schemas Schema.org riches, sitemap dynamique
- Routes API `/api/quote`, `/api/contact`, `/api/checkout` branchées sur Payload (sauvegarde DB) + Resend (emails)
- Stripe webhook idempotent

⚠️ **Manques bénins, ajustables en live** :
- 51 produits sur 61 à importer dans Payload (10 en démo actuellement)
- Sous-domaine `booking.mister-pellets.be` Easy!Appointments à activer (bandeau temporaire en place)
- URLs réelles des 3 profils sociaux (placeholders `#tiktok`, etc.)
- Année création Dielle (omise par honnêteté)

---

## Variables d'environnement à configurer sur Vercel (production)

Sur https://vercel.com/dashboard → projet `mister-pellets-next` → Settings → Environment Variables, sélectionner **Production** et ajouter :

### 🔴 OBLIGATOIRES pour ouvrir au public

| Variable | Valeur | Source |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://mister-pellets.be` | (au lieu de l'URL Vercel preview) |
| `NEXT_PUBLIC_ALLOW_INDEXING` | `true` | (déclenche indexation Google) |
| `PAYLOAD_SECRET` | `[chaîne aléatoire 32+ chars]` | Générer avec `openssl rand -base64 32` |
| `DATABASE_URI` | `postgresql://...` | Supabase prod (séparée de la preview !) ou Combell Postgres |
| `STRIPE_SECRET_KEY` | `sk_live_...` | Stripe Dashboard → Developers → API keys → mode **Live** |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Stripe Dashboard → Developers → Webhooks → endpoint créé sur `https://mister-pellets.be/api/webhooks/stripe` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | Stripe Dashboard → API keys mode Live |
| `RESEND_API_KEY` | `re_...` | Resend.com → API keys (créer un compte si absent, plan gratuit 3 000 emails/mois suffit) |

### 🟠 Recommandées

| Variable | Valeur | Source |
|---|---|---|
| `EMAIL_FROM` | `Mister Pellets <info@awlest.com>` | Domaine d'envoi (à valider DKIM/SPF dans Resend) |
| `EMAIL_TO_QUOTES` | `info@awlest.com` | Adresse qui reçoit les leads |
| `S3_ENDPOINT` + `S3_BUCKET` + `S3_ACCESS_KEY` + `S3_SECRET_KEY` + `S3_REGION` | (optionnel) | Stockage médias S3-compatible (Cellar OVH, Backblaze, R2 Cloudflare). Sinon Payload stocke en local sur Vercel (fonctionne mais pas idéal). |

### ⏳ Phase 8 (analytics, post-prod)

| Variable | Valeur |
|---|---|
| `NEXT_PUBLIC_GA_ID` | Google Analytics 4 |
| `NEXT_PUBLIC_CLARITY_ID` | Microsoft Clarity (heatmaps) |
| `SENTRY_DSN` | Sentry monitoring erreurs |

---

## Setup Stripe Live (5 min)

1. https://dashboard.stripe.com → toggle **View test data** → OFF (passer en mode Live)
2. Developers → API keys : copier `pk_live_...` et `sk_live_...` dans Vercel env vars
3. Developers → Webhooks → Add endpoint :
   - URL : `https://mister-pellets.be/api/webhooks/stripe`
   - Events : `checkout.session.completed`, `payment_intent.payment_failed`
   - Copier le `whsec_...` du endpoint vers `STRIPE_WEBHOOK_SECRET` Vercel
4. Activer Bancontact dans Settings → Payment methods (très utilisé en Belgique)
5. Configurer le brand : nom Mister Pellets, logo, couleurs (Stripe Checkout)

## Setup Resend (5 min)

1. Créer un compte sur https://resend.com (plan free 3 000 emails/mois suffit largement)
2. Domains → Add Domain → `mister-pellets.be` (ou `awlest.com` si déjà DKIM)
3. Suivre les instructions DNS : ajouter les 3 records (TXT SPF, CNAME DKIM, MX optionnel) dans le DNS du domaine
4. Une fois validé (icône verte), API keys → Create → copier `re_...` dans Vercel `RESEND_API_KEY`

---

## Bascule DNS

Deux options selon ton choix d'hébergement final :

### Option A — Vercel comme hébergeur prod (le plus simple)

1. Vercel → projet `mister-pellets-next` → Settings → Domains → Add `mister-pellets.be` et `www.mister-pellets.be`
2. Vercel affiche les records DNS à ajouter (typiquement A record `76.76.21.21` ou CNAME)
3. Côté registrar du domaine (probablement Combell ou OVH), pointer le DNS sur Vercel
4. Attendre propagation DNS (15 min à 24h selon TTL ancien)
5. Vercel installe automatiquement le certificat SSL Let's Encrypt
6. Désactiver le mot de passe Vercel preview (Settings → Deployment Protection)

### Option B — Combell hébergeur prod (selon brief original)

Plus complexe car Combell tourne sur Apache/Nginx + Node, pas idéal pour Next.js App Router. Si vraiment cette option :
1. Build Next.js standalone (`output: "standalone"` dans next.config.ts)
2. Copier `.next/standalone/` + `.next/static/` + `public/` sur Combell via FTP/SSH
3. Lancer Node + reverse proxy
4. Re-pointer DNS sur Combell

**Recommandation** : Option A. Vercel est conçu pour Next.js, déploiement instantané sur push, certificat SSL géré, edge CDN inclus, plan Pro 20 €/mois si trafic > Hobby (100 GB/mois).

---

## Checklist post-bascule (jour J)

Une fois `mister-pellets.be` répondant en HTTPS :

### Tests fonctionnels (15 min)

- [ ] Home s'affiche correctement (logo, nav, content)
- [ ] Boutique liste les produits
- [ ] Page produit ouverture + ajout panier
- [ ] Checkout test avec carte Stripe live (4242 4242 4242 4242 si test mode encore actif, sinon vraie CB en très petit montant)
- [ ] Email de confirmation reçu côté client + côté info@awlest.com
- [ ] Devis depuis `/demande-de-devis` : email staff + email client reçus
- [ ] Contact depuis `/contact` : email staff reçu
- [ ] FAQ avec recherche fonctionnelle
- [ ] Toutes les pages 200 OK (sitemap.xml accessible)

### Tests sécurité (5 min)

- [ ] https://securityheaders.com/?q=https://mister-pellets.be : note A ou A+ attendue
- [ ] https://www.ssllabs.com/ssltest/analyze.html?d=mister-pellets.be : certificat valide
- [ ] Tester `curl -X POST https://mister-pellets.be/api/quote -H "Origin: https://evil.com"` → 403 attendu
- [ ] Tester rate limit : envoyer 6 quotes en 1 min depuis la même IP → la 6e doit retourner 429

### Tests SEO + indexation (10 min)

- [ ] https://search.google.com/test/rich-results?url=https://mister-pellets.be/ : tous les schemas valides (Organization, LocalBusiness, FAQPage)
- [ ] https://www.opengraph.xyz/url/https://mister-pellets.be/ : OG image apparaît
- [ ] Soumettre le sitemap dans Google Search Console : `https://mister-pellets.be/sitemap.xml`
- [ ] Demander une indexation manuelle de la home dans GSC
- [ ] Vérifier robots.txt sert la version "allow" : `curl https://mister-pellets.be/robots.txt`

### Tests performance (5 min)

- [ ] https://pagespeed.web.dev/ → tester home + boutique + page produit. Cible Lighthouse mobile 90+
- [ ] WebPageTest depuis Belgique : LCP < 2,5 s, CLS < 0,1

---

## Plan B en cas de problème

Si quelque chose casse en prod après la bascule DNS :

1. **Rollback rapide** : Vercel → Deployments → trouver l'avant-dernier déploiement Ready → Promote to Production. Retour à l'état précédent en 30 secondes.
2. **Désactiver l'indexation** : changer `NEXT_PUBLIC_ALLOW_INDEXING` à `false`, redeploy. Le robots.txt repasse en disallow et X-Robots-Tag noindex est ajouté. Google va dépublier sous 24-48h.
3. **DNS rollback** : repointer le DNS vers l'ancien hébergeur si l'ancien site est encore disponible.

---

## Suivi 1 mois post-prod

- Surveiller la collection Payload `Quotes` et `ContactMessages` quotidiennement (leads entrants)
- Surveiller les logs Vercel pour erreurs 500
- Monitorer les avis Google sur la fiche Awlest (basculer vers Mister Pellets quand stabilité confirmée)
- Phase 8 : activer GA4, Search Console, Merchant Center, Sentry une fois la base utilisateur réelle observée
- Importer les 51 produits restants depuis Wix au fur et à mesure

---

**Dernière mise à jour** : 2026-05-04 — release V1.5 wiring Resend + Payload sur les routes API publiques.
