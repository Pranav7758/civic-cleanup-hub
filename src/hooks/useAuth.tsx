import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { apiClient, type Session } from "@/lib/apiClient";

interface User {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
  };
}

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  address: string | null;
  city: string | null;
  ward: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  roles: string[];
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, role: string, phone?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<string>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data: profileData } = await apiClient
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    
    const { data: rolesData } = await apiClient
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    setProfile(profileData);
    setRoles(rolesData?.map((r: any) => r.role) || []);
  };

  useEffect(() => {
    const { data: { subscription } } = apiClient.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          setTimeout(() => fetchProfile(session.user.id), 0);
        } else {
          setProfile(null);
          setRoles([]);
        }
        setLoading(false);
      }
    );

    apiClient.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, role: string, phone?: string) => {
    const { data, error } = await apiClient.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, phone },
      },
    });

    if (error) throw error;
    if (!data.user) throw new Error("Signup failed");

    const { error: roleError } = await apiClient
      .from("user_roles")
      .insert({ user_id: data.user.id, role: role as any });

    if (roleError) throw roleError;

    if (phone) {
      await apiClient
        .from("profiles")
        .update({ phone })
        .eq("user_id", data.user.id);
    }
  };

  const signIn = async (email: string, password: string): Promise<string> => {
    const { data, error } = await apiClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    const { data: rolesData } = await apiClient
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id);

    const userRoles = rolesData?.map((r: any) => r.role) || [];
    
    if (userRoles.includes("admin")) return "/admin";
    if (userRoles.includes("worker")) return "/worker";
    if (userRoles.includes("ngo")) return "/ngo";
    if (userRoles.includes("scrap_dealer")) return "/scrap";
    return "/citizen";
  };

  const signOut = async () => {
    await apiClient.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setRoles([]);
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, roles, loading, signUp, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
