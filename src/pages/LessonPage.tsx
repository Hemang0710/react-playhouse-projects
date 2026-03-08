import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, ArrowLeft } from 'lucide-react';
import { TutorialLesson } from '@/components/lessons/TutorialLesson';
import { InteractiveLesson } from '@/components/lessons/InteractiveLesson';
import { QuizLesson } from '@/components/lessons/QuizLesson';
import { toast } from 'sonner';

export default function LessonPage() {
  const { slug, lessonId } = useParams<{ slug: string; lessonId: string }>();
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const queryClient = useQueryClient();

  const { data: project } = useQuery({
    queryKey: ['project', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('slug', slug!)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: lesson, isLoading } = useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId!)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: allLessons } = useQuery({
    queryKey: ['lessons', project?.id],
    enabled: !!project,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('project_id', project!.id)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const { data: existingProgress } = useQuery({
    queryKey: ['lesson_progress', user?.id, lessonId],
    enabled: !!user && !!lessonId,
    queryFn: async () => {
      const { data } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user!.id)
        .eq('lesson_id', lessonId!)
        .maybeSingle();
      return data;
    },
  });

  const completeMutation = useMutation({
    mutationFn: async (score?: number) => {
      if (!user || !project || !lesson) return;
      
      // Upsert progress
      const { error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: user.id,
          project_id: project.id,
          lesson_id: lesson.id,
          status: 'completed',
          score: score ?? null,
          completed_at: new Date().toISOString(),
        }, { onConflict: 'user_id,project_id,lesson_id' });
      if (error) throw error;

      // Fetch fresh profile to avoid stale XP
      const { data: freshProfile } = await supabase
        .from('profiles')
        .select('xp, level, last_activity_date, streak_days')
        .eq('user_id', user.id)
        .single();

      if (!freshProfile) return;

      const xpToAdd = lesson.xp_reward;
      const currentXp = freshProfile.xp + xpToAdd;
      const newLevel = Math.floor(currentXp / 100) + 1;

      // Streak calculation
      const today = new Date().toISOString().split('T')[0];
      const lastActivity = freshProfile.last_activity_date;
      let newStreak = freshProfile.streak_days;

      if (lastActivity !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (lastActivity === yesterdayStr) {
          newStreak += 1; // Consecutive day
        } else if (!lastActivity) {
          newStreak = 1; // First activity
        } else {
          newStreak = 1; // Streak broken, restart
        }
      }

      await supabase
        .from('profiles')
        .update({
          xp: currentXp,
          level: newLevel,
          streak_days: newStreak,
          last_activity_date: today,
        })
        .eq('user_id', user.id);
    },
    onSuccess: () => {
      toast.success(`+${lesson?.xp_reward} XP earned! 🎉`);
      queryClient.invalidateQueries({ queryKey: ['user_progress'] });
      queryClient.invalidateQueries({ queryKey: ['lesson_progress'] });
      
      // Refresh profile so header/hero show updated XP
      refreshProfile();
      
      // Navigate to next lesson or back to project
      if (allLessons && lesson) {
        const currentIndex = allLessons.findIndex((l) => l.id === lesson.id);
        if (currentIndex < allLessons.length - 1) {
          const next = allLessons[currentIndex + 1];
          navigate(`/project/${slug}/lesson/${next.id}`, { replace: true });
        } else {
          toast.success('Project completed! 🏆');
          navigate(`/project/${slug}`, { replace: true });
        }
      }
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Lesson not found</p>
        <button onClick={() => navigate(-1)} className="text-primary hover:underline">Go back</button>
      </div>
    );
  }

  const content = lesson.content as any;
  const isCompleted = existingProgress?.status === 'completed';

  const handleComplete = (score?: number) => {
    if (!isCompleted) {
      completeMutation.mutate(score);
    } else {
      // Already completed, just navigate
      if (allLessons) {
        const currentIndex = allLessons.findIndex((l) => l.id === lesson.id);
        if (currentIndex < allLessons.length - 1) {
          const next = allLessons[currentIndex + 1];
          navigate(`/project/${slug}/lesson/${next.id}`, { replace: true });
        } else {
          navigate(`/project/${slug}`, { replace: true });
        }
      }
    }
  };

  const lessonHeader = (
    <header className="sticky top-0 z-50 px-4 py-3 backdrop-blur-xl bg-background/80 border-b border-border/50">
      <div className="max-w-2xl mx-auto flex items-center gap-3">
        <button onClick={() => navigate(`/project/${slug}`)} className="p-2 -ml-2 rounded-lg hover:bg-secondary transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-semibold truncate text-sm">{lesson.title}</h1>
          <p className="text-xs text-muted-foreground">{project?.title}</p>
        </div>
        {isCompleted && (
          <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">✓ Done</span>
        )}
      </div>
    </header>
  );

  return (
    <div className="min-h-screen bg-background">
      {lessonHeader}
      <main className="max-w-2xl mx-auto">
        {lesson.lesson_type === 'tutorial' && (
          <TutorialLesson content={content} onComplete={handleComplete} isCompleted={isCompleted} />
        )}
        {lesson.lesson_type === 'interactive' && (
          <InteractiveLesson content={content} onComplete={handleComplete} isCompleted={isCompleted} />
        )}
        {lesson.lesson_type === 'quiz' && (
          <QuizLesson content={content} onComplete={handleComplete} isCompleted={isCompleted} />
        )}
      </main>
    </div>
  );
}
