
CREATE TABLE public.feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  message text NOT NULL,
  rating int,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit feedback"
  ON public.feedback FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(name) BETWEEN 1 AND 80
    AND char_length(message) BETWEEN 1 AND 1000
    AND (rating IS NULL OR rating BETWEEN 1 AND 5)
  );

CREATE POLICY "Authenticated can read feedback"
  ON public.feedback FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated can update feedback"
  ON public.feedback FOR UPDATE
  TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated can delete feedback"
  ON public.feedback FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX feedback_created_at_idx ON public.feedback (created_at DESC);
