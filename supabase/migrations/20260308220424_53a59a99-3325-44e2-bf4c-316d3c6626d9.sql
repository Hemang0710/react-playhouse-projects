
DROP POLICY IF EXISTS "Lessons viewable by all" ON public.lessons;
CREATE POLICY "Lessons viewable by all" ON public.lessons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE id = lessons.project_id AND is_published = true
    ) OR has_role(auth.uid(), 'admin'::app_role)
  );
