import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { enableMapSet } from 'immer';

// Enable Immer's MapSet plugin for Map/Set support in state
enableMapSet();

import type {
  GameState,
  GamePhase,
  GameMode,
  Zone,
  Player,
  CardInstance,
  GlobalEvent,
  WinCondition,
  TeamType,
  MatchReport,
  MatchStats,
  PlayerConfig,
} from '@/types/game';
import { GAME_CONSTANTS, ZONE_NAMES } from '@/types/game';
import {
  GOOD_BEHAVIOR_CARDS,
  BAD_BEHAVIOR_CARDS,
  GLOBAL_EVENTS,
  shuffleDeck,
  createCardInstance,
} from '@/data/cards';

// ============================================
// STORE INTERFACE
// ============================================

interface GameStore extends GameState {
  // Match statistics
  matchStats: MatchStats;
  lastMatchReport: MatchReport | null;

  // Game Actions
  initGame: (mode: GameMode, players: PlayerConfig[]) => void;
  rollDie: () => void;
  resolveEvent: () => void;
  selectCard: (card: CardInstance | null) => void;
  selectZone: () => void;
  playCard: (zoneId: number, card?: CardInstance) => void;
  nextTurn: () => void;
  endTurn: () => void;
  resetGame: () => void;
  setPhase: (phase: GamePhase) => void;
  setMessage: (message: string) => void;
  addLogEntry: (player: string, action: string, details?: string) => void;

