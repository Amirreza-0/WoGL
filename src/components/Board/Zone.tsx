import { motion } from 'framer-motion';
import clsx from 'clsx';
import type { Zone as ZoneType } from '@/types/game';
import { useGameStore } from '@/store/gameStore';
import goodBacteriaToken from '@/assets/images/tokens/good-bacteria.png';
import badBacteriaToken from '@/assets/images/tokens/bad-bacteria.png';

interface ZoneProps {
  zone: ZoneType;
  isSelectable: boolean;
}

export function Zone({ zone, isSelectable }: ZoneProps) {
  const phase = useGameStore((state) => state.phase);
  const playCard = useGameStore((state) => state.playCard);
  const players = useGameStore((state) => state.players);
  const currentPlayerIndex = useGameStore((state) => state.currentPlayerIndex);
  const zoneCapacity = useGameStore((state) => state.ruleSettings.zoneCapacity);

  const currentPlayer = players[currentPlayerIndex];
  const isHumanTurn = currentPlayer && !currentPlayer.isAI;

  const handleClick = () => {
    if (!isHumanTurn || phase !== 'action') {
      return;
    }
    playCard(zone.id);
  };

  const totalTokens = zone.goodTokens + zone.badTokens;
  const isFull = totalTokens >= zoneCapacity;

  const getControlClass = () => {
    if (zone.goodTokens > zone.badTokens) {
      return 'border-good-500 ring-4 ring-good-200 bg-good-50';
    }
    if (zone.badTokens > zone.goodTokens) {
      return 'border-bad-500 ring-4 ring-bad-200 bg-bad-50';
    }
    return 'border-amber-300 bg-white';
  };

  const renderTokens = () => {
    const tokens = [];

    // Good tokens (bacteria images)
    for (let i = 0; i < zone.goodTokens; i++) {
      tokens.push(
        <motion.div
          key={`good-${i}`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-8 h-8 rounded-full border-2 border-white shadow-md pointer-events-none overflow-hidden bg-good-100"
          title="Good Bacteria"
        >
          <img src={goodBacteriaToken} alt="Good Bacteria" className="w-full h-full object-cover" />
        </motion.div>
      );
    }

    // Bad tokens (bacteria images)
    for (let i = 0; i < zone.badTokens; i++) {
      tokens.push(
        <motion.div
          key={`bad-${i}`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-8 h-8 rounded-full border-2 border-white shadow-md pointer-events-none overflow-hidden bg-bad-100"
          title="Bad Bacteria"
        >
          <img src={badBacteriaToken} alt="Bad Bacteria" className="w-full h-full object-cover" />
        </motion.div>
      );
    }

    // Empty slots
    const emptySlots = zoneCapacity - totalTokens;
    for (let i = 0; i < emptySlots; i++) {
      tokens.push(
        <div
          key={`empty-${i}`}
          className="w-8 h-8 rounded-full bg-gray-200 opacity-40 border border-gray-300 pointer-events-none"
        />
      );
    }

    return tokens;
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={clsx(
        'relative h-36 rounded-2xl shadow-lg border-4 transition-all duration-200',
        'flex flex-col items-center justify-center p-3 w-full',
        getControlClass(),
        {
          'cursor-pointer hover:bg-amber-100 hover:scale-105 active:scale-95': isSelectable,
          'cursor-not-allowed opacity-60': !isSelectable,
        }
      )}
    >
      {/* Zone label */}
      <div className="absolute top-2 left-3 text-xs font-bold text-slate-400 uppercase tracking-wider pointer-events-none">
        {zone.name}
      </div>

      {/* Token container */}
      <div className="flex gap-1.5 flex-wrap justify-center max-w-[90%] mt-2 pointer-events-none">
        {renderTokens()}
      </div>

      {/* Status indicators */}
      {isFull && (
        <div className="absolute bottom-2 right-2 text-[10px] text-slate-500 font-bold uppercase bg-slate-100 px-2 py-0.5 rounded pointer-events-none">
          Full
        </div>
      )}

      {zone.locked && (
        <div className="absolute bottom-2 left-2 text-[10px] text-amber-600 font-bold uppercase bg-amber-100 px-2 py-0.5 rounded pointer-events-none">
          Locked
        </div>
      )}

      {/* Control indicator */}
      {zone.controlledBy && (
        <div
          className={clsx(
            'absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md pointer-events-none',
            zone.controlledBy === 'good' ? 'bg-good-500' : 'bg-bad-500'
          )}
        >
          {zone.controlledBy === 'good' ? '✓' : '✗'}
        </div>
      )}

      {/* Selectable indicator overlay */}
      {isSelectable && (
        <div className="absolute inset-0 border-4 border-yellow-400 rounded-2xl animate-pulse pointer-events-none" />
      )}
    </button>
  );
}
