-- Harden function search_path per security linter
ALTER FUNCTION public.get_next_numero_sorteio() SET search_path = public;