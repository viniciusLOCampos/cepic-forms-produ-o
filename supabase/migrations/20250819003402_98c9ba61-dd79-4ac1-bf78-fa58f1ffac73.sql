-- Recreate function in public schema and ensure exposure
CREATE OR REPLACE FUNCTION public.get_next_numero_sorteio()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
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

-- Permissions for REST roles
GRANT EXECUTE ON FUNCTION public.get_next_numero_sorteio() TO anon, authenticated;

-- Ensure RLS and permissive policies for public form usage
ALTER TABLE public.formulario_cepic ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public CPF verification" ON public.formulario_cepic;
DROP POLICY IF EXISTS "Allow public form submissions" ON public.formulario_cepic;
DROP POLICY IF EXISTS "Admin full access to formulario_cepic" ON public.formulario_cepic;

CREATE POLICY "Allow public CPF verification"
ON public.formulario_cepic
FOR SELECT
USING (true);

CREATE POLICY "Allow public form submissions"
ON public.formulario_cepic
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admin full access to formulario_cepic"
ON public.formulario_cepic
FOR ALL
USING (true)
WITH CHECK (true);

-- Force PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';