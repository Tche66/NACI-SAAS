# LONACI Pro — SaaS Predictions Loto Bonheur

## Projet
SaaS de predictions pour le Loto Bonheur (LONACI, Cote d'Ivoire).
3 modeles IA (Bot statistique, Reseau Neuronal, LSTM) analysent 15 800+ tirages.

## Stack
- **Frontend**: Next.js 16 + React 19 + TypeScript + Tailwind CSS 4
- **Auth**: Custom JWT (bcryptjs + jose) avec cookies httpOnly
- **Database**: Fichiers JSON locaux (data/users.json, data/access.json)
- **Paiement**: SaaSPay (Orange Money, MTN MoMo, Wave)
- **Predictions API**: Express server existant (lonaci-scraper, port 3002)
- **Deploy**: Vercel (Next.js) + le serveur predictions a part

## Architecture
```
lonaci-saas/
  src/
    app/
      page.tsx              — Landing page (vente)
      login/page.tsx        — Connexion email/password
      dashboard/page.tsx    — Dashboard protege (predictions)
      pricing/page.tsx      — Tarifs + paiement SaaSPay
      api/
        auth/register/      — Inscription (POST)
        auth/login/         — Connexion (POST)
        auth/me/            — Session courante (GET)
        auth/logout/        — Deconnexion (POST)
        access/consume/     — Consommer une prediction (POST)
        payment/create/     — Creer paiement SaaSPay (POST)
        payment/callback/   — Webhook SaaSPay (POST)
    lib/
      auth.ts               — JWT creation/verification, cookies
      users.ts              — CRUD utilisateurs (JSON file)
      access.ts             — Controle acces (free=2/jour, 100F/24h, mensuel)
      saaspay.ts            — Integration SaaSPay
  data/
    users.json              — Comptes utilisateurs (gitignored)
    access.json             — Acces et quotas (gitignored)
```

## Modele d'acces
- **Gratuit**: 2 predictions par jour, suivi des paris
- **Pass 24h (100F)**: Predictions illimitees pendant 24h
- **Mensuel (2000F)**: Tout illimite + backtest + alertes

## Auth
- Inscription/connexion par email + mot de passe
- Mot de passe hashe avec bcryptjs (salt 10)
- Session JWT (jose, HS256, 30 jours) dans cookie httpOnly
- Pas de dependance externe (pas de Firebase, pas de OAuth provider)

## API Predictions (backend separe)
Le serveur Express dans ~/lonaci-scraper fournit:
- GET /api/tirages-du-jour?jour=N
- GET /api/predictions/:jour
- POST /api/placer-pari
- GET /api/mes-paris
- POST /api/backtest-custom

## Env vars
Copier `.env.example` vers `.env.local` et remplir:
- JWT_SECRET — secret pour signer les tokens (changer en prod!)
- SAASPAY_API_KEY / SAASPAY_SECRET — cles SaaSPay
- NEXT_PUBLIC_APP_URL — URL publique du SaaS
- NEXT_PUBLIC_API_URL — URL du serveur de predictions

## Dev
```bash
npm run dev          # Next.js sur :3000
# Serveur predictions:
cd ~/lonaci-scraper && PORT=3002 node server.js
```
