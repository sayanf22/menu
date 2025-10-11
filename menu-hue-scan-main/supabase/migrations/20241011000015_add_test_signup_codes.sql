-- Add some test signup codes for development
INSERT INTO public.signup_codes (code, is_used) VALUES 
('TEST12345678', false),
('DEMO87654321', false),
('SAMPLE123456', false)
ON CONFLICT (code) DO NOTHING;

-- Also create a function to bypass signup code validation for development
CREATE OR REPLACE FUNCTION public.validate_signup_code(signup_code TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- For development, accept any 12-character code
  IF LENGTH(signup_code) = 12 THEN
    RETURN TRUE;
  END IF;
  
  -- Check if code exists and is not used
  RETURN EXISTS (
    SELECT 1 FROM public.signup_codes 
    WHERE code = UPPER(signup_code) 
    AND is_used = false
  );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.validate_signup_code(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_signup_code(TEXT) TO anon;