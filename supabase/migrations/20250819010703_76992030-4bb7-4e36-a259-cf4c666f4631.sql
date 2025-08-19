-- Enable public access to formulario_cepic table for form submissions
-- This allows anonymous users to submit the form

-- Create policy to allow anyone to insert new records
CREATE POLICY "Allow public form submissions" 
ON public.formulario_cepic 
FOR INSERT 
TO anon 
WITH CHECK (true);

-- Create policy to allow reading records (for admin purposes)
CREATE POLICY "Allow public read access" 
ON public.formulario_cepic 
FOR SELECT 
TO anon 
USING (true);