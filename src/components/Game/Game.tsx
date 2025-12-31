import { useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Header } from '@/components/UI/Header';
import { Sidebar } from '@/components/UI/Sidebar';
import { GameBoard } from '@/components/Board/GameBoard';
import { PlayerHand } from '@/components/Cards/PlayerHand';
import { GameOverScreen } from '@/components/UI/GameOverScreen';
import { AIPlayer } from '@/utils/ai';

interface GameProps {
  onMainMenu: () => void;
}

export function Game({ onMainMenu }: GameProps) {
  const phase = useGameStore((state) => state.phase);
  const winner = useGameStore((state) => state.winner);
  const initGame = useGameStore((state) => state.initGame);
  const mode = useGameStore((state) => state.mode);
  const players = useGameStore((state) => state.players);
  const currentPlayerIndex = useGameStore((state) => state.currentPlayerIndex);
  const rollDie = useGameStore((state) => state.rollDie);
  const resolveEvent = useGameStore((state) => state.resolveEvent);
  const selectCard = useGameStore((state) => state.selectCard);
  const playCard = useGameStore((state) => state.playCard);
  const nextTurn = useGameStore((state) => state.nextTurn);

  const aiTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const actionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentPlayer = players[currentPlayerIndex];
  const isAITurn = currentPlayer?.isAI ?? false;

  // Cleanup function for AI timeouts
  const cleanupAITimeout = useCallback(() => {
    if (aiTimeoutRef.current) {
      clearTimeout(aiTimeoutRef.current);
      aiTimeoutRef.current = null;
    }
    if (actionTimeoutRef.current) {
      clearTimeout(actionTimeoutRef.current);
      actionTimeoutRef.current = null;
    }
  }, []);

  // Process AI turns - use a unique key combining player index and phase
  useEffect(() => {
    // Skip non-game phases
    if (phase === 'game_over' || phase === 'menu' || phase === 'setup') {
      return;
    }

    // Skip if not AI's turn
    if (!isAITurn || !currentPlayer?.isAI) {
      return;
    }

    // Clean up any existing timeouts before starting new ones
    cleanupAITimeout();

    const ai = new AIPlayer(currentPlayer.aiDifficulty || 'medium');
    const baseDelay = 800;
    const randomDelay = () => baseDelay + Math.random() * 600;

    if (phase === 'roll') {
      aiTimeoutRef.current = setTimeout(() => {
        rollDie();
      }, randomDelay());
    } else if (phase === 'resolve_event') {
      aiTimeoutRef.current = setTimeout(() => {
        resolveEvent();
      }, 1200 + Math.random() * 800);
    } else if (phase === 'action') {
      // Get fresh state for AI decision
      const state = useGameStore.getState();
      const decision = ai.makeDecision(state, state.currentPlayerIndex);

      if (decision) {
        aiTimeoutRef.current = setTimeout(() => {
          selectCard(decision.card);

          // Then play it on the target zone
          actionTimeoutRef.current = setTimeout(() => {
            playCard(decision.targetZoneId, decision.card);
          }, 600 + Math.random() * 400);
        }, randomDelay());
      } else {
        // No valid plays - this shouldn't happen, but handle gracefully
        console.warn('[AI] No valid plays available, skipping turn');
        // Force next turn if AI can't play
        aiTimeoutRef.current = setTimeout(() => {
          nextTurn();
        }, 500);
      }
    }

    return cleanupAITimeout;
  }, [
    phase,
    currentPlayerIndex,
    isAITurn,
    currentPlayer?.aiDifficulty,
    rollDie,
    resolveEvent,
    selectCard,
    playCard,
    nextTurn,
    cleanupAITimeout,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanupAITimeout;
  }, [cleanupAITimeout]);

  const handlePlayAgain = useCallback(() => {
    cleanupAITimeout();

    // Restart with same player configuration
    const playerConfigs = players.map((p) => ({
      name: p.name,
      isAI: p.isAI,
      aiDifficulty: p.aiDifficulty,
    }));
    initGame(mode, playerConfigs);
  }, [cleanupAITimeout, players, initGame, mode]);

  const handleMainMenu = useCallback(() => {
    cleanupAITimeout();
    onMainMenu();
  }, [cleanupAITimeout, onMainMenu]);

  if (phase === 'game_over' && winner) {
    return (
      <GameOverScreen
        winner={winner}
        onPlayAgain={handlePlayAgain}
        onMainMenu={handleMainMenu}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen bg-amber-50 text-slate-800 overflow-hidden">
      {/* Header */}
      <Header />

      {/* Main game area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        <Sidebar />

        {/* Game board */}
        <GameBoard />
      </div>

      {/* Player hand */}
      <PlayerHand />
    </div>
  );
}
