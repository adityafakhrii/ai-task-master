-- Create function to delete user account and all associated data
CREATE OR REPLACE FUNCTION public.delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete user's todos
  DELETE FROM public.todos WHERE user_id = auth.uid();
  
  -- Delete user's profile
  DELETE FROM public.profiles WHERE id = auth.uid();
  
  -- Delete the user account
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;