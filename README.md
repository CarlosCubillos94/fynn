# Fynn

A personal finance app for the phone. Type `uber 4500` or `almuerzo 8000`, and Fynn suggests a category, keeps the ledger on the device, and tells you in plain language how this week compares with the last.

## Features

- Onboarding and an optional Face ID or fingerprint lock
- Phrase entry, plus a manual form for amount, category, note, and date
- On-device categorization, with an optional assistant through a proxy that never ships the API key
- Weekly summary computed from your own transactions
- Monthly balance, spending by category, and a six-month expense trend
- Budgets per category, with a warning at 80 percent
- Search, filters, and swipe to delete
- CLP and USD
- Light and dark mode
- Sample ledger on first launch, labeled as sample data

## Stack

Expo, React Native, TypeScript, Expo Router, NativeWind, Reanimated, Zustand, React Query, expo-sqlite, expo-local-authentication. Jest and React Native Testing Library. A small Node proxy for an OpenAI-compatible API.

```mermaid
flowchart LR
  Screens[Expo Router screens] --> Repo[SQLite repository]
  Screens --> Parser[On-device phrase parser]
  Screens --> Proxy[AI proxy]
  Proxy --> Model[OpenAI-compatible API]
```

## Run it

```bash
npm install
npm start
```

Then press `i` for the iOS simulator, `a` for Android, or `w` for the web demo.

```bash
npm test
npm run typecheck
npm run lint
npm run export:web
```

The first launch is a sample ledger. It is not a real account. Remove it in Settings.

## Assistant proxy

The app works fully offline. To let a model rephrase a category or the weekly sentence, run the proxy and point the app at it. The key stays in the proxy environment.

```bash
export OPENAI_API_KEY=your-key
export OPENAI_BASE_URL=https://api.openai.com/v1
export OPENAI_MODEL=gpt-4o-mini
npm run proxy
```

In `.env` for the app:

```bash
EXPO_PUBLIC_AI_PROXY_URL=http://localhost:8787
```

On a physical phone, use your computer's LAN address instead of `localhost`. Amounts are parsed on the device. The model is not allowed to invent them. If a rewritten insight drops the computed percent, Fynn keeps the on-device sentence.

## Screenshots

Capture the iOS simulator after `npm run ios`:

```bash
xcrun simctl io booted screenshot docs/home.png
```

The web build is the live demo: `npm run export:web`, then host the `dist` folder. The host needs `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: credentialless` so the on-device database can run in the browser.

## What I'd build next

- More currencies, still without mixing them in one total
- A widget for the phrase field
- Export of the ledger
- Shared budgets, only if the ledger can leave the device on purpose
