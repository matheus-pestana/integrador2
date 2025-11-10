'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { type User } from '@/types/ai-types';
import { getMe } from '@/lib/actions';
import { Loader2 } from 'lucide-react';

type AuthContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Ao carregar o provedor (layout da aplicação), busca os dados do usuário
    const fetchUser = async () => {
      setIsLoading(true);
      const userData = await getMe();
      setUser(userData);
      setIsLoading(false);
    };
    fetchUser();
  }, []);

  if (isLoading) {
    return (
        <div className="flex h-svh w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}