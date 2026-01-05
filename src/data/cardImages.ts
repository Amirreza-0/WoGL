/**
 * Card Image Mapping System
 * Maps card IDs to their corresponding image files
 */

// Good Behavior Card Images
const goodBehaviorImages: Record<string, string> = {
  g_probiotic_yogurt: new URL('../assets/images/cards/good-behavior/probiotic-yogurt.jpeg', import.meta.url).href,
  // Add more as images are created
  // g_fiber_diet: new URL('../assets/images/cards/good-behavior/high-fiber-diet.png', import.meta.url).href,
  // g_hand_washing: new URL('../assets/images/cards/good-behavior/proper-hand-washing.png', import.meta.url).href,
  // etc...
};

// Bad Behavior Card Images
const badBehaviorImages: Record<string, string> = {
  b_dirty_hands: new URL('../assets/images/cards/bad-behavior/dirty-hands.jpeg', import.meta.url).href,
  // Add more as images are created
  // b_sugary_snack: new URL('../assets/images/cards/bad-behavior/sugary-snack.png', import.meta.url).href,
  // b_stress: new URL('../assets/images/cards/bad-behavior/chronic-stress.png', import.meta.url).href,
  // etc...
};

// Global Event Card Images
const globalEventImages: Record<string, string> = {
  ge_farming_overuse: new URL('../assets/images/cards/global-events/farming-overuse.jpeg', import.meta.url).href,
  // Add more as images are created
  // ge_pandemic_scare: new URL('../assets/images/cards/global-events/pandemic-panic.png', import.meta.url).href,
  // ge_health_campaign: new URL('../assets/images/cards/global-events/health-campaign.png', import.meta.url).href,
  // etc...
};

/**
 * Get the image URL for a card by its ID
 * @param cardId - The unique card ID
 * @returns The image URL or undefined if no image exists
 */
export function getCardImage(cardId: string): string | undefined {
  return (
    goodBehaviorImages[cardId] ||
    badBehaviorImages[cardId] ||
    globalEventImages[cardId]
  );
}

/**
 * Check if a card has an associated image
 * @param cardId - The unique card ID
 * @returns True if an image exists for this card
 */
export function hasCardImage(cardId: string): boolean {
  return getCardImage(cardId) !== undefined;
}

export { goodBehaviorImages, badBehaviorImages, globalEventImages };
