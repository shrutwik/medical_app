import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from 'firebase/auth';
import {
  hasFirebaseConfig,
  signInUser,
  signUpUser,
  signOutUser,
  subscribeToUserAuth,
} from '../services/auth/firebase';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  guestMode: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  continueAsGuest: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [guestMode, setGuestMode] = useState(false);

  useEffect(() => {
    if (!hasFirebaseConfig()) {
      setLoading(false);
      return;
    }
    const unsubscribe = subscribeToUserAuth((nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    const nextUser = await signInUser(email, password);
    setUser(nextUser);
  };

  const signUp = async (email: string, password: string) => {
    const nextUser = await signUpUser(email, password);
    setUser(nextUser);
  };

  const signOut = async () => {
    await signOutUser();
    setUser(null);
    setGuestMode(false);
  };

  const continueAsGuest = () => setGuestMode(true);

  return (
    <AuthContext.Provider value={{ user, loading, guestMode, signIn, signUp, signOut, continueAsGuest }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
