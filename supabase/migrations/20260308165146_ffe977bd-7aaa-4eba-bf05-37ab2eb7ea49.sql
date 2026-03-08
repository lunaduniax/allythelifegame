
CREATE TABLE public.community_content (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  author text,
  description text,
  type text NOT NULL DEFAULT 'videos',
  url text,
  thumbnail_url text,
  duration text,
  featured boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.community_content ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view all community content (shared content)
CREATE POLICY "Authenticated users can view all community content"
  ON public.community_content
  FOR SELECT
  TO authenticated
  USING (true);

-- Users can add their own content
CREATE POLICY "Users can add their own content"
  ON public.community_content
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own content
CREATE POLICY "Users can update their own content"
  ON public.community_content
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can delete their own content
CREATE POLICY "Users can delete their own content"
  ON public.community_content
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
