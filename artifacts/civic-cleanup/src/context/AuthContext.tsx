import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { setAuthTokenGetter } from "@workspace/api-client-react";

interface AuthUser {
  id: string;
  email: string;
  fullName: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  roles: string[];
  isLoading: boolean;
  signIn: (user: AuthUser, token: string, roles: string[]) => void;
  signOut: () => void;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_KEY = "civic_token";
const USER_KEY = "civic_user";
const ROLES_KEY = "civic_roles";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    const savedUser = localStorage.getItem(USER_KEY);
    const savedRoles = localStorage.getItem(ROLES_KEY);
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setRoles(savedRoles ? JSON.parse(savedRoles) : []);
      setAuthTokenGetter(() => savedToken);
    }
    setIsLoading(false);
  }, []);

  const signIn = useCallback((newUser: AuthUser, newToken: string, newRoles: string[]) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    localStorage.setItem(ROLES_KEY, JSON.stringify(newRoles));
    setUser(newUser);
    setToken(newToken);
    setRoles(newRoles);
    setAuthTokenGetter(() => newToken);
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(ROLES_KEY);
    setUser(null);
    setToken(null);
    setRoles([]);
    setAuthTokenGetter(null);
  }, []);

  const hasRole = useCallback((role: string) => {
    return roles.includes(role) || roles.includes("admin");
  }, [roles]);

  return (
    <AuthContext.Provider value={{ user, token, roles, isLoading, signIn, signOut, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
