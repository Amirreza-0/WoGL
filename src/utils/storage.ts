import type { GameState, GameSettings, GameStatistics, Achievement } from '@/types/game';
import { DEFAULT_SETTINGS } from '@/types/game';

const STORAGE_KEYS = {
  SETTINGS: 'wogl_settings',
  STATISTICS: 'wogl_statistics',
  ACHIEVEMENTS: 'wogl_achievements',
  SAVED_GAME: 'wogl_saved_game',
} as const;

/**
 * Save game settings to localStorage
 */
export function saveSettings(settings: GameSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
}

/**
 * Load game settings from localStorage
 */
export function loadSettings(): GameSettings {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (saved) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
  return DEFAULT_SETTINGS;
}

/**
 * Save game statistics
 */
export function saveStatistics(stats: GameStatistics): void {
  try {
    localStorage.setItem(STORAGE_KEYS.STATISTICS, JSON.stringify(stats));
  } catch (error) {
    console.error('Failed to save statistics:', error);
  }
}

/**
 * Load game statistics
 */
export function loadStatistics(): GameStatistics {
  const defaultStats: GameStatistics = {
    totalGamesPlayed: 0,
    gamesWonGood: 0,
    gamesWonBad: 0,
    totalTurns: 0,
    cardsPlayedGood: 0,
    cardsPlayedBad: 0,
    antibioticsUsed: 0,
    globalEventsTriggered: 0,
    averageAMRLevel: 0,
    fastestWin: Infinity,
    longestGame: 0,
  };

  try {
    const saved = localStorage.getItem(STORAGE_KEYS.STATISTICS);
    if (saved) {
      return { ...defaultStats, ...JSON.parse(saved) };
    }
  } catch (error) {
    console.error('Failed to load statistics:', error);
  }
  return defaultStats;
}

/**
 * Update statistics after a game
 */
export function updateStatistics(
  gameState: GameState,
  winner: 'good' | 'bad'
): GameStatistics {
  const current = loadStatistics();

  const updated: GameStatistics = {
    ...current,
    totalGamesPlayed: current.totalGamesPlayed + 1,
    gamesWonGood: current.gamesWonGood + (winner === 'good' ? 1 : 0),
    gamesWonBad: current.gamesWonBad + (winner === 'bad' ? 1 : 0),
    totalTurns: current.totalTurns + gameState.turnNumber,
    fastestWin: Math.min(current.fastestWin, gameState.turnNumber),
    longestGame: Math.max(current.longestGame, gameState.turnNumber),
    averageAMRLevel:
      (current.averageAMRLevel * current.totalGamesPlayed + gameState.amrLevel) /
      (current.totalGamesPlayed + 1),
  };

  saveStatistics(updated);
  return updated;
}

/**
 * Save current game state
 */
export function saveGame(state: Partial<GameState>): void {
  try {
    const saveData = {
      ...state,
      savedAt: Date.now(),
    };
    localStorage.setItem(STORAGE_KEYS.SAVED_GAME, JSON.stringify(saveData));
  } catch (error) {
    console.error('Failed to save game:', error);
  }
}

/**
 * Load saved game state
 */
export function loadGame(): (Partial<GameState> & { savedAt: number }) | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SAVED_GAME);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Failed to load game:', error);
  }
  return null;
}

/**
 * Delete saved game
 */
export function deleteSavedGame(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.SAVED_GAME);
  } catch (error) {
    console.error('Failed to delete saved game:', error);
  }
}

/**
 * Check if a saved game exists
 */
export function hasSavedGame(): boolean {
  return localStorage.getItem(STORAGE_KEYS.SAVED_GAME) !== null;
}

// Achievement definitions
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'microbiome_master',
    name: 'Microbiome Master',
    description: 'Complete the tutorial',
    icon: '🎓',
    unlocked: false,
  },
  {
    id: 'health_hero',
    name: 'Health Hero',
    description: 'Win 5 games as Good Bacteria',
    icon: '🦸',
    unlocked: false,
    progress: 0,
    maxProgress: 5,
  },
  {
    id: 'resistance_fighter',
    name: 'Resistance Fighter',
    description: 'Win without AMR exceeding level 5',
    icon: '💪',
    unlocked: false,
  },
  {
    id: 'antibiotic_wisdom',
    name: 'Antibiotic Wisdom',
    description: 'Win a game without using antibiotics',
    icon: '🧠',
    unlocked: false,
  },
  {
    id: 'zone_controller',
    name: 'Zone Controller',
    description: 'Control all 9 zones simultaneously',
    icon: '👑',
    unlocked: false,
  },
  {
    id: 'perfect_balance',
    name: 'Perfect Balance',
    description: 'Win with AMR barometer at exactly 0',
    icon: '⚖️',
    unlocked: false,
  },
  {
    id: 'card_collector',
    name: 'Card Collector',
    description: 'Play every card type in a single game',
    icon: '🃏',
    unlocked: false,
  },
  {
    id: 'veteran_player',
    name: 'Veteran Player',
    description: 'Play 100 games',
    icon: '🎖️',
    unlocked: false,
    progress: 0,
    maxProgress: 100,
  },
  {
    id: 'bacteria_blitz',
    name: 'Bacteria Blitz',
    description: 'Win a game in under 10 turns',
    icon: '⚡',
    unlocked: false,
  },
  {
    id: 'marathon_match',
    name: 'Marathon Match',
    description: 'Complete a game lasting 50+ turns',
    icon: '🏃',
    unlocked: false,
  },
  {
    id: 'comeback_king',
    name: 'Comeback King',
    description: 'Win from controlling only 1 zone',
    icon: '🔄',
    unlocked: false,
  },
  {
    id: 'perfect_game',
    name: 'Perfect Game',
    description: 'Win without losing any tokens',
    icon: '✨',
    unlocked: false,
  },
];

/**
 * Save achievements
 */
export function saveAchievements(achievements: Achievement[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
  } catch (error) {
    console.error('Failed to save achievements:', error);
  }
}

/**
 * Load achievements
 */
export function loadAchievements(): Achievement[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
    if (saved) {
      const savedAchievements = JSON.parse(saved) as Achievement[];
      // Merge with default achievements (in case new ones are added)
      return ACHIEVEMENTS.map((defaultAch) => {
        const saved = savedAchievements.find((a) => a.id === defaultAch.id);
        return saved ? { ...defaultAch, ...saved } : defaultAch;
      });
    }
  } catch (error) {
    console.error('Failed to load achievements:', error);
  }
  return ACHIEVEMENTS;
}

/**
 * Unlock an achievement
 */
export function unlockAchievement(achievementId: string): Achievement | null {
  const achievements = loadAchievements();
  const achievement = achievements.find((a) => a.id === achievementId);

  if (achievement && !achievement.unlocked) {
    achievement.unlocked = true;
    achievement.unlockedAt = new Date();
    saveAchievements(achievements);
    return achievement;
  }

  return null;
}

/**
 * Update achievement progress
 */
export function updateAchievementProgress(
  achievementId: string,
  progress: number
): Achievement | null {
  const achievements = loadAchievements();
  const achievement = achievements.find((a) => a.id === achievementId);

  if (achievement && !achievement.unlocked && achievement.maxProgress) {
    achievement.progress = Math.min(progress, achievement.maxProgress);

    if (achievement.progress >= achievement.maxProgress) {
      achievement.unlocked = true;
      achievement.unlockedAt = new Date();
    }

    saveAchievements(achievements);
    return achievement;
  }

  return null;
}
