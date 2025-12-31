# Game Design Guide

This guide helps you customize The War of Gutlands by modifying the card system.

## Quick Start

1. Navigate to `src/data/cards/`
2. Open any JSON file (good-behavior.json, bad-behavior.json, or global-events.json)
3. Edit the cards using your favorite text editor
4. Save and reload the game to see changes

## Card Balance Guidelines

### Good Bacteria Cards

Good Bacteria cards should help players:
- Add good bacteria tokens to zones
- Remove bad bacteria tokens
- Convert bad bacteria to good
- Prevent bad bacteria spread

**Balance tip:** Good cards should be slightly weaker individually but work well together.

### Bad Bacteria Cards

Bad Bacteria cards should:
- Add bad bacteria tokens
- Remove or convert good bacteria
- Spread across multiple zones
- Increase AMR when appropriate

**Balance tip:** Bad cards can be more aggressive since they face the AMR limit.

### Antibiotic Cards

Antibiotics are powerful cards that:
- Always increase AMR (`amrCost` > 0)
- Can affect full zones
- Kill bacteria rather than just adding/removing

**Balance tip:** Higher AMR cost = more powerful effect

## Effect Types Reference

### Adding Bacteria
- `add_good` - Add good bacteria tokens
- `add_bad` - Add bad bacteria tokens

### Removing Bacteria
- `remove_good` - Remove good bacteria tokens
- `remove_bad` - Remove bad bacteria tokens
- `kill_good` - Kill good bacteria (with potential AMR effect)
- `kill_bad` - Kill bad bacteria (with potential AMR effect)

### Zone Effects
- `nuke_zone` - Clear all bacteria from a zone
- `lock_zone` - Lock a zone (prevents changes)
- `unlock_zone` - Unlock a locked zone

### Conversion
- `convert_good_to_bad` - Turn good bacteria into bad
- `convert_bad_to_good` - Turn bad bacteria into good

### Special Abilities
- `preview_events` - See upcoming global events
- `draw_extra` - Draw additional cards
- `skip_turn` - Skip opponent's turn
- `swap_tokens` - Swap good/bad bacteria in a zone
- `spread_bacteria` - Spread bacteria to adjacent zones

## Special Targeting

Add a `special` field to target multiple zones or specific conditions:

- `two_zones` - Affects target zone + 1 random other zone
- `three_random_zones` - Affects 3 random zones
- `four_random_zones` - Affects 4 random zones
- `all_zones` - Affects all zones
- `random_zone` - Affects 1 random zone
- `zones_with_2plus_bad` - Only zones with 2+ bad bacteria
- `zone_most_good` - Zone with most good bacteria
- `zone_fewest_good` - Zone with fewest good bacteria

## Creating New Cards

### 1. Choose Card Type
- `behavior` - Normal cards (most common)
- `antibiotic` - Powerful cards that increase AMR
- `action` - Special ability cards (rare)

### 2. Choose Deck Type
- `good_behavior` - For Good Bacteria team
- `bad_behavior` - For Bad Bacteria team
- Global events don't have deckType

### 3. Design Effects
Start simple with one effect, then add complexity:

```json
{
  "id": "simple_card",
  "name": "Probiotic Drink",
  "type": "behavior",
  "deckType": "good_behavior",
  "description": "Add 1 good bacteria.",
  "educationalFact": "Probiotic drinks contain live beneficial bacteria.",
  "effects": [{ "type": "add_good", "value": 1 }],
  "amrCost": 0
}
```

### 4. Add Complexity
Combine multiple effects for interesting combos:

```json
{
  "id": "complex_card",
  "name": "Gut Health Routine",
  "type": "behavior",
  "deckType": "good_behavior",
  "description": "Add 2 good bacteria and remove 1 bad bacteria.",
  "educationalFact": "A healthy routine supports good bacteria while reducing harmful ones.",
  "effects": [
    { "type": "add_good", "value": 2 },
    { "type": "remove_bad", "value": 1 }
  ],
  "amrCost": 0
}
```

