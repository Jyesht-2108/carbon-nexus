import { Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function Topbar() {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Dashboard</h2>
        <p className="text-xs text-gray-500">{today}</p>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </Button>
        <Button variant="ghost" size="sm">
          <User className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
}
