import type { GameState, CardInstance, Zone, AIDifficulty, TeamType } from '@/types/game';
import { GAME_CONSTANTS } from '@/types/game';

// ============================================
// TYPES
// ============================================

export interface AIDecision {
  card: CardInstance;
  targetZoneId: number;
  reasoning: string;
  score: number;
}

interface ZoneAnalysis {
  zoneId: number;
  control: TeamType | 'neutral';
  goodTokens: number;
  badTokens: number;
  totalTokens: number;
  availableSpace: number;
  flipPotential: number;
  strategicValue: number;
}

interface BoardAnalysis {
  zones: ZoneAnalysis[];
  goodZoneCount: number;
  badZoneCount: number;
  neutralZoneCount: number;
  totalGoodTokens: number;
  totalBadTokens: number;
  winProximityGood: number;
  winProximityBad: number;
  amrThreat: number;
  gamePhase: 'early' | 'mid' | 'late' | 'critical';
}

interface ScoredPlay {
  card: CardInstance;
  zoneId: number;
  score: number;
  reasoning: string;
}

// ============================================
// AI PLAYER CLASS
// ============================================

export class AIPlayer {
  private difficulty: AIDifficulty;

  constructor(difficulty: AIDifficulty = 'medium') {
    this.difficulty = difficulty;
  }

  /**
   * Make a decision about which card to play and where
   */
  makeDecision(state: GameState, playerIndex: number): AIDecision | null {
    const player = state.players[playerIndex];
    if (!player || player.hand.length === 0) {
      return null;
    }

    const isGoodTeam = player.team === 'good';
    const analysis = this.analyzeBoard(state);
    const scoredPlays = this.getAllScoredPlays(state, player.hand, isGoodTeam, analysis);

    if (scoredPlays.length === 0) {
      return null;
    }

    // Sort by score (highest first)
    scoredPlays.sort((a, b) => b.score - a.score);

    // Select based on difficulty
    const selectedIndex = this.selectByDifficulty(scoredPlays);
    const selected = scoredPlays[selectedIndex];

    return {
      card: selected.card,
      targetZoneId: selected.zoneId,
      reasoning: selected.reasoning,
      score: selected.score,
    };
  }

  /**
   * Analyze the current board state
   */
  private analyzeBoard(state: GameState): BoardAnalysis {
    let goodZoneCount = 0;
    let badZoneCount = 0;
    let neutralZoneCount = 0;
    let totalGoodTokens = 0;
    let totalBadTokens = 0;

    const zones: ZoneAnalysis[] = state.zones.map((zone) => {
      totalGoodTokens += zone.goodTokens;
      totalBadTokens += zone.badTokens;

      let control: TeamType | 'neutral' = 'neutral';
      if (zone.goodTokens > zone.badTokens) {
        control = 'good';
        goodZoneCount++;
      } else if (zone.badTokens > zone.goodTokens) {
        control = 'bad';
        badZoneCount++;
      } else {
        neutralZoneCount++;
      }

      const totalTokens = zone.goodTokens + zone.badTokens;
      const availableSpace = GAME_CONSTANTS.ZONE_CAPACITY - totalTokens;
      const diff = Math.abs(zone.goodTokens - zone.badTokens);
      const flipPotential = diff === 0 ? 1 : 1 / (diff + 1);

      let strategicValue = 1;
      if (totalTokens > 0) strategicValue += 0.2;
      if (control === 'neutral') strategicValue += 0.3;

      return {
        zoneId: zone.id,
        control,
        goodTokens: zone.goodTokens,
        badTokens: zone.badTokens,
        totalTokens,
        availableSpace,
        flipPotential,
        strategicValue,
      };
    });

    const winProximityGood = goodZoneCount / GAME_CONSTANTS.WIN_ZONE_COUNT;
    const winProximityBad = badZoneCount / GAME_CONSTANTS.WIN_ZONE_COUNT;
    const amrThreat = state.amrLevel / GAME_CONSTANTS.MAX_AMR;

    let gamePhase: BoardAnalysis['gamePhase'] = 'early';
    if (state.turnNumber > 15 || winProximityGood >= 0.8 || winProximityBad >= 0.8) {
      gamePhase = 'critical';
    } else if (state.turnNumber > 10 || winProximityGood >= 0.6 || winProximityBad >= 0.6) {
      gamePhase = 'late';
    } else if (state.turnNumber > 5) {
      gamePhase = 'mid';
    }

    return {
      zones,
      goodZoneCount,
      badZoneCount,
      neutralZoneCount,
      totalGoodTokens,
      totalBadTokens,
      winProximityGood,
      winProximityBad,
      amrThreat,
      gamePhase,
    };
  }

