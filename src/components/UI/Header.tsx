import { motion } from 'framer-motion';
import { Settings, HelpCircle } from 'lucide-react';
import clsx from 'clsx';
import { useGameStore } from '@/store/gameStore';
import logoImage from '@/assets/images/ui/WoGL-logo.png';

interface HeaderProps {
  onSettingsClick?: () => void;
  onHelpClick?: () => void;
}

export function Header({ onSettingsClick, onHelpClick }: HeaderProps) {
  const players = useGameStore((state) => state.players);
  const currentPlayerIndex = useGameStore((state) => state.currentPlayerIndex);
  const currentDieRoll = useGameStore((state) => state.currentDieRoll);
  const turnNumber = useGameStore((state) => state.turnNumber);

  const currentPlayer = players[currentPlayerIndex];

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-white shadow-sm border-b border-amber-200">
      {/* Logo and title */}
      <div className="flex items-center gap-3">
        <img src={logoImage} alt="WoGL Logo" className="w-10 h-10 rounded-full object-cover" />
        <h1 className="text-xl font-bold text-amber-900">
          The War of Gutlands
        </h1>
      </div>

      {/* Game info */}
      <div className="flex items-center gap-6">
        {/* Turn indicator */}
        {currentPlayer && (
          <motion.div
            key={currentPlayerIndex}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={clsx(
              'px-4 py-1.5 rounded-full font-bold border-2 transition-colors',
              currentPlayer.team === 'good'
                ? 'bg-good-100 text-good-800 border-good-300'
                : 'bg-bad-100 text-bad-800 border-bad-300'
            )}
          >
            Turn: {currentPlayer.name}
          </motion.div>
        )}

        {/* Turn number */}
        <div className="text-sm text-slate-500">
          Round <span className="font-bold text-slate-700">{turnNumber}</span>
        </div>

        {/* Die roll result */}
        <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
          <span className="text-sm font-medium text-slate-600">Last Roll:</span>
          <motion.span
            key={currentDieRoll}
            initial={{ scale: 1.5 }}
            animate={{ scale: 1 }}
            className="text-lg font-mono font-bold text-slate-800"
          >
            {currentDieRoll ?? '-'}
          </motion.span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onHelpClick}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            title="Help"
          >
            <HelpCircle size={20} className="text-slate-500" />
          </button>
          <button
            onClick={onSettingsClick}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            title="Settings"
          >
            <Settings size={20} className="text-slate-500" />
          </button>
        </div>
      </div>
    </header>
  );
}
