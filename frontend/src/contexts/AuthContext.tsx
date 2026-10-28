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
  if (
    msg.includes("rate limit") ||
    msg.includes("too many requests") ||
    msg.includes("over_email_send_rate_limit")
  ) {
    return "Limite de envio de e-mails atingido no momento pelo provedor de autenticação. Por favor, aguarde alguns instantes antes de tentar novamente.";
  }
  if (
    msg.includes("password should be") ||
    msg.includes("password should have") ||
    msg.includes("weak_password")
  ) {
    return "A senha fornecida não atende aos requisitos de segurança do servidor.";
  }
  if (msg.includes("database error") || msg.includes("error saving new user")) {
    return "Erro no banco de dados ao inicializar seu perfil de estudante. Contate o suporte técnico.";
  }
  if (msg.includes("signups not allowed") || msg.includes("signups are disabled")) {
    return "Cadastros de novos usuários estão desativados temporariamente.";
  }

  // Retorna a mensagem original detalhada se não for um dos casos acima
  return rawMessage;
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

    // Fallback de Auto-provisionamento: caso a trigger do banco não tenha sido executada
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser && currentUser.id === userId) {
        const studentName =
          currentUser.user_metadata?.full_name ||
          currentUser.user_metadata?.name ||
          currentUser.email?.split("@")[0] ||
          "Estudante";

        const { data: createdProfile, error: insertError } = await supabase
          .from("students")
          .insert({
            user_id: userId,
            name: studentName,
            email: currentUser.email,
            course: "Engenharia de Software",
            semester: 1,
            avatar: "neutral"
          })
          .select("id, user_id, name, email, phone, course, semester, avatar, created_at")
          .maybeSingle();

        if (createdProfile) {
          console.log("[UniGag Auth] Perfil de estudante criado com sucesso via auto-provisionamento:", createdProfile);
          return createdProfile as StudentProfile;
        }

        if (insertError) {
          console.warn("[UniGag Auth] Falha ao criar perfil via auto-provisionamento:", insertError.message);
        }
      }
    } catch (fallbackErr) {
      console.warn("[UniGag Auth] Erro inesperado no auto-provisionamento do perfil:", fallbackErr);
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
      console.log("[UniGag Auth] Iniciando cadastro para:", data.email);
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            name: data.fullName,
          },
        },
      });

      if (error) {
        console.error("[UniGag Auth] Erro no cadastro (Supabase Auth API):", error);
        return { success: false, error: sanitizeAuthError(error.message) };
      }

      console.log("[UniGag Auth] Resposta do signUp com sucesso:", {
        userId: authData.user?.id,
        hasSession: !!authData.session,
        identitiesCount: authData.user?.identities?.length
      });

      // Se o usuário já existia previamente e email confirmation está ativo no Supabase,
      // a API do Supabase não retorna erro, mas retorna identities vazio.
      if (authData.user && Array.isArray(authData.user.identities) && authData.user.identities.length === 0) {
        console.warn("[UniGag Auth] Usuário com e-mail já registrado detectado via identities vazias:", data.email);
        return {
          success: false,
          error: "Este endereço de e-mail já está cadastrado na plataforma.",
        };
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
      console.error("[UniGag Auth] Exceção inesperada no cadastro:", err);
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
