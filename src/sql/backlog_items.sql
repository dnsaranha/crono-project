
-- Create enum for backlog item status
CREATE TYPE public.backlog_status AS ENUM (
  'pending',
  'in_progress',
  'done',
  'converted'
);

-- Create table for backlog items
CREATE TABLE public.backlog_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  priority INTEGER DEFAULT 3,
  status backlog_status DEFAULT 'pending',
  target_project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add RLS policies
ALTER TABLE public.backlog_items ENABLE ROW LEVEL SECURITY;

-- Anyone can view backlog items they created 
CREATE POLICY "Users can view their own backlog items"
  ON public.backlog_items
  FOR SELECT
  USING (auth.uid() = creator_id);

-- Users can insert their own backlog items
CREATE POLICY "Users can insert their own backlog items"
  ON public.backlog_items
  FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

-- Users can update their own backlog items
CREATE POLICY "Users can update their own backlog items"
  ON public.backlog_items
  FOR UPDATE
  USING (auth.uid() = creator_id);

-- Users can delete their own backlog items
CREATE POLICY "Users can delete their own backlog items"
  ON public.backlog_items
  FOR DELETE
  USING (auth.uid() = creator_id);

-- Project members can view backlog items for projects they're members of
CREATE POLICY "Project members can view related backlog items"
  ON public.backlog_items
  FOR SELECT
  USING (
    target_project_id IS NOT NULL AND 
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_id = target_project_id
      AND user_id = auth.uid()
    )
  );

-- Add created_at trigger
CREATE TRIGGER set_backlog_items_updated_at
BEFORE UPDATE ON public.backlog_items
FOR EACH ROW
EXECUTE FUNCTION public.moddatetime(updated_at);
