import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Bot, Plus, Minus, Play, ArrowLeft, Eye, Zap } from 'lucide-react';
import clsx from 'clsx';
import type { GameMode, AIDifficulty } from '@/types/game';

interface PlayerConfig {
  name: string;
  isAI: boolean;
  aiDifficulty: AIDifficulty;
}

interface PlayerSetupProps {
  mode: GameMode;
  onStart: (players: PlayerConfig[]) => void;
  onBack: () => void;
}

type SetupPreset = 'custom' | 'spectator' | 'single_player';

export function PlayerSetup({ mode, onStart, onBack }: PlayerSetupProps) {
  const [playerCount, setPlayerCount] = useState(2);
  const [setupPreset, setSetupPreset] = useState<SetupPreset>(
    mode === 'single_player' ? 'single_player' : 'custom'
  );
  const [players, setPlayers] = useState<PlayerConfig[]>([
    { name: 'Player 1', isAI: false, aiDifficulty: 'medium' },
    { name: 'Player 2', isAI: mode === 'single_player', aiDifficulty: 'medium' },
  ]);

  const isSinglePlayer = mode === 'single_player';
  const minPlayers = 2;
  const maxPlayers = 6;

  // Check if this is spectator mode (all AI)
  const isSpectatorMode = players.every(p => p.isAI);

  // Apply preset configuration
  const applyPreset = (preset: SetupPreset) => {
    setSetupPreset(preset);

    switch (preset) {
      case 'spectator':
        // All AI players
        setPlayers(players.map((p, i) => ({
          ...p,
          name: `AI ${i + 1}`,
          isAI: true,
          aiDifficulty: i % 2 === 0 ? 'hard' : 'medium',
        })));
        break;
      case 'single_player':
        // First player human, rest AI
        setPlayers(players.map((p, i) => ({
          ...p,
          name: i === 0 ? 'Player 1' : `AI ${i}`,
          isAI: i !== 0,
          aiDifficulty: 'medium',
        })));
        break;
      case 'custom':
        // Reset to all human
        setPlayers(players.map((p, i) => ({
          ...p,
          name: `Player ${i + 1}`,
          isAI: false,
        })));
        break;
    }
  };

  const updatePlayerCount = (delta: number) => {
    const newCount = Math.max(minPlayers, Math.min(maxPlayers, playerCount + delta));
    setPlayerCount(newCount);

    if (delta > 0) {
      const newIndex = players.length;
      const isNewPlayerAI = setupPreset === 'spectator' || (setupPreset === 'single_player' && newIndex > 0);
      setPlayers([
        ...players,
        {
          name: isNewPlayerAI ? `AI ${newIndex + 1}` : `Player ${newIndex + 1}`,
          isAI: isNewPlayerAI,
          aiDifficulty: newIndex % 2 === 0 ? 'hard' : 'medium',
        },
      ]);
    } else if (delta < 0 && players.length > minPlayers) {
      setPlayers(players.slice(0, -1));
    }
  };

  const updatePlayer = (index: number, updates: Partial<PlayerConfig>) => {
    setPlayers(
      players.map((p, i) => (i === index ? { ...p, ...updates } : p))
    );
  };

  const handleStart = () => {
    onStart(players);
  };

  return (
    <div className="min-h-screen max-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex flex-col items-center p-4 sm:p-6 overflow-y-auto">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-64 h-64 bg-good-200 rounded-full opacity-20 blur-3xl" />
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-bad-200 rounded-full opacity-20 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-xl relative z-10 my-auto flex flex-col max-h-[95vh]"
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft size={24} className="text-slate-600" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              {isSpectatorMode ? 'Spectator Mode' : isSinglePlayer ? 'Single Player' : 'Local Multiplayer'}
            </h2>
            <p className="text-slate-500">
              {isSpectatorMode ? 'Watch AI players battle it out' : isSinglePlayer ? 'Play against the AI' : 'Set up your players'}
            </p>
          </div>
        </div>

        {/* Mode preset buttons */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => applyPreset('custom')}
            className={clsx(
              'flex-1 py-2 px-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all',
              setupPreset === 'custom'
                ? 'bg-amber-500 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            )}
          >
            <Users size={16} />
            All Human
          </button>
          <button
            onClick={() => applyPreset('single_player')}
            className={clsx(
              'flex-1 py-2 px-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all',
              setupPreset === 'single_player'
                ? 'bg-amber-500 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            )}
          >
            <Zap size={16} />
            vs AI
          </button>
          <button
            onClick={() => applyPreset('spectator')}
            className={clsx(
              'flex-1 py-2 px-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all',
              setupPreset === 'spectator'
                ? 'bg-purple-500 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            )}
          >
            <Eye size={16} />
            AI vs AI
          </button>
        </div>

        {/* Player count selector */}
        <div className="flex items-center justify-between bg-slate-50 rounded-xl p-4 mb-6">
          <span className="font-medium text-slate-700">Number of Players</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => updatePlayerCount(-1)}
              disabled={playerCount <= minPlayers}
              className="w-10 h-10 rounded-lg bg-slate-200 hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
            >
              <Minus size={20} />
            </button>
            <span className="text-2xl font-bold w-8 text-center">{playerCount}</span>
            <button
              onClick={() => updatePlayerCount(1)}
              disabled={playerCount >= maxPlayers}
              className="w-10 h-10 rounded-lg bg-slate-200 hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>

        {/* Player list - scrollable area */}
        <div className="space-y-3 mb-4 overflow-y-auto flex-1 min-h-0 pr-1">
          {players.map((player, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={clsx(
                'p-4 rounded-xl border-2 transition-colors',
                index % 2 === 0
                  ? 'bg-good-50 border-good-200'
                  : 'bg-bad-50 border-bad-200'
              )}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={clsx(
                    'w-10 h-10 rounded-full flex items-center justify-center',
                    index % 2 === 0 ? 'bg-good-200' : 'bg-bad-200'
                  )}
                >
                  {player.isAI ? (
                    <Bot size={20} className={index % 2 === 0 ? 'text-good-700' : 'text-bad-700'} />
                  ) : (
                    <Users size={20} className={index % 2 === 0 ? 'text-good-700' : 'text-bad-700'} />
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={player.name}
                    onChange={(e) => updatePlayer(index, { name: e.target.value })}
                    className="w-full bg-white/80 px-3 py-1.5 rounded-lg border border-slate-200 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="Player name"
                  />
                </div>
                <span
                  className={clsx(
                    'text-xs font-bold px-2 py-1 rounded-full',
                    index % 2 === 0
                      ? 'bg-good-200 text-good-800'
                      : 'bg-bad-200 text-bad-800'
                  )}
                >
                  {index % 2 === 0 ? 'Good' : 'Bad'}
                </span>
              </div>

              {/* AI toggle - available for all players */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200">
                <span className="text-sm text-slate-600">AI Controlled</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      updatePlayer(index, { isAI: !player.isAI });
                      setSetupPreset('custom'); // Switch to custom when manually toggling
                    }}
                    className={clsx(
                      'relative w-14 h-7 rounded-full transition-colors',
                      player.isAI ? 'bg-amber-500' : 'bg-slate-300'
                    )}
                  >
                    <div
                      className={clsx(
                        'absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform',
                        player.isAI ? 'left-8' : 'left-1'
                      )}
                    />
                  </button>
                </div>
              </div>

              {/* AI difficulty selector */}
              {player.isAI && (
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200">
                  <span className="text-sm text-slate-600">AI Difficulty</span>
                  <div className="flex gap-2">
                    {(['easy', 'medium', 'hard'] as AIDifficulty[]).map((diff) => (
                      <button
                        key={diff}
                        onClick={() => updatePlayer(index, { aiDifficulty: diff })}
                        className={clsx(
                          'px-3 py-1 rounded-lg text-sm font-medium capitalize transition-colors',
                          player.aiDifficulty === diff
                            ? 'bg-amber-500 text-white'
                            : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                        )}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Bottom section - always visible */}
        <div className="flex-shrink-0 pt-4 border-t border-slate-100">
          {/* Team info or Spectator mode info */}
          {isSpectatorMode ? (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 mb-4 text-center">
              <div className="flex items-center justify-center gap-2 text-purple-700">
                <Eye size={16} />
                <span className="font-semibold text-sm">Spectator Mode</span>
                <span className="text-purple-600 text-sm">- Watch AI players battle!</span>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-xl p-3 mb-4 text-center">
              <p className="text-sm text-slate-600">
                Players alternate between{' '}
                <span className="font-bold text-good-600">Good</span>
                {' '}and{' '}
                <span className="font-bold text-bad-600">Bad</span>
                {' '}Bacteria teams.
              </p>
            </div>
          )}

          {/* Start button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleStart}
            className={clsx(
              'w-full py-3 sm:py-4 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl flex items-center justify-center gap-3 transition-all',
              isSpectatorMode
                ? 'bg-gradient-to-r from-purple-500 to-indigo-500'
                : 'bg-gradient-to-r from-amber-500 to-orange-500'
            )}
          >
            {isSpectatorMode ? <Eye size={24} /> : <Play size={24} />}
            {isSpectatorMode ? 'Watch AI Battle' : 'Start Game'}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
