import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import api from '../lib/api';

interface Tenant {
  _id: string;
  nombre: string;
  slug: string;
  email: string;
  plan: string;
  foto: string;
  bio: string;
  zona: string;
  estiloVenta: string;
  tipoPropiedadPrincipal: string;
  configuracion: {
    colorPrimario: string;
    colorSecundario: string;
    frase: string;
  };
}

interface AuthContextType {
  tenant: Tenant | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedTenant = localStorage.getItem('tenant');

    if (storedToken && storedTenant) {
      setToken(storedToken);
      setTenant(JSON.parse(storedTenant));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    setToken(data.token);
    setTenant(data);
    localStorage.setItem('token', data.token);
    localStorage.setItem('tenant', JSON.stringify(data));
  };

  const logout = () => {
    setToken(null);
    setTenant(null);
    localStorage.removeItem('token');
    localStorage.removeItem('tenant');
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{
      tenant,
      token,
      loading,
      login,
      logout,
      isAuthenticated: !!token
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
};