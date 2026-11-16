import { useState, type ReactNode } from 'react';
import {
  loginAccount,
  loginDemoAccount,
  logoutAccount,
  registerAccount,
  type AuthSession,
} from './api';
import { AuthContext } from './authContext';

const STORAGE_KEY = 'queueless.auth.session';

function readSession(): AuthSession | null {
  const stored = sessionStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    const parsed: unknown = JSON.parse(stored);
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'access_token' in parsed &&
      typeof parsed.access_token === 'string' &&
      'user' in parsed &&
      typeof parsed.user === 'object' &&
      parsed.user !== null &&
      'name' in parsed.user &&
      typeof parsed.user.name === 'string' &&
      'email' in parsed.user &&
      typeof parsed.user.email === 'string' &&
      'id' in parsed.user &&
      typeof parsed.user.id === 'number'
    ) {
      return parsed as AuthSession;
    }
  } catch (error) {
    if (!(error instanceof SyntaxError)) throw error;
  }
  sessionStorage.removeItem(STORAGE_KEY);
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(readSession);

  function saveSession(nextSession: AuthSession) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
    setSession(nextSession);
  }

  async function signIn(email: string, password: string) {
    saveSession(await loginAccount(email, password));
  }

  async function signUp(name: string, email: string, password: string) {
    saveSession(await registerAccount(name, email, password));
  }

  async function signInDemo() {
    saveSession(await loginDemoAccount());
  }

  async function signOut() {
    const token = session?.access_token;
    try {
      if (token) await logoutAccount(token);
    } finally {
      sessionStorage.removeItem(STORAGE_KEY);
      setSession(null);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user: session?.user ?? null,
        signIn,
        signUp,
        signInDemo,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
