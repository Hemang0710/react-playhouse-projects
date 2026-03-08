import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Plus, Pencil, Trash2, BookOpen, Users, Trophy, FolderOpen,
  ChevronRight, Loader2, BarChart3, Zap, GraduationCap, Eye, EyeOff, Save, X
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type Tab = 'overview' | 'projects' | 'lessons' | 'achievements' | 'users';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const navigate = useNavigate();

  const tabs: { id: Tab; label: string; icon: typeof BookOpen }[] = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'projects', label: 'Projects', icon: FolderOpen },
    { id: 'lessons', label: 'Lessons', icon: BookOpen },
    { id: 'achievements', label: 'Badges', icon: Trophy },
    { id: 'users', label: 'Users', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 px-4 py-3 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-2 -ml-2 rounded-lg hover:bg-secondary">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="font-bold text-lg gradient-text">Admin Dashboard</h1>
            <p className="text-xs text-muted-foreground">Manage your learning platform</p>
          </div>
        </div>
      </header>

      {/* Tab Nav */}
      <div className="border-b border-border sticky top-[57px] z-40 bg-background/95 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 flex gap-1 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'projects' && <ProjectsTab />}
        {activeTab === 'lessons' && <LessonsTab />}
        {activeTab === 'achievements' && <AchievementsTab />}
        {activeTab === 'users' && <UsersTab />}
      </main>
    </div>
  );
}

/* ─── Overview ─── */
function OverviewTab() {
  const { data: stats } = useQuery({
    queryKey: ['admin_stats'],
    queryFn: async () => {
      const [projects, lessons, profiles, achievements] = await Promise.all([
        supabase.from('projects').select('id', { count: 'exact', head: true }),
        supabase.from('lessons').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('achievements').select('id', { count: 'exact', head: true }),
      ]);
      return {
        projects: projects.count || 0,
        lessons: lessons.count || 0,
        users: profiles.count || 0,
        achievements: achievements.count || 0,
      };
    },
  });

  const cards = [
    { label: 'Total Projects', value: stats?.projects || 0, icon: FolderOpen, color: 'text-primary' },
    { label: 'Total Lessons', value: stats?.lessons || 0, icon: BookOpen, color: 'text-accent' },
    { label: 'Registered Users', value: stats?.users || 0, icon: Users, color: 'text-success' },
    { label: 'Achievements', value: stats?.achievements || 0, icon: Trophy, color: 'text-warning' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="glass-card p-5"
        >
          <card.icon className={cn("w-6 h-6 mb-3", card.color)} />
          <p className="text-2xl font-bold">{card.value}</p>
          <p className="text-xs text-muted-foreground">{card.label}</p>
        </motion.div>
      ))}
    </div>
  );
}

