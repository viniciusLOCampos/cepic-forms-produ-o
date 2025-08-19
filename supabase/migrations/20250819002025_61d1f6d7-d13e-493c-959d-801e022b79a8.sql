-- Criar função para gerar próximo número de sorteio
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

-- Habilitar RLS na tabela formulario_cepic
ALTER TABLE public.formulario_cepic ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir verificação pública de CPF
CREATE POLICY "Allow public CPF verification" 
ON public.formulario_cepic 
FOR SELECT 
USING (true);

-- Criar política para permitir inserções públicas no formulário
CREATE POLICY "Allow public form submissions" 
ON public.formulario_cepic 
FOR INSERT 
WITH CHECK (true);

-- Criar política para acesso completo de admin
CREATE POLICY "Admin full access to formulario_cepic" 
ON public.formulario_cepic 
FOR ALL 
USING (true) 
WITH CHECK (true);