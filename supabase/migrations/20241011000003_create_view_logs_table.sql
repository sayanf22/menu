-- Create view_logs table for analytics
CREATE TABLE public.view_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (id)
);

-- Enable RLS
ALTER TABLE public.view_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for view_logs
CREATE POLICY "Restaurant owners can view their logs"
ON public.view_logs
FOR SELECT
USING (auth.uid() = restaurant_id);

CREATE POLICY "Anyone can insert view logs for existing restaurants"
ON public.view_logs
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = view_logs.restaurant_id
  )
);