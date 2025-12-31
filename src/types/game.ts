// Core game types for The War of Gutlands

// ============================================
// ENUMS AND BASIC TYPES
// ============================================

export type TeamType = 'good' | 'bad';

export type GamePhase =
  | 'menu'
  | 'setup'
  | 'roll'
  | 'resolve_event'
  | 'action'
  | 'game_over';

export type GameMode = 'local_multiplayer' | 'single_player' | 'tutorial';

export type AIDifficulty = 'easy' | 'medium' | 'hard';

export type CardType = 'behavior' | 'antibiotic' | 'action';

export type DeckType = 'good_behavior' | 'bad_behavior' | 'global_events';

export type EffectType =
  | 'add_good'
  | 'add_bad'
  | 'remove_good'
  | 'remove_bad'
  | 'kill_bad'
  | 'kill_good'
  | 'nuke_zone'
  | 'convert_good_to_bad'
  | 'convert_bad_to_good'
  | 'prevent_bad'
  | 'prevent_good'
  | 'draw_extra'
  | 'skip_turn'
  | 'preview_events'
  | 'lock_zone'
  | 'unlock_zone'
  | 'swap_tokens'
  | 'spread_bacteria';

export type ZoneTargetType =
  | 'any'
  | 'controlled'
  | 'enemy'
  | 'empty'
  | 'has_good'
  | 'has_bad';

export type WinCondition =
  | 'good_zone_control'
  | 'good_elimination'
  | 'bad_zone_control'
  | 'bad_elimination'
  | 'bad_amr_victory';

// ============================================
// CARD SYSTEM
// ============================================

export interface CardEffect {
  type: EffectType;
  value: number;
  zoneTarget?: ZoneTargetType;
  amrChange?: number;
  special?: string;
}

export interface Card {
  id: string;
  name: string;
  type: CardType;
  deckType: DeckType;
  description: string;
  educationalFact: string;
  effects: CardEffect[];
  amrCost: number;
  artwork?: string;
}

export interface CardInstance extends Card {
  instanceId: string;
}

// ============================================
// GAME BOARD
// ============================================

export interface Zone {
  id: number;
  name: string;
  goodTokens: number;
  badTokens: number;
  locked: boolean;
  controlledBy: TeamType | null;
}

// ============================================
// PLAYERS
// ============================================

export interface Player {
  id: string;
  name: string;
  team: TeamType;
  isAI: boolean;
  aiDifficulty?: AIDifficulty;
  hand: CardInstance[];
}

export interface PlayerConfig {
  name: string;
  isAI: boolean;
  aiDifficulty?: AIDifficulty;
}

// ============================================
// GLOBAL EVENTS
// ============================================

export interface GlobalEvent {
  id: string;
  title: string;
  description: string;
  educationalFact: string;
  effects: CardEffect[];
  artwork?: string;
}

// ============================================
// STATISTICS AND TRACKING
// ============================================

export interface PlayerMatchStats {
  cardsPlayed: number;
  antibioticsUsed: number;
}

export interface MatchStats {
  playerStats: Map<string, PlayerMatchStats>;
  globalEventsTriggered: number;
  highestAMRReached: number;
  totalCardsPlayed: number;
}

export interface GameStatistics {
  totalGamesPlayed: number;
  gamesWonGood: number;
  gamesWonBad: number;
  totalTurns: number;
  cardsPlayedGood: number;
  cardsPlayedBad: number;
  antibioticsUsed: number;
  globalEventsTriggered: number;
  averageAMRLevel: number;
  fastestWin: number;
  longestGame: number;
}

export interface ActionLogEntry {
  timestamp: number;
  player: string;
  action: string;
  details?: string;
}

// ============================================
// MATCH REPORT
// ============================================

export interface MatchReportPlayer {
  name: string;
  team: TeamType;
  isAI: boolean;
  aiDifficulty?: AIDifficulty;
  cardsPlayed: number;
  antibioticsUsed: number;
}

export interface MatchReport {
  matchId: string;
  timestamp: number;
  duration: number;
  players: MatchReportPlayer[];
  winner: WinCondition;
  winningTeam: TeamType;
  totalTurns: number;
  finalZoneControl: {
    good: number;
    bad: number;
    neutral: number;
  };
  finalAMRLevel: number;
  finalGoodTokens: number;
  finalBadTokens: number;
  globalEventsTriggered: number;
  highestAMRReached: number;
  averageCardsPerTurn: number;
  mode: GameMode;
  isSpectatorMode: boolean;
}

// ============================================
// ACHIEVEMENTS
// ============================================

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
}

// ============================================
// SETTINGS
// ============================================

export type AnimationSpeed = 'slow' | 'normal' | 'fast';
export type TextSize = 'small' | 'medium' | 'large';

export interface GameSettings {
  musicVolume: number;
  sfxVolume: number;
  animationSpeed: AnimationSpeed;
  colorblindMode: boolean;
  highContrastMode: boolean;
  textSize: TextSize;
  showHints: boolean;
  confirmActions: boolean;
  autoEndTurn: boolean;
}

export const DEFAULT_SETTINGS: GameSettings = {
  musicVolume: 0.7,
  sfxVolume: 0.8,
  animationSpeed: 'normal',
  colorblindMode: false,
  highContrastMode: false,
  textSize: 'medium',
  showHints: true,
  confirmActions: true,
  autoEndTurn: false,
};

// ============================================
// GAME STATE
// ============================================

export interface GameState {
  mode: GameMode;
  phase: GamePhase;

  // Board state
  zones: Zone[];
  amrLevel: number;

  // Players
  players: Player[];
  currentPlayerIndex: number;

  // Decks
  goodDeck: CardInstance[];
  badDeck: CardInstance[];
  globalEventsDeck: GlobalEvent[];

  // Current turn state
  currentDieRoll: number | null;
  currentEvent: GlobalEvent | null;
  selectedCard: CardInstance | null;

  // Game tracking
  turnNumber: number;
  gameStartTime: number;
  winner: WinCondition | null;

  // UI state
  message: string;
  actionLog: ActionLogEntry[];
}

// ============================================
// GAME CONSTANTS
// ============================================

export const GAME_CONSTANTS = {
  ZONE_COUNT: 9,
  ZONE_CAPACITY: 5,
  WIN_ZONE_COUNT: 5,
  MAX_AMR: 10,
  HAND_SIZE: 3,
  GLOBAL_EVENT_THRESHOLD: 15,
  DIE_SIDES: 20,
  INITIAL_TOKENS: 2,
  DECK_COPIES: 3,
} as const;

// ============================================
// ZONE NAMES
// ============================================

export const ZONE_NAMES = [
  'Mouth',
  'Esophagus',
  'Stomach',
  'Duodenum',
  'Jejunum',
  'Ileum',
  'Cecum',
  'Colon',
  'Rectum',
] as const;
