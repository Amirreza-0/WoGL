import { motion } from 'framer-motion';
import { ArrowLeft, RotateCcw, Trophy, Target, Beaker, Layers, Dices, Zap, Clock, Bot } from 'lucide-react';
import clsx from 'clsx';
import type { GameRuleSettings as GameRuleSettingsType } from '@/types/game';
import { DEFAULT_RULE_SETTINGS } from '@/types/game';

interface GameRuleSettingsProps {
  settings: GameRuleSettingsType;
  onUpdate: (settings: Partial<GameRuleSettingsType>) => void;
  onReset: () => void;
  onBack: () => void;
}

interface NumberInputProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  description?: string;
  step?: number;
  displayValue?: string;
}

function NumberInput({ label, value, min, max, onChange, description, step = 1, displayValue }: NumberInputProps) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <span className="font-medium text-slate-700">{label}</span>
        {description && (
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(Math.max(min, value - step))}
          disabled={value <= min}
          className="w-8 h-8 rounded-lg bg-slate-200 hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors text-lg font-bold"
        >
          -
        </button>
        <span className="w-14 text-center font-bold text-lg">{displayValue ?? value}</span>
        <button
          onClick={() => onChange(Math.min(max, value + step))}
          disabled={value >= max}
          className="w-8 h-8 rounded-lg bg-slate-200 hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors text-lg font-bold"
        >
          +
        </button>
      </div>
    </div>
  );
}

interface ToggleInputProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  description?: string;
}

function ToggleInput({ label, value, onChange, description }: ToggleInputProps) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <span className="font-medium text-slate-700">{label}</span>
        {description && (
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        )}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={clsx(
          'relative w-14 h-7 rounded-full transition-colors',
          value ? 'bg-amber-500' : 'bg-slate-300'
        )}
      >
        <div
          className={clsx(
            'absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform',
            value ? 'left-8' : 'left-1'
          )}
        />
      </button>
    </div>
  );
}

interface SettingsSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  color: string;
}

function SettingsSection({ title, icon, children, color }: SettingsSectionProps) {
  return (
    <div className="mb-6">
      <div className={clsx('flex items-center gap-2 mb-3 pb-2 border-b', color)}>
        {icon}
        <h3 className="font-bold text-slate-800">{title}</h3>
      </div>
      <div className="divide-y divide-slate-100">
        {children}
      </div>
    </div>
  );
}

