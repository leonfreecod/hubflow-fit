import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { User } from '../../domain/models';
import {
  repositories,
  usesApiDataSource,
} from '../../services/repositories/localRepositories';
import { apiSession, apiUnauthorizedEvent } from '../../services/api/apiClient';
import { readStorage, storageKeys, writeStorage } from '../../services/storage/storage';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login(email: string, password: string): Promise<boolean>;
  logout(): void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restore = async () => {
      try {
        const userId = readStorage<string | null>(storageKeys.session, null);
        const hasStoredSession = usesApiDataSource
          ? Boolean(apiSession.getToken())
          : Boolean(userId);

        if (!hasStoredSession) {
          localStorage.removeItem(storageKeys.session);
          return;
        }

        const restoredUser = await repositories.users.findById(userId ?? '');
        if (restoredUser) {
          setUser(restoredUser);
          writeStorage(storageKeys.session, restoredUser.id);
          return;
        }

        if (usesApiDataSource) apiSession.clear();
        localStorage.removeItem(storageKeys.session);
      } catch {
        setUser(null);
        if (usesApiDataSource) apiSession.clear();
        localStorage.removeItem(storageKeys.session);
      } finally {
        setLoading(false);
      }
    };
    void restore();
  }, []);

  useEffect(() => {
    const expireSession = () => {
      setUser(null);
      localStorage.removeItem(storageKeys.session);
    };
    window.addEventListener(apiUnauthorizedEvent, expireSession);
    return () => window.removeEventListener(apiUnauthorizedEvent, expireSession);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    async login(email, password) {
      const authenticated = await repositories.users.findByCredentials(email.trim().toLowerCase(), password);
      if (!authenticated) return false;
      setUser(authenticated);
      writeStorage(storageKeys.session, authenticated.id);
      return true;
    },
    logout() {
      setUser(null);
      apiSession.clear();
      localStorage.removeItem(storageKeys.session);
    },
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider.');
  return context;
}
