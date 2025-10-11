-- Create social_links table
CREATE TABLE public.social_links (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL,
  facebook TEXT,
  instagram TEXT,
  twitter TEXT,
  youtube TEXT,
  whatsapp TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (id)
);

-- Enable RLS
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;

-- RLS Policies for social_links
CREATE POLICY "Restaurant owners can view their social links"
ON public.social_links
FOR SELECT
USING (auth.uid() = restaurant_id);

CREATE POLICY "Restaurant owners can manage their social links"
ON public.social_links
FOR ALL
USING (auth.uid() = restaurant_id);

CREATE POLICY "Public can view social links"
ON public.social_links
FOR SELECT
USING (true);

-- Trigger for social_links table
CREATE TRIGGER update_social_links_updated_at
BEFORE UPDATE ON public.social_links
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();