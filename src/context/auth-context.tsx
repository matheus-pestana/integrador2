'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { type User } from '@/types/ai-types';
import { getMe } from '@/lib/actions';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

type AuthContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      const userData = await getMe();
      setUser(userData);
      setIsLoading(false);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);
  if (isLoading) {
    return (
        <div className="flex h-svh w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  if (!isLoading && user) {
    return (
      <AuthContext.Provider value={{ user, setUser, isLoading: false }}>
        {children}
      </AuthContext.Provider>
    );
  }
  
  return (
    <div className="flex h-svh w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}