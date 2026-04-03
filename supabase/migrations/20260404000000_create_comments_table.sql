-- Create Comments Table
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id UUID REFERENCES public.places(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public comments are viewable by everyone." 
ON public.comments FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can post comments." 
ON public.comments FOR INSERT 
WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "Users can delete own comments." 
ON public.comments FOR DELETE 
USING (auth.uid() = user_id);

-- Add index for performance
CREATE INDEX IF NOT EXISTS comments_place_id_idx ON public.comments (place_id);
