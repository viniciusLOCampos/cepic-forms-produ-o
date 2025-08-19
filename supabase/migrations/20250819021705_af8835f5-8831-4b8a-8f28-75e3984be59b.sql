-- Add RLS policies for UPDATE and DELETE operations on formulario_cepic table
-- These policies will allow all operations since this is an admin dashboard

CREATE POLICY "Allow admin to update records" 
ON public.formulario_cepic 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow admin to delete records" 
ON public.formulario_cepic 
FOR DELETE 
USING (true);