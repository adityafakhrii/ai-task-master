-- Migration: Add database indexes to public.todos for scalability
-- Create index for user_id to optimize filtering todos by authenticated user
CREATE INDEX IF NOT EXISTS idx_todos_user_id ON public.todos(user_id);

-- Create index for due_date (partial index for uncompleted tasks) to optimize sorting and filtering overdue tasks
CREATE INDEX IF NOT EXISTS idx_todos_due_date ON public.todos(due_date) WHERE completed = false;
