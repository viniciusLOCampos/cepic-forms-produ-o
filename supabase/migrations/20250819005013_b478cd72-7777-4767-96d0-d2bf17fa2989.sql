-- Create function to get next lottery number
CREATE OR REPLACE FUNCTION get_next_numero_sorteio()
RETURNS INTEGER AS $$
DECLARE
    next_number INTEGER;
BEGIN
    -- Get the maximum numero_registro and add 1
    SELECT COALESCE(MAX(numero_registro), 0) + 1 
    INTO next_number 
    FROM formulario_cepic;
    
    RETURN next_number;
END;
$$ LANGUAGE plpgsql;