import { useGameStore } from '@/store/gameStore';
import { Zone } from './Zone';

export function GameBoard() {
  const zones = useGameStore((state) => state.zones);
  const phase = useGameStore((state) => state.phase);
  const players = useGameStore((state) => state.players);
  const currentPlayerIndex = useGameStore((state) => state.currentPlayerIndex);
  const selectedCard = useGameStore((state) => state.selectedCard);

  const currentPlayer = players[currentPlayerIndex];
  const isHumanTurn = currentPlayer && !currentPlayer.isAI;

  // Calculate if zones are selectable (card is selected during action phase on human turn)
  const isZoneSelectable = isHumanTurn && phase === 'action' && !!selectedCard;

  return (
    <div className="flex-1 relative p-8 flex items-center justify-center overflow-y-auto bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Decorative background pattern */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Board title */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center pointer-events-none">
        <h2 className="text-xl font-bold text-amber-800 opacity-50">
          The Digestive Tract
        </h2>
        <p className="text-sm text-amber-600 opacity-40">
          Control 5 zones to win
        </p>
      </div>

      {/* Zone grid */}
      <div className="grid grid-cols-3 gap-6 max-w-3xl w-full relative z-10">
        {zones.map((zone) => (
          <Zone
            key={`zone-${zone.id}-${zone.goodTokens}-${zone.badTokens}`}
            zone={zone}
            isSelectable={isZoneSelectable}
          />
        ))}
      </div>

      {/* Board labels */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-8 text-sm pointer-events-none">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-good-400 to-good-600 border border-white" />
          <span className="text-good-700 font-medium">Good Bacteria</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-bad-400 to-bad-600 border border-white" />
          <span className="text-bad-700 font-medium">Bad Bacteria</span>
        </div>
      </div>
    </div>
  );
}
