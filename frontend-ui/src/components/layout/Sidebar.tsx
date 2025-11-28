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
        className="p-6 border-b border-gray-200/50 dark:border-gray-700/30"
      >
        <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
          CARBON FOOTPRINT DASHBOARD
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Tracking CO₂ Emissions Across Supply Chain
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
                  'flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200',
                  isActive
                    ? 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light font-medium'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200'
                )
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm">{item.label}</span>
            </NavLink>
          </motion.div>
        ))}
      </nav>
    </aside>
  );
}
