import { Home, BookOpen, Trophy, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: Home, label: 'Home', active: true },
  { icon: BookOpen, label: 'Learn', active: false },
  { icon: Trophy, label: 'Progress', active: false },
  { icon: User, label: 'Profile', active: false },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-xl border-t border-border safe-area-bottom z-50">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {navItems.map((item) => (
          <button
            key={item.label}
            className={cn(
              "flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors",
              item.active
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <item.icon className={cn("w-5 h-5", item.active && "drop-shadow-[0_0_8px_hsl(var(--primary))]")} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
