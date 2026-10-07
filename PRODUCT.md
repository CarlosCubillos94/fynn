# Product

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

## Stack

Expo (latest SDK), React Native, TypeScript in strict mode, Expo Router.
NativeWind for styling. Reanimated for animation.
Zustand for client state. React Query for async server data.
expo-sqlite for an offline-first ledger on the device. expo-local-authentication for an optional biometric lock.
AI calls an OpenAI-compatible API through a small serverless proxy. The key is read from environment variables and is never shipped in the app.
Jest and React Native Testing Library. ESLint and Prettier.
GitHub Actions runs lint, typecheck, and tests.
An Expo web build is a publishable live demo for recruiters. It is not a separate product.

## Users

Primary user: a person tracking their own money on a phone. They add an expense or income in the moment, either in a few taps or as a short phrase such as "uber 4500" or "almuerzo 8000", then check the month, category budgets, and a weekly summary. The currencies in use are CLP and USD.

Secondary audience: international tech recruiters reviewing Fynn as a portfolio project. They need a first launch that already looks alive, a README in English, and a web demo they can open without installing the app.

## Product Purpose

Fynn is a personal finance mobile app. It exists so someone can record money quickly, see where it went, and stay inside category budgets, including while offline.

Success for the user: a transaction saved in under three taps, or from one natural-language line that becomes a cleaned-up entry with a suggested category; a dashboard and budgets that match that ledger; a weekly insight in plain language computed from their own transactions.

Success for the project: a polished portfolio piece a recruiter can run, read, and trust.

## Positioning

The mechanism a form-and-chart expense tracker cannot claim is phrase entry. The user types something like "uber 4500" and Fynn suggests the category and cleans the description, then keeps the ledger on the device. Weekly insights are sentences about that person's own change in spending.

Revolut and Copilot Money are the quality bar named for the interface. They are not a claim that Fynn beats them, and they are not a feature list Fynn includes.

## Operating Context

The app runs on iOS and Android. An Expo web build is the public demo.
The ledger is local sqlite. Offline use is a normal case, not a fallback.
Onboarding is three screens, followed by an optional Face ID or fingerprint lock.
Capture happens in daily life. Review happens on a dashboard (monthly balance, spending by category, six-month trend) and on a transaction list (search, filters, swipe to edit or delete).
Budgets are set per category and warn at 80 percent of the limit.
Light and dark appearance are both part of using the app.
First launch is seeded with realistic demo data so the screens are not empty. That data is fiction for the demo, not a real customer's finances.

## Capabilities and Constraints

Confirmed MVP:

1. Onboarding (three screens) and an optional biometric lock.
2. Add an expense or income (amount, category, note, date) in under three taps.
3. AI categorization from a typed phrase, including a cleaned-up description.
4. A weekly AI summary in plain language, derived from the user's transactions.
5. Dashboard: monthly balance, spending by category as a donut, six-month trend as a line.
6. Budgets per category, with progress and a warning at 80 percent.
7. Transaction list with search, filters, and swipe to edit or delete.
8. CLP and USD, each formatted correctly.
9. Dark mode and light mode.

Confirmed code and delivery constraints:

- Feature folders under `src/features/transactions`, `src/features/budgets`, `src/features/insights`, and `src/features/auth`. Shared UI in `src/components/ui`.
- Typed domain models. No `any`.
- Unit tests for categorization logic, budget calculations, and currency formatting.
- README in English: one-line pitch, a screenshots or GIF section, features, tech stack, a mermaid architecture diagram, how to run, and what to build next.
- Implementation waits until the proposed folder structure and data model are approved, then proceeds one feature at a time, with typecheck and tests after each.

Open, and not to be invented as if decided:

- The category taxonomy.
- Onboarding copy, and what each of the three screens contains, beyond the count and the optional lock.
- The accent hue. The commitment is one strong accent, not a named color.
- Which OpenAI-compatible provider and model, and where the proxy is hosted. The decided constraint is the key stays in the proxy environment, never in the app.
- Screenshots and a GIF. They do not exist yet.

## Brand Commitments

Name: Fynn.

Insight voice: plain language about the user's own spending. The sentence "You spent 23% more on food than last week" is an example of that voice, not a measured result to publish.

Binding visual bar, recorded here without a visual system: a modern fintech interface at the level of Revolut and Copilot Money. Clear hierarchy, generous spacing, one strong accent color, smooth micro-interactions, empty states, loading skeletons, and friendly error states.

Type, the accent hue, and the component world are not decided in this file.

## Evidence on Hand

No customer data, testimonials, press, pricing, or production metrics exist. Future work must not fabricate them.

The insight sentence in the brief is an example of tone, not evidence.

Demo seed data is required on first launch and must stay identifiable as demo data.

## Product Principles

1. Capture beats ceremony. Logging money is the job. Three taps, or one phrase, is the ceiling.
2. The ledger stays on the device. Offline use is normal, and the model key never lives in the app.
3. A figure is either computed from the ledger or labeled as demo seed. Invented precision is out.
4. A recruiter can meet the work without a private install: English README, seeded first launch, public web demo.
5. Accessibility is part of the product, not a later pass: contrast, dynamic type, and screen reader labels belong on every screen.

## Accessibility & Inclusion

Required: good contrast, dynamic font sizes, and screen reader labels, in both light and dark mode. No further standard, such as a named WCAG level, was set.
