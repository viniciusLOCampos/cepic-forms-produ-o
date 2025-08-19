export const validateCPF = (cpf: string): boolean => {
  if (!cpf) return false;
  
  // Remove caracteres não numéricos
  const cleanCPF = cpf.replace(/\D/g, '');
  
  // Verifica se tem 11 dígitos
  if (cleanCPF.length !== 11) {
    return false;
  }
  
  // Verifica se todos os dígitos são iguais (CPFs inválidos conhecidos)
  const invalidCPFs = [
    '00000000000', '11111111111', '22222222222', '33333333333',
    '44444444444', '55555555555', '66666666666', '77777777777',
    '88888888888', '99999999999'
  ];
  
  if (invalidCPFs.includes(cleanCPF)) {
    return false;
  }
  
  // Cálculo do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF[i]) * (10 - i);
  }
  
  let remainder = sum % 11;
  let digit1 = remainder < 2 ? 0 : 11 - remainder;
  
  // Verifica o primeiro dígito
  if (parseInt(cleanCPF[9]) !== digit1) {
    return false;
  }
  
  // Cálculo do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF[i]) * (11 - i);
  }
  
  remainder = sum % 11;
  let digit2 = remainder < 2 ? 0 : 11 - remainder;
  
  // Verifica o segundo dígito
  return parseInt(cleanCPF[10]) === digit2;
};

export const formatCPF = (cpf: string): string => {
  const cleanCPF = cpf.replace(/\D/g, '');
  return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

export const formatPhone = (phone: string): string => {
  const cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.length <= 10) {
    return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
};

export const validatePhone = (phone: string): boolean => {
  const cleanPhone = phone.replace(/\D/g, '');
  // Valida formato brasileiro: DDD + número (10 ou 11 dígitos)
  return /^[1-9][1-9]\d{8,9}$/.test(cleanPhone);
};

export const validateEmail = (email: string): boolean => {
  // Validação customizada - deve ter @ e terminar com .alguma_coisa
  const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/i;
  return emailRegex.test(email);
};

import { supabase } from "@/integrations/supabase/client";

// Função para verificar se CPF já existe na tabela formulario_cepic
export const checkCPFExists = async (cpf: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('formulario_cepic')
      .select('id')
      .eq('cpf', parseInt(cpf))
      .maybeSingle();
    
    if (error) {
      console.error('Erro ao verificar CPF:', error);
      return false;
    }
    
    return data !== null;
  } catch (error) {
    console.error('Erro ao verificar CPF:', error);
    return false;
  }
};

// Função para gerar próximo número de sorteio
export const getNextNumeroSorteio = async (): Promise<number> => {
  try {
    const { data, error } = await supabase
      .rpc('get_next_numero_sorteio');
    
    if (error) {
      console.error('Erro ao gerar número de sorteio:', error);
      return 1;
    }
    
    return data || 1;
  } catch (error) {
    console.error('Erro ao gerar número de sorteio:', error);
    return 1;
  }
};