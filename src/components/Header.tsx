import { Dumbbell, LogOut } from 'lucide-react';
import { Button } from './ui/button';

interface HeaderProps {
  currentPage?: 'home' | 'history' | 'pr' | 'profile' | 'planning' | 'nutrition' | 'templates';
  onNavigate?: (page: string) => void;
  onLogout?: () => void;
}

export function Header({ currentPage = 'home', onNavigate, onLogout }: HeaderProps) {
  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'planning', label: 'Planning' },
    { id: 'templates', label: 'Templates' },
    { id: 'nutrition', label: 'Nutrition' },
    { id: 'history', label: 'History' },
    { id: 'pr', label: 'PR' },
    { id: 'profile', label: 'Profile' },
  ];

  return (
    <header className="border-b border-[#151923]">
      <div className="max-w-[1200px] mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button 
            onClick={() => onNavigate?.('home')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Dumbbell className="w-6 h-6 text-[#22C55E]" />
            <span className="text-xl" style={{ fontWeight: 600 }}>BodyGoal</span>
          </button>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate?.(item.id)}
                className={`transition-colors ${
                  currentPage === item.id
                    ? 'text-[#22C55E]'
                    : 'text-[#FFFFFF]/70 hover:text-[#FFFFFF]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button 
              onClick={() => onNavigate?.('start-session')}
              className="bg-[#22C55E] hover:bg-[#22C55E]/90 text-[#0B0B0F]"
            >
              Start session
            </Button>
            {onLogout && (
              <Button
                onClick={onLogout}
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}