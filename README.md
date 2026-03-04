# GameBoy — Card & Dice Game Rules Reference

A React + Vite web application serving as a searchable reference for card and dice game rules with interactive simulations.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Build for Production

```bash
npm run build
npm run preview
```

## Deploy to Vercel

Connect your GitHub repo to Vercel — it auto-detects Vite and deploys on push to main.

Or use the CLI:
```bash
npx vercel
```

## Tech Stack

- **React 19** + **Vite 7** + **TypeScript**
- **Tailwind CSS v4** (via `@tailwindcss/vite` plugin — no config file needed)
- **React Router v7** for navigation
- **Lucide React** for icons

## Project Structure

```
src/
├── components/
│   ├── DiceFace.tsx          # Rendered dice with dot grid patterns
│   ├── FilterSidebar.tsx     # Desktop + mobile filter panel
│   ├── GameCard.tsx          # Game card for the grid listing
│   ├── Navbar.tsx            # Top navigation bar
│   ├── PlayingCard.tsx       # Visual playing card component
│   ├── PokerSimulation.tsx   # Interactive Texas Hold'em simulator
│   └── YahtzeeSimulation.tsx # Playable Yahtzee with live scorecard
├── data/
│   └── games.json            # All game data
├── pages/
│   ├── HomePage.tsx          # Main listing + filters page
│   └── GameDetailPage.tsx    # Tabbed game detail page
└── types/
    └── game.ts               # TypeScript types for game data
```

## Adding New Games

1. Add a new entry to `src/data/games.json` following the existing schema.
2. The home page filters and listing render dynamically from this file automatically.
3. For a custom simulation, add a component in `src/components/` and wire it into `GameDetailPage.tsx`.

## Games Included

| Game | Type | Players | Difficulty |
|------|------|---------|------------|
| Yahtzee | Dice | 1–10 | Easy |
| Texas Hold'em Poker | Card | 2–10 | Medium |
