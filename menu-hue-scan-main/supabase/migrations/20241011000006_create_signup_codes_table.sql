-- Create signup_codes table for controlled registration
CREATE TABLE public.signup_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  is_used BOOLEAN DEFAULT false,
  used_by UUID REFERENCES auth.users(id),
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (id),
  CONSTRAINT code_length CHECK (LENGTH(code) = 12)
);

-- Enable RLS
ALTER TABLE public.signup_codes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for signup_codes (very restrictive - service role only)
CREATE POLICY "Service role only can read signup codes"
ON public.signup_codes
FOR SELECT
USING (false);

CREATE POLICY "Service role can update signup codes"
ON public.signup_codes
FOR UPDATE
USING (false);

-- Insert some initial signup codes
INSERT INTO public.signup_codes (code) VALUES 
('8119811655SS'),
('9876543210AB'),
('1234567890CD'),
('5555666677EF'),
('9999888877GH');