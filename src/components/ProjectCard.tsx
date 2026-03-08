import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Clock, ChevronRight } from 'lucide-react';
import { MiniProject } from '@/types/project';
import { cn } from '@/lib/utils';

interface ProjectCardProps {
  project: MiniProject;
  index: number;
}

const difficultyConfig = {
  beginner: { label: 'Beginner', className: 'difficulty-beginner' },
  intermediate: { label: 'Intermediate', className: 'difficulty-intermediate' },
  advanced: { label: 'Advanced', className: 'difficulty-advanced' },
};

export function ProjectCard({ project, index }: ProjectCardProps) {
  const difficulty = difficultyConfig[project.difficulty];
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      onClick={() => !project.isLocked && navigate(`/project/${project.id}`)}
      className={cn(
        "glass-card p-5 cursor-pointer group relative overflow-hidden",
        project.isLocked && "opacity-60"
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {project.isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-10">
          <div className="flex flex-col items-center gap-2">
            <Lock className="w-6 h-6 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Complete previous projects</span>
          </div>
        </div>
      )}

      <div className="relative z-0">
        <div className="flex items-start justify-between mb-3">
          <span className="text-3xl">{project.icon}</span>
          <span className={cn("text-xs font-medium px-2 py-1 rounded-full border", difficulty.className)}>
            {difficulty.label}
          </span>
        </div>
        <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">{project.title}</h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{project.description}</p>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.concepts.map((concept) => (
            <span key={concept} className="text-xs font-mono bg-secondary px-2 py-0.5 rounded text-muted-foreground">{concept}</span>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            <span>{project.estimatedTime}</span>
          </div>
          {project.progress > 0 ? (
            <div className="flex items-center gap-2">
              <div className="w-20 h-1.5 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full" style={{ width: `${project.progress}%` }} />
              </div>
              <span className="text-xs text-primary font-medium">{project.progress}%</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-primary text-sm font-medium group-hover:gap-2 transition-all">
              Start <ChevronRight className="w-4 h-4" />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
