import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Zap, CheckCircle2, Circle, Lock, BookOpen, Code2, HelpCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const lessonTypeIcons = {
  tutorial: BookOpen,
  interactive: Code2,
  quiz: HelpCircle,
};

const lessonTypeLabels = {
  tutorial: 'Tutorial',
  interactive: 'Code Lab',
  quiz: 'Quiz',
};

export default function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: project, isLoading: projectLoading } = useQuery({
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

  const { data: lessons, isLoading: lessonsLoading } = useQuery({
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

  const { data: progress } = useQuery({
    queryKey: ['user_progress', user?.id, project?.id],
    enabled: !!user && !!project,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user!.id)
        .eq('project_id', project!.id);
      if (error) throw error;
      return data;
    },
  });

  const isLessonCompleted = (lessonId: string) =>
    progress?.some((p) => p.lesson_id === lessonId && p.status === 'completed');

  const completedCount = lessons?.filter((l) => isLessonCompleted(l.id)).length || 0;
  const totalLessons = lessons?.length || 0;
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const difficultyConfig: Record<string, { label: string; className: string }> = {
    beginner: { label: 'Beginner', className: 'difficulty-beginner' },
    intermediate: { label: 'Intermediate', className: 'difficulty-intermediate' },
    advanced: { label: 'Advanced', className: 'difficulty-advanced' },
  };

  if (projectLoading || lessonsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Project not found</p>
        <Button variant="outline" onClick={() => navigate('/')}>Go Home</Button>
      </div>
    );
  }

  const difficulty = difficultyConfig[project.difficulty] || difficultyConfig.beginner;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 px-4 py-3 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-2 -ml-2 rounded-lg hover:bg-secondary transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold truncate">{project.title}</h1>
            <p className="text-xs text-muted-foreground">{completedCount}/{totalLessons} lessons</p>
          </div>
          <span className={cn("text-xs font-medium px-2 py-1 rounded-full border", difficulty.className)}>
            {difficulty.label}
          </span>
        </div>
      </header>

      <main className="px-4 py-6 max-w-lg mx-auto">
        {/* Project Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-5 mb-6"
        >
          <div className="flex items-start gap-4 mb-4">
            <span className="text-4xl">{project.icon}</span>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-3">{project.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {project.concepts.map((c) => (
                  <span key={c} className="text-xs font-mono bg-secondary px-2 py-0.5 rounded text-muted-foreground">{c}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{project.estimated_time}</span>
            <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-primary" />{project.xp_reward} XP</span>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-medium text-primary">{progressPercent}%</span>
          </div>
        </motion.div>

        {/* Lessons List */}
        <h2 className="text-lg font-semibold mb-4">Lessons</h2>
        {!lessons || lessons.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Lessons coming soon!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {lessons.map((lesson, index) => {
              const completed = isLessonCompleted(lesson.id);
              const Icon = lessonTypeIcons[lesson.lesson_type as keyof typeof lessonTypeIcons] || BookOpen;
              const typeLabel = lessonTypeLabels[lesson.lesson_type as keyof typeof lessonTypeLabels] || 'Lesson';

              return (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => {
                    if (!user) {
                      navigate('/auth');
                      return;
                    }
                    navigate(`/project/${slug}/lesson/${lesson.id}`);
                  }}
                  className={cn(
                    "glass-card p-4 cursor-pointer group flex items-center gap-4 hover:border-primary/30 transition-colors",
                    completed && "border-primary/20"
                  )}
                >
                  {/* Status indicator */}
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                    completed ? "bg-primary/10" : "bg-secondary"
                  )}>
                    {completed ? (
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    ) : (
                      <span className="text-sm font-mono text-muted-foreground">{index + 1}</span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm group-hover:text-primary transition-colors truncate">
                      {lesson.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Icon className="w-3 h-3" /> {typeLabel}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Zap className="w-3 h-3" /> {lesson.xp_reward} XP
                      </span>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="text-muted-foreground group-hover:text-primary transition-colors">
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
