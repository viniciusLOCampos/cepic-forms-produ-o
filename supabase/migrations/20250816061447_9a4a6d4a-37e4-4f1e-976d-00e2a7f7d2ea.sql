-- Fix function to use numero_registro instead of numero_sorteado
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