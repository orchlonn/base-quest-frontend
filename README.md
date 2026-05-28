# base-quest-frontend

Frontend for **Base Quest** — a gamified app for learning binary, hex, and decimal conversions through lessons, mini-games, and pre/post tests. Built with Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Zustand, and Framer Motion.

All app content is bundled locally from JSON files in `src/data/`, and all progress, XP, and profile data is stored locally in the browser (`localStorage`). No backend, database, or external API is required.

## Prerequisites

- **Node.js** 18.17+ (Node 20 LTS recommended)
- **npm** 9+ (or pnpm / yarn)

## Getting started

```bash
git clone <repo-url>
cd base-quest-frontend
npm install
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

## Available scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the Next.js dev server on port 3000 with hot reload. |
| `npm run build` | Create an optimized production build. |
| `npm run start` | Start the production server (run `build` first). |
| `npm run lint` | Run Next.js / ESLint checks. |

## Production build

```bash
npm run build
npm run start
```

The server listens on port 3000 by default. To use a different port:

```bash
npx next dev -p 3001
# or
npx next start -p 3001
```

## Project structure

```
src/
├── app/                # Next.js App Router pages
│   ├── dashboard/      # Home dashboard with tiles
│   ├── games/          # Mini-games: conversion-challenge, memory-match,
│   │                   #   speed-quiz, tower-defense
│   ├── how-to-play/    # Rules and guide
│   ├── lessons/        # Lesson list and detail pages
│   ├── pre-test/       # Diagnostic test
│   ├── post-test/      # Post-lesson assessment
│   ├── layout.tsx      # Root layout (NavBar lives here)
│   └── page.tsx        # Landing page
├── components/         # Shared UI (NavBar, XPBar)
├── data/               # Local JSON data for lessons, tests, badges, achievements
├── lib/                # convert, data, local-progress, xp helpers
└── store/              # Zustand profile store
```

## How it works

- **Local JSON content.** Lessons, pre-test questions, post-test questions, badges, and achievements are loaded from `src/data/*.json` through `src/lib/data.ts`.
- **No login required.** A local profile is created on first visit and kept in `localStorage`.
- **Lessons** teach the concepts; **games** reinforce them with XP rewards.
- **Pre-test** establishes a baseline; **post-test** measures growth.

## Troubleshooting

- **Port 3000 already in use** — run on another port: `npx next dev -p 3001`.
- **Stale build artifacts** — delete `.next/` and `tsconfig.tsbuildinfo`, then rebuild.
- **Reset your local progress** — clear the site's `localStorage` from DevTools (Application → Storage).
