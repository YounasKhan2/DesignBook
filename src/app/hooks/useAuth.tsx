import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { requireSupabase, supabase } from "../lib/supabase";

export interface Profile {
  id: string;
  user_id: string;
  owner_name: string;
  business_name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

interface SignUpInput {
  ownerName: string;
  businessName: string;
  email: string;
  password: string;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: SignUpInput) => Promise<{ needsEmailConfirmation: boolean }>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function profileFromUser(user: User): Omit<Profile, "id" | "created_at" | "updated_at"> {
  return {
    user_id: user.id,
    owner_name: String(user.user_metadata?.owner_name ?? user.user_metadata?.ownerName ?? "").trim(),
    business_name: String(user.user_metadata?.business_name ?? user.user_metadata?.businessName ?? "").trim(),
    email: user.email ?? "",
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const user = session?.user ?? null;

  const ensureProfile = useCallback(async (nextUser: User) => {
    const client = requireSupabase();
    const fallback = profileFromUser(nextUser);

    const { data: existing, error: selectError } = await client
      .from("profiles")
      .select("*")
      .eq("user_id", nextUser.id)
      .maybeSingle();

    if (selectError) throw selectError;
    if (existing) {
      setProfile(existing as Profile);
      return;
    }

    if (!fallback.owner_name || !fallback.business_name || !fallback.email) {
      setProfile(null);
      return;
    }

    const { data, error } = await client
      .from("profiles")
      .insert(fallback)
      .select("*")
      .single();

    if (error) throw error;
    setProfile(data as Profile);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!session?.user) {
      setProfile(null);
      return;
    }
    await ensureProfile(session.user);
  }, [ensureProfile, session?.user]);

  useEffect(() => {
    let alive = true;

    async function loadSession() {
      if (!supabase) {
        if (alive) setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.getSession();
      if (!alive) return;

      if (error) {
        setSession(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      setSession(data.session);
      if (data.session?.user) {
        try {
          await ensureProfile(data.session.user);
        } catch {
          setProfile(null);
        }
      }
      if (alive) setLoading(false);
    }

    loadSession();

    const { data: listener } =
      supabase?.auth.onAuthStateChange(async (_event, nextSession) => {
        setSession(nextSession);
        if (nextSession?.user) {
          try {
            await ensureProfile(nextSession.user);
          } catch {
            setProfile(null);
          }
        } else {
          setProfile(null);
        }
        setLoading(false);
      }) ?? { data: { subscription: null } };

    return () => {
      alive = false;
      listener.subscription?.unsubscribe();
    };
  }, [ensureProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    const client = requireSupabase();
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signUp = useCallback(async ({ ownerName, businessName, email, password }: SignUpInput) => {
    const client = requireSupabase();
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        data: {
          owner_name: ownerName,
          business_name: businessName,
        },
      },
    });

    if (error) throw error;

    if (data.user && data.session) {
      await ensureProfile(data.user);
    }

    return { needsEmailConfirmation: !data.session };
  }, [ensureProfile]);

  const resetPassword = useCallback(async (email: string) => {
    const client = requireSupabase();
    const { error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    const client = requireSupabase();
    const { error } = await client.auth.signOut();
    if (error) throw error;
    setSession(null);
    setProfile(null);
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      session,
      user,
      profile,
      loading,
      signIn,
      signUp,
      resetPassword,
      signOut,
      refreshProfile,
    }),
    [loading, profile, refreshProfile, resetPassword, session, signIn, signOut, signUp, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
