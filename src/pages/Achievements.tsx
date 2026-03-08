import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock, CheckCircle2, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { BottomNav } from '@/components/BottomNav';
import { cn } from '@/lib/utils';

export default function Achievements() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: allAchievements } = useQuery({
    queryKey: ['all_achievements'],
    queryFn: async () => {
      const { data, error } = await supabase.from('achievements').select('*').order('xp_reward');
      if (error) throw error;
      return data;
    },
  });

  const { data: earnedIds } = useQuery({
    queryKey: ['earned_achievements', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', user!.id);
      return new Set(data?.map((d) => d.achievement_id) || []);
    },
  });

  const earned = allAchievements?.filter((a) => earnedIds?.has(a.id)) || [];
  const locked = allAchievements?.filter((a) => !earnedIds?.has(a.id)) || [];

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-50 px-4 py-3 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-lg hover:bg-secondary">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-semibold">Achievements</h1>
          <span className="ml-auto text-xs text-muted-foreground font-mono">
            {earned.length}/{allAchievements?.length || 0}
          </span>
        </div>
      </header>

      <main className="px-4 py-6 max-w-lg mx-auto space-y-8">
        {/* Summary Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 text-center glow-effect">
          <div className="text-5xl mb-3">🏆</div>
          <h2 className="text-2xl font-bold gradient-text">{earned.length} Badges Earned</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {locked.length > 0 ? `${locked.length} more to unlock` : 'All badges unlocked! 🎉'}
          </p>
          {allAchievements && allAchievements.length > 0 && (
            <div className="mt-4 h-2 bg-secondary rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(earned.length / allAchievements.length) * 100}%` }}
                transition={{ duration: 1 }}
                className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
              />
            </div>
          )}
        </motion.div>

        {/* Earned */}
        {earned.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-primary" />
              <h3 className="font-semibold">Unlocked</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {earned.map((a, i) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card p-4 text-center border-primary/20 relative overflow-hidden"
                >
                  <div className="absolute top-2 right-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-3xl mb-2">{a.icon}</div>
                  <h4 className="font-semibold text-sm">{a.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{a.description}</p>
                  <span className="inline-block mt-2 text-xs text-primary font-mono">+{a.xp_reward} XP</span>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Locked */}
        {locked.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-semibold text-muted-foreground">Locked</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {locked.map((a, i) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card p-4 text-center opacity-50"
                >
                  <div className="text-3xl mb-2 grayscale">{a.icon}</div>
                  <h4 className="font-semibold text-sm">{a.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{a.description}</p>
                  <span className="inline-block mt-2 text-xs text-muted-foreground font-mono">+{a.xp_reward} XP</span>
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