  /**
   * Get all valid plays with calculated scores
   */
  private getAllScoredPlays(
    state: GameState,
    hand: CardInstance[],
    isGoodTeam: boolean,
    analysis: BoardAnalysis
  ): ScoredPlay[] {
    const plays: ScoredPlay[] = [];

    for (const card of hand) {
      for (const zone of state.zones) {
        if (this.canPlayCard(card, zone)) {
          const zoneAnalysis = analysis.zones[zone.id];
          const score = this.evaluatePlay(card, zoneAnalysis, analysis, isGoodTeam);
          const reasoning = this.generateReasoning(card, zoneAnalysis, score, isGoodTeam, analysis);
          plays.push({ card, zoneId: zone.id, score, reasoning });
        }
      }
    }

    return plays;
  }

  /**
   * Check if a card can be played on a zone
   */
  private canPlayCard(card: CardInstance, zone: Zone): boolean {
    const totalTokens = zone.goodTokens + zone.badTokens;

    if (totalTokens >= GAME_CONSTANTS.ZONE_CAPACITY && card.type !== 'antibiotic') {
      return false;
    }

    for (const effect of card.effects) {
      if (effect.zoneTarget === 'has_good' && zone.goodTokens === 0) return false;
      if (effect.zoneTarget === 'has_bad' && zone.badTokens === 0) return false;
      if (effect.zoneTarget === 'empty' && totalTokens > 0) return false;
    }

    return true;
  }

  /**
   * Evaluate a play with strategic considerations
   */
  private evaluatePlay(
    card: CardInstance,
    zone: ZoneAnalysis,
    analysis: BoardAnalysis,
    isGoodTeam: boolean
  ): number {
    let score = 0;
    const myTeam = isGoodTeam ? 'good' : 'bad';
    const enemyTeam = isGoodTeam ? 'bad' : 'good';

    // Base score from card effects
    for (const effect of card.effects) {
      score += this.scoreEffect(effect, zone, isGoodTeam, analysis);
    }

    // AMR cost penalty
    if (card.amrCost > 0) {
      const amrPenalty = card.amrCost * 8;
      if (isGoodTeam) {
        score -= amrPenalty * (1 + analysis.amrThreat);
      } else {
        score += amrPenalty * 0.3;
      }
    }

    // Strategic zone targeting
    if (zone.control === enemyTeam) {
      score += 8 * zone.flipPotential;
    } else if (zone.control === myTeam) {
      if (zone.flipPotential > 0.3) {
        score += 5;
      }
    } else {
      score += 6;
    }

    // Win proximity adjustments
    const myWinProximity = isGoodTeam ? analysis.winProximityGood : analysis.winProximityBad;
    const enemyWinProximity = isGoodTeam ? analysis.winProximityBad : analysis.winProximityGood;

    if (myWinProximity >= 0.8) {
      score *= 1.3;
    }
    if (enemyWinProximity >= 0.8 && zone.control === enemyTeam) {
      score *= 1.4;
    }

    // Game phase adjustments
    switch (analysis.gamePhase) {
      case 'early':
        if (zone.totalTokens === 0) score += 5;
        break;
      case 'mid':
        if (zone.control === 'neutral') score += 3;
        break;
      case 'late':
      case 'critical':
        score *= 1.2;
        break;
    }

    // Survival mode
    if (isGoodTeam && analysis.totalGoodTokens <= 3) {
      for (const effect of card.effects) {
        if (effect.type === 'add_good') score += 20;
      }
    } else if (!isGoodTeam && analysis.totalBadTokens <= 3) {
      for (const effect of card.effects) {
        if (effect.type === 'add_bad') score += 20;
      }
    }

    return score;
  }

