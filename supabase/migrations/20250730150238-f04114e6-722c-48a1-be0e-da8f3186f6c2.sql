-- Renomear tabela teste_mozao para formulario_cepic
ALTER TABLE public.teste_mozao RENAME TO formulario_cepic;

-- Adicionar coluna numero_sorteado se não existir
ALTER TABLE public.formulario_cepic 
ADD COLUMN IF NOT EXISTS numero_sorteado INTEGER;

-- Criar função para gerar próximo número de sorteio
CREATE OR REPLACE FUNCTION get_next_numero_sorteio()
RETURNS INTEGER AS $$
DECLARE
    next_numero INTEGER;
BEGIN
    SELECT COALESCE(MAX(numero_sorteado), 0) + 1 
    INTO next_numero 
    FROM public.formulario_cepic;
    
    RETURN next_numero;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;