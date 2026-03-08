import { motion } from 'framer-motion';
import { CheckCircle2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TutorialContent {
  sections: {
    title: string;
    body: string;
    code?: string;
    tip?: string;
  }[];
}

interface Props {
  content: TutorialContent;
  onComplete: () => void;
  isCompleted: boolean;
}

export function TutorialLesson({ content, onComplete, isCompleted }: Props) {
  const sections = content?.sections || [];

  return (
    <div className="px-4 py-6 space-y-6">
      {sections.map((section, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="glass-card p-5"
        >
          <h3 className="font-semibold text-base mb-3">{section.title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{section.body}</p>
          
          {section.code && (
            <div className="mt-4 rounded-lg bg-secondary/80 border border-border overflow-x-auto">
              <pre className="p-4 text-sm code-font text-foreground">
                <code>{section.code}</code>
              </pre>
            </div>
          )}

          {section.tip && (
            <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-xs text-primary">💡 <strong>Tip:</strong> {section.tip}</p>
            </div>
          )}
        </motion.div>
      ))}

      <div className="pt-4 pb-8">
        <Button
          variant="hero"
          size="lg"
          className="w-full"
          onClick={onComplete}
        >
          {isCompleted ? (
            <>Next Lesson <ChevronRight className="w-4 h-4" /></>
          ) : (
            <>Mark as Complete <CheckCircle2 className="w-4 h-4" /></>
          )}
        </Button>
      </div>
    </div>
  );
}
