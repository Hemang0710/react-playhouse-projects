import { Bell, Settings } from 'lucide-react';

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 safe-area-inset">
      <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <span className="font-mono font-bold text-sm text-primary-foreground">R</span>
          </div>
          <span className="font-bold text-lg">
            React<span className="text-primary">Learn</span>
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg hover:bg-secondary transition-colors relative">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
          </button>
          <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
            <Settings className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>
    </header>
  );
}
