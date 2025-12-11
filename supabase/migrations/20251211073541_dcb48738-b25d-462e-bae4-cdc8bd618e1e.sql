-- Fix: Improve delete_user function with better error handling and explicit auth check
CREATE OR REPLACE FUNCTION public.delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
BEGIN
  -- Get and validate current user
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Delete in transaction (already implicit in function)
  -- Delete user's todos first
  DELETE FROM public.todos WHERE user_id = current_user_id;
  
  -- Delete user's profile
  DELETE FROM public.profiles WHERE id = current_user_id;
  
  -- Delete the user account from auth.users
  DELETE FROM auth.users WHERE id = current_user_id;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Account deletion failed: %', SQLERRM;
END;
$$;