  /**
   * Score individual effect
   */
  private scoreEffect(
    effect: { type: string; value: number; special?: string; amrChange?: number },
    zone: ZoneAnalysis,
    isGoodTeam: boolean,
    analysis: BoardAnalysis
  ): number {
    let score = 0;
    const baseValue = effect.value * 10;

    switch (effect.type) {
      case 'add_good':
        score += isGoodTeam ? baseValue : -baseValue * 0.8;
        if (zone.availableSpace >= effect.value) {
          score += isGoodTeam ? 3 : -2;
        }
        if (effect.special === 'two_zones') {
          score += isGoodTeam ? baseValue * 0.5 : -baseValue * 0.4;
        }
        break;

      case 'add_bad':
        score += isGoodTeam ? -baseValue * 0.8 : baseValue;
        if (zone.availableSpace >= effect.value) {
          score += isGoodTeam ? -2 : 3;
        }
        if (effect.special === 'two_zones') {
          score += isGoodTeam ? -baseValue * 0.4 : baseValue * 0.5;
        }
        break;

      case 'remove_good':
        score += isGoodTeam ? -baseValue : baseValue * 0.9;
        if (zone.goodTokens >= effect.value) {
          score += isGoodTeam ? -5 : 5;
        }
        break;

      case 'remove_bad':
        score += isGoodTeam ? baseValue * 0.9 : -baseValue;
        if (zone.badTokens >= effect.value) {
          score += isGoodTeam ? 5 : -5;
        }
        break;

      case 'kill_bad':
        score += isGoodTeam ? baseValue * 0.8 : -baseValue * 0.7;
        if (effect.amrChange) {
          const amrPenalty = effect.amrChange * 6 * (1 + analysis.amrThreat);
          score -= isGoodTeam ? amrPenalty : -amrPenalty * 0.3;
        }
        break;

      case 'kill_good':
        score += isGoodTeam ? -baseValue * 0.8 : baseValue * 0.8;
        if (effect.amrChange) {
          score += isGoodTeam ? -effect.amrChange * 5 : effect.amrChange * 2;
        }
        break;

      case 'nuke_zone': {
        const goodLoss = zone.goodTokens;
        const badLoss = zone.badTokens;
        const netEffect = isGoodTeam ? badLoss - goodLoss : goodLoss - badLoss;
        score += netEffect * 8;
        if (effect.amrChange) {
          score -= isGoodTeam
            ? effect.amrChange * 10 * (1 + analysis.amrThreat)
            : -effect.amrChange * 3;
        }
        break;
      }

      case 'convert_good_to_bad':
        score += isGoodTeam ? -baseValue * 1.5 : baseValue * 1.5;
        break;

      case 'convert_bad_to_good':
        score += isGoodTeam ? baseValue * 1.5 : -baseValue * 1.5;
        break;
    }

    return score;
  }

  /**
   * Generate human-readable reasoning
   */
  private generateReasoning(
    card: CardInstance,
    zone: ZoneAnalysis,
    score: number,
    isGoodTeam: boolean,
    analysis: BoardAnalysis
  ): string {
    const teamStr = isGoodTeam ? 'Good' : 'Bad';
    const action = this.describeCardAction(card, isGoodTeam);
    const target = this.describeZoneTarget(zone, isGoodTeam);
    const strategy = this.describeStrategy(analysis, isGoodTeam);

    return `[${score.toFixed(1)}] ${teamStr}: ${action} ${target}. ${strategy}`;
  }

  private describeCardAction(card: CardInstance, isGoodTeam: boolean): string {
    if (card.type === 'antibiotic') {
      return `uses ${card.name}`;
    }
    const isOffensive = card.effects.some(
      (e) =>
        (isGoodTeam && (e.type === 'remove_bad' || e.type === 'kill_bad')) ||
        (!isGoodTeam && (e.type === 'remove_good' || e.type === 'kill_good'))
    );
    return isOffensive ? `attacks with ${card.name}` : `plays ${card.name}`;
  }

