# The War of Gutlands

An educational turn-based strategy board game teaching children (11+) about gut bacteria, healthy behaviors, and antibiotic resistance through engaging gameplay.

## Overview

Two teams battle for control of the digestive tract:
- **Good Bacteria** (Blue): Promote healthy gut flora
- **Bad Bacteria** (Red): Try to take over and cause illness

Players use behavior cards representing real health choices, with antibiotics as powerful but risky tools that increase antibiotic resistance.

## Features

- Turn-based strategy gameplay for 2-6 players
- Educational content about gut health and AMR
- Local multiplayer and AI opponents
- Interactive tutorial
- Steam achievements and statistics
- Cross-platform (Windows, macOS, Linux)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run Electron app (development)
npm run electron:dev

# Build Electron app for distribution
npm run electron:build
```

### Development

The game is built with:
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Zustand** - State management
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Vite** - Build tool
- **Electron** - Desktop app wrapper

## Game Rules

### Win Conditions

**Good Bacteria Win:**
- Control 5+ zones, OR
- Eliminate all bad bacteria

**Bad Bacteria Win:**
- Control 5+ zones, OR
- Push AMR barometer to level 10

### Turn Flow

1. Roll the 20-sided die
2. If roll >= 15, a Global Event occurs
3. Play one card from your hand
4. Apply card effects to a target zone
5. Draw a replacement card
6. Pass turn to next player

### AMR Barometer

The Antibiotic Resistance (AMR) barometer tracks how resistant bacteria are becoming. Using antibiotics increases this level. If it reaches 10, bad bacteria become unstoppable!

## Educational Value

This game teaches:
- How gut bacteria affect health
- Impact of lifestyle choices on microbiome
- How antibiotics work and their risks
- Why antibiotic resistance is a global concern
- Importance of completing antibiotic courses

## Modular Card System

The game uses a modular, JSON-based card system that makes it easy to modify game rules without touching code.

All card definitions are stored in **`src/data/cards/`** as JSON files:
- `good-behavior.json` - Cards for Good Bacteria team
- `bad-behavior.json` - Cards for Bad Bacteria team
- `global-events.json` - Random global events

### Editing Cards

Simply open the JSON files and modify:
- Card names and descriptions
- Effect types and values
- AMR costs
- Educational facts

See `src/data/cards/README.md` for detailed documentation on card structure and available effects.

### Example Card

```json
{
  "id": "my_custom_card",
  "name": "Healthy Snack",
  "type": "behavior",
  "deckType": "good_behavior",
  "description": "Add 2 good bacteria to a zone.",
  "educationalFact": "Healthy snacks support beneficial gut bacteria.",
  "effects": [{ "type": "add_good", "value": 2 }],
  "amrCost": 0
}
```

Changes take effect immediately during development (hot reload) or after rebuild for production.

## Project Structure

```
src/
├── components/
│   ├── Board/        # Game board and zones
│   ├── Cards/        # Card components
│   ├── Game/         # Main game component
│   └── UI/           # Menu, settings, etc.
├── data/
│   ├── cards/        # Modular JSON card definitions (EDIT THESE!)
│   │   ├── good-behavior.json
│   │   ├── bad-behavior.json
│   │   ├── global-events.json
│   │   └── README.md
│   └── cards.ts      # Card loading system
├── hooks/            # Custom React hooks
├── store/            # Zustand state management
├── types/            # TypeScript type definitions
└── utils/            # Helper functions (AI, audio, storage)
```

## Steam Release

For Steam distribution:
1. Set up Steamworks developer account
2. Create `steam_appid.txt` with your App ID
3. Configure achievements in Steamworks
4. Build with `npm run electron:build`
5. Upload via SteamCMD

## License

MIT License - see LICENSE file for details
