-- Ensure columns exist on projects
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS color text DEFAULT '#60A5FA';

-- Ensure columns exist on workload_tasks
ALTER TABLE public.workload_tasks
  ADD COLUMN IF NOT EXISTS assignee_id uuid,
  ADD COLUMN IF NOT EXISTS hours_per_day integer NOT NULL DEFAULT 8,
  ADD COLUMN IF NOT EXISTS category text;

-- Ensure RLS is enabled on workload_tasks
ALTER TABLE public.workload_tasks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'workload_tasks' AND policyname = 'Project members can view workload tasks'
  ) THEN
    CREATE POLICY "Project members can view workload tasks" 
    ON public.workload_tasks
    FOR SELECT
    USING (can_view_project(project_id, auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'workload_tasks' AND policyname = 'Editors and admins can insert workload tasks'
  ) THEN
    CREATE POLICY "Editors and admins can insert workload tasks" 
    ON public.workload_tasks
    FOR INSERT
    WITH CHECK (can_update_project(project_id, auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'workload_tasks' AND policyname = 'Editors and admins can update workload tasks'
  ) THEN
    CREATE POLICY "Editors and admins can update workload tasks" 
    ON public.workload_tasks
    FOR UPDATE
    USING (can_update_project(project_id, auth.uid()))
    WITH CHECK (can_update_project(project_id, auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'workload_tasks' AND policyname = 'Admins can delete workload tasks'
  ) THEN
    CREATE POLICY "Admins can delete workload tasks" 
    ON public.workload_tasks
    FOR DELETE
    USING (can_update_project(project_id, auth.uid()));
  END IF;
END$$;