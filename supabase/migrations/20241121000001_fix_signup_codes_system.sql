-- Migration to fix signup codes system and add admin functions
-- This migration updates the signup_codes table to support multi-use codes
-- and creates admin RPC functions for managing codes

-- Step 1: Update signup_codes table structure
ALTER TABLE public.signup_codes 
  DROP COLUMN IF EXISTS is_used,
  DROP COLUMN IF EXISTS used_by,
  DROP COLUMN IF EXISTS used_at,
  DROP CONSTRAINT IF EXISTS code_length;

-- Add new columns for multi-use support
ALTER TABLE public.signup_codes 
  ADD COLUMN IF NOT EXISTS max_uses INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS current_uses INTEGER DEFAULT 0;

-- Update existing codes to have proper values
UPDATE public.signup_codes 
SET max_uses = 1, current_uses = 0 
WHERE max_uses IS NULL;

-- Add constraints
ALTER TABLE public.signup_codes 
  ADD CONSTRAINT max_uses_positive CHECK (max_uses > 0),
  ADD CONSTRAINT current_uses_non_negative CHECK (current_uses >= 0),
  ADD CONSTRAINT current_uses_not_exceed_max CHECK (current_uses <= max_uses);

-- Step 2: Create admin RPC functions

-- Function to get all signup codes (admin only)
CREATE OR REPLACE FUNCTION admin_get_signup_codes()
RETURNS TABLE (
  id UUID,
  code TEXT,
  max_uses INTEGER,
  current_uses INTEGER,
  created_at TIMESTAMPTZ
) 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- This function bypasses RLS and should only be called by authenticated admins
  -- The admin dashboard should verify admin status before calling
  RETURN QUERY
  SELECT 
    sc.id,
    sc.code,
    sc.max_uses,
    sc.current_uses,
    sc.created_at
  FROM public.signup_codes sc
  ORDER BY sc.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to create a new signup code (admin only)
CREATE OR REPLACE FUNCTION admin_create_signup_code(
  code_value TEXT,
  max_uses_value INTEGER DEFAULT 1
)
RETURNS JSON
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code_id UUID;
BEGIN
  -- Validate inputs
  IF code_value IS NULL OR LENGTH(code_value) < 6 THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Code must be at least 6 characters'
    );
  END IF;

  IF max_uses_value < 1 THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Max uses must be at least 1'
    );
  END IF;

  -- Check if code already exists
  IF EXISTS (SELECT 1 FROM public.signup_codes WHERE code = code_value) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Code already exists'
    );
  END IF;

  -- Insert new code
  INSERT INTO public.signup_codes (code, max_uses, current_uses)
  VALUES (code_value, max_uses_value, 0)
  RETURNING id INTO new_code_id;

  RETURN json_build_object(
    'success', true,
    'id', new_code_id,
    'code', code_value
  );
END;
$$ LANGUAGE plpgsql;

-- Function to delete a signup code (admin only)
CREATE OR REPLACE FUNCTION admin_delete_signup_code(
  code_id UUID
)
RETURNS JSON
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if code exists
  IF NOT EXISTS (SELECT 1 FROM public.signup_codes WHERE id = code_id) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Code not found'
    );
  END IF;

  -- Delete the code
  DELETE FROM public.signup_codes WHERE id = code_id;

  RETURN json_build_object(
    'success', true
  );
END;
$$ LANGUAGE plpgsql;

-- Function to update profile status (admin only)
CREATE OR REPLACE FUNCTION admin_update_profile_status(
  profile_id UUID,
  is_disabled_value BOOLEAN,
  disabled_by_email TEXT DEFAULT NULL
)
RETURNS JSON
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if profile exists
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = profile_id) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Profile not found'
    );
  END IF;

  -- Update profile
  UPDATE public.profiles
  SET 
    is_disabled = is_disabled_value,
    disabled_at = CASE WHEN is_disabled_value THEN NOW() ELSE NULL END,
    disabled_by = disabled_by_email
  WHERE id = profile_id;

  RETURN json_build_object(
    'success', true
  );
END;
$$ LANGUAGE plpgsql;

-- Step 3: Create function to validate and use signup codes
CREATE OR REPLACE FUNCTION use_signup_code(
  code_value TEXT
)
RETURNS JSON
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  code_record RECORD;
BEGIN
  -- Get code details with row lock
  SELECT * INTO code_record
  FROM public.signup_codes
  WHERE code = code_value
  FOR UPDATE;

  -- Check if code exists
  IF NOT FOUND THEN
    RETURN json_build_object(
      'valid', false,
      'error', 'Invalid signup code'
    );
  END IF;

  -- Check if code has uses remaining
  IF code_record.current_uses >= code_record.max_uses THEN
    RETURN json_build_object(
      'valid', false,
      'error', 'Signup code has been fully used'
    );
  END IF;

  -- Increment usage count
  UPDATE public.signup_codes
  SET current_uses = current_uses + 1
  WHERE code = code_value;

  RETURN json_build_object(
    'valid', true,
    'remaining_uses', code_record.max_uses - code_record.current_uses - 1
  );
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions to authenticated users for use_signup_code
GRANT EXECUTE ON FUNCTION use_signup_code(TEXT) TO anon, authenticated;

-- Grant execute permissions to service_role for admin functions
GRANT EXECUTE ON FUNCTION admin_get_signup_codes() TO service_role;
GRANT EXECUTE ON FUNCTION admin_create_signup_code(TEXT, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION admin_delete_signup_code(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION admin_update_profile_status(UUID, BOOLEAN, TEXT) TO service_role;

-- Add comment
COMMENT ON FUNCTION admin_get_signup_codes() IS 'Admin function to retrieve all signup codes';
COMMENT ON FUNCTION admin_create_signup_code(TEXT, INTEGER) IS 'Admin function to create new signup codes with custom use limits';
COMMENT ON FUNCTION admin_delete_signup_code(UUID) IS 'Admin function to delete signup codes';
COMMENT ON FUNCTION admin_update_profile_status(UUID, BOOLEAN, TEXT) IS 'Admin function to enable/disable user profiles';
COMMENT ON FUNCTION use_signup_code(TEXT) IS 'Public function to validate and use a signup code during registration';


-- Step 4: Create function to get profiles with emails for admin dashboard
CREATE OR REPLACE FUNCTION admin_get_profiles()
RETURNS TABLE (
  id UUID,
  email VARCHAR(255),
  restaurant_name TEXT,
  restaurant_description TEXT,
  created_at TIMESTAMPTZ,
  is_disabled BOOLEAN,
  disabled_at TIMESTAMPTZ,
  approval_status TEXT
)
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    u.email::VARCHAR(255),
    p.restaurant_name,
    p.restaurant_description,
    p.created_at,
    p.is_disabled,
    p.disabled_at,
    p.approval_status
  FROM public.profiles p
  LEFT JOIN auth.users u ON p.id = u.id
  ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to service_role
GRANT EXECUTE ON FUNCTION admin_get_profiles() TO service_role;

COMMENT ON FUNCTION admin_get_profiles() IS 'Admin function to retrieve all profiles with user emails';
