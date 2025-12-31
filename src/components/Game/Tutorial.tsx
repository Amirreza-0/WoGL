import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, X, GraduationCap, Lightbulb } from 'lucide-react';
import clsx from 'clsx';

interface TutorialStep {
  id: string;
  title: string;
  content: string;
  fact: string;
  highlight?: 'board' | 'hand' | 'sidebar' | 'amr' | 'zones' | 'cards';
  position?: 'center' | 'top' | 'bottom' | 'left' | 'right';
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to The War of Gutlands!',
    content: 'In this game, you\'ll learn about the amazing world inside your digestive system. Two teams of bacteria battle for control of your gut!',
    fact: 'Your gut contains over 100 trillion bacteria - that\'s more than all the stars in the Milky Way galaxy!',
    position: 'center',
  },
  {
    id: 'board',
    title: 'The Digestive Tract',
    content: 'This board represents your digestive system, divided into 9 zones. Each zone can hold up to 5 bacteria tokens. Your goal is to control these zones!',
    fact: 'The human digestive tract is about 30 feet long and contains different types of bacteria in each section.',
    highlight: 'board',
    position: 'center',
  },
  {
    id: 'tokens',
    title: 'Good vs Bad Bacteria',
    content: 'Blue tokens are Good Bacteria - they help keep you healthy. Red tokens are Bad Bacteria - they can make you sick. You\'ll be assigned to one team!',
    fact: 'In a healthy gut, beneficial bacteria outnumber harmful ones by about 100 to 1.',
    highlight: 'zones',
    position: 'center',
  },
  {
    id: 'cards',
    title: 'Playing Cards',
    content: 'Each turn, you\'ll play one card from your hand. Cards can add or remove bacteria, or trigger special effects. Look at your cards at the bottom of the screen!',
    fact: 'Your daily habits like eating, sleeping, and exercising directly affect your gut bacteria balance.',
    highlight: 'hand',
    position: 'top',
  },
  {
    id: 'die',
    title: 'Rolling the Die',
    content: 'At the start of each turn, roll the 20-sided die! If you roll 15 or higher, a Global Event occurs - these represent real-world factors affecting health.',
    fact: 'Global events like pandemics and agricultural practices affect antibiotic use worldwide.',
    highlight: 'sidebar',
    position: 'right',
  },
  {
    id: 'amr',
    title: 'The AMR Barometer',
    content: 'This gauge tracks Antibiotic Resistance. When antibiotics are used, it goes up. If it reaches 10, the bad bacteria become unstoppable and WIN!',
    fact: 'Antibiotic resistance is one of the biggest threats to global health. Over 700,000 people die from drug-resistant infections each year.',
    highlight: 'amr',
    position: 'right',
  },
  {
    id: 'antibiotics',
    title: 'Using Antibiotics Wisely',
    content: 'Antibiotics are powerful but risky! They can clear zones of bacteria but increase the AMR level. Use them only when necessary!',
    fact: 'Antibiotics were discovered in 1928 and have saved millions of lives, but overuse has led to resistant superbugs.',
    highlight: 'cards',
    position: 'top',
  },
  {
    id: 'winning',
    title: 'Winning the Game',
    content: 'Good Bacteria win by controlling 5 zones OR eliminating all bad bacteria. Bad Bacteria win by controlling 5 zones OR pushing AMR to 10.',
    fact: 'In real life, balance is key! A healthy gut has both good and bad bacteria, with good bacteria keeping the bad ones in check.',
    position: 'center',
  },
  {
    id: 'complete',
    title: 'Ready to Play!',
    content: 'You now know the basics! Remember: balance is key to a healthy gut. Good luck in your battle for the digestive tract!',
    fact: 'You can improve your gut health by eating fiber, fermented foods, staying active, and avoiding unnecessary antibiotics.',
    position: 'center',
  },
];

interface TutorialProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function Tutorial({ onComplete, onSkip }: TutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const step = TUTORIAL_STEPS[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'Escape') {
        handleSkip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep]);

  return (
    <>
      {/* Overlay with highlight cutout */}
      <div className="fixed inset-0 z-40 pointer-events-none">
        <div
          className={clsx(
            'absolute inset-0 bg-black/60 transition-all duration-500',
            step.highlight && 'backdrop-blur-sm'
          )}
        />
      </div>

      {/* Tutorial card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step.id}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className={clsx(
            'fixed z-50 bg-white rounded-2xl shadow-2xl p-6 max-w-lg w-full mx-4',
            step.position === 'center' && 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
            step.position === 'top' && 'top-8 left-1/2 -translate-x-1/2',
            step.position === 'bottom' && 'bottom-8 left-1/2 -translate-x-1/2',
            step.position === 'left' && 'left-8 top-1/2 -translate-y-1/2',
            step.position === 'right' && 'right-8 top-1/2 -translate-y-1/2'
          )}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                <GraduationCap size={24} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-xl text-slate-800">{step.title}</h3>
                <p className="text-sm text-slate-500">
                  Step {currentStep + 1} of {TUTORIAL_STEPS.length}
                </p>
              </div>
            </div>
            <button
              onClick={handleSkip}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              title="Skip tutorial"
            >
              <X size={20} className="text-slate-400" />
            </button>
          </div>

          {/* Content */}
          <p className="text-slate-700 leading-relaxed mb-4">{step.content}</p>

          {/* Educational fact */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-2">
              <Lightbulb size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-amber-800 text-sm mb-1">Did You Know?</h4>
                <p className="text-sm text-amber-900">{step.fact}</p>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-100 rounded-full h-2 mb-4">
            <motion.div
              className="bg-gradient-to-r from-amber-400 to-orange-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / TUTORIAL_STEPS.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrev}
              disabled={isFirstStep}
              className={clsx(
                'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors',
                isFirstStep
                  ? 'text-slate-300 cursor-not-allowed'
                  : 'text-slate-600 hover:bg-slate-100'
              )}
            >
              <ChevronLeft size={20} />
              Back
            </button>

            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-bold hover:shadow-lg transition-all"
            >
              {isLastStep ? 'Start Playing!' : 'Next'}
              {!isLastStep && <ChevronRight size={20} />}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}

// Hook to manage tutorial state
export function useTutorial() {
  const [showTutorial, setShowTutorial] = useState(false);
  const [hasCompletedTutorial, setHasCompletedTutorial] = useState(() => {
    return localStorage.getItem('wogl_tutorial_completed') === 'true';
  });

  const startTutorial = () => setShowTutorial(true);

  const completeTutorial = () => {
    setShowTutorial(false);
    setHasCompletedTutorial(true);
    localStorage.setItem('wogl_tutorial_completed', 'true');
  };

  const skipTutorial = () => {
    setShowTutorial(false);
  };

  const resetTutorial = () => {
    localStorage.removeItem('wogl_tutorial_completed');
    setHasCompletedTutorial(false);
  };

  return {
    showTutorial,
    hasCompletedTutorial,
    startTutorial,
    completeTutorial,
    skipTutorial,
    resetTutorial,
  };
}
