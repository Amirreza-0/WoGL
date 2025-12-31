/**
 * Steam integration module for The War of Gutlands
 *
 * This module provides Steam integration through the Electron bridge.
 * In production, this connects to the native Steamworks SDK via node bindings.
 * In development/web mode, it falls back to local storage.
 */

import {
  unlockAchievement as localUnlockAchievement,
  updateAchievementProgress as localUpdateProgress,
  loadAchievements,
  loadStatistics,
  saveStatistics,
} from './storage';
import type { Achievement } from '@/types/game';

interface SteamAPI {
  isAvailable: () => boolean;
  unlockAchievement: (id: string) => Promise<boolean>;
  updateStat: (name: string, value: number) => Promise<boolean>;
  getUserName: () => Promise<string>;
}

// Steam API interface (injected by Electron preload)
declare global {
  interface Window {
    electronAPI?: {
      steam?: SteamAPI;
    };
  }
}

/**
 * Check if Steam is available
 */
export function isSteamAvailable(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.electronAPI?.steam?.isAvailable?.() === true
  );
}

/**
 * Get Steam username
 */
export async function getSteamUserName(): Promise<string | null> {
  if (isSteamAvailable()) {
    try {
      return await window.electronAPI!.steam!.getUserName();
    } catch (error) {
      console.warn('Failed to get Steam username:', error);
    }
  }
  return null;
}

/**
 * Unlock a Steam achievement
 */
export async function unlockSteamAchievement(achievementId: string): Promise<boolean> {
  // Always update local storage first
  const localResult = localUnlockAchievement(achievementId);

  // If Steam is available, also unlock there
  if (isSteamAvailable()) {
    try {
      await window.electronAPI!.steam!.unlockAchievement(achievementId);
      console.log(`Steam achievement unlocked: ${achievementId}`);
    } catch (error) {
      console.warn(`Failed to unlock Steam achievement ${achievementId}:`, error);
    }
  }

  return localResult !== null;
}

/**
 * Update a Steam stat
 */
export async function updateSteamStat(statName: string, value: number): Promise<boolean> {
  // Update local statistics
  const stats = loadStatistics();
  if (statName in stats) {
    (stats as unknown as Record<string, number>)[statName] = value;
    saveStatistics(stats);
  }

  // If Steam is available, also update there
  if (isSteamAvailable()) {
    try {
      await window.electronAPI!.steam!.updateStat(statName, value);
    } catch (error) {
      console.warn(`Failed to update Steam stat ${statName}:`, error);
    }
  }

  return true;
}

/**
 * Increment a Steam stat
 */
export async function incrementSteamStat(
  statName: string,
  increment: number = 1
): Promise<boolean> {
  const stats = loadStatistics();
  const currentValue = (stats as unknown as Record<string, number>)[statName] || 0;
  return updateSteamStat(statName, currentValue + increment);
}

// Achievement IDs that map to Steam achievement names
export const STEAM_ACHIEVEMENTS = {
  MICROBIOME_MASTER: 'microbiome_master',
  HEALTH_HERO: 'health_hero',
  RESISTANCE_FIGHTER: 'resistance_fighter',
  ANTIBIOTIC_WISDOM: 'antibiotic_wisdom',
  ZONE_CONTROLLER: 'zone_controller',
  PERFECT_BALANCE: 'perfect_balance',
  CARD_COLLECTOR: 'card_collector',
  VETERAN_PLAYER: 'veteran_player',
  BACTERIA_BLITZ: 'bacteria_blitz',
  MARATHON_MATCH: 'marathon_match',
  COMEBACK_KING: 'comeback_king',
  PERFECT_GAME: 'perfect_game',
} as const;

// Stat names that map to Steam stat names
export const STEAM_STATS = {
  TOTAL_GAMES: 'total_games',
  GAMES_WON_GOOD: 'games_won_good',
  GAMES_WON_BAD: 'games_won_bad',
  TOTAL_TURNS: 'total_turns',
  CARDS_PLAYED: 'cards_played',
  ANTIBIOTICS_USED: 'antibiotics_used',
  GLOBAL_EVENTS: 'global_events',
} as const;

/**
 * Check and unlock achievements based on game state
 */
