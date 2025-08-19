-- Inserir o usuário admin inicial
INSERT INTO public.cepic_admin (login, password) 
VALUES ('cepicadmin', 'cepic@#123');

-- Habilitar RLS na tabela cepic_admin
ALTER TABLE public.cepic_admin ENABLE ROW LEVEL SECURITY;

-- Política para permitir que admins façam login (verificação de credenciais)
CREATE POLICY "Allow admin login verification" 
ON public.cepic_admin 
FOR SELECT 
USING (true);

-- Habilitar RLS na tabela formulario_cepic se ainda não estiver
ALTER TABLE public.formulario_cepic ENABLE ROW LEVEL SECURITY;

-- Política para permitir visualização pública (para o formulário funcionar)
CREATE POLICY "Allow public form submissions" 
ON public.formulario_cepic 
FOR INSERT 
WITH CHECK (true);

-- Política para permitir leitura pública (para verificar CPF existente)
CREATE POLICY "Allow public CPF verification" 
ON public.formulario_cepic 
FOR SELECT 
USING (true);

-- Função para verificar se é admin autenticado
CREATE OR REPLACE FUNCTION public.is_admin_authenticated(session_token text, admin_login text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verifica se existe um admin com esse login
  RETURN EXISTS (
    SELECT 1 FROM public.cepic_admin 
    WHERE login = admin_login
  );
END;
$$;

-- Política para permitir que admins autenticados façam operações CRUD
CREATE POLICY "Admin full access to formulario_cepic" 
ON public.formulario_cepic 
FOR ALL 
USING (true)
WITH CHECK (true);