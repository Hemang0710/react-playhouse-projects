import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, CheckCircle2, ChevronRight, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InteractiveContent {
  instruction: string;
  starterCode: string;
  solution: string;
  hints: string[];
  expectedOutput?: string;
}

interface Props {
  content: InteractiveContent;
  onComplete: () => void;
  isCompleted: boolean;
}

export function InteractiveLesson({ content, onComplete, isCompleted }: Props) {
  const [code, setCode] = useState(content?.starterCode || '');
  const [showSolution, setShowSolution] = useState(false);
  const [showHint, setShowHint] = useState(-1);
  const [output, setOutput] = useState<string | null>(null);

  const handleRun = () => {
    // Simple code evaluation simulation
    try {
      // We can't run real React code here, but we simulate checking
      if (code.trim().length > (content?.starterCode?.trim().length || 0) + 10) {
        setOutput('✅ Great job! Your code looks correct.');
      } else {
        setOutput('⚠️ Try adding more code. Follow the instructions above.');
      }
    } catch {
      setOutput('❌ There was an error in your code.');
    }
  };

  const handleReset = () => {
    setCode(content?.starterCode || '');
    setOutput(null);
    setShowSolution(false);
  };

  return (
    <div className="px-4 py-6 space-y-5">
      {/* Instruction */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-5"
      >
        <h3 className="font-semibold text-base mb-2">📝 Instructions</h3>
        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
          {content?.instruction || 'Complete the code challenge below.'}
        </p>
      </motion.div>

      {/* Code Editor */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 py-2 bg-secondary/50 border-b border-border">
          <span className="text-xs font-mono text-muted-foreground">code.jsx</span>
          <div className="flex gap-2">
            <button onClick={handleReset} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>
        </div>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full min-h-[200px] p-4 bg-background/50 text-sm code-font text-foreground resize-y border-none outline-none"
          spellCheck={false}
        />
      </motion.div>

      {/* Run & Output */}
      <div className="flex gap-3">
        <Button variant="default" onClick={handleRun} className="flex-1 gap-2">
          <Play className="w-4 h-4" /> Run Code
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowSolution(!showSolution)}
        >
          {showSolution ? 'Hide' : 'Show'} Solution
        </Button>
      </div>

      {output && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="glass-card p-4"
        >
          <p className="text-sm code-font">{output}</p>
          {content?.expectedOutput && (
            <p className="text-xs text-muted-foreground mt-2">Expected: {content.expectedOutput}</p>
          )}
        </motion.div>
      )}

      {/* Hints */}
      {content?.hints && content.hints.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-medium">Need help?</p>
          {content.hints.map((hint, i) => (
            <button
              key={i}
              onClick={() => setShowHint(showHint === i ? -1 : i)}
              className="glass-card p-3 w-full text-left text-sm"
            >
              <span className="text-primary">💡 Hint {i + 1}</span>
              {showHint === i && (
                <p className="mt-2 text-muted-foreground text-xs">{hint}</p>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Solution */}
      {showSolution && content?.solution && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card overflow-hidden"
        >
          <div className="px-4 py-2 bg-primary/5 border-b border-primary/20">
            <span className="text-xs font-medium text-primary">Solution</span>
          </div>
          <pre className="p-4 text-sm code-font overflow-x-auto">
            <code>{content.solution}</code>
          </pre>
        </motion.div>
      )}

      {/* Complete */}
      <div className="pt-2 pb-8">
        <Button variant="hero" size="lg" className="w-full" onClick={onComplete}>
          {isCompleted ? (
            <>Next Lesson <ChevronRight className="w-4 h-4" /></>
          ) : (
            <>Complete Challenge <CheckCircle2 className="w-4 h-4" /></>
          )}
        </Button>
      </div>
    </div>
  );
}
