# majong

A complete Mahjong web application with teaching AI helper and auto-generated assets.

## Features

- **Hong Kong Mahjong (13 tile)**: 4 players, 136 tiles, dealer rotation, wall building
- **Game mechanics**: Chi, Pon, Kong, flowers with replacement draw
- **Scoring system**: Pungs, kongs, all simples, dragons, winds, concealed hand, self draw, flowers
- **Solo mode**: Play against 3 beginner bots
- **Teaching AI**: Built-in helper with contextual tips
- **Auto-generated assets**: AI-generated tile faces and table backgrounds
- **Responsive design**: Works on mobile (360x640) to desktop

## Tech Stack

- **Frontend**: Vite + React + TypeScript + Tailwind CSS + Zustand + Framer Motion
- **Backend**: Vercel serverless functions
- **Testing**: Vitest (unit) + Playwright (e2e)
- **AI**: GitHub Models / OpenAI for teaching tips and asset generation
- **Hosting**: GitHub Pages (frontend) + Vercel (API)

## Development

### Prerequisites

- Node.js 18+
- pnpm 8+

### Setup

```bash
pnpm install
pnpm dev
```

### Scripts

- `pnpm dev` - Start all development servers
- `pnpm build` - Build all packages
- `pnpm test` - Run all tests
- `pnpm lint` - Lint all packages
- `pnpm type-check` - Type check all packages

## Deployment

### GitHub Pages

The frontend is automatically deployed to GitHub Pages at:
https://bradmarnold.github.io/majong/

### Vercel API

The backend API is deployed to Vercel with endpoints:
- `/api/health` - Health check
- `/api/help` - Teaching AI helper

### Asset Generation

Use the GitHub Action `asset-generate.yml` to generate new tiles and backgrounds:
1. Go to Actions tab
2. Run "Asset Generate" workflow
3. Review and merge the generated PR

## Project Structure

```
majong/
├── apps/
│   ├── web/          # React frontend
│   └── api/          # Vercel serverless functions
├── packages/
│   ├── rules/        # Game engine and rules
│   └── ui/           # Shared UI components
├── assets/
│   └── prompts/      # AI prompt templates
└── .github/
    └── workflows/    # CI/CD workflows
```