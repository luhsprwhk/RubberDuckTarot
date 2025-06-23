-- Rename readings table to insights
ALTER TABLE public.readings RENAME TO insights;

-- Update RLS policies to reference the new table name
DROP POLICY IF EXISTS "Users can view their own readings" ON public.insights;
DROP POLICY IF EXISTS "Users can insert their own readings" ON public.insights;
DROP POLICY IF EXISTS "Users can update their own readings" ON public.insights;
DROP POLICY IF EXISTS "Allow anonymous readings" ON public.insights;

-- Recreate policies with new names
CREATE POLICY "Users can view their own insights" ON public.insights
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own insights" ON public.insights
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own insights" ON public.insights
  FOR UPDATE USING (auth.uid()::text = user_id);

-- Allow anonymous insights (where user_id is null)
CREATE POLICY "Allow anonymous insights" ON public.insights
  FOR ALL USING (user_id is null);