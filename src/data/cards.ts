import type { Card, GlobalEvent, CardInstance } from '@/types/game';
import goodBehaviorCardsJson from './cards/good-behavior.json';
import badBehaviorCardsJson from './cards/bad-behavior.json';
import globalEventsJson from './cards/global-events.json';

// Type-safe card exports
export const GOOD_BEHAVIOR_CARDS: Card[] = goodBehaviorCardsJson as Card[];
export const BAD_BEHAVIOR_CARDS: Card[] = badBehaviorCardsJson as Card[];
export const GLOBAL_EVENTS: GlobalEvent[] = globalEventsJson as GlobalEvent[];

/**
 * Fisher-Yates shuffle algorithm for randomizing deck order
 */
export function shuffleDeck<T>(deck: T[]): T[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Create a unique card instance from a card definition
 */
export function createCardInstance(card: Card, index: number): CardInstance {
  return {
    ...card,
    instanceId: `${card.id}-${index}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  };
}

/**
 * Get a card by its ID
 */
export function getCardById(id: string): Card | undefined {
  return [...GOOD_BEHAVIOR_CARDS, ...BAD_BEHAVIOR_CARDS].find(
    (card) => card.id === id
  );
}

/**
 * Get a global event by its ID
 */
export function getEventById(id: string): GlobalEvent | undefined {
  return GLOBAL_EVENTS.find((event) => event.id === id);
}

/**
 * Get all cards of a specific type
 */
export function getCardsByType(type: 'behavior' | 'antibiotic' | 'action'): Card[] {
  return [...GOOD_BEHAVIOR_CARDS, ...BAD_BEHAVIOR_CARDS].filter(
    (card) => card.type === type
  );
}

/**
 * Get all cards for a specific team
 */
export function getCardsByTeam(team: 'good' | 'bad'): Card[] {
  return team === 'good' ? GOOD_BEHAVIOR_CARDS : BAD_BEHAVIOR_CARDS;
}

/**
 * Create a shuffled deck of card instances for a team
 */
export function createDeck(team: 'good' | 'bad', copies: number = 3): CardInstance[] {
  const cards = getCardsByTeam(team);
  const deckCards: Card[] = [];

  for (let i = 0; i < copies; i++) {
    deckCards.push(...cards);
  }

  const shuffled = shuffleDeck(deckCards);
  return shuffled.map((card, index) => createCardInstance(card, index));
}

/**
 * Create a shuffled global events deck
 */
export function createEventsDeck(): GlobalEvent[] {
  return shuffleDeck([...GLOBAL_EVENTS]);
}

/**
 * Draw cards from a deck
 */
export function drawCards<T>(deck: T[], count: number): { drawn: T[]; remaining: T[] } {
  const drawn = deck.slice(0, count);
  const remaining = deck.slice(count);
  return { drawn, remaining };
}

/**
 * Check if a card is an antibiotic
 */
export function isAntibioticCard(card: Card | CardInstance): boolean {
  return card.type === 'antibiotic';
}

/**
 * Get the effective AMR cost of a card (including effect-based AMR changes)
 */
export function getTotalAMRImpact(card: Card | CardInstance): number {
  let total = card.amrCost;
  for (const effect of card.effects) {
    if (effect.amrChange) {
      total += effect.amrChange;
    }
  }
  return total;
}
