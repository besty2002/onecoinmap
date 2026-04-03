-- Create Comments Table
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id UUID REFERENCES public.places(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL, -- auth.users 대신 profiles 참조
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- 1. 기존 정책 삭제 (재시도 시 에러 방지)
DROP POLICY IF EXISTS "Public comments are viewable by everyone." ON public.comments;
DROP POLICY IF EXISTS "Authenticated users can post comments." ON public.comments;
DROP POLICY IF EXISTS "Users can delete own comments." ON public.comments;

-- 2. 신규 정책 생성
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