  // Getters
  getCurrentPlayer: () => Player | undefined;
  getZoneControl: (zone: Zone) => TeamType | null;
  canPlayCard: (card: CardInstance, zoneId: number) => boolean;
  checkWinConditions: () => WinCondition | null;
  generateMatchReport: () => MatchReport | null;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function createInitialZones(): Zone[] {
  return Array.from({ length: GAME_CONSTANTS.ZONE_COUNT }, (_, i) => ({
    id: i,
    name: ZONE_NAMES[i] || `Zone ${i + 1}`,
    goodTokens: 0,
    badTokens: 0,
    locked: false,
    controlledBy: null,
  }));
}

function createInitialMatchStats(): MatchStats {
  return {
    playerStats: new Map(),
    globalEventsTriggered: 0,
    highestAMRReached: 1,
    totalCardsPlayed: 0,
  };
}

function getInitialState(): Omit<GameState, 'players' | 'goodDeck' | 'badDeck' | 'globalEventsDeck'> & {
  players: Player[];
  goodDeck: CardInstance[];
  badDeck: CardInstance[];
  globalEventsDeck: GlobalEvent[];
  matchStats: MatchStats;
  lastMatchReport: MatchReport | null;
} {
  return {
    mode: 'local_multiplayer',
    phase: 'menu',
    zones: createInitialZones(),
    amrLevel: 1,
    players: [],
    currentPlayerIndex: 0,
    goodDeck: [],
    badDeck: [],
    globalEventsDeck: [],
    currentDieRoll: null,
    currentEvent: null,
    selectedCard: null,
    turnNumber: 0,
    gameStartTime: 0,
    winner: null,
    message: 'Welcome to The War of Gutlands!',
    actionLog: [],
    matchStats: createInitialMatchStats(),
    lastMatchReport: null,
  };
}

function updateZoneControl(zone: Zone): void {
  if (zone.goodTokens > zone.badTokens) {
    zone.controlledBy = 'good';
  } else if (zone.badTokens > zone.goodTokens) {
    zone.controlledBy = 'bad';
  } else {
    zone.controlledBy = null;
  }
}

function addTokensToZone(zone: Zone, type: 'good' | 'bad', amount: number): number {
  const currentOther = type === 'good' ? zone.badTokens : zone.goodTokens;
  const maxAdd = GAME_CONSTANTS.ZONE_CAPACITY - currentOther;
  const currentSame = type === 'good' ? zone.goodTokens : zone.badTokens;
  const actualAdd = Math.min(amount, maxAdd - currentSame);

  if (type === 'good') {
    zone.goodTokens = Math.min(GAME_CONSTANTS.ZONE_CAPACITY - zone.badTokens, zone.goodTokens + actualAdd);
  } else {
    zone.badTokens = Math.min(GAME_CONSTANTS.ZONE_CAPACITY - zone.goodTokens, zone.badTokens + actualAdd);
  }

  return actualAdd;
}

function removeTokensFromZone(zone: Zone, type: 'good' | 'bad', amount: number): number {
  if (type === 'good') {
    const removed = Math.min(zone.goodTokens, amount);
    zone.goodTokens -= removed;
    return removed;
  } else {
    const removed = Math.min(zone.badTokens, amount);
    zone.badTokens -= removed;
    return removed;
  }
}

function checkWinConditionsInternal(state: GameState): WinCondition | null {
  // Check AMR victory (bad bacteria win)
  if (state.amrLevel >= GAME_CONSTANTS.MAX_AMR) {
    return 'bad_amr_victory';
  }

  let goodZones = 0;
  let badZones = 0;
  let totalGoodTokens = 0;
  let totalBadTokens = 0;

  for (const zone of state.zones) {
    totalGoodTokens += zone.goodTokens;
    totalBadTokens += zone.badTokens;
    if (zone.goodTokens > zone.badTokens) goodZones++;
    if (zone.badTokens > zone.goodTokens) badZones++;
  }

  // Zone control victories
  if (goodZones >= GAME_CONSTANTS.WIN_ZONE_COUNT) {
    return 'good_zone_control';
  }
  if (badZones >= GAME_CONSTANTS.WIN_ZONE_COUNT) {
    return 'bad_zone_control';
  }

  // Elimination victories (only after initial setup)
  if (state.turnNumber > 1) {
    if (totalBadTokens === 0 && totalGoodTokens > 0) {
      return 'good_elimination';
    }
    if (totalGoodTokens === 0 && totalBadTokens > 0) {
      return 'bad_elimination';
    }
  }

  return null;
}

function getWinMessage(winner: WinCondition): string {
  switch (winner) {
    case 'good_zone_control':
      return 'Good Bacteria win! Successfully colonized the gut with healthy flora!';
    case 'good_elimination':
      return 'Good Bacteria win! All harmful bacteria have been eliminated!';
    case 'bad_zone_control':
      return 'Bad Bacteria win! They have taken over the digestive system!';
    case 'bad_elimination':
      return 'Bad Bacteria win! All good bacteria have been eliminated!';
    case 'bad_amr_victory':
      return 'Bad Bacteria win! Antibiotic resistance reached critical levels!';
  }
}

// ============================================
// STORE IMPLEMENTATION
// ============================================

export const useGameStore = create<GameStore>()(
  immer((set, get) => ({
    ...getInitialState(),

    // ========================================
    // GAME INITIALIZATION
    // ========================================

    initGame: (mode: GameMode, playerConfigs: PlayerConfig[]) => {
      set((state) => {
        // Reset state
        state.mode = mode;
        state.phase = 'roll';
        state.zones = createInitialZones();
        state.amrLevel = 1;
        state.turnNumber = 1;
        state.gameStartTime = Date.now();
        state.winner = null;
        state.currentDieRoll = null;
        state.currentEvent = null;
        state.selectedCard = null;
        state.actionLog = [];

        // Create shuffled decks with multiple copies
        const goodDeckCards = shuffleDeck([
          ...GOOD_BEHAVIOR_CARDS,
          ...GOOD_BEHAVIOR_CARDS,
          ...GOOD_BEHAVIOR_CARDS,
        ]);
        const badDeckCards = shuffleDeck([
          ...BAD_BEHAVIOR_CARDS,
          ...BAD_BEHAVIOR_CARDS,
          ...BAD_BEHAVIOR_CARDS,
        ]);
        const eventsDeck = shuffleDeck([...GLOBAL_EVENTS]);

        state.goodDeck = goodDeckCards.map((card, i) => createCardInstance(card, i));
        state.badDeck = badDeckCards.map((card, i) => createCardInstance(card, i));
        state.globalEventsDeck = eventsDeck;

        // Create players with hands - alternating teams
        state.players = playerConfigs.map((config, index) => {
          const team: TeamType = index % 2 === 0 ? 'good' : 'bad';
          const deck = team === 'good' ? state.goodDeck : state.badDeck;
          const hand = deck.splice(0, GAME_CONSTANTS.HAND_SIZE);

          return {
            id: `player-${index}`,
            name: config.name || `Player ${index + 1}`,
            team,
            isAI: config.isAI || false,
            aiDifficulty: config.aiDifficulty,
            hand,
          };
        });

        state.currentPlayerIndex = 0;

        // Initialize match statistics
        state.matchStats = createInitialMatchStats();
        state.lastMatchReport = null;
        state.players.forEach((player) => {
          state.matchStats.playerStats.set(player.id, {
            cardsPlayed: 0,
            antibioticsUsed: 0,
          });
        });

        // Place initial tokens in random zones
        const randomZones = shuffleDeck([0, 1, 2, 3, 4, 5, 6, 7, 8]);
        state.zones[randomZones[0]].goodTokens = GAME_CONSTANTS.INITIAL_TOKENS;
        state.zones[randomZones[1]].badTokens = GAME_CONSTANTS.INITIAL_TOKENS;

        // Update control for initial zones
        updateZoneControl(state.zones[randomZones[0]]);
        updateZoneControl(state.zones[randomZones[1]]);

        const currentPlayer = state.players[0];
        state.message = `${currentPlayer.name}'s turn (${currentPlayer.team === 'good' ? 'Good Bacteria' : 'Bad Bacteria'}). Roll the die!`;

        state.actionLog.push({
          timestamp: Date.now(),
          player: 'System',
          action: 'Game started',
          details: `${state.players.length} players, ${mode} mode`,
        });
      });
    },

    // ========================================
    // TURN FLOW
    // ========================================

    rollDie: () => {
      set((state) => {
        if (state.phase !== 'roll') return;

        const roll = Math.floor(Math.random() * GAME_CONSTANTS.DIE_SIDES) + 1;
        state.currentDieRoll = roll;

        const currentPlayer = state.players[state.currentPlayerIndex];

        if (roll >= GAME_CONSTANTS.GLOBAL_EVENT_THRESHOLD) {
          // Trigger global event
          if (state.globalEventsDeck.length > 0) {
            state.currentEvent = state.globalEventsDeck.shift()!;
            state.phase = 'resolve_event';
            state.message = `Rolled ${roll}! GLOBAL EVENT: ${state.currentEvent.title}`;
            state.actionLog.push({
              timestamp: Date.now(),
              player: currentPlayer.name,
              action: 'rolled die',
              details: `Rolled ${roll} - Global Event triggered!`,
            });
          } else {
            state.phase = 'action';
            state.message = `Rolled ${roll}. No more events in deck. Select a card to play.`;
          }
        } else {
          state.phase = 'action';
          state.message = `Rolled ${roll}. Select a card to play.`;
          state.actionLog.push({
            timestamp: Date.now(),
            player: currentPlayer.name,
            action: 'rolled die',
            details: `Rolled ${roll}`,
          });
        }
      });
    },

    resolveEvent: () => {
      set((state) => {
        if (state.phase !== 'resolve_event' || !state.currentEvent) return;

        const event = state.currentEvent;

        // Track global event
        state.matchStats.globalEventsTriggered++;

        // Apply event effects
        for (const effect of event.effects) {
          applyEventEffect(state, effect, event);
        }

        state.actionLog.push({
          timestamp: Date.now(),
          player: 'Global Event',
          action: event.title,
          details: event.description,
        });

        state.currentEvent = null;
        state.phase = 'action';
        state.message = 'Event resolved. Select a card to play.';

        // Check for AMR victory
        if (state.amrLevel >= GAME_CONSTANTS.MAX_AMR) {
          state.winner = 'bad_amr_victory';
          state.phase = 'game_over';
          state.message = 'Bad Bacteria win! AMR reached critical level!';
        }
      });
    },

    selectCard: (card: CardInstance | null) => {
      set((state) => {
        if (state.phase !== 'action') return;

        state.selectedCard = card;
        if (card) {
          state.message = `Selected: ${card.name}. Click a zone to play it.`;
        } else {
          state.message = 'Card deselected. Select a card to play.';
        }
      });
    },

    selectZone: () => {
      // No longer used - zones are not selected, only cards
    },

    playCard: (zoneId: number, card?: CardInstance) => {
      // 1. GET CURRENT STATE (Read-only) to validate
      const state = get();
      const cardToPlay = card || state.selectedCard;
      const zone = state.zones[zoneId];

      if (!zone || !cardToPlay) {
        return;
      }

      // 2. VALIDATION (Run this BEFORE calling set)
      const totalTokens = zone.goodTokens + zone.badTokens;

      // Check Capacity
      if (totalTokens >= GAME_CONSTANTS.ZONE_CAPACITY && cardToPlay.type !== 'antibiotic') {
        get().setMessage('Zone is full! Only antibiotics can affect full zones.');
        return; // Abort
      }

      // Check Targeting Requirements
      for (const effect of cardToPlay.effects) {
        if (effect.zoneTarget === 'has_good' && zone.goodTokens === 0) {
          get().setMessage('This card requires a zone with good bacteria.');
          return; // Abort
        }
        if (effect.zoneTarget === 'has_bad' && zone.badTokens === 0) {
          get().setMessage('This card requires a zone with bad bacteria.');
          return; // Abort
        }
        if (effect.zoneTarget === 'empty' && totalTokens > 0) {
          get().setMessage('This card requires an empty zone.');
          return; // Abort
        }
      }

      // 3. EXECUTION (Mutate state)
      set((draft) => {
        // Need to grab the zone from the DRAFT to mutate it
        const draftZone = draft.zones[zoneId];
        const currentPlayer = draft.players[draft.currentPlayerIndex];

        // Update Stats
        const playerStats = draft.matchStats.playerStats.get(currentPlayer.id);
        if (playerStats) {
          playerStats.cardsPlayed++;
          if (cardToPlay.type === 'antibiotic') {
            playerStats.antibioticsUsed++;
          }
        }
        draft.matchStats.totalCardsPlayed++;

        // Apply Effects
        applyCardEffects(draft, cardToPlay, draftZone);

        // Apply AMR Cost
        if (cardToPlay.amrCost > 0) {
          draft.amrLevel = Math.min(GAME_CONSTANTS.MAX_AMR, draft.amrLevel + cardToPlay.amrCost);
          if (draft.amrLevel > draft.matchStats.highestAMRReached) {
            draft.matchStats.highestAMRReached = draft.amrLevel;
          }
        }

        // Update Controls
        draft.zones.forEach(z => updateZoneControl(z));

        // Remove from Hand
        const cardIndex = currentPlayer.hand.findIndex(
          (c) => c.instanceId === cardToPlay.instanceId
        );
        if (cardIndex !== -1) {
          currentPlayer.hand.splice(cardIndex, 1);
        }

        // Draw Card
        const deck = currentPlayer.team === 'good' ? draft.goodDeck : draft.badDeck;
        if (deck.length > 0) {
          currentPlayer.hand.push(deck.shift()!);
        }

        // Log
        draft.actionLog.push({
          timestamp: Date.now(),
          player: currentPlayer.name,
          action: `played ${cardToPlay.name}`,
          details: `on ${draftZone.name}`,
        });

        // Clear Selection
        draft.selectedCard = null;

        // Check Winner
        const winner = checkWinConditionsInternal(draft);
        if (winner) {
          draft.winner = winner;
          draft.phase = 'game_over';
          draft.message = getWinMessage(winner);
        }
      });

      // 4. TURN TRANSITION (Outside set)
      const finalState = get();
      if (finalState.phase !== 'game_over') {
        setTimeout(() => {
          get().nextTurn();
        }, 1000);
      }
    },

    nextTurn: () => {
      set((state) => {
        state.currentPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;
        if (state.currentPlayerIndex === 0) {
          state.turnNumber++;
        }
        state.currentDieRoll = null;
        state.phase = 'roll';
        const nextPlayer = state.players[state.currentPlayerIndex];
        state.message = `${nextPlayer.name}'s turn (${nextPlayer.team === 'good' ? 'Good Bacteria' : 'Bad Bacteria'}). Roll the die!`;
      });
    },

    endTurn: () => {
      set((state) => {
        state.currentPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;
        if (state.currentPlayerIndex === 0) {
          state.turnNumber++;
        }
        state.currentDieRoll = null;
        state.selectedCard = null;

        const nextPlayer = state.players[state.currentPlayerIndex];
        state.message = `${nextPlayer.name}'s turn. Roll the die!`;
      });
    },

    // ========================================
    // STATE MANAGEMENT
    // ========================================

    resetGame: () => {
      set(getInitialState());
    },

    setPhase: (phase: GamePhase) => {
      set((state) => {
        state.phase = phase;
      });
    },

    setMessage: (message: string) => {
      set((state) => {
        state.message = message;
      });
    },

    addLogEntry: (player: string, action: string, details?: string) => {
      set((state) => {
        state.actionLog.push({
          timestamp: Date.now(),
          player,
          action,
          details,
        });
      });
    },

    // ========================================
    // GETTERS
    // ========================================

    getCurrentPlayer: () => {
      const state = get();
      return state.players[state.currentPlayerIndex];
    },

    getZoneControl: (zone: Zone): TeamType | null => {
      if (zone.goodTokens > zone.badTokens) return 'good';
      if (zone.badTokens > zone.goodTokens) return 'bad';
      return null;
    },

    canPlayCard: (card: CardInstance, zoneId: number): boolean => {
      const state = get();
      const zone = state.zones[zoneId];

      if (!zone) return false;

      const totalTokens = zone.goodTokens + zone.badTokens;

      // Full zones can only be affected by antibiotics
      if (totalTokens >= GAME_CONSTANTS.ZONE_CAPACITY && card.type !== 'antibiotic') {
        return false;
      }

      // Check zone targeting requirements
      for (const effect of card.effects) {
        if (effect.zoneTarget === 'has_good' && zone.goodTokens === 0) return false;
        if (effect.zoneTarget === 'has_bad' && zone.badTokens === 0) return false;
        if (effect.zoneTarget === 'empty' && totalTokens > 0) return false;
      }

      return true;
    },

    checkWinConditions: () => {
      const state = get();
      return checkWinConditionsInternal(state);
    },

    generateMatchReport: (): MatchReport | null => {
      const state = get();

      if (!state.winner || state.phase !== 'game_over') {
        return null;
      }

      // Calculate zone control
      let goodZones = 0;
      let badZones = 0;
      let neutralZones = 0;
      let totalGoodTokens = 0;
      let totalBadTokens = 0;

      for (const zone of state.zones) {
        totalGoodTokens += zone.goodTokens;
        totalBadTokens += zone.badTokens;
        if (zone.goodTokens > zone.badTokens) goodZones++;
        else if (zone.badTokens > zone.goodTokens) badZones++;
        else neutralZones++;
      }

      // Determine winning team
      const winningTeam: TeamType =
        state.winner === 'good_zone_control' || state.winner === 'good_elimination'
          ? 'good'
          : 'bad';

      // Check if spectator mode
      const isSpectatorMode = state.players.every((p) => p.isAI);

      // Calculate duration
      const duration = Math.round((Date.now() - state.gameStartTime) / 1000);

      // Build player stats
      const playerReports = state.players.map((player) => {
        const stats = state.matchStats.playerStats.get(player.id);
        return {
          name: player.name,
          team: player.team,
          isAI: player.isAI,
          aiDifficulty: player.aiDifficulty,
          cardsPlayed: stats?.cardsPlayed || 0,
          antibioticsUsed: stats?.antibioticsUsed || 0,
        };
      });

      const report: MatchReport = {
        matchId: `match-${state.gameStartTime}`,
        timestamp: state.gameStartTime,
        duration,
        players: playerReports,
        winner: state.winner,
        winningTeam,
        totalTurns: state.turnNumber,
        finalZoneControl: {
          good: goodZones,
          bad: badZones,
          neutral: neutralZones,
        },
        finalAMRLevel: state.amrLevel,
        finalGoodTokens: totalGoodTokens,
        finalBadTokens: totalBadTokens,
        globalEventsTriggered: state.matchStats.globalEventsTriggered,
        highestAMRReached: state.matchStats.highestAMRReached,
        averageCardsPerTurn:
          state.turnNumber > 0
            ? Math.round((state.matchStats.totalCardsPlayed / state.turnNumber) * 10) / 10
            : 0,
        mode: state.mode,
        isSpectatorMode,
      };

      return report;
    },
  }))
);

// ============================================
// EFFECT APPLICATION HELPERS
// ============================================

function applyCardEffects(
  state: GameState & { matchStats: MatchStats },
  card: CardInstance,
  zone: Zone
): void {
  for (const effect of card.effects) {
    // Handle special multi-zone effects
    if (effect.special === 'two_zones') {
      const otherZones = state.zones.filter((z) => z.id !== zone.id);
      const randomOther = otherZones[Math.floor(Math.random() * otherZones.length)];

      applyEffectToZone(state, effect, zone);
      if (randomOther) {
        applyEffectToZone(state, effect, randomOther);
      }
      continue;
    }

    if (effect.special === 'all_zones_max_3') {
      let count = 0;
      for (const z of state.zones) {
        if (count >= 3) break;
        if (effect.type === 'remove_good' && z.goodTokens > 0) {
          z.goodTokens = Math.max(0, z.goodTokens - effect.value);
          count++;
        } else if (effect.type === 'remove_bad' && z.badTokens > 0) {
          z.badTokens = Math.max(0, z.badTokens - effect.value);
          count++;
        }
      }
      continue;
    }

    // Standard single-zone effects
    applyEffectToZone(state, effect, zone);
  }
}

function applyEffectToZone(
  state: GameState & { matchStats: MatchStats },
  effect: { type: string; value: number; amrChange?: number },
  zone: Zone
): void {
  switch (effect.type) {
    case 'add_good':
      addTokensToZone(zone, 'good', effect.value);
      break;
    case 'add_bad':
      addTokensToZone(zone, 'bad', effect.value);
      break;
    case 'remove_good':
      removeTokensFromZone(zone, 'good', effect.value);
      break;
    case 'remove_bad':
      removeTokensFromZone(zone, 'bad', effect.value);
      break;
    case 'kill_bad':
      removeTokensFromZone(zone, 'bad', effect.value);
      if (effect.amrChange) {
        state.amrLevel = Math.min(GAME_CONSTANTS.MAX_AMR, state.amrLevel + effect.amrChange);
      }
      break;
    case 'kill_good':
      removeTokensFromZone(zone, 'good', effect.value);
      if (effect.amrChange) {
        state.amrLevel = Math.min(GAME_CONSTANTS.MAX_AMR, state.amrLevel + effect.amrChange);
      }
      break;
    case 'nuke_zone':
      zone.goodTokens = 0;
      zone.badTokens = 0;
      if (effect.amrChange) {
        state.amrLevel = Math.min(GAME_CONSTANTS.MAX_AMR, state.amrLevel + effect.amrChange);
      }
      break;
    case 'convert_good_to_bad':
      if (zone.goodTokens > 0) {
        const convertAmount = Math.min(effect.value, zone.goodTokens);
        zone.goodTokens -= convertAmount;
        zone.badTokens = Math.min(
          GAME_CONSTANTS.ZONE_CAPACITY - zone.goodTokens,
          zone.badTokens + convertAmount
        );
      }
      break;
    case 'convert_bad_to_good':
      if (zone.badTokens > 0) {
        const convertAmount = Math.min(effect.value, zone.badTokens);
        zone.badTokens -= convertAmount;
        zone.goodTokens = Math.min(
          GAME_CONSTANTS.ZONE_CAPACITY - zone.badTokens,
          zone.goodTokens + convertAmount
        );
      }
      break;
    case 'preview_events':
      const upcomingEvents = state.globalEventsDeck.slice(0, effect.value);
      if (upcomingEvents.length > 0) {
        state.message = `Upcoming events: ${upcomingEvents.map((e) => e.title).join(', ')}`;
      } else {
        state.message = 'No more events in the deck.';
      }
      break;
  }
}

function applyEventEffect(
  state: GameState & { matchStats: MatchStats },
  effect: { type: string; value: number; special?: string; amrChange?: number },
  event: GlobalEvent
): void {
  switch (effect.special) {
    case 'random_zone': {
      const zonesWithBad = state.zones.filter((z) => z.badTokens > 0);
      if (zonesWithBad.length > 0) {
        const randomZone = zonesWithBad[Math.floor(Math.random() * zonesWithBad.length)];
        randomZone.badTokens = Math.max(0, randomZone.badTokens - effect.value);
      }
      state.amrLevel = Math.min(GAME_CONSTANTS.MAX_AMR, state.amrLevel + 1);
      break;
    }
    case 'zones_with_2plus_bad': {
      state.zones.forEach((zone) => {
        if (zone.badTokens > 2) {
          zone.badTokens--;
        }
      });
      break;
    }
    case 'three_random_zones':
    case 'four_random_zones': {
      const count = effect.special === 'three_random_zones' ? 3 : 4;
      const availableZones = state.zones.filter(
        (z) => z.goodTokens + z.badTokens < GAME_CONSTANTS.ZONE_CAPACITY
      );
      const shuffledZones = shuffleDeck(availableZones);
      for (let i = 0; i < Math.min(count, shuffledZones.length); i++) {
        addTokensToZone(shuffledZones[i], 'bad', effect.value);
      }
      break;
    }
    case 'two_random_zones': {
      const availableZones = state.zones.filter((z) => z.badTokens > 0);
      const shuffledZones = shuffleDeck(availableZones);
      for (let i = 0; i < Math.min(2, shuffledZones.length); i++) {
        if (effect.type === 'remove_bad') {
          shuffledZones[i].badTokens = Math.max(0, shuffledZones[i].badTokens - effect.value);
        } else if (effect.type === 'add_bad') {
          addTokensToZone(shuffledZones[i], 'bad', effect.value);
        }
      }
      break;
    }
    case 'zone_most_good': {
      const maxGood = Math.max(...state.zones.map((z) => z.goodTokens));
      const zone = state.zones.find((z) => z.goodTokens === maxGood);
      if (zone) {
        addTokensToZone(zone, 'bad', effect.value);
      }
      break;
    }
    case 'zone_fewest_good': {
      const minGood = Math.min(...state.zones.map((z) => z.goodTokens));
      const zone = state.zones.find((z) => z.goodTokens === minGood);
      if (zone) {
        addTokensToZone(zone, 'good', effect.value);
      }
      break;
    }
    case 'all_zones': {
      state.zones.forEach((zone) => {
        if (zone.goodTokens + zone.badTokens < GAME_CONSTANTS.ZONE_CAPACITY) {
          zone.goodTokens++;
        }
      });
      break;
    }
    case 'reduce_amr': {
      state.amrLevel = Math.max(0, state.amrLevel - 1);
      break;
    }
    case 'one_random_zone': {
      const zonesWithBad = state.zones.filter((z) => z.badTokens > 0);
      if (zonesWithBad.length > 0) {
        const zone = zonesWithBad[Math.floor(Math.random() * zonesWithBad.length)];
        zone.badTokens = 0;
      }
      break;
    }
    case 'random_zones': {
      const zonesWithGood = state.zones.filter((z) => z.goodTokens > 0);
      const shuffledZones = shuffleDeck(zonesWithGood);
      for (let i = 0; i < Math.min(effect.value, shuffledZones.length); i++) {
        if (shuffledZones[i].goodTokens > 0) {
          shuffledZones[i].goodTokens--;
          addTokensToZone(shuffledZones[i], 'bad', 1);
        }
      }
      break;
    }
    default: {
      // Handle pandemic event (AMR +2)
      if (event.id === 'ge_pandemic_scare') {
        state.amrLevel = Math.min(GAME_CONSTANTS.MAX_AMR, state.amrLevel + 2);
      }
    }
  }
}
