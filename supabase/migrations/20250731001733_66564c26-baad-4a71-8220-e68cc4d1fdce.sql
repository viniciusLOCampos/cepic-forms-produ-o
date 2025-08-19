-- Corrigir função get_next_numero_sorteio com search_path seguro
CREATE OR REPLACE FUNCTION public.get_next_numero_sorteio()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
    next_numero INTEGER;
BEGIN
    SELECT COALESCE(MAX(numero_sorteado), 0) + 1 
    INTO next_numero 
    FROM public.formulario_cepic;
    
    RETURN next_numero;
END;
$function$;

-- Corrigir função is_admin_authenticated com search_path seguro
CREATE OR REPLACE FUNCTION public.is_admin_authenticated(session_token text, admin_login text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Verifica se existe um admin com esse login
  RETURN EXISTS (
    SELECT 1 FROM public.cepic_admin 
    WHERE login = admin_login
  );
END;
$$;