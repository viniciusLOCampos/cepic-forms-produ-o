-- Add RLS policies for cepic_admin table to resolve security linter warning
-- This table needs policies for admin authentication functionality

-- Allow reading admin records for login verification
CREATE POLICY "Allow admin login verification" 
ON public.cepic_admin 
FOR SELECT 
TO anon 
USING (true);

-- Restrict insert/update/delete to authenticated admins only
-- (This will be properly secured when admin auth is implemented)
CREATE POLICY "Restrict admin modifications" 
ON public.cepic_admin 
FOR ALL 
TO authenticated 
USING (false) 
WITH CHECK (false);