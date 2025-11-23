-- Add due_date column to todos table
ALTER TABLE public.todos 
ADD COLUMN due_date timestamp with time zone;

-- Add estimated_duration_minutes column for AI time estimation
ALTER TABLE public.todos 
ADD COLUMN estimated_duration_minutes integer;

-- Add tags column for AI-generated tags
ALTER TABLE public.todos 
ADD COLUMN tags text[];