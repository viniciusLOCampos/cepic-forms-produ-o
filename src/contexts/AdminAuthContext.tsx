import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdminAuthContextType {
  isAuthenticated: boolean;
  adminLogin: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

export const AdminAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminLogin, setAdminLogin] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se há sessão salva
    const savedAuth = localStorage.getItem('admin_auth');
    if (savedAuth) {
      const { login, timestamp } = JSON.parse(savedAuth);
      // Verificar se a sessão não expirou (24 horas)
      if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
        setIsAuthenticated(true);
        setAdminLogin(login);
      } else {
        localStorage.removeItem('admin_auth');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('cepic_admin')
        .select('login')
        .eq('login', username)
        .eq('password', password)
        .single();

      if (error || !data) {
        return false;
      }

      setIsAuthenticated(true);
      setAdminLogin(username);
      
      // Salvar sessão no localStorage
      localStorage.setItem('admin_auth', JSON.stringify({
        login: username,
        timestamp: Date.now()
      }));

      return true;
    } catch (error) {
      console.error('Erro no login:', error);
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setAdminLogin(null);
    localStorage.removeItem('admin_auth');
  };

  return (
    <AdminAuthContext.Provider value={{
      isAuthenticated,
      adminLogin,
      login,
      logout,
      loading
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
};