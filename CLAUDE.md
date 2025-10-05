# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Forge & Field is a controller-first, Zelda-inspired PLM (Product Lifecycle Management) workspace demo. The theme maps traditional PLM concepts to fantasy game terminology:
- **Inventory** → Items (product parts/components)
- **Quest Board** → Requests (change requests/RFQs)
- **Forge** → Changes (ECOs/Engineering Change Orders)
- **Adventure Log** → Audit trail

The UI is designed for gamepad navigation first, with keyboard fallbacks, and features Zelda-inspired aesthetics without using any Nintendo assets.

## Development Commands

```bash
# Install dependencies
pnpm i   # or npm i / yarn

# Development server (runs on http://localhost:3005)
pnpm dev

# Production build
pnpm build

# Start production server
pnpm start
```

## Architecture

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS with custom theme colors (parchment, temple, rune, gold)
- **Animations**: Framer Motion for interactive elements
- **Icons**: Lucide React
- **State**: Zustand (installed but not yet implemented)
- **Input**: Gamepad API for controller support
- **Audio**: WebAudio API for sound effects

### Route Structure
- `/` — Title screen with "Continue" and "Controls" options
- `/system` — Main menu hub linking to all PLM sections
- `/inventory` — Items management (uses `InventoryGrid` component)
- `/quests` — Requests board (uses `QuestBoard` component)
- `/forge` — Changes/ECO management (uses `ForgeRitual` component)
- `/log` — Audit log (uses `AdventureLog` component)
- `/controls` — Controller diagram (uses `ControlsDiagram` component)

### Data Layer
All demo data is stored in `public/data/demo.json` and typed in `lib/data.ts`:
- **Item**: PLM parts/components with revision, supplier, cost, health_pct, status
- **Request**: Change requests with priority, origin, linked_item
- **Change**: ECOs/Variants with affected_item, from_rev, to_rev, rationale
- **LogEntry**: Audit entries with year and description

Access via: `import { dataset } from '@/lib/data'`

### Gamepad Integration
The `hooks/useGamepad.ts` hook polls the Gamepad API and maps controller buttons to actions:
- Button 9 (Start) → System menu
- Button 4 (L) → Inventory
- Button 5 (R) → Quests
- Button 7 (ZR) → Forge
- Button 0 (A) → Confirm
- Button 1 (B) → Back

Usage: `useGamepad((action) => { /* handle action */ })`

### Styling System
Custom Tailwind configuration with theme-specific utilities:
- Colors: `temple` (dark blue), `parchment` (tan), `rune` (cyan), `gold`
- `.card` — Likely defined in globals.css for consistent card styling
- `.font-display` — Cinzel serif font for headings
- `.title-shadow` — Custom text shadow effect (check globals.css)

### Sound Effects
Audio files in `public/sfx/`:
- `select.wav` — UI selection sounds
- `success.wav` — Successful action feedback
- `error.wav` — Error/invalid action feedback

WebAudio API is used for playback (implementation may be in components or hooks).

## Key Implementation Notes

### Component Pattern
Most page components follow this pattern:
1. Import dataset from `lib/data.ts`
2. Use Framer Motion for hover/tap animations (`whileHover`, `whileTap`)
3. Map over data arrays to render cards
4. Apply `.card` class for consistent theming

### State Management
Zustand is installed but not yet implemented. When adding state:
- Create stores in a new `store/` directory
- Consider stores for: active item selection, modal state, audio preferences, gamepad connection status

### Adding New Routes
1. Create page in `app/[route]/page.tsx`
2. Create corresponding component in `components/` if complex
3. Add link from `/system` menu
4. Update button mapping in `useGamepad.ts` if adding gamepad shortcut
5. Update route list in README.md

### Styling Conventions
- Use `font-display` class for headers/titles
- Use `card` class for interactive elements and containers
- Framer Motion `whileHover={{scale:1.02}}` for subtle hover effects
- Keep opacity at 80-90% for secondary text
