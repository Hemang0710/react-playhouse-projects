
-- Fix restrictive SELECT policies to PERMISSIVE

-- achievements
DROP POLICY IF EXISTS "Achievements viewable by everyone" ON public.achievements;
CREATE POLICY "Achievements viewable by everyone" ON public.achievements FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage achievements" ON public.achievements;
CREATE POLICY "Admins can manage achievements for insert" ON public.achievements FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage achievements for update" ON public.achievements FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage achievements for delete" ON public.achievements FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- profiles
DROP POLICY IF EXISTS "Profiles viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles viewable by everyone" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- projects
DROP POLICY IF EXISTS "Published projects viewable by everyone" ON public.projects;
CREATE POLICY "Published projects viewable by everyone" ON public.projects FOR SELECT USING (is_published = true OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can insert projects" ON public.projects;
CREATE POLICY "Admins can insert projects" ON public.projects FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update projects" ON public.projects;
CREATE POLICY "Admins can update projects" ON public.projects FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete projects" ON public.projects;
CREATE POLICY "Admins can delete projects" ON public.projects FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- lessons
DROP POLICY IF EXISTS "Lessons viewable by authenticated users" ON public.lessons;
CREATE POLICY "Lessons viewable by all" ON public.lessons FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can insert lessons" ON public.lessons;
CREATE POLICY "Admins can insert lessons" ON public.lessons FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update lessons" ON public.lessons;
CREATE POLICY "Admins can update lessons" ON public.lessons FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete lessons" ON public.lessons;
CREATE POLICY "Admins can delete lessons" ON public.lessons FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- user_progress
DROP POLICY IF EXISTS "Users can view own progress" ON public.user_progress;
CREATE POLICY "Users can view own progress" ON public.user_progress FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own progress" ON public.user_progress;
CREATE POLICY "Users can insert own progress" ON public.user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own progress" ON public.user_progress;
CREATE POLICY "Users can update own progress" ON public.user_progress FOR UPDATE USING (auth.uid() = user_id);

-- user_achievements
DROP POLICY IF EXISTS "Users can view own achievements" ON public.user_achievements;
DROP POLICY IF EXISTS "Anyone can view achievements for leaderboard" ON public.user_achievements;
DROP POLICY IF EXISTS "Users can earn achievements" ON public.user_achievements;

CREATE POLICY "Anyone can view earned achievements" ON public.user_achievements FOR SELECT USING (true);
CREATE POLICY "Users can earn achievements" ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- user_roles
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
