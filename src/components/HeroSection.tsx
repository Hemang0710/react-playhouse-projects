import { motion } from 'framer-motion';
import { Sparkles, Code2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  return (
    <section className="relative py-12 px-4 overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.15)_0%,transparent_70%)] pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 text-center max-w-md mx-auto"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary border border-border mb-6"
        >
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-xs font-medium text-muted-foreground">Learn by Building</span>
        </motion.div>

        {/* Title */}
        <h1 className="text-4xl font-bold mb-3 leading-tight">
          Master{' '}
          <span className="gradient-text">React</span>
          <br />
          One Project at a Time
        </h1>

        {/* Subtitle */}
        <p className="text-muted-foreground mb-8 text-base">
          Build real mini-projects, learn core concepts, and track your progress as you become a React developer.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="hero" size="lg" className="gap-2">
            <Code2 className="w-5 h-5" />
            Start Learning
          </Button>
          <Button variant="outline" size="lg">
            View Projects
          </Button>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-10 flex justify-center gap-8"
        >
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">6</div>
            <div className="text-xs text-muted-foreground">Projects</div>
          </div>
          <div className="w-px bg-border" />
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">15+</div>
            <div className="text-xs text-muted-foreground">Concepts</div>
          </div>
          <div className="w-px bg-border" />
          <div className="text-center">
            <div className="text-2xl font-bold gradient-text">∞</div>
            <div className="text-xs text-muted-foreground">Practice</div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
