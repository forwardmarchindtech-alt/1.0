import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const loginEventIdRef = useRef<string | null>(null);

  // Track login event
  const trackLogin = async (userId: string, provider: string) => {
    try {
      const { data } = await supabase
        .from("login_events")
        .insert([{ user_id: userId, provider }])
        .select("id")
        .single();
      if (data) loginEventIdRef.current = data.id;
    } catch (e) {
      console.error("Failed to track login:", e);
    }
  };

  // Track session end
  const trackSessionEnd = async () => {
    if (!loginEventIdRef.current) return;
    try {
      await supabase
        .from("login_events")
        .update({ session_end_at: new Date().toISOString() })
        .eq("id", loginEventIdRef.current);
      loginEventIdRef.current = null;
    } catch (e) {
      console.error("Failed to track session end:", e);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if (event === "SIGNED_IN" && session?.user) {
        const provider = session.user.app_metadata?.provider || "email";
        setTimeout(() => trackLogin(session.user.id, provider), 0);
      }

      if (event === "SIGNED_OUT") {
        trackSessionEnd();
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Track session end on page unload
    const handleUnload = () => trackSessionEnd();
    window.addEventListener("beforeunload", handleUnload);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, []);

  const signOut = async () => {
    await trackSessionEnd();
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
