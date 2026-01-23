export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface MiniProject {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  estimatedTime: string;
  concepts: string[];
  icon: string;
  progress: number;
  isLocked: boolean;
}
