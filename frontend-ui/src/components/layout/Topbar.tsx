import { Bell, User, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/hooks/useTheme';
import { motion } from 'framer-motion';

export function Topbar() {
  const { theme, toggleTheme } = useTheme();
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 h-16 glass-card border-b flex items-center justify-between px-6 backdrop-blur-xl"
    >
      <div>
        <h2 className="text-lg font-heading font-semibold text-gray-900 dark:text-gray-100">
          Dashboard
        </h2>
        <p className="text-xs text-muted dark:text-gray-400">{today}</p>
      </div>
      <div className="flex items-center gap-2">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="relative hover:bg-primary/10 dark:hover:bg-primary/20"
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            ) : (
              <Sun className="w-5 h-5 text-yellow-500" />
            )}
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="ghost"
            size="sm"
            className="relative hover:bg-primary/10 dark:hover:bg-primary/20"
          >
            <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"
            />
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="ghost"
            size="sm"
            className="hover:bg-primary/10 dark:hover:bg-primary/20"
          >
            <User className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </Button>
        </motion.div>
      </div>
    </motion.header>
  );
}