### 5. Use Special Targeting
Create cards that affect multiple zones:

```json
{
  "id": "spread_card",
  "name": "Probiotic Outbreak",
  "type": "behavior",
  "deckType": "good_behavior",
  "description": "Add 1 good bacteria to this zone and 2 random other zones.",
  "educationalFact": "Good bacteria can spread naturally through the digestive system.",
  "effects": [
    { "type": "add_good", "value": 1, "special": "three_random_zones" }
  ],
  "amrCost": 0
}
```

## Balance Testing

After creating new cards, test by playing the game and checking:

1. **Power Level** - Is the card too strong or weak?
   - Compare to similar existing cards
   - Adjust values (1-3 is typical, 4+ is very strong)

2. **AMR Cost** - For antibiotics only
   - AMR +1 = Moderate antibiotic
   - AMR +2 = Strong antibiotic
   - AMR +3 = Nuclear option (very rare)

3. **Fun Factor** - Is the card interesting to play?
   - Simple effects are fine for common cards
   - Rare cards should be more exciting
   - Special targeting makes cards feel unique

4. **Educational Value** - Does it teach something?
   - Update `educationalFact` with real health information
   - Make connections to real-world behaviors

## Common Patterns

### Starter Cards (Simple, Reliable)
```json
{
  "effects": [{ "type": "add_good", "value": 1 }],
  "amrCost": 0
}
```

### Combo Cards (Multiple Effects)
```json
{
  "effects": [
    { "type": "add_good", "value": 1 },
    { "type": "remove_bad", "value": 1 }
  ],
  "amrCost": 0
}
```

### Spread Cards (Multi-Zone)
```json
{
  "effects": [
    { "type": "add_bad", "value": 1, "special": "two_zones" }
  ],
  "amrCost": 0
}
```

### Antibiotic Cards (High Power, High Cost)
```json
{
  "effects": [{ "type": "kill_bad", "value": 3 }],
  "amrCost": 2
}
```

### Conversion Cards (Tactical)
```json
{
  "effects": [{ "type": "convert_good_to_bad", "value": 1 }],
  "amrCost": 0
}
```

## Global Events

Global events are special cards that trigger randomly (die roll ≥ 15):

```json
{
  "id": "my_event",
  "title": "Health Campaign",
  "description": "Public awareness increases! Remove 1 bad bacteria from all zones.",
  "educationalFact": "Health campaigns reduce infections worldwide.",
  "effects": [
    { "type": "remove_bad", "value": 1, "special": "all_zones" }
  ]
}
```

Events should:
- Have dramatic effects that change the game state
- Be roughly balanced (50% good, 50% bad outcomes)
- Teach important health concepts
- Feel thematic and exciting

## Tips for Educators

If you're modifying this game for educational purposes:

1. **Focus Educational Facts** - Update the `educationalFact` field to match your curriculum
2. **Adjust Difficulty** - Make cards simpler or more complex based on student age
3. **Themed Decks** - Create custom card sets for specific health topics
4. **Local Context** - Add cards about local health issues or campaigns
5. **Student Input** - Have students design cards as a learning activity!

## Testing Your Changes

1. Save your JSON files
2. In development mode (`npm run dev`), changes hot-reload automatically
3. In production, rebuild with `npm run build`
4. Play through a full game to test balance
5. Ask players for feedback on fun and difficulty

## Need Help?

- Check `src/data/cards/README.md` for technical card reference
- Look at existing cards for examples
- Test one change at a time to identify issues
- Keep backups of working configurations

## Advanced: Programmatic Changes

If you need to generate cards programmatically or validate them, see:
- `src/data/cards.ts` - Card loading system
- `src/types/game.ts` - TypeScript type definitions
- `src/store/gameStore.ts` - How cards are used in game logic
