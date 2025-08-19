-- Ensure function exists and is callable by anon/authenticated
CREATE OR REPLACE FUNCTION public.get_next_numero_sorteio()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
    next_numero INTEGER;
BEGIN
    SELECT COALESCE(MAX(numero_registro), 0) + 1
    INTO next_numero
    FROM public.formulario_cepic;
    RETURN next_numero;
END;
$function$;

-- Grant execute to REST roles
GRANT EXECUTE ON FUNCTION public.get_next_numero_sorteio() TO anon, authenticated;

-- Ensure RLS and permissive policies for public form usage
ALTER TABLE public.formulario_cepic ENABLE ROW LEVEL SECURITY;

-- Reset policies to known good state
DROP POLICY IF EXISTS "Allow public CPF verification" ON public.formulario_cepic;
DROP POLICY IF EXISTS "Allow public form submissions" ON public.formulario_cepic;
DROP POLICY IF EXISTS "Admin full access to formulario_cepic" ON public.formulario_cepic;

-- Allow public read (for cpf checks and success page last registro)
CREATE POLICY "Allow public CPF verification" 
ON public.formulario_cepic 
FOR SELECT 
USING (true);

-- Allow public inserts
CREATE POLICY "Allow public form submissions" 
ON public.formulario_cepic 
FOR INSERT 
WITH CHECK (true);

-- Optional: keep an admin catch-all (still permissive for now)
CREATE POLICY "Admin full access to formulario_cepic" 
ON public.formulario_cepic 
FOR ALL 
USING (true) 
WITH CHECK (true);