export async function checkAchievements(context: {
  winner: 'good' | 'bad' | null;
  turnCount: number;
  amrLevel: number;
  antibioticsUsed: number;
  zonesControlled: number;
  tokensLost: number;
  tutorialCompleted?: boolean;
}): Promise<Achievement[]> {
  const unlockedAchievements: Achievement[] = [];
  const achievements = loadAchievements();
  const stats = loadStatistics();

  // Tutorial completion
  if (context.tutorialCompleted) {
    const result = await unlockSteamAchievement(STEAM_ACHIEVEMENTS.MICROBIOME_MASTER);
    if (result) {
      const ach = achievements.find((a) => a.id === STEAM_ACHIEVEMENTS.MICROBIOME_MASTER);
      if (ach) unlockedAchievements.push(ach);
    }
  }

  // Good team wins
  if (context.winner === 'good') {
    // Health Hero - Win 5 games as Good Bacteria
    const goodWins = stats.gamesWonGood + 1;
    if (goodWins >= 5) {
      const result = await unlockSteamAchievement(STEAM_ACHIEVEMENTS.HEALTH_HERO);
      if (result) {
        const ach = achievements.find((a) => a.id === STEAM_ACHIEVEMENTS.HEALTH_HERO);
        if (ach) unlockedAchievements.push(ach);
      }
    } else {
      localUpdateProgress(STEAM_ACHIEVEMENTS.HEALTH_HERO, goodWins);
    }

    // Resistance Fighter - Win without AMR exceeding 5
    if (context.amrLevel <= 5) {
      const result = await unlockSteamAchievement(STEAM_ACHIEVEMENTS.RESISTANCE_FIGHTER);
      if (result) {
        const ach = achievements.find((a) => a.id === STEAM_ACHIEVEMENTS.RESISTANCE_FIGHTER);
        if (ach) unlockedAchievements.push(ach);
      }
    }

    // Antibiotic Wisdom - Win without using antibiotics
    if (context.antibioticsUsed === 0) {
      const result = await unlockSteamAchievement(STEAM_ACHIEVEMENTS.ANTIBIOTIC_WISDOM);
      if (result) {
        const ach = achievements.find((a) => a.id === STEAM_ACHIEVEMENTS.ANTIBIOTIC_WISDOM);
        if (ach) unlockedAchievements.push(ach);
      }
    }

    // Perfect Balance - Win with AMR at 0
    if (context.amrLevel === 0) {
      const result = await unlockSteamAchievement(STEAM_ACHIEVEMENTS.PERFECT_BALANCE);
      if (result) {
        const ach = achievements.find((a) => a.id === STEAM_ACHIEVEMENTS.PERFECT_BALANCE);
        if (ach) unlockedAchievements.push(ach);
      }
    }
  }

  // Bacteria Blitz - Win in under 10 turns
  if (context.winner && context.turnCount < 10) {
    const result = await unlockSteamAchievement(STEAM_ACHIEVEMENTS.BACTERIA_BLITZ);
    if (result) {
      const ach = achievements.find((a) => a.id === STEAM_ACHIEVEMENTS.BACTERIA_BLITZ);
      if (ach) unlockedAchievements.push(ach);
    }
  }

  // Marathon Match - Game lasting 50+ turns
  if (context.turnCount >= 50) {
    const result = await unlockSteamAchievement(STEAM_ACHIEVEMENTS.MARATHON_MATCH);
    if (result) {
      const ach = achievements.find((a) => a.id === STEAM_ACHIEVEMENTS.MARATHON_MATCH);
      if (ach) unlockedAchievements.push(ach);
    }
  }

  // Zone Controller - Control all 9 zones
  if (context.zonesControlled >= 9) {
    const result = await unlockSteamAchievement(STEAM_ACHIEVEMENTS.ZONE_CONTROLLER);
    if (result) {
      const ach = achievements.find((a) => a.id === STEAM_ACHIEVEMENTS.ZONE_CONTROLLER);
      if (ach) unlockedAchievements.push(ach);
    }
  }

  // Perfect Game - Win without losing any tokens
  if (context.winner && context.tokensLost === 0) {
    const result = await unlockSteamAchievement(STEAM_ACHIEVEMENTS.PERFECT_GAME);
    if (result) {
      const ach = achievements.find((a) => a.id === STEAM_ACHIEVEMENTS.PERFECT_GAME);
      if (ach) unlockedAchievements.push(ach);
    }
  }

  // Veteran Player - Play 100 games
  const totalGames = stats.totalGamesPlayed + 1;
  if (totalGames >= 100) {
    const result = await unlockSteamAchievement(STEAM_ACHIEVEMENTS.VETERAN_PLAYER);
    if (result) {
      const ach = achievements.find((a) => a.id === STEAM_ACHIEVEMENTS.VETERAN_PLAYER);
      if (ach) unlockedAchievements.push(ach);
    }
  } else {
    localUpdateProgress(STEAM_ACHIEVEMENTS.VETERAN_PLAYER, totalGames);
  }

  return unlockedAchievements;
}
