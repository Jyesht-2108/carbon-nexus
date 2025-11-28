import { Home, Activity, Target, Settings, Upload, MessageSquare } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

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
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary">Carbon Nexus</h1>
        <p className="text-xs text-gray-500 mt-1">Real-time Carbon Intelligence</p>
      </div>
      <nav className="flex-1 px-3">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              )
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
