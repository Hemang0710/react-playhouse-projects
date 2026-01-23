import { AppHeader } from '@/components/AppHeader';
import { HeroSection } from '@/components/HeroSection';
import { ProjectsSection } from '@/components/ProjectsSection';
import { BottomNav } from '@/components/BottomNav';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main>
        <HeroSection />
        <ProjectsSection />
      </main>
      <BottomNav />
    </div>
  );
};

export default Index;