export function GameRuleSettings({ settings, onUpdate, onReset, onBack }: GameRuleSettingsProps) {
  const hasChanges = JSON.stringify(settings) !== JSON.stringify(DEFAULT_RULE_SETTINGS);

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
        <div className="flex items-center gap-4 mb-6 flex-shrink-0">
          <button
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft size={24} className="text-slate-600" />
          </button>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-800">Game Rules</h2>
            <p className="text-slate-500">Customize the game mechanics</p>
          </div>
          {hasChanges && (
            <button
              onClick={onReset}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            >
              <RotateCcw size={16} />
              <span className="text-sm font-medium">Reset</span>
            </button>
          )}
        </div>

        {/* Settings - scrollable area */}
        <div className="overflow-y-auto flex-1 min-h-0 pr-1">
          {/* Winning Conditions */}
          <SettingsSection
            title="Winning Conditions"
            icon={<Trophy size={20} className="text-amber-600" />}
            color="border-amber-200"
          >
            <NumberInput
              label="Zone Control Count"
              value={settings.zoneControlCount}
              min={1}
              max={9}
              onChange={(v) => onUpdate({ zoneControlCount: v })}
              description="Zones needed for zone control victory"
            />
            <ToggleInput
              label="Elimination Victory"
              value={settings.enableEliminationVictory}
              onChange={(v) => onUpdate({ enableEliminationVictory: v })}
              description="Win by eliminating all opponent tokens"
            />
            <ToggleInput
              label="AMR Victory"
              value={settings.enableAMRVictory}
              onChange={(v) => onUpdate({ enableAMRVictory: v })}
              description="Bad team wins at max AMR level"
            />
          </SettingsSection>

          {/* Zone Settings */}
          <SettingsSection
            title="Zone Settings"
            icon={<Target size={20} className="text-green-600" />}
            color="border-green-200"
          >
            <NumberInput
              label="Zone Capacity"
              value={settings.zoneCapacity}
              min={1}
              max={10}
              onChange={(v) => onUpdate({ zoneCapacity: v })}
              description="Max tokens (good + bad) per zone"
            />
            <NumberInput
              label="Initial Tokens"
              value={settings.initialTokensPerTeam}
              min={0}
              max={5}
              onChange={(v) => onUpdate({ initialTokensPerTeam: v })}
              description="Starting tokens for each team"
            />
          </SettingsSection>

          {/* AMR Settings */}
          <SettingsSection
            title="AMR Settings"
            icon={<Beaker size={20} className="text-red-600" />}
            color="border-red-200"
          >
            <NumberInput
              label="Max AMR Level"
              value={settings.maxAMR}
              min={5}
              max={20}
              onChange={(v) => {
                // Ensure startingAMR doesn't exceed new maxAMR
                const updates: Partial<GameRuleSettingsType> = { maxAMR: v };
                if (settings.startingAMR > v) {
                  updates.startingAMR = v;
                }
                onUpdate(updates);
              }}
              description="Maximum antibiotic resistance level"
            />
            <NumberInput
              label="Starting AMR"
              value={settings.startingAMR}
              min={0}
              max={settings.maxAMR}
              onChange={(v) => onUpdate({ startingAMR: v })}
              description="Initial AMR level at game start"
            />
          </SettingsSection>

          {/* Deck & Hand Settings */}
          <SettingsSection
            title="Deck & Hand"
            icon={<Layers size={20} className="text-purple-600" />}
            color="border-purple-200"
          >
            <NumberInput
              label="Hand Size"
              value={settings.handSize}
              min={1}
              max={5}
              onChange={(v) => onUpdate({ handSize: v })}
              description="Cards per player"
            />
            <NumberInput
              label="Deck Copies"
              value={settings.deckCopies}
              min={1}
              max={5}
              onChange={(v) => onUpdate({ deckCopies: v })}
              description="Copies of each card in deck"
            />
          </SettingsSection>

          {/* Event Settings */}
          <SettingsSection
            title="Events"
            icon={<Zap size={20} className="text-yellow-600" />}
            color="border-yellow-200"
          >
            <ToggleInput
              label="Enable Global Events"
              value={settings.enableGlobalEvents}
              onChange={(v) => onUpdate({ enableGlobalEvents: v })}
              description="Whether global events can occur"
            />
            {settings.enableGlobalEvents && (
              <NumberInput
                label="Event Threshold"
                value={settings.globalEventThreshold}
                min={1}
                max={settings.dieSides}
                onChange={(v) => onUpdate({ globalEventThreshold: v })}
                description={`Roll ${settings.globalEventThreshold}+ on d${settings.dieSides} triggers event`}
              />
            )}
          </SettingsSection>

          {/* Turn Settings */}
          <SettingsSection
            title="Turn Limit"
            icon={<Clock size={20} className="text-blue-600" />}
            color="border-blue-200"
          >
            <NumberInput
              label="Turn Limit"
              value={settings.turnLimit}
              min={0}
              max={100}
              onChange={(v) => onUpdate({ turnLimit: v })}
              description={settings.turnLimit === 0 ? "No turn limit (unlimited)" : `Game ends after ${settings.turnLimit} turns`}
            />
          </SettingsSection>

          {/* Die Settings */}
          <SettingsSection
            title="Die"
            icon={<Dices size={20} className="text-indigo-600" />}
            color="border-indigo-200"
          >
            <NumberInput
              label="Die Sides"
              value={settings.dieSides}
              min={6}
              max={20}
              onChange={(v) => {
                // Ensure eventThreshold doesn't exceed new dieSides
                const updates: Partial<GameRuleSettingsType> = { dieSides: v };
                if (settings.globalEventThreshold > v) {
                  updates.globalEventThreshold = v;
                }
                onUpdate(updates);
              }}
              description={`Roll a d${settings.dieSides} each turn`}
            />
          </SettingsSection>

          {/* AI Settings */}
          <SettingsSection
            title="AI Players"
            icon={<Bot size={20} className="text-cyan-600" />}
            color="border-cyan-200"
          >
            <NumberInput
              label="Thinking Delay"
              value={settings.aiThinkingDelay}
              min={0}
              max={3000}
              onChange={(v) => onUpdate({ aiThinkingDelay: v })}
              description={settings.aiThinkingDelay === 0 ? "Instant (no delay)" : `${(settings.aiThinkingDelay / 1000).toFixed(1)}s base delay`}
            />
          </SettingsSection>
        </div>

        {/* Bottom section */}
        <div className="flex-shrink-0 pt-4 border-t border-slate-100">
          {hasChanges && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-center">
              <span className="text-amber-700 text-sm font-medium">
                Custom rules active - changes apply to new games
              </span>
            </div>
          )}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onBack}
            className="w-full py-3 sm:py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl flex items-center justify-center gap-3 transition-all"
          >
            Done
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
