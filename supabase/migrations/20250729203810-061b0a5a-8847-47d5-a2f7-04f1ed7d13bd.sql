-- Desabilitar RLS na tabela teste_mozao para permitir acesso público
ALTER TABLE public.teste_mozao DISABLE ROW LEVEL SECURITY;

-- Alternativamente, se quiser manter RLS, pode criar políticas públicas:
-- CREATE POLICY "Allow public read access" ON public.teste_mozao FOR SELECT USING (true);
-- CREATE POLICY "Allow public insert access" ON public.teste_mozao FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Allow public update access" ON public.teste_mozao FOR UPDATE USING (true);
-- CREATE POLICY "Allow public delete access" ON public.teste_mozao FOR DELETE USING (true);