"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type {
  Session,
  User,
} from "@supabase/supabase-js";

import { createClient } from "@/utils/supabase/client";

/* =========================================================
   ADMIN CONFIGURATION
========================================================= */

/*
 * Approved Osmium administrators.
 *
 * For now we are using email recognition while building
 * the foundation.
 *
 * Later we can move roles and permissions into a proper
 * database-backed system.
 */

const ADMIN_EMAILS = [
  "devosmiumbpo@gmail.com",
];

/* =========================================================
   TYPES
========================================================= */

interface AuthContextType {
  /* Authentication state */
  user: User | null;
  session: Session | null;
  loading: boolean;

  /* User information */
  displayName: string;
  email: string;
  avatarUrl: string;

  /* Authorization */
  isAdmin: boolean;

  /* Authentication actions */
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

/* =========================================================
   CONTEXT
========================================================= */

const AuthContext =
  createContext<AuthContextType | undefined>(
    undefined
  );

/* =========================================================
   PROVIDER
========================================================= */

export function AuthProvider({
  children,
}: AuthProviderProps) {
  /*
   * Create one stable Supabase browser client.
   *
   * We don't want a new client to be created every time
   * the AuthProvider re-renders.
   */

  const supabase = useMemo(
    () => createClient(),
    []
  );

  /* =======================================================
     STATE
  ======================================================= */

  const [user, setUser] =
    useState<User | null>(null);

  const [session, setSession] =
    useState<Session | null>(null);

  const [loading, setLoading] =
    useState(true);

  /* =======================================================
     INITIAL SESSION + AUTH LISTENER
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    /* -------------------------------------------------------
       LOAD EXISTING SESSION
    ------------------------------------------------------- */

    const loadSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error(
            "Failed to load authentication session:",
            error
          );

          if (mounted) {
            setSession(null);
            setUser(null);
          }

          return;
        }

        if (!mounted) {
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error(
          "Authentication initialization error:",
          error
        );

        if (mounted) {
          setSession(null);
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadSession();

    /* -------------------------------------------------------
       LISTEN FOR AUTH CHANGES
    ------------------------------------------------------- */

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        if (!mounted) {
          return;
        }

        setSession(nextSession);
        setUser(nextSession?.user ?? null);
        setLoading(false);
      }
    );

    /* -------------------------------------------------------
       CLEANUP
    ------------------------------------------------------- */

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  /* =======================================================
     USER INFORMATION
  ======================================================= */

  const email =
    user?.email ?? "";

  /*
   * Google normally gives us full_name and avatar_url.
   * We support several common metadata names so the UI
   * remains flexible with different providers.
   */

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.user_metadata?.preferred_username ||
    user?.user_metadata?.user_name ||
    (email
      ? email.split("@")[0]
      : "User");

  const avatarUrl =
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    "";

  /* =======================================================
     ADMIN RECOGNITION
  ======================================================= */

  const normalizedEmail =
    email.trim().toLowerCase();

  const isAdmin =
    normalizedEmail !== "" &&
    ADMIN_EMAILS.some(
      (adminEmail) =>
        adminEmail.trim().toLowerCase() ===
        normalizedEmail
    );

  /* =======================================================
     GOOGLE LOGIN
  ======================================================= */

  const signInWithGoogle =
    async () => {
      if (
        typeof window === "undefined"
      ) {
        return;
      }

      const redirectTo =
        `${window.location.origin}/auth/callback`;

      const {
        error,
      } =
        await supabase.auth.signInWithOAuth(
          {
            provider: "google",

            options: {
              redirectTo,

              queryParams: {
                access_type: "offline",
                prompt: "select_account",
              },
            },
          }
        );

      if (error) {
        console.error(
          "Google sign-in error:",
          error
        );

        throw error;
      }
    };

  /* =======================================================
     SIGN OUT
  ======================================================= */

  const signOut =
    async () => {
      try {
        const {
          error,
        } =
          await supabase.auth.signOut();

        if (error) {
          throw error;
        }

        /*
         * Clear the local state immediately.
         *
         * Supabase will also fire the SIGNED_OUT event.
         */

        setUser(null);
        setSession(null);
      } catch (error) {
        console.error(
          "Sign-out error:",
          error
        );

        throw error;
      }
    };

  /* =======================================================
     CONTEXT VALUE
  ======================================================= */

  const contextValue: AuthContextType = {
    user,
    session,
    loading,

    displayName,
    email,
    avatarUrl,

    isAdmin,

    signInWithGoogle,
    signOut,
  };

  /* =======================================================
     PROVIDER
  ======================================================= */

  return (
    <AuthContext.Provider
      value={contextValue}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* =========================================================
   AUTH HOOK
========================================================= */

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside an AuthProvider"
    );
  }

  return context;
}