"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import type {
  StudentProfile,
  AuthContextType,
  LoginFormData,
  RegisterFormData,
} from "@/types/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Sanitiza e traduz mensagens de erro de autenticação para evitar
 * vazamento de detalhes internos da infraestrutura e enumeração de usuários.
 */
function sanitizeAuthError(rawMessage?: string): string {
  if (!rawMessage) return "Ocorreu um erro inesperado. Tente novamente.";
  const msg = rawMessage.toLowerCase();

  if (msg.includes("invalid login credentials") || msg.includes("invalid_credentials")) {
    return "E-mail ou senha incorretos.";
  }
  if (msg.includes("user already registered") || msg.includes("already exists")) {
    return "Este endereço de e-mail já está cadastrado.";
  }
  if (msg.includes("email not confirmed")) {
    return "E-mail ainda não confirmado. Verifique sua caixa de entrada.";
  }
  if (msg.includes("rate limit") || msg.includes("too many requests")) {
    return "Muitas tentativas em sequência. Aguarde alguns instantes.";
  }
  if (msg.includes("password should be")) {
    return "A senha fornecida não atende aos requisitos mínimos de segurança.";
  }

  return "Não foi possível concluir a autenticação. Verifique os dados.";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Busca o perfil do estudante vinculado no schema public
  const fetchStudentProfile = useCallback(async (userId: string, retries = 3): Promise<StudentProfile | null> => {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const { data, error } = await supabase
          .from("students")
          .select("id, user_id, name, email, phone, course, semester, avatar, created_at")
          .eq("user_id", userId)
          .maybeSingle();

        if (error) {
          console.warn(`[UniGag Auth] Tentativa ${attempt + 1} de carregar perfil:`, error.message);
        } else if (data) {
          return data as StudentProfile;
        }
      } catch (err) {
        console.warn(`[UniGag Auth] Falha na requisição do perfil:`, err);
      }

      // Pequena pausa para aguardar o disparo da trigger no Supabase
      if (attempt < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
    return null;
  }, []);

  const refreshStudent = useCallback(async () => {
    if (!user) {
      setStudent(null);
      return;
    }
    const profile = await fetchStudentProfile(user.id, 1);
    if (profile) setStudent(profile);
  }, [user, fetchStudentProfile]);

  // Inicialização e escuta das alterações de sessão do Supabase Auth
  useEffect(() => {
    let mounted = true;

    async function initSession() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("[UniGag Auth] Erro ao obter sessão inicial:", error);
        }

        if (session?.user && mounted) {
          setUser(session.user);
          const profile = await fetchStudentProfile(session.user.id);
          if (mounted && profile) {
            setStudent(profile);
          }
        }
      } catch (err) {
        console.error("[UniGag Auth] Falha inesperada ao inicializar sessão:", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    initSession();

    // Listener reativo em tempo real para mudanças de autenticação (login, logout, refresh)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (session?.user) {
          setUser(session.user);
          const profile = await fetchStudentProfile(session.user.id);
          if (mounted && profile) {
            setStudent(profile);
          }
        } else {
          setUser(null);
          setStudent(null);
        }
        setIsLoading(false);
      }
    );

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [fetchStudentProfile]);

  // Login de usuário existente
  const signIn = useCallback(async (data: LoginFormData) => {
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        return { success: false, error: sanitizeAuthError(error.message) };
      }

      if (authData.user) {
        setUser(authData.user);
        const profile = await fetchStudentProfile(authData.user.id);
        if (profile) setStudent(profile);
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: sanitizeAuthError((err as Error).message) };
    }
  }, [fetchStudentProfile]);

  // Cadastro de novo usuário
  const signUp = useCallback(async (data: RegisterFormData) => {
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
          },
        },
      });

      if (error) {
        return { success: false, error: sanitizeAuthError(error.message) };
      }

      // Caso a confirmação de e-mail esteja ativa no projeto do Supabase
      const requiresEmailConfirmation = !authData.session && !!authData.user;

      if (authData.user && authData.session) {
        setUser(authData.user);
        const profile = await fetchStudentProfile(authData.user.id);
        if (profile) setStudent(profile);
      }

      return { success: true, requiresEmailConfirmation };
    } catch (err) {
      return { success: false, error: sanitizeAuthError((err as Error).message) };
    }
  }, [fetchStudentProfile]);

  // Logout seguro com encerramento de sessão e limpeza de tokens
  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn("[UniGag Auth] Falha ao comunicar encerramento de sessão:", err);
    } finally {
      setUser(null);
      setStudent(null);
      // Limpeza de itens locais residuais de navegação
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem("unigag_subject_avatars");
        } catch {}
      }
    }
  }, []);

  const value = useMemo<AuthContextType>(() => ({
    user,
    student,
    isLoading,
    isDemoMode: !user,
    signIn,
    signUp,
    signOut,
    refreshStudent,
  }), [user, student, isLoading, signIn, signUp, signOut, refreshStudent]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser utilizado dentro de um <AuthProvider />.");
  }
  return context;
}
