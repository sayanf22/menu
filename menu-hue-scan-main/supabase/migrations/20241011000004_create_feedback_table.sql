-- Create feedback table with anti-spam protection
CREATE TABLE public.feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL,
  customer_name TEXT,
  rating INTEGER NOT NULL,
  comment TEXT,
  customer_ip TEXT,
  device_fingerprint TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (id)
);

-- Enable RLS
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies for feedback
CREATE POLICY "Restaurant owners can view their feedback"
ON public.feedback
FOR SELECT
USING (auth.uid() = restaurant_id);

CREATE POLICY "Validated feedback submission with restrictions"
ON public.feedback
FOR INSERT
WITH CHECK (
  -- Restaurant must exist
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = feedback.restaurant_id
  )
  AND
  -- No duplicate feedback from same IP/device within 7 days
  NOT EXISTS (
    SELECT 1 FROM public.feedback f
    WHERE f.restaurant_id = feedback.restaurant_id
      AND (
        (f.customer_ip IS NOT NULL AND f.customer_ip = feedback.customer_ip)
        OR
        (f.device_fingerprint IS NOT NULL AND f.device_fingerprint = feedback.device_fingerprint)
      )
      AND f.created_at > (now() - INTERVAL '7 days')
  )
);