import { User, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { motion, AnimatePresence } from 'framer-motion';

export function Topbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.header
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 h-16 glass-card border-b flex items-center justify-end px-6 relative"
    >
      <div className="flex items-center gap-3">
        <motion.button
          onClick={toggleTheme}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-9 h-9 rounded-lg glass-premium flex items-center justify-center"
        >
          <AnimatePresence mode="wait">
            {theme === 'light' ? (
              <motion.div
                key="moon"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Moon className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              </motion.div>
            ) : (
              <motion.div
                key="sun"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Sun className="w-4 h-4 text-yellow-500" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-9 h-9 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center"
        >
          <User className="w-4 h-4 text-primary" />
        </motion.button>
      </div>
    </motion.header>
  );
}
