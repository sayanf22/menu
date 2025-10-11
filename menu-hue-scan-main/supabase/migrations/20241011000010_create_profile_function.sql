-- Create a function to handle profile creation with proper error handling
CREATE OR REPLACE FUNCTION public.create_user_profile(
  user_id UUID,
  restaurant_name TEXT,
  restaurant_description TEXT DEFAULT ''
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result JSON;
BEGIN
  -- Check if profile already exists
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = user_id) THEN
    -- Update existing profile
    UPDATE public.profiles 
    SET 
      restaurant_name = create_user_profile.restaurant_name,
      restaurant_description = create_user_profile.restaurant_description,
      updated_at = NOW()
    WHERE id = user_id;
    
    result := json_build_object('success', true, 'message', 'Profile updated successfully');
  ELSE
    -- Create new profile
    INSERT INTO public.profiles (id, restaurant_name, restaurant_description)
    VALUES (user_id, restaurant_name, restaurant_description);
    
    result := json_build_object('success', true, 'message', 'Profile created successfully');
  END IF;
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false, 
      'error', SQLERRM,
      'error_code', SQLSTATE
    );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_user_profile(UUID, TEXT, TEXT) TO authenticated;