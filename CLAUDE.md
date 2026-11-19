# LONACI Pro — SaaS Predictions Loto Bonheur

## Projet
SaaS de predictions pour le Loto Bonheur (LONACI, Cote d'Ivoire).
3 modeles IA (Bot statistique, Reseau Neuronal, LSTM) analysent 15 800+ tirages.

## Stack
- **Frontend**: Next.js 16 + React 19 + TypeScript + Tailwind CSS 4
- **Auth**: Firebase Authentication (telephone + email)
- **Database**: Firebase Firestore (users, access, bets)
- **Paiement**: SaaSPay (Orange Money, MTN MoMo, Wave)
- **Predictions API**: Express server existant (lonaci-scraper, port 3002)
- **Deploy**: Vercel (Next.js) + le serveur predictions a part

## Architecture
```
lonaci-saas/
  src/
    app/
      page.tsx            — Landing page (vente)
      login/page.tsx      — Connexion (tel/email)
      dashboard/page.tsx  — Dashboard protege
      pricing/page.tsx    — Tarifs + paiement SaaSPay
      api/payment/        — Webhooks SaaSPay
    lib/
      firebase.ts         — Config Firebase
      access.ts           — Controle acces (free=2/jour, 100F/24h, mensuel)
      saaspay.ts          — Integration SaaSPay
    components/           — Composants React
```

## Modele d'acces
- **Gratuit**: 2 predictions par jour, suivi des paris
- **Pass 24h (100F)**: Predictions illimitees pendant 24h
- **Mensuel (2000F)**: Tout illimite + backtest + alertes

## API Predictions (backend separe)
Le serveur Express dans ~/lonaci-scraper fournit:
- GET /api/tirages-du-jour?jour=N
- GET /api/predictions/:jour
- POST /api/placer-pari
- GET /api/mes-paris
- POST /api/backtest-custom

## Env vars
Copier `.env.example` vers `.env.local` et remplir les cles Firebase + SaaSPay.

## Dev
```bash
npm run dev          # Next.js sur :3000
# Serveur predictions:
cd ~/lonaci-scraper && PORT=3002 node server.js
```
