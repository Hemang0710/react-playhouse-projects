import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Zap, Flame, Trophy, Calendar, BookOpen, Target, Medal, TrendingUp, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { BottomNav } from '@/components/BottomNav';

export default function Profile() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const { data: progressData } = useQuery({
    queryKey: ['user_all_progress', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from('user_progress')
        .select('*, projects(title, icon)')
        .eq('user_id', user!.id);
      return data || [];
    },
  });

  const { data: achievements } = useQuery({
    queryKey: ['user_achievements_count', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user!.id);
      return data || [];
    },
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-4">
        <div className="text-5xl mb-2">🔒</div>
        <h2 className="text-xl font-bold">Sign in to view your profile</h2>
        <Button variant="hero" onClick={() => navigate('/auth')}>Sign In</Button>
      </div>
    );
  }

  const completedLessons = progressData?.filter((p) => p.status === 'completed').length || 0;
  const uniqueProjects = new Set(progressData?.filter((p) => p.status === 'completed').map((p) => p.project_id)).size;
  const xpProgress = ((profile?.xp || 0) % 100);
  const memberSince = profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '';

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 px-4 py-3 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-2 -ml-2 rounded-lg hover:bg-secondary">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-semibold">Profile</h1>
        </div>
      </header>

      <main className="px-4 py-6 max-w-lg mx-auto space-y-6">
        {/* Profile Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 text-center">
          <Avatar className="h-20 w-20 mx-auto mb-4 border-4 border-primary/30 shadow-[0_0_20px_hsl(var(--primary)/0.2)]">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
              {(profile?.display_name || user.email || '?')[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-xl font-bold">{profile?.display_name || 'Learner'}</h2>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <div className="flex items-center justify-center gap-1 mt-2 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>Joined {memberSince}</span>
          </div>

          {/* Level & XP Bar */}
          <div className="mt-5">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-semibold gradient-text">Level {profile?.level || 1}</span>
              <span className="text-xs text-muted-foreground">{profile?.xp || 0} XP</span>
            </div>
            <div className="h-3 bg-secondary rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">{100 - xpProgress} XP to Level {(profile?.level || 1) + 1}</p>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 gap-3">
          {[
            { icon: Zap, label: 'Total XP', value: profile?.xp || 0, color: 'text-primary' },
            { icon: Flame, label: 'Day Streak', value: profile?.streak_days || 0, color: 'text-warning' },
            { icon: BookOpen, label: 'Lessons Done', value: completedLessons, color: 'text-accent' },
            { icon: Target, label: 'Projects', value: uniqueProjects, color: 'text-success' },
            { icon: Medal, label: 'Badges', value: achievements?.length || 0, color: 'text-primary' },
            { icon: TrendingUp, label: 'Level', value: profile?.level || 1, color: 'text-accent' },
          ].map((stat, i) => (
            <div key={stat.label} className="glass-card p-4 text-center">
              <stat.icon className={`w-5 h-5 ${stat.color} mx-auto mb-2`} />
              <p className="text-xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Actions */}
        <div className="space-y-3">
          <Button variant="outline" className="w-full justify-start gap-3" onClick={() => navigate('/achievements')}>
            <Trophy className="w-4 h-4 text-primary" /> View Achievements
          </Button>
          <Button variant="outline" className="w-full justify-start gap-3" onClick={() => navigate('/leaderboard')}>
            <TrendingUp className="w-4 h-4 text-accent" /> Leaderboard
          </Button>
          <Button variant="outline" className="w-full justify-start gap-3 text-destructive hover:text-destructive" onClick={signOut}>
            Sign Out
          </Button>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