  private describeZoneTarget(zone: ZoneAnalysis, isGoodTeam: boolean): string {
    const myTeam = isGoodTeam ? 'good' : 'bad';
    if (zone.control === myTeam) {
      return `to reinforce zone ${zone.zoneId + 1}`;
    } else if (zone.control === 'neutral') {
      return `to contest zone ${zone.zoneId + 1}`;
    } else {
      return `to attack zone ${zone.zoneId + 1}`;
    }
  }

  private describeStrategy(analysis: BoardAnalysis, isGoodTeam: boolean): string {
    const myZones = isGoodTeam ? analysis.goodZoneCount : analysis.badZoneCount;
    const enemyZones = isGoodTeam ? analysis.badZoneCount : analysis.goodZoneCount;

    if (myZones >= 4) return 'Pressing for victory!';
    if (enemyZones >= 4) return 'Desperate defense!';
    if (analysis.gamePhase === 'early') return 'Establishing position.';
    if (analysis.gamePhase === 'critical') return 'Critical moment!';
    return 'Building advantage.';
  }

  /**
   * Select a play based on difficulty
   */
  private selectByDifficulty(scoredPlays: ScoredPlay[]): number {
    const totalOptions = scoredPlays.length;
    if (totalOptions === 0) return 0;
    if (totalOptions === 1) return 0;

    switch (this.difficulty) {
      case 'easy':
        // 30% best, 70% random
        if (Math.random() < 0.3) {
          return 0;
        }
        return Math.floor(Math.random() * totalOptions);

      case 'medium': {
        // Weighted selection favoring better options
        const cutoff = Math.min(5, Math.ceil(totalOptions * 0.5));
        const weights = Array.from({ length: cutoff }, (_, i) => Math.pow(0.6, i));
        const totalWeight = weights.reduce((a, b) => a + b, 0);
        let random = Math.random() * totalWeight;
        for (let i = 0; i < weights.length; i++) {
          random -= weights[i];
          if (random <= 0) return i;
        }
        return 0;
      }

      case 'hard': {
        // 85% best, 10% second-best, 5% third-best
        const roll = Math.random();
        if (roll < 0.85) return 0;
        if (roll < 0.95 && totalOptions > 1) return 1;
        if (totalOptions > 2) return 2;
        return 0;
      }

      default:
        return 0;
    }
  }
}

// ============================================
// AI TURN PROCESSING
// ============================================

export interface AITurnCallbacks {
  onRoll: () => void;
  onResolveEvent: () => void;
  onSelectCard: (card: CardInstance) => void;
  onPlayCard: (zoneId: number) => void;
}

/**
 * Process an AI turn with proper timing
 */
export function processAITurn(
  state: GameState,
  playerIndex: number,
  callbacks: AITurnCallbacks
): void {
  const player = state.players[playerIndex];
  if (!player || !player.isAI) return;

  const ai = new AIPlayer(player.aiDifficulty || 'medium');

  const baseDelay = 800;
  const randomDelay = () => baseDelay + Math.random() * 600;

  if (state.phase === 'roll') {
    setTimeout(() => {
      callbacks.onRoll();
    }, randomDelay());
  } else if (state.phase === 'resolve_event') {
    setTimeout(() => {
      callbacks.onResolveEvent();
    }, 1200 + Math.random() * 800);
  } else if (state.phase === 'action') {
    const decision = ai.makeDecision(state, playerIndex);

    if (decision) {
      setTimeout(() => {
        callbacks.onSelectCard(decision.card);

        setTimeout(() => {
          callbacks.onPlayCard(decision.targetZoneId);
        }, 600 + Math.random() * 400);
      }, randomDelay());
    }
  }
}

/**
 * Get AI difficulty description
 */
export function getDifficultyDescription(difficulty: AIDifficulty): string {
  switch (difficulty) {
    case 'easy':
      return 'Makes frequent mistakes and random choices';
    case 'medium':
      return 'Balanced strategy with occasional errors';
    case 'hard':
      return 'Optimal play with minimal mistakes';
  }
}
