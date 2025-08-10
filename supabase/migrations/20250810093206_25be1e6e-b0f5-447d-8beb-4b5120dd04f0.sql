-- 1) Projects: add status and color
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','on_hold','completed','archived')),
  ADD COLUMN IF NOT EXISTS color text DEFAULT '#60A5FA';

-- Trigger to maintain updated_at on projects
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_projects_updated_at'
  ) THEN
    CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- 2) Workload tasks: align schema with UI needs
ALTER TABLE public.workload_tasks
  ADD COLUMN IF NOT EXISTS assignee_id uuid,
  ADD COLUMN IF NOT EXISTS hours_per_day integer NOT NULL DEFAULT 8,
  ADD COLUMN IF NOT EXISTS category text;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_workload_tasks_project_id ON public.workload_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_workload_tasks_assignee_id ON public.workload_tasks(assignee_id);

-- Trigger to maintain updated_at on workload_tasks
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_workload_tasks_updated_at'
  ) THEN
    CREATE TRIGGER update_workload_tasks_updated_at
    BEFORE UPDATE ON public.workload_tasks
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- 3) Secure workload_tasks with RLS and policies tied to project access
ALTER TABLE public.workload_tasks ENABLE ROW LEVEL SECURITY;

-- SELECT policy for project viewers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE polname = 'Project members can view workload tasks'
  ) THEN
    CREATE POLICY "Project members can view workload tasks"
    ON public.workload_tasks
    FOR SELECT
    USING (public.can_view_project(project_id, auth.uid()));
  END IF;
END $$;

-- INSERT policy for editors/admins
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE polname = 'Editors and admins can insert workload tasks'
  ) THEN
    CREATE POLICY "Editors and admins can insert workload tasks"
    ON public.workload_tasks
    FOR INSERT
    WITH CHECK (public.can_update_project(project_id, auth.uid()));
  END IF;
END $$;

-- UPDATE policy for editors/admins
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE polname = 'Editors and admins can update workload tasks'
  ) THEN
    CREATE POLICY "Editors and admins can update workload tasks"
    ON public.workload_tasks
    FOR UPDATE
    USING (public.can_update_project(project_id, auth.uid()))
    WITH CHECK (public.can_update_project(project_id, auth.uid()));
  END IF;
END $$;

-- DELETE policy for admins (reuse can_update_project which allows owners/admins)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE polname = 'Admins can delete workload tasks'
  ) THEN
    CREATE POLICY "Admins can delete workload tasks"
    ON public.workload_tasks
    FOR DELETE
    USING (public.can_update_project(project_id, auth.uid()));
  END IF;
END $$;
