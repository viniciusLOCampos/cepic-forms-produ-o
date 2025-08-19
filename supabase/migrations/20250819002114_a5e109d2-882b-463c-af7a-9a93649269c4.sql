-- Criar políticas RLS para formulario_cepic
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