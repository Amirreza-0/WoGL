import { motion } from 'framer-motion';
import clsx from 'clsx';
import { Shield, Skull, Pill, Zap } from 'lucide-react';
import type { CardInstance } from '@/types/game';
import { getCardImage } from '@/data/cardImages';

interface CardProps {
  card: CardInstance;
  isSelected: boolean;
  isPlayable: boolean;
  onClick: () => void;
  size?: 'small' | 'medium' | 'large';
}

export function Card({
  card,
  isSelected,
  isPlayable,
  onClick,
  size = 'medium',
}: CardProps) {
  const getCardIcon = () => {
    switch (card.type) {
      case 'antibiotic':
        return <Pill size={size === 'small' ? 12 : 16} className="text-purple-500" />;
      case 'action':
        return <Zap size={size === 'small' ? 12 : 16} className="text-yellow-500" />;
      default:
        return card.deckType === 'good_behavior'
          ? <Shield size={size === 'small' ? 12 : 16} className="text-good-500" />
          : <Skull size={size === 'small' ? 12 : 16} className="text-bad-500" />;
    }
  };

  const getCardEmoji = () => {
    const effectType = card.effects[0]?.type;
    if (effectType?.includes('good')) return '🛡️';
    if (effectType?.includes('bad')) return '🦠';
    if (card.type === 'antibiotic') return '💊';
    if (effectType?.includes('convert')) return '🔄';
    if (effectType?.includes('preview')) return '🔮';
    return '⚡';
  };

  const getBorderColor = () => {
    if (card.deckType === 'good_behavior') return 'border-good-400';
    if (card.deckType === 'bad_behavior') return 'border-bad-400';
    return 'border-amber-400';
  };

  const getBackgroundColor = () => {
    if (card.type === 'antibiotic') return 'bg-purple-50';
    return 'bg-white';
  };

  const sizeClasses = {
    small: 'w-24 h-32 p-1.5 text-[9px]',
    medium: 'w-32 h-44 p-2 text-xs',
    large: 'w-40 h-56 p-3 text-sm',
  };

  const iconAreaSize = {
    small: 'h-12',
    medium: 'h-16',
    large: 'h-20',
  };

  const cardImage = getCardImage(card.id);

  return (
    <motion.div
      onClick={isPlayable ? onClick : undefined}
      whileHover={isPlayable ? { y: -8, scale: 1.02 } : undefined}
      whileTap={isPlayable ? { scale: 0.98 } : undefined}
      className={clsx(
        'relative flex flex-col rounded-lg shadow-md border-2 transition-all select-none',
        sizeClasses[size],
        getBorderColor(),
        getBackgroundColor(),
        {
          'ring-4 ring-yellow-400 scale-105 z-10': isSelected,
          'cursor-pointer hover:shadow-lg': isPlayable,
          'opacity-50 grayscale cursor-not-allowed': !isPlayable,
        }
      )}
    >
      {/* Card type icon */}
      <div className="absolute top-1 right-1">
        {getCardIcon()}
      </div>

      {/* Card illustration area */}
      <div
        className={clsx(
          'w-full rounded flex items-center justify-center overflow-hidden',
          iconAreaSize[size],
          {
            'bg-gradient-to-br from-slate-100 to-slate-200': !cardImage,
          }
        )}
      >
        {cardImage ? (
          <img
            src={cardImage}
            alt={card.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-3xl">{getCardEmoji()}</span>
        )}
      </div>

      {/* Card name */}
      <div className="font-bold leading-tight mt-1.5 line-clamp-2">
        {card.name}
      </div>

      {/* Card description */}
      <div className="text-slate-500 leading-tight flex-1 line-clamp-3 mt-0.5">
        {card.description}
      </div>

      {/* AMR cost indicator */}
      {card.amrCost > 0 && (
        <div className="absolute bottom-1 right-1 bg-red-100 text-red-700 text-[10px] px-1.5 py-0.5 rounded font-bold">
          AMR +{card.amrCost}
        </div>
      )}
    </motion.div>
  );
}