/* ─── Projects ─── */
function ProjectsTab() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    slug: '', title: '', description: '', icon: '📦', difficulty: 'beginner',
    estimated_time: '15 min', concepts: '', sort_order: 0, is_published: false, xp_reward: 50,
  });

  const { data: projects, isLoading } = useQuery({
    queryKey: ['admin_projects'],
    queryFn: async () => {
      const { data, error } = await supabase.from('projects').select('*').order('sort_order');
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        concepts: form.concepts.split(',').map((c) => c.trim()).filter(Boolean),
      };
      if (editing) {
        const { error } = await supabase.from('projects').update(payload).eq('id', editing);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('projects').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editing ? 'Project updated' : 'Project created');
      queryClient.invalidateQueries({ queryKey: ['admin_projects'] });
      resetForm();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Project deleted');
      queryClient.invalidateQueries({ queryKey: ['admin_projects'] });
    },
  });

  const resetForm = () => {
    setEditing(null);
    setCreating(false);
    setForm({ slug: '', title: '', description: '', icon: '📦', difficulty: 'beginner', estimated_time: '15 min', concepts: '', sort_order: 0, is_published: false, xp_reward: 50 });
  };

  const startEdit = (p: any) => {
    setEditing(p.id);
    setCreating(true);
    setForm({
      slug: p.slug, title: p.title, description: p.description, icon: p.icon,
      difficulty: p.difficulty, estimated_time: p.estimated_time,
      concepts: p.concepts.join(', '), sort_order: p.sort_order,
      is_published: p.is_published, xp_reward: p.xp_reward,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Projects ({projects?.length || 0})</h2>
        <Button onClick={() => { resetForm(); setCreating(true); }} className="gap-2">
          <Plus className="w-4 h-4" /> New Project
        </Button>
      </div>

      {/* Form */}
      <AnimatePresence>
        {creating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card p-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{editing ? 'Edit Project' : 'New Project'}</h3>
              <button onClick={resetForm}><X className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input placeholder="Slug (e.g. counter)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
              <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <Input placeholder="Icon emoji" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
              <select
                value={form.difficulty}
                onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              <Input placeholder="Estimated time" value={form.estimated_time} onChange={(e) => setForm({ ...form, estimated_time: e.target.value })} />
              <Input placeholder="XP Reward" type="number" value={form.xp_reward} onChange={(e) => setForm({ ...form, xp_reward: parseInt(e.target.value) || 0 })} />
              <Input placeholder="Sort order" type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} className="rounded" />
                Published
              </label>
            </div>
            <Textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <Input placeholder="Concepts (comma separated)" value={form.concepts} onChange={(e) => setForm({ ...form, concepts: e.target.value })} />
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="gap-2">
              {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {editing ? 'Update' : 'Create'}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List */}
      <div className="space-y-2">
        {projects?.map((p) => (
          <div key={p.id} className="glass-card p-4 flex items-center gap-4">
            <span className="text-2xl">{p.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-sm truncate">{p.title}</h4>
                {p.is_published ? (
                  <Eye className="w-3.5 h-3.5 text-success shrink-0" />
                ) : (
                  <EyeOff className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">{p.description}</p>
            </div>
            <div className="flex gap-1 shrink-0">
              <button onClick={() => startEdit(p)} className="p-2 rounded-lg hover:bg-secondary">
                <Pencil className="w-4 h-4 text-muted-foreground" />
              </button>
              <button onClick={() => { if (confirm('Delete this project?')) deleteMutation.mutate(p.id); }} className="p-2 rounded-lg hover:bg-destructive/10">
                <Trash2 className="w-4 h-4 text-destructive" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Lessons ─── */
function LessonsTab() {
  const queryClient = useQueryClient();
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '', lesson_type: 'tutorial', sort_order: 0, xp_reward: 10, content: '{}',
  });

  const { data: projects } = useQuery({
    queryKey: ['admin_projects'],
    queryFn: async () => {
      const { data } = await supabase.from('projects').select('*').order('sort_order');
      return data || [];
    },
  });

  const { data: lessons } = useQuery({
    queryKey: ['admin_lessons', selectedProject],
    enabled: !!selectedProject,
    queryFn: async () => {
      const { data } = await supabase.from('lessons').select('*').eq('project_id', selectedProject!).order('sort_order');
      return data || [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      let parsedContent;
      try { parsedContent = JSON.parse(form.content); } catch { throw new Error('Invalid JSON in content'); }
      const payload = { ...form, content: parsedContent, project_id: selectedProject! };
      if (editing) {
        const { error } = await supabase.from('lessons').update(payload).eq('id', editing);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('lessons').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editing ? 'Lesson updated' : 'Lesson created');
      queryClient.invalidateQueries({ queryKey: ['admin_lessons'] });
      resetForm();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('lessons').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Lesson deleted');
      queryClient.invalidateQueries({ queryKey: ['admin_lessons'] });
    },
  });

  const resetForm = () => {
    setEditing(null);
    setCreating(false);
    setForm({ title: '', lesson_type: 'tutorial', sort_order: 0, xp_reward: 10, content: '{}' });
  };

  const startEdit = (l: any) => {
    setEditing(l.id);
    setCreating(true);
    setForm({
      title: l.title, lesson_type: l.lesson_type, sort_order: l.sort_order,
      xp_reward: l.xp_reward, content: JSON.stringify(l.content, null, 2),
    });
  };

  const lessonTypeIcons: Record<string, string> = { tutorial: '📖', interactive: '💻', quiz: '❓' };

  return (
    <div className="space-y-6">
      {/* Project Selector */}
      <div>
        <label className="text-sm font-medium mb-2 block">Select Project</label>
        <select
          value={selectedProject || ''}
          onChange={(e) => { setSelectedProject(e.target.value || null); resetForm(); }}
          className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm"
        >
          <option value="">Choose a project...</option>
          {projects?.map((p) => (
            <option key={p.id} value={p.id}>{p.icon} {p.title}</option>
          ))}
        </select>
      </div>

      {selectedProject && (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Lessons ({lessons?.length || 0})</h2>
            <Button onClick={() => { resetForm(); setCreating(true); }} className="gap-2">
              <Plus className="w-4 h-4" /> New Lesson
            </Button>
          </div>

          <AnimatePresence>
            {creating && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="glass-card p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{editing ? 'Edit Lesson' : 'New Lesson'}</h3>
                  <button onClick={resetForm}><X className="w-4 h-4" /></button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                  <select value={form.lesson_type} onChange={(e) => setForm({ ...form, lesson_type: e.target.value })} className="h-10 rounded-lg border border-border bg-background px-3 text-sm">
                    <option value="tutorial">Tutorial</option>
                    <option value="interactive">Interactive</option>
                    <option value="quiz">Quiz</option>
                  </select>
                  <Input placeholder="Sort order" type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} />
                  <Input placeholder="XP Reward" type="number" value={form.xp_reward} onChange={(e) => setForm({ ...form, xp_reward: parseInt(e.target.value) || 0 })} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Content (JSON)</label>
                  <Textarea
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    className="min-h-[200px] code-font text-xs"
                    placeholder='{"sections": [...]}'
                  />
                </div>
                <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="gap-2">
                  {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {editing ? 'Update' : 'Create'}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-2">
            {lessons?.map((l, i) => (
              <div key={l.id} className="glass-card p-4 flex items-center gap-4">
                <span className="text-xl">{lessonTypeIcons[l.lesson_type] || '📄'}</span>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm truncate">{l.title}</h4>
                  <p className="text-xs text-muted-foreground capitalize">{l.lesson_type} · {l.xp_reward} XP · Order: {l.sort_order}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => startEdit(l)} className="p-2 rounded-lg hover:bg-secondary">
                    <Pencil className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button onClick={() => { if (confirm('Delete?')) deleteMutation.mutate(l.id); }} className="p-2 rounded-lg hover:bg-destructive/10">
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              </div>
            ))}
            {lessons?.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No lessons yet. Create one above.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Achievements ─── */
function AchievementsTab() {
  const queryClient = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({
    slug: '', title: '', description: '', icon: '🏆', xp_reward: 25, criteria: '{}',
  });

  const { data: achievements } = useQuery({
    queryKey: ['admin_achievements'],
    queryFn: async () => {
      const { data } = await supabase.from('achievements').select('*').order('xp_reward');
      return data || [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      let parsedCriteria;
      try { parsedCriteria = JSON.parse(form.criteria); } catch { throw new Error('Invalid JSON in criteria'); }
      const payload = { ...form, criteria: parsedCriteria };
      if (editing) {
        const { error } = await supabase.from('achievements').update(payload).eq('id', editing);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('achievements').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editing ? 'Achievement updated' : 'Achievement created');
      queryClient.invalidateQueries({ queryKey: ['admin_achievements'] });
      resetForm();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('achievements').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Deleted');
      queryClient.invalidateQueries({ queryKey: ['admin_achievements'] });
    },
  });

  const resetForm = () => {
    setEditing(null);
    setCreating(false);
    setForm({ slug: '', title: '', description: '', icon: '🏆', xp_reward: 25, criteria: '{}' });
  };

  const startEdit = (a: any) => {
    setEditing(a.id);
    setCreating(true);
    setForm({
      slug: a.slug, title: a.title, description: a.description,
      icon: a.icon, xp_reward: a.xp_reward, criteria: JSON.stringify(a.criteria, null, 2),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Achievements ({achievements?.length || 0})</h2>
        <Button onClick={() => { resetForm(); setCreating(true); }} className="gap-2">
          <Plus className="w-4 h-4" /> New Badge
        </Button>
      </div>

      <AnimatePresence>
        {creating && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="glass-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{editing ? 'Edit Badge' : 'New Badge'}</h3>
              <button onClick={resetForm}><X className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input placeholder="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
              <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <Input placeholder="Icon emoji" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
              <Input placeholder="XP Reward" type="number" value={form.xp_reward} onChange={(e) => setForm({ ...form, xp_reward: parseInt(e.target.value) || 0 })} />
            </div>
            <Input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <Textarea value={form.criteria} onChange={(e) => setForm({ ...form, criteria: e.target.value })} className="min-h-[80px] code-font text-xs" placeholder='{"type": "projects_completed", "count": 1}' />
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="gap-2">
              {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {editing ? 'Update' : 'Create'}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {achievements?.map((a) => (
          <div key={a.id} className="glass-card p-4 flex items-center gap-3">
            <span className="text-2xl">{a.icon}</span>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm">{a.title}</h4>
              <p className="text-xs text-muted-foreground truncate">{a.description}</p>
              <span className="text-xs text-primary font-mono">+{a.xp_reward} XP</span>
            </div>
            <div className="flex gap-1 shrink-0">
              <button onClick={() => startEdit(a)} className="p-2 rounded-lg hover:bg-secondary">
                <Pencil className="w-4 h-4 text-muted-foreground" />
              </button>
              <button onClick={() => { if (confirm('Delete?')) deleteMutation.mutate(a.id); }} className="p-2 rounded-lg hover:bg-destructive/10">
                <Trash2 className="w-4 h-4 text-destructive" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Users ─── */
function UsersTab() {
  const { data: users, isLoading } = useQuery({
    queryKey: ['admin_users'],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('xp', { ascending: false });
      return data || [];
    },
  });

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Users ({users?.length || 0})</h2>
      <div className="space-y-2">
        {users?.map((u, i) => (
          <div key={u.id} className="glass-card p-4 flex items-center gap-4">
            <span className="text-sm font-mono text-muted-foreground w-6 text-center">{i + 1}</span>
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
              {(u.display_name || '?')[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{u.display_name || 'Anonymous'}</p>
              <p className="text-xs text-muted-foreground">Level {u.level} · Joined {new Date(u.created_at).toLocaleDateString()}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-bold text-primary">{u.xp} XP</p>
              <p className="text-[10px] text-muted-foreground">{u.streak_days}d streak</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
