import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Crown, Medal, Award, Zap, Flame } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BottomNav } from '@/components/BottomNav';
import { cn } from '@/lib/utils';

const rankIcons = [Crown, Medal, Award];
const rankColors = ['text-yellow-400', 'text-gray-300', 'text-amber-600'];

export default function Leaderboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url, xp, level, streak_days')
        .order('xp', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  const myRank = leaderboard?.findIndex((p) => p.user_id === user?.id) ?? -1;

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-50 px-4 py-3 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-lg hover:bg-secondary">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-semibold">Leaderboard</h1>
        </div>
      </header>

      <main className="px-4 py-6 max-w-lg mx-auto">
        {/* Top 3 Podium */}
        {leaderboard && leaderboard.length >= 3 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-end justify-center gap-3 mb-8">
            {[1, 0, 2].map((idx) => {
              const p = leaderboard[idx];
              if (!p) return null;
              const isCenter = idx === 0;
              return (
                <div key={p.user_id} className={cn("flex flex-col items-center", isCenter ? "order-2" : idx === 1 ? "order-1" : "order-3")}>
                  <div className={cn("relative", isCenter && "mb-2")}>
                    {isCenter && (
                      <Crown className="w-6 h-6 text-yellow-400 absolute -top-7 left-1/2 -translate-x-1/2" />
                    )}
                    <Avatar className={cn(
                      "border-2 shadow-lg",
                      isCenter ? "h-20 w-20 border-yellow-400" : "h-14 w-14 border-border"
                    )}>
                      <AvatarImage src={p.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {(p.display_name || '?')[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <p className={cn("font-semibold mt-2 truncate max-w-[80px]", isCenter ? "text-sm" : "text-xs")}>
                    {p.display_name || 'User'}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Zap className="w-3 h-3 text-primary" />
                    <span className="text-xs font-mono text-primary">{p.xp}</span>
                  </div>
                  <div className={cn(
                    "mt-2 rounded-t-lg w-16 flex items-center justify-center font-bold text-lg",
                    isCenter ? "h-20 bg-gradient-to-t from-yellow-500/20 to-yellow-500/5 text-yellow-400" :
                    idx === 1 ? "h-14 bg-gradient-to-t from-gray-400/20 to-gray-400/5 text-gray-300" :
                    "h-10 bg-gradient-to-t from-amber-600/20 to-amber-600/5 text-amber-600"
                  )}>
                    {idx + 1}
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* Your Rank */}
        {myRank >= 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-4 mb-6 border-primary/20 flex items-center gap-3">
            <span className="text-sm font-mono text-primary font-bold w-8 text-center">#{myRank + 1}</span>
            <div className="flex-1">
              <p className="font-semibold text-sm">Your Rank</p>
              <p className="text-xs text-muted-foreground">Keep learning to climb higher!</p>
            </div>
            <Zap className="w-5 h-5 text-primary" />
          </motion.div>
        )}

        {/* Full List */}
        <div className="space-y-2">
          {leaderboard?.map((p, i) => {
            const isMe = p.user_id === user?.id;
            const RankIcon = i < 3 ? rankIcons[i] : null;
            
            return (
              <motion.div
                key={p.user_id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.5) }}
                className={cn(
                  "glass-card p-3 flex items-center gap-3",
                  isMe && "border-primary/30 bg-primary/5"
                )}
              >
                {/* Rank */}
                <div className="w-8 text-center shrink-0">
                  {RankIcon ? (
                    <RankIcon className={cn("w-5 h-5 mx-auto", rankColors[i])} />
                  ) : (
                    <span className="text-sm font-mono text-muted-foreground">{i + 1}</span>
                  )}
                </div>

                {/* Avatar */}
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarImage src={p.avatar_url || undefined} />
                  <AvatarFallback className="bg-secondary text-xs">
                    {(p.display_name || '?')[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className={cn("font-medium text-sm truncate", isMe && "text-primary")}>
                    {p.display_name || 'Anonymous'} {isMe && '(You)'}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>Lv.{p.level}</span>
                    {p.streak_days > 0 && (
                      <span className="flex items-center gap-0.5">
                        <Flame className="w-3 h-3 text-warning" />{p.streak_days}d
                      </span>
                    )}
                  </div>
                </div>

                {/* XP */}
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-primary">{p.xp}</p>
                  <p className="text-[10px] text-muted-foreground">XP</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
