import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface QuizContent {
  questions: QuizQuestion[];
}

interface Props {
  content: QuizContent;
  onComplete: (score: number) => void;
  isCompleted: boolean;
}

export function QuizLesson({ content, onComplete, isCompleted }: Props) {
  const questions = content?.questions || [];
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  const question = questions[currentQ];

  const handleSelect = (index: number) => {
    if (answered) return;
    setSelected(index);
    setAnswered(true);
    if (index === question.correctIndex) {
      setCorrectCount((c) => c + 1);
    }
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ((c) => c + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      setFinished(true);
    }
  };

  const score = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;

  if (finished) {
    return (
      <div className="px-4 py-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-8 text-center"
        >
          <div className="text-5xl mb-4">{score >= 80 ? '🏆' : score >= 50 ? '👍' : '📚'}</div>
          <h2 className="text-2xl font-bold mb-2">Quiz Complete!</h2>
          <p className="text-muted-foreground mb-2">
            You scored <span className="text-primary font-bold">{correctCount}/{questions.length}</span> ({score}%)
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            {score >= 80 ? 'Excellent work!' : score >= 50 ? 'Good effort! Review the concepts and try again.' : 'Keep learning! You\'ll get there.'}
          </p>
          <Button variant="hero" size="lg" onClick={() => onComplete(score)}>
            {isCompleted ? (
              <>Next Lesson <ChevronRight className="w-4 h-4" /></>
            ) : (
              <>Claim {score >= 50 ? 'XP' : ''} & Continue <ChevronRight className="w-4 h-4" /></>
            )}
          </Button>
        </motion.div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="px-4 py-6 text-center text-muted-foreground">
        No quiz questions available.
      </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-5">
      {/* Progress */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all"
            style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
          />
        </div>
        <span className="text-xs text-muted-foreground font-mono">
          {currentQ + 1}/{questions.length}
        </span>
      </div>

      {/* Question */}
      <motion.div
        key={currentQ}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="glass-card p-5"
      >
        <h3 className="font-semibold text-base mb-5">{question.question}</h3>
        
        <div className="space-y-3">
          {question.options.map((option, i) => {
            const isCorrect = i === question.correctIndex;
            const isSelected = i === selected;

            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                disabled={answered}
                className={cn(
                  "w-full text-left p-4 rounded-xl border transition-all text-sm",
                  !answered && "hover:border-primary/50 hover:bg-secondary/50",
                  !answered && "border-border bg-background/50",
                  answered && isCorrect && "border-primary bg-primary/10",
                  answered && isSelected && !isCorrect && "border-destructive bg-destructive/10",
                  answered && !isCorrect && !isSelected && "opacity-50"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center text-xs font-mono shrink-0">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="flex-1">{option}</span>
                  {answered && isCorrect && <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />}
                  {answered && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-destructive shrink-0" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {answered && question.explanation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20"
          >
            <p className="text-xs text-primary">
              💡 {question.explanation}
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Next Button */}
      {answered && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Button variant="default" size="lg" className="w-full" onClick={handleNext}>
            {currentQ < questions.length - 1 ? 'Next Question' : 'See Results'}
            <ChevronRight className="w-4 h-4" />
          </Button>
        </motion.div>
      )}
    </div>
  );
}
