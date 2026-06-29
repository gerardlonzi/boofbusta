# ShopFlow — E-commerce Fullstack SaaS

Boutique en ligne professionnelle construite avec Next.js 16, React 19, Prisma + MongoDB.

## Stack

- **Frontend:** Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, React Hook Form, Zod
- **Backend:** Route Handlers, Prisma, MongoDB, JWT, Bcrypt
- **Services plug & play:** Stripe, Cloudinary, Resend

## Démarrage rapide

```bash
# 1. Copier les variables d'environnement
cp .env.example .env

# 2. Installer les dépendances
npm install

# 3. Pousser le schéma Prisma vers MongoDB
npm run db:push

# 4. Seed (admin + produits demo)
npm run db:seed

# 5. Lancer le dev server
npm dev
```

## Compte admin (seed)

- **Email:** admin@shopflow.com
- **Mot de passe:** défini via `ADMIN_SEED_PASSWORD` dans `.env` (voir `.env.example`)

## Configuration Stripe (plug & play)

Ajoutez dans `.env` :

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

Webhook endpoint : `POST /api/webhooks/stripe`

Sans Stripe, les commandes sont confirmées automatiquement (mode démo).

## Configuration Cloudinary

```env
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

Upload endpoint : `POST /api/upload` (admin)

## Configuration Resend (emails)

```env
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@votredomaine.com
```

## Architecture

```
app/           → Pages & API routes
components/    → UI (shadcn-style)
services/      → Logique métier
validations/   → Schémas Zod
lib/           → Auth, Stripe, Cloudinary, Email, Security
prisma/        → Schéma MongoDB
constants/     → Routes, config app
middleware.ts  → Protection routes + sécurité
```

## Modules implémentés

| Module | Description |
|--------|-------------|
| 1 | Setup, layout, helpers, env |
| 2 | Schéma Prisma complet (10 collections) |
| 3 | Auth JWT, middleware, register/login/reset |
| 4-5 | Catalogue, produits, recherche, filtres |
| 6-7 | Panier, wishlist |
| 8-9 | Checkout, Stripe plug & play, webhooks |
| 10 | Commandes, annulation, statuts |
| 11-12 | Dashboard client & admin |
| 13 | Upload Cloudinary |
| 14 | Avis clients + réponses admin |
| 15 | SEO (metadata, sitemap, robots, Schema.org) |
| 16 | ISR, Server Components, image optimization |
| 17 | Responsive (mobile/tablet/desktop) |
| 18 | Rate limiting, validation, security headers |
| 19 | Emails Resend (welcome, order, reset) |
| 20 | Déploiement Vercel + Mongo Atlas |

## Déploiement

1. **MongoDB Atlas** — créer un cluster, copier `DATABASE_URL`
2. **Vercel** — importer le repo, ajouter les variables `.env`
3. **Stripe** — configurer le webhook vers `https://votredomaine.com/api/webhooks/stripe`
4. `npm run db:push && npm run db:seed`
