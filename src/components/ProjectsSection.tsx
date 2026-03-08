import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ProjectCard } from '@/components/ProjectCard';
import { useProjects, useUserProgress } from '@/hooks/useProjects';
import { miniProjects } from '@/data/projects';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

export function ProjectsSection() {
  const [filter, setFilter] = useState<'All' | 'In Progress' | 'Done'>('All');
  const { data: dbProjects, isLoading } = useProjects();
  const { data: userProgress } = useUserProgress();

  // Fetch lesson counts per project for accurate progress calculation
  const { data: lessonCounts } = useQuery({
    queryKey: ['lesson_counts'],
    enabled: !!dbProjects && dbProjects.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lessons')
        .select('project_id');
      if (error) throw error;
      const counts: Record<string, number> = {};
      data?.forEach((l) => {
        counts[l.project_id] = (counts[l.project_id] || 0) + 1;
      });
      return counts;
    },
  });

  // Use DB projects if available, otherwise fallback to static data
  const projects = dbProjects && dbProjects.length > 0
    ? dbProjects.map((p) => {
        const completedLessons = userProgress?.filter(
          (up) => up.project_id === p.id && up.status === 'completed' && up.lesson_id
        ).length || 0;
        const totalLessons = lessonCounts?.[p.id] || 1;
        const totalProgress = totalLessons > 0
          ? Math.round((completedLessons / totalLessons) * 100)
          : 0;

        return {
          id: p.slug,
          title: p.title,
          description: p.description,
          difficulty: p.difficulty as 'beginner' | 'intermediate' | 'advanced',
          estimatedTime: p.estimated_time,
          concepts: p.concepts,
          icon: p.icon,
          progress: totalProgress,
          isLocked: false,
        };
      })
    : miniProjects;

  const filteredProjects = projects.filter((p) => {
    if (filter === 'In Progress') return p.progress > 0 && p.progress < 100;
    if (filter === 'Done') return p.progress === 100;
    return true;
  });

  const filters = ['All', 'In Progress', 'Done'] as const;

  return (
    <section className="px-4 pb-24">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold">Mini Projects</h2>
            <p className="text-sm text-muted-foreground">Choose a project to start learning</p>
          </div>
          <div className="flex gap-1">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  filter === f
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-secondary'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredProjects.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
            {filteredProjects.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No projects match this filter yet.
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
