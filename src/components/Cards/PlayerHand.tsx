import { motion } from 'framer-motion';
import clsx from 'clsx';
import { useGameStore } from '@/store/gameStore';
import { Card } from './Card';

export function PlayerHand() {
  const players = useGameStore((state) => state.players);
  const currentPlayerIndex = useGameStore((state) => state.currentPlayerIndex);
  const phase = useGameStore((state) => state.phase);
  const selectCard = useGameStore((state) => state.selectCard);
  const selectedCard = useGameStore((state) => state.selectedCard);
  const goodDeckLength = useGameStore((state) => state.goodDeck.length);
  const badDeckLength = useGameStore((state) => state.badDeck.length);

  const currentPlayer = players[currentPlayerIndex];

  if (!currentPlayer) return null;

  const isGoodTeam = currentPlayer.team === 'good';
  const isActionPhase = phase === 'action';
  const isHumanTurn = !currentPlayer.isAI;
  const canInteract = isActionPhase && isHumanTurn;

  const handleCardClick = (card: typeof currentPlayer.hand[0]) => {
    if (!canInteract) return;

    selectCard(card);
  };

  return (
    <motion.footer
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className={clsx(
        'h-52 border-t-4 p-4 flex items-center gap-4 overflow-x-auto shrink-0 transition-colors duration-300',
        isGoodTeam
          ? 'bg-good-50 border-good-300'
          : 'bg-bad-50 border-bad-300'
      )}
    >
      {/* Player info */}
      <div className="flex flex-col justify-center mr-4 min-w-[120px]">
        <h3 className={clsx(
          'font-bold text-xl',
          isGoodTeam ? 'text-good-700' : 'text-bad-700'
        )}>
          {currentPlayer.name}
        </h3>
        <p className={clsx(
          'text-sm font-medium',
          isGoodTeam ? 'text-good-600' : 'text-bad-600'
        )}>
          {isGoodTeam ? 'Good Bacteria Team' : 'Bad Bacteria Team'}
        </p>
        <p className="text-sm text-slate-500 mt-1">
          {phase === 'roll' && 'Roll the die...'}
          {phase === 'resolve_event' && 'Resolve event...'}
          {phase === 'action' && 'Select a card, then click a zone'}
        </p>
      </div>

      {/* Divider */}
      <div className={clsx(
        'w-px h-32 opacity-30',
        isGoodTeam ? 'bg-good-500' : 'bg-bad-500'
      )} />

      {/* Cards */}
      <div className="flex gap-4 px-4 items-center">
        {currentPlayer.hand.map((card, index) => (
          <motion.div
            key={card.instanceId}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              card={card}
              isSelected={selectedCard?.instanceId === card.instanceId}
              isPlayable={canInteract}
              onClick={() => handleCardClick(card)}
              size="medium"
            />
          </motion.div>
        ))}
      </div>

      {/* Cards remaining */}
      <div className="ml-auto flex flex-col items-center justify-center min-w-[80px] opacity-60">
        <div className={clsx(
          'w-16 h-24 rounded-lg border-2 border-dashed flex items-center justify-center',
          isGoodTeam ? 'border-good-400' : 'border-bad-400'
        )}>
          <span className="text-2xl font-bold text-slate-400">
            {isGoodTeam ? goodDeckLength : badDeckLength}
          </span>
        </div>
        <span className="text-xs text-slate-500 mt-1">Deck</span>
      </div>
    </motion.footer>
  );
}
