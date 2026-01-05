import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Skull, RotateCcw, Home, Clock, Zap, Target, Activity, ChevronDown, ChevronUp } from 'lucide-react';
import clsx from 'clsx';
import type { WinCondition, MatchReport } from '@/types/game';
import { useGameStore } from '@/store/gameStore';

interface GameOverScreenProps {
  winner: WinCondition;
  onPlayAgain: () => void;
  onMainMenu: () => void;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
}

export function GameOverScreen({ winner, onPlayAgain, onMainMenu }: GameOverScreenProps) {
  const generateMatchReport = useGameStore((state) => state.generateMatchReport);
  const [report, setReport] = useState<MatchReport | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const isGoodWinner = winner === 'good_zone_control' || winner === 'good_elimination';
  const isDraw = winner === 'draw_turn_limit';

  // Generate report on mount
  useEffect(() => {
    const matchReport = generateMatchReport();
    setReport(matchReport);
  }, [generateMatchReport]);

  const getWinnerMessage = () => {
    switch (winner) {
      case 'good_zone_control':
        return {
          title: 'Good Bacteria Win!',
          subtitle: 'Successfully colonized the gut with healthy flora!',
          fact: 'A healthy gut microbiome contains trillions of beneficial bacteria that help digest food, produce vitamins, and protect against harmful pathogens.',
        };
      case 'good_elimination':
        return {
          title: 'Good Bacteria Win!',
          subtitle: 'All harmful bacteria have been eliminated!',
          fact: 'While eliminating all bad bacteria is the goal in this game, in real life a balanced microbiome includes some "bad" bacteria kept in check by good ones.',
        };
      case 'bad_zone_control':
        return {
          title: 'Bad Bacteria Win!',
          subtitle: 'They have taken over the digestive system!',
          fact: 'When harmful bacteria dominate, it can lead to digestive issues, weakened immunity, and various health problems. Maintaining balance is key!',
        };
      case 'bad_elimination':
        return {
          title: 'Bad Bacteria Win!',
          subtitle: 'All good bacteria have been wiped out!',
          fact: 'A gut without beneficial bacteria would lead to severe health issues. Probiotics and a healthy diet help replenish good bacteria.',
        };
      case 'bad_amr_victory':
        return {
          title: 'Bad Bacteria Win!',
          subtitle: 'Antibiotic resistance reached critical levels!',
          fact: 'Antibiotic resistance is one of the biggest threats to global health. Each year, over 700,000 people die from drug-resistant infections worldwide.',
        };
      case 'draw_turn_limit':
        return {
          title: 'Draw!',
          subtitle: 'Turn limit reached with no clear winner.',
          fact: 'In real life, the battle between good and bad bacteria in your gut is an ongoing process that never truly ends - balance is always shifting!',
        };
    }
  };

  const message = getWinnerMessage()!;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={clsx(
        'fixed inset-0 flex items-center justify-center z-50 p-4 overflow-y-auto',
        isDraw
          ? 'bg-gradient-to-br from-amber-100 via-amber-50 to-yellow-100'
          : isGoodWinner
          ? 'bg-gradient-to-br from-good-100 via-good-50 to-blue-100'
          : 'bg-gradient-to-br from-bad-100 via-bad-50 to-orange-100'
      )}
    >
      <motion.div
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20 }}
        className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 max-w-2xl w-full text-center my-auto"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className={clsx(
            'w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center',
            isDraw ? 'bg-amber-100' : isGoodWinner ? 'bg-good-100' : 'bg-bad-100'
          )}
        >
          {isDraw ? (
            <Target size={40} className="text-amber-600" />
          ) : isGoodWinner ? (
            <Trophy size={40} className="text-good-600" />
          ) : (
            <Skull size={40} className="text-bad-600" />
          )}
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={clsx(
            'text-3xl sm:text-4xl font-bold mb-2',
            isDraw ? 'text-amber-700' : isGoodWinner ? 'text-good-700' : 'text-bad-700'
          )}
        >
          {message.title}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-base sm:text-lg text-slate-600 mb-4"
        >
          {message.subtitle}
        </motion.p>

        {/* Quick Stats */}
        {report && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="grid grid-cols-4 gap-2 sm:gap-4 mb-4"
          >
            <div className="bg-slate-50 rounded-xl p-2 sm:p-3">
              <Clock size={18} className="mx-auto text-slate-500 mb-1" />
              <div className="text-lg sm:text-xl font-bold text-slate-800">
                {formatDuration(report.duration)}
              </div>
              <div className="text-xs text-slate-500">Duration</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-2 sm:p-3">
              <Zap size={18} className="mx-auto text-slate-500 mb-1" />
              <div className="text-lg sm:text-xl font-bold text-slate-800">
                {report.totalTurns}
              </div>
              <div className="text-xs text-slate-500">Turns</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-2 sm:p-3">
              <Target size={18} className="mx-auto text-slate-500 mb-1" />
              <div className="text-lg sm:text-xl font-bold text-slate-800">
                {report.finalZoneControl.good}-{report.finalZoneControl.bad}
              </div>
              <div className="text-xs text-slate-500">Zones</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-2 sm:p-3">
              <Activity size={18} className="mx-auto text-slate-500 mb-1" />
              <div className="text-lg sm:text-xl font-bold text-slate-800">
                {report.finalAMRLevel}
              </div>
              <div className="text-xs text-slate-500">Final AMR</div>
            </div>
          </motion.div>
        )}

        {/* Expandable Details */}
        {report && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center justify-center gap-2 mx-auto text-sm text-slate-500 hover:text-slate-700 mb-3"
            >
              {showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              {showDetails ? 'Hide Details' : 'Show Match Details'}
            </button>

            {showDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-slate-50 rounded-xl p-4 mb-4 text-left"
              >
                {/* Player Stats */}
                <h4 className="font-bold text-slate-700 mb-2 text-sm">Player Statistics</h4>
                <div className="space-y-2 mb-4">
                  {report.players.map((player, index) => (
                    <div
                      key={index}
                      className={clsx(
                        'flex items-center justify-between p-2 rounded-lg',
                        player.team === 'good' ? 'bg-good-50' : 'bg-bad-50'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={clsx(
                            'w-2 h-2 rounded-full',
                            player.team === 'good' ? 'bg-good-500' : 'bg-bad-500'
                          )}
                        />
                        <span className="font-medium text-sm">{player.name}</span>
                        {player.isAI && (
                          <span className="text-xs bg-slate-200 px-1.5 py-0.5 rounded">
                            AI ({player.aiDifficulty})
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-600">
                        {player.cardsPlayed} cards
                        {player.antibioticsUsed > 0 && ` (${player.antibioticsUsed} antibiotics)`}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Match Stats */}
                <h4 className="font-bold text-slate-700 mb-2 text-sm">Match Statistics</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Global Events:</span>
                    <span className="font-medium">{report.globalEventsTriggered}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Highest AMR:</span>
                    <span className="font-medium">{report.highestAMRReached}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Cards/Turn:</span>
                    <span className="font-medium">{report.averageCardsPerTurn}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Final Tokens:</span>
                    <span className="font-medium">
                      <span className="text-good-600">{report.finalGoodTokens}</span>
                      {' vs '}
                      <span className="text-bad-600">{report.finalBadTokens}</span>
                    </span>
                  </div>
                </div>

                {report.isSpectatorMode && (
                  <div className="mt-3 text-xs text-purple-600 text-center">
                    Spectator Mode Match
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Educational fact */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="bg-amber-50 border border-amber-200 rounded-xl p-3 sm:p-4 mb-6"
        >
          <h4 className="font-bold text-amber-800 mb-1 text-sm">Did You Know?</h4>
          <p className="text-sm text-amber-900">{message.fact}</p>
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex gap-3 sm:gap-4 justify-center"
        >
          <button
            onClick={onPlayAgain}
            className={clsx(
              'flex items-center gap-2 px-4 sm:px-6 py-3 rounded-xl font-bold text-white shadow-lg hover:shadow-xl transition-all',
              isDraw
                ? 'bg-amber-500 hover:bg-amber-600'
                : isGoodWinner
                ? 'bg-good-500 hover:bg-good-600'
                : 'bg-bad-500 hover:bg-bad-600'
            )}
          >
            <RotateCcw size={20} />
            Play Again
          </button>
          <button
            onClick={onMainMenu}
            className="flex items-center gap-2 px-4 sm:px-6 py-3 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 shadow-lg hover:shadow-xl transition-all"
          >
            <Home size={20} />
            Main Menu
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
