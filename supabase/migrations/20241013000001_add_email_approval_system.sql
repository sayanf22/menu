-- Add approval status to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'approved' CHECK (approval_status IN ('pending', 'approved', 'rejected'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS approved_by TEXT;

-- Set existing users to approved
UPDATE public.profiles SET approval_status = 'approved', approved_at = NOW(), approved_by = 'migration' WHERE approval_status IS NULL;

-- Create approval tokens table for email-based approval
CREATE TABLE IF NOT EXISTS approval_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  action TEXT NOT NULL CHECK (action IN ('approve', 'reject')),
  used BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.approval_tokens ENABLE ROW LEVEL SECURITY;

-- Only service role can access approval tokens
CREATE POLICY "Service role can manage approval tokens"
  ON public.approval_tokens
  FOR ALL
  TO service_role
  USING (true);

-- Update RLS policies to check approval status
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id
  );

-- Add policy to restrict dashboard access for non-approved users
CREATE POLICY "Only approved users can update profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = id 
    AND (approval_status = 'approved' OR approval_status IS NULL)
  );

-- Function to check if user is approved
CREATE OR REPLACE FUNCTION is_user_approved(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id 
    AND approval_status = 'approved'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate approval token
CREATE OR REPLACE FUNCTION generate_approval_token(
  p_user_id UUID,
  p_action TEXT
)
RETURNS TEXT AS $$
DECLARE
  v_token TEXT;
BEGIN
  -- Generate random token
  v_token := encode(gen_random_bytes(32), 'base64');
  
  -- Insert token
  INSERT INTO approval_tokens (user_id, token, action)
  VALUES (p_user_id, v_token, p_action);
  
  RETURN v_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to process approval
CREATE OR REPLACE FUNCTION process_approval(
  p_token TEXT
)
RETURNS JSON AS $$
DECLARE
  v_token_record RECORD;
  v_result JSON;
BEGIN
  -- Get token details
  SELECT * INTO v_token_record
  FROM approval_tokens
  WHERE token = p_token
  AND used = FALSE
  AND expires_at > NOW();
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Invalid or expired token'
    );
  END IF;
  
  -- Update profile based on action
  IF v_token_record.action = 'approve' THEN
    UPDATE profiles
    SET 
      approval_status = 'approved',
      approved_at = NOW(),
      approved_by = 'admin'
    WHERE id = v_token_record.user_id;
  ELSE
    UPDATE profiles
    SET 
      approval_status = 'rejected',
      approved_at = NOW(),
      approved_by = 'admin'
    WHERE id = v_token_record.user_id;
  END IF;
  
  -- Mark token as used
  UPDATE approval_tokens
  SET used = TRUE
  WHERE token = p_token;
  
  RETURN json_build_object(
    'success', true,
    'action', v_token_record.action,
    'user_id', v_token_record.user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remove signup codes table (no longer needed)
-- DROP TABLE IF EXISTS signup_codes CASCADE;

-- Comment: Keep signup_codes for now as backup, can remove later
