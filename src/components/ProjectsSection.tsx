import { ProjectCard } from '@/components/ProjectCard';
import { miniProjects } from '@/data/projects';

export function ProjectsSection() {
  return (
    <section className="px-4 pb-24">
      <div className="max-w-lg mx-auto">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold">Mini Projects</h2>
            <p className="text-sm text-muted-foreground">Choose a project to start learning</p>
          </div>
          <div className="flex gap-1">
            {['All', 'In Progress', 'Done'].map((filter, i) => (
              <button
                key={filter}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  i === 0
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-secondary'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid gap-4">
          {miniProjects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
