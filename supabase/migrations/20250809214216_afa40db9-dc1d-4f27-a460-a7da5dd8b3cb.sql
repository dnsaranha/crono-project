-- Add optional categorization fields for Roadmap and Workload
-- Tasks: category and special marker for roadmap tagging
ALTER TABLE public.tasks 
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS special_marker text;

-- Projects: category for strategic grouping (start_date and end_date already exist)
ALTER TABLE public.projects 
  ADD COLUMN IF NOT EXISTS category text;

-- Enable realtime updates for tasks and projects
ALTER TABLE public.tasks REPLICA IDENTITY FULL;
ALTER TABLE public.projects REPLICA IDENTITY FULL;

DO $$
BEGIN
  -- Add tables to supabase_realtime publication if not already present
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'tasks'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'projects'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
  END IF;
END $$;