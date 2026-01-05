import { motion } from 'framer-motion';
import { Users, Bot, GraduationCap, Settings, Info } from 'lucide-react';
import clsx from 'clsx';
import logoImage from '@/assets/images/ui/WoGL-logo.png';

interface MainMenuProps {
  onStartLocal: () => void;
  onStartSinglePlayer: () => void;
  onStartTutorial: () => void;
  onOpenSettings: () => void;
  onOpenAbout: () => void;
}

export function MainMenu({
  onStartLocal,
  onStartSinglePlayer,
  onStartTutorial,
  onOpenSettings,
  onOpenAbout,
}: MainMenuProps) {
  const menuItems = [
    {
      icon: Users,
      label: 'Local Multiplayer',
      description: 'Play with friends on the same device',
      onClick: onStartLocal,
      color: 'from-good-500 to-good-600',
      hoverColor: 'hover:from-good-600 hover:to-good-700',
    },
    {
      icon: Bot,
      label: 'Single Player',
      description: 'Play against the AI',
      onClick: onStartSinglePlayer,
      color: 'from-purple-500 to-purple-600',
      hoverColor: 'hover:from-purple-600 hover:to-purple-700',
    },
    {
      icon: GraduationCap,
      label: 'Tutorial',
      description: 'Learn how to play',
      onClick: onStartTutorial,
      color: 'from-amber-500 to-amber-600',
      hoverColor: 'hover:from-amber-600 hover:to-amber-700',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex flex-col items-center justify-center p-8">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 bg-good-200 rounded-full opacity-20 blur-3xl" />
        <div className="absolute bottom-20 right-20 w-64 h-64 bg-bad-200 rounded-full opacity-20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-200 rounded-full opacity-10 blur-3xl" />
      </div>

      {/* Logo and title */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12 relative z-10"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="inline-flex items-center justify-center w-32 h-32 rounded-full shadow-xl mb-6 overflow-hidden"
        >
          <img src={logoImage} alt="War of Gutlands Logo" className="w-full h-full object-cover" />
        </motion.div>
        <h1 className="text-5xl font-bold text-amber-900 mb-3">
          The War of Gutlands
        </h1>
        <p className="text-xl text-amber-700 max-w-md mx-auto">
          An educational strategy game about gut health and antibiotic resistance
        </p>
      </motion.div>

      {/* Menu buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col gap-4 w-full max-w-md relative z-10"
      >
        {menuItems.map((item, index) => (
          <motion.button
            key={item.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={item.onClick}
            className={clsx(
              'flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-r text-white shadow-lg transition-all',
              item.color,
              item.hoverColor
            )}
          >
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <item.icon size={28} />
            </div>
            <div className="text-left">
              <div className="font-bold text-lg">{item.label}</div>
              <div className="text-sm opacity-80">{item.description}</div>
            </div>
          </motion.button>
        ))}
      </motion.div>

      {/* Bottom buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="flex gap-4 mt-12 relative z-10"
      >
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/80 text-slate-700 hover:bg-white shadow-md hover:shadow-lg transition-all"
        >
          <Settings size={20} />
          Settings
        </button>
        <button
          onClick={onOpenAbout}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/80 text-slate-700 hover:bg-white shadow-md hover:shadow-lg transition-all"
        >
          <Info size={20} />
          About
        </button>
      </motion.div>

      {/* Version info */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-sm text-amber-600/60 mt-8 relative z-10"
      >
        Version 1.0.0 | Educational Game for Ages 11+
      </motion.p>
    </div>
  );
}
