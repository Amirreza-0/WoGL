# Card Data Files

This folder contains all the card definitions for The War of Gutlands game. You can easily modify game rules by editing these JSON files.

## Files

- `good-behavior.json` - Cards for the Good Bacteria player
- `bad-behavior.json` - Cards for the Bad Bacteria player
- `global-events.json` - Random events that affect both players

## Card Structure

### Behavior/Antibiotic Cards

```json
{
  "id": "unique_card_id",
  "name": "Card Display Name",
  "type": "behavior" | "antibiotic" | "action",
  "deckType": "good_behavior" | "bad_behavior",
  "description": "What the card does (shown to players)",
  "educationalFact": "Educational information about the card",
  "effects": [
    {
      "type": "effect_type",
      "value": 1,
      "special": "optional_special_behavior"
    }
  ],
  "amrCost": 0
}
```

### Global Events

```json
{
  "id": "unique_event_id",
  "title": "Event Title",
  "description": "What happens during this event",
  "educationalFact": "Educational information",
  "effects": [
    {
      "type": "effect_type",
      "value": 1,
      "special": "optional_special_behavior"
    }
  ]
}
```

## Effect Types

- `add_good` - Add good bacteria tokens to a zone
- `add_bad` - Add bad bacteria tokens to a zone
- `remove_good` - Remove good bacteria tokens
- `remove_bad` - Remove bad bacteria tokens
- `kill_good` - Kill good bacteria (may have AMR effects)
- `kill_bad` - Kill bad bacteria (may have AMR effects)
- `nuke_zone` - Clear all bacteria from a zone
- `convert_good_to_bad` - Convert good bacteria to bad
- `convert_bad_to_good` - Convert bad bacteria to good
- `prevent_bad` - Prevent bad bacteria from being added
- `prevent_good` - Prevent good bacteria from being added
- `draw_extra` - Draw additional cards
- `skip_turn` - Skip the next turn
- `preview_events` - Preview upcoming global events
- `lock_zone` - Lock a zone from changes
- `unlock_zone` - Unlock a locked zone
- `swap_tokens` - Swap good and bad tokens
- `spread_bacteria` - Spread bacteria to adjacent zones

## Special Behaviors

Some effects have special targeting or behavior:

- `two_zones` - Affects the target zone and one random other zone
- `three_random_zones` - Affects 3 random zones
- `four_random_zones` - Affects 4 random zones
- `all_zones` - Affects all zones on the board
- `all_zones_max_3` - Affects up to 3 zones
- `random_zone` - Affects one random zone
- `one_random_zone` - Affects one random zone (clear all)
- `two_random_zones` - Affects 2 random zones
- `zones_with_2plus_bad` - Only zones with 2+ bad bacteria
- `zone_most_good` - Zone with the most good bacteria
- `zone_fewest_good` - Zone with the fewest good bacteria
- `reduce_amr` - Reduces AMR level by 1
- `random_zones` - Affects value-many random zones

## AMR Cost

The `amrCost` field determines how much the Antibiotic Resistance (AMR) level increases when this card is played.
- 0 = No AMR increase
- 1 = Small AMR increase
- 2+ = Larger AMR increase

When AMR reaches 10, Bad Bacteria win!

## Tips for Editing

1. Keep card IDs unique across all files
2. Balance `amrCost` with card power - stronger antibiotics should cost more
3. Test new cards by playing the game
4. Educational facts help players learn about real-world health topics
5. Use appropriate `deckType` to ensure cards go to the right player
6. Effects can be combined (see Vaccination card for example)

## Examples

### Simple Card
```json
{
  "id": "my_new_card",
  "name": "Healthy Snack",
  "type": "behavior",
  "deckType": "good_behavior",
  "description": "Add 1 good bacteria to a zone.",
  "educationalFact": "Eating healthy snacks supports gut health.",
  "effects": [{ "type": "add_good", "value": 1 }],
  "amrCost": 0
}
```

### Complex Card with Multiple Effects
```json
{
  "id": "super_probiotic",
  "name": "Super Probiotic",
  "type": "behavior",
  "deckType": "good_behavior",
  "description": "Add 2 good bacteria and remove 1 bad bacteria.",
  "educationalFact": "Advanced probiotics can crowd out harmful bacteria.",
  "effects": [
    { "type": "add_good", "value": 2 },
    { "type": "remove_bad", "value": 1 }
  ],
  "amrCost": 0
}
```

### Special Behavior Card
```json
{
  "id": "powerful_antibiotic",
  "name": "Powerful Antibiotic",
  "type": "antibiotic",
  "deckType": "good_behavior",
  "description": "Remove 2 bad bacteria from this zone and 1 random other zone. AMR +2.",
  "educationalFact": "Powerful antibiotics have wide-reaching effects.",
  "effects": [{ "type": "remove_bad", "value": 2, "special": "two_zones" }],
  "amrCost": 2
}
```
