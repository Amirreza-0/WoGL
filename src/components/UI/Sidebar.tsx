import { motion, AnimatePresence } from 'framer-motion';
import { Dices, Thermometer, AlertTriangle, CheckCircle } from 'lucide-react';
import clsx from 'clsx';
import { useGameStore } from '@/store/gameStore';

export function Sidebar() {
  const phase = useGameStore((state) => state.phase);
  const amrLevel = useGameStore((state) => state.amrLevel);
  const currentEvent = useGameStore((state) => state.currentEvent);
  const message = useGameStore((state) => state.message);
  const rollDie = useGameStore((state) => state.rollDie);
  const resolveEvent = useGameStore((state) => state.resolveEvent);
  const zones = useGameStore((state) => state.zones);
  const players = useGameStore((state) => state.players);
  const currentPlayerIndex = useGameStore((state) => state.currentPlayerIndex);
  const ruleSettings = useGameStore((state) => state.ruleSettings);

  const currentPlayer = players[currentPlayerIndex];
  const isAITurn = currentPlayer?.isAI ?? false;

  // Calculate zone control
  const goodZones = zones.filter((z) => z.goodTokens > z.badTokens).length;
  const badZones = zones.filter((z) => z.badTokens > z.goodTokens).length;

  const getAMRColor = (level: number) => {
    if (level >= 8) return 'bg-red-500';
    if (level >= 5) return 'bg-orange-500';
    return 'bg-green-500';
  };

  return (
    <aside className="w-72 bg-white border-r border-amber-100 p-4 flex flex-col gap-4 overflow-y-auto shrink-0">
      {/* Status message */}
      <motion.div
        key={message}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 bg-amber-50 rounded-lg text-sm border-l-4 border-amber-500"
      >
        <h4 className="font-bold text-amber-800 mb-1">Status</h4>
        <p className="text-amber-900">{message}</p>
      </motion.div>

      {/* Roll Die button */}
      {phase === 'roll' && !isAITurn && (
        <motion.button
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={rollDie}
          className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-bold text-xl shadow-lg hover:shadow-xl flex items-center justify-center gap-3 ring-4 ring-indigo-200 animate-pulse"
        >
          <Dices size={28} />
          Roll Die
        </motion.button>
      )}

      {/* AI thinking indicator */}
      {isAITurn && phase !== 'game_over' && (
        <div className="text-center text-sm text-slate-500 italic py-3 border border-slate-200 rounded-lg bg-slate-50 flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          <span className="ml-2">{currentPlayer?.name} is thinking...</span>
        </div>
      )}

      {/* Action phase indicator */}
      {phase === 'action' && !isAITurn && (
        <div className="text-center text-sm text-slate-500 italic py-3 border border-slate-200 rounded-lg bg-slate-50">
          Select a card from your hand, then click a zone to play it.
        </div>
      )}

      {/* Global Event panel */}
      <AnimatePresence>
        {phase === 'resolve_event' && currentEvent && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-4 bg-red-50 border-2 border-red-300 rounded-xl shadow-lg"
          >
            <h4 className="font-bold text-red-800 flex items-center gap-2 text-lg">
              <AlertTriangle size={20} />
              Global Event!
            </h4>
            <p className="font-bold text-xl mt-2 text-red-900">
              {currentEvent.title}
            </p>
            <p className="text-sm mt-2 text-red-700">
              {currentEvent.description}
            </p>
            <p className="text-xs mt-3 text-red-600 italic bg-red-100 p-2 rounded">
              {currentEvent.educationalFact}
            </p>
            {!isAITurn && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={resolveEvent}
                className="mt-4 w-full py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors"
              >
                Resolve Event
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* AMR Barometer */}
      <div className="flex flex-col items-center mt-2">
        <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
          <Thermometer className="text-red-500" size={20} />
          Antibiotic Resistance
        </h3>

        {/* Vertical gauge */}
        <div className="w-16 h-64 bg-gray-100 rounded-full relative border-2 border-gray-300 overflow-hidden flex flex-col-reverse shadow-inner">
          {Array.from({ length: ruleSettings.maxAMR }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: i + 1 <= amrLevel ? 1 : 0.2 }}
              className={clsx(
                'w-full flex-1 border-t border-white/20 transition-all duration-300',
                i + 1 <= amrLevel ? getAMRColor(i + 1) : 'bg-gray-200'
              )}
            />
          ))}
        </div>

        {/* Level display */}
        <motion.div
          key={amrLevel}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          className={clsx(
            'mt-3 text-3xl font-bold',
            amrLevel >= 8 ? 'text-red-600' : amrLevel >= 5 ? 'text-orange-600' : 'text-green-600'
          )}
        >
          {amrLevel} / {ruleSettings.maxAMR}
        </motion.div>

        <p className="text-xs text-center text-slate-500 mt-1 max-w-[180px]">
          {amrLevel >= 8 && 'DANGER! Close to critical resistance!'}
          {amrLevel >= 5 && amrLevel < 8 && 'Warning: Resistance is rising.'}
          {amrLevel < 5 && 'Resistance levels are manageable.'}
        </p>
      </div>

      {/* Zone control summary */}
      <div className="mt-auto pt-4 border-t border-slate-200">
        <h4 className="text-sm font-bold text-slate-600 mb-2">Zone Control</h4>
        <div className="flex gap-3">
          <div className="flex-1 bg-good-50 rounded-lg p-3 text-center border border-good-200">
            <div className="flex items-center justify-center gap-1">
              <CheckCircle size={16} className="text-good-600" />
              <span className="text-2xl font-bold text-good-700">{goodZones}</span>
            </div>
            <p className="text-xs text-good-600">Good</p>
          </div>
          <div className="flex-1 bg-bad-50 rounded-lg p-3 text-center border border-bad-200">
            <div className="flex items-center justify-center gap-1">
              <CheckCircle size={16} className="text-bad-600" />
              <span className="text-2xl font-bold text-bad-700">{badZones}</span>
            </div>
            <p className="text-xs text-bad-600">Bad</p>
          </div>
        </div>
        <p className="text-xs text-center text-slate-500 mt-2">
          Need {ruleSettings.zoneControlCount} zones to win
        </p>
      </div>
    </aside>
  );
}
