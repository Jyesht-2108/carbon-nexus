import { Home, Activity, Target, Settings, Upload, MessageSquare } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const navItems = [
  { icon: Home, label: 'Dashboard', path: '/' },
  { icon: Activity, label: 'Activity', path: '/activity' },
  { icon: Upload, label: 'Data Upload', path: '/ingest' },
  { icon: MessageSquare, label: 'RAG Assistant', path: '/chatbot' },
  { icon: Target, label: 'Goals', path: '/goals' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export function Sidebar() {
  return (
    <aside className="w-64 glass-card border-r flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 border-b border-gray-200/50 dark:border-gray-700/50"
      >
        <h1 className="text-2xl font-heading font-bold bg-gradient-to-r from-primary to-accent1 bg-clip-text text-transparent">
          Carbon Nexus
        </h1>
        <p className="text-xs text-muted dark:text-gray-400 mt-1">
          Real-time Carbon Intelligence
        </p>
      </motion.div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item, index) => (
          <motion.div
            key={item.path}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-3 rounded-2xl mb-1 transition-all duration-300 group',
                  isActive
                    ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-glow font-medium'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-primary/10 dark:hover:bg-primary/20 hover:translate-x-1'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={cn(
                      'w-5 h-5 transition-transform duration-300 group-hover:scale-110',
                      isActive && 'drop-shadow-lg'
                    )}
                  />
                  <span className="font-medium">{item.label}</span>
                </>
              )}
            </NavLink>
          </motion.div>
        ))}
      </nav>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="p-4 border-t border-gray-200/50 dark:border-gray-700/50"
      >
        <div className="glass rounded-2xl p-3 text-center">
          <p className="text-xs text-muted dark:text-gray-400">
            Powered by AI & ML
          </p>
        </div>
      </motion.div>
    </aside>
  );
}
