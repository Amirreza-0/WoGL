import { useState, useCallback } from 'react';
import { useGameStore } from '@/store/gameStore';
import { MainMenu } from '@/components/UI/MainMenu';
import { PlayerSetup } from '@/components/UI/PlayerSetup';
import { Game } from '@/components/Game/Game';
import { Tutorial, useTutorial } from '@/components/Game/Tutorial';
import type { GameMode, PlayerConfig } from '@/types/game';

type AppScreen = 'menu' | 'setup' | 'game' | 'tutorial' | 'settings' | 'about';

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('menu');
  const [gameMode, setGameMode] = useState<GameMode>('local_multiplayer');
  const initGame = useGameStore((state) => state.initGame);
  const resetGame = useGameStore((state) => state.resetGame);

  const { showTutorial, startTutorial, completeTutorial, skipTutorial } = useTutorial();

  // Screen navigation handlers
  const handleStartLocal = useCallback(() => {
    setGameMode('local_multiplayer');
    setScreen('setup');
  }, []);

  const handleStartSinglePlayer = useCallback(() => {
    setGameMode('single_player');
    setScreen('setup');
  }, []);

  const handleStartTutorial = useCallback(() => {
    // Initialize a demo game for the tutorial
    initGame('tutorial', [
      { name: 'You', isAI: false },
      { name: 'Tutorial AI', isAI: true, aiDifficulty: 'easy' },
    ]);
    startTutorial();
    setScreen('game');
  }, [initGame, startTutorial]);

  const handleOpenSettings = useCallback(() => {
    // Settings modal or screen
    console.log('Settings coming soon!');
  }, []);

  const handleOpenAbout = useCallback(() => {
    console.log(
      'The War of Gutlands\n\n' +
      'An educational strategy game about gut health and antibiotic resistance.\n\n' +
      'Version 1.0.0\n\n' +
      'Learn about the amazing world inside your digestive system while having fun!'
    );
  }, []);

  const handleSetupBack = useCallback(() => {
    setScreen('menu');
  }, []);

  const handleStartGame = useCallback(
    (players: PlayerConfig[]) => {
      initGame(gameMode, players);
      setScreen('game');
    },
    [gameMode, initGame]
  );

  const handleMainMenu = useCallback(() => {
    resetGame();
    setScreen('menu');
  }, [resetGame]);

  const handleTutorialComplete = useCallback(() => {
    completeTutorial();
  }, [completeTutorial]);

  const handleTutorialSkip = useCallback(() => {
    skipTutorial();
  }, [skipTutorial]);

  // Render tutorial overlay if active
  const renderTutorial = () => {
    if (showTutorial && screen === 'game') {
      return (
        <Tutorial
          onComplete={handleTutorialComplete}
          onSkip={handleTutorialSkip}
        />
      );
    }
    return null;
  };

  // Render screen based on current state
  switch (screen) {
    case 'menu':
      return (
        <MainMenu
          onStartLocal={handleStartLocal}
          onStartSinglePlayer={handleStartSinglePlayer}
          onStartTutorial={handleStartTutorial}
          onOpenSettings={handleOpenSettings}
          onOpenAbout={handleOpenAbout}
        />
      );

    case 'setup':
      return (
        <PlayerSetup
          mode={gameMode}
          onStart={handleStartGame}
          onBack={handleSetupBack}
        />
      );

    case 'game':
      return (
        <>
          <Game onMainMenu={handleMainMenu} />
          {renderTutorial()}
        </>
      );

    default:
      return (
        <MainMenu
          onStartLocal={handleStartLocal}
          onStartSinglePlayer={handleStartSinglePlayer}
          onStartTutorial={handleStartTutorial}
          onOpenSettings={handleOpenSettings}
          onOpenAbout={handleOpenAbout}
        />
      );
  }
}
