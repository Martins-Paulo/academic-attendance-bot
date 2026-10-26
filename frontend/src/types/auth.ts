import { z } from "zod";
import type { User } from "@supabase/supabase-js";

// ==============================================================================
// 1. SCHEMAS DE VALIDAÇÃO ZOD
// ==============================================================================

/**
 * Schema estrito para login de usuários existentes.
 */
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "O e-mail é obrigatório.")
    .email("Insira um endereço de e-mail acadêmico ou pessoal válido.")
    .toLowerCase(),
  password: z
    .string()
    .min(1, "A senha é obrigatória."),
});

/**
 * Schema rigoroso para cadastro de novos estudantes:
 * - Nome com no mínimo 3 caracteres, sem tags HTML (<>) ou caracteres de controle para barrar XSS.
 * - E-mail válido e sanitizado.
 * - Complexidade de senha: mínimo 8 caracteres, letra maiúscula, minúscula, número e símbolo.
 * - Confirmação idêntica de senha.
 */
export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(3, "O nome completo deve conter ao menos 3 caracteres.")
      .max(70, "O nome não pode exceder 70 caracteres.")
      .regex(/^[^<>]+$/, "Caracteres HTML (< ou >) não são permitidos por segurança.")
      .regex(/^[^\x00-\x1F\x7F]+$/, "Caracteres de controle não são permitidos."),
    email: z
      .string()
      .trim()
      .min(1, "O e-mail é obrigatório.")
      .email("Insira um endereço de e-mail acadêmico ou pessoal válido.")
      .toLowerCase(),
    password: z
      .string()
      .min(8, "A senha deve ter no mínimo 8 caracteres.")
      .regex(/[A-Z]/, "A senha deve conter ao menos uma letra maiúscula.")
      .regex(/[a-z]/, "A senha deve conter ao menos uma letra minúscula.")
      .regex(/[0-9]/, "A senha deve conter ao menos um número.")
      .regex(
        /[^A-Za-z0-9]/,
        "A senha deve conter ao menos um caractere especial (!, @, #, $, %, etc.)."
      ),
    confirmPassword: z
      .string()
      .min(1, "Confirme sua senha para prosseguir."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas informadas não coincidem.",
    path: ["confirmPassword"],
  });

// ==============================================================================
// 2. TIPOS INFERIDOS DOS SCHEMAS
// ==============================================================================

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;

// ==============================================================================
// 3. MODELOS DE DADOS DE SESSÃO E PERFIL
// ==============================================================================

export interface StudentProfile {
  id: number;
  user_id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  course?: string | null;
  semester?: number | null;
  avatar?: string | null;
  created_at?: string;
}

export interface AuthSessionState {
  user: User | null;
  student: StudentProfile | null;
  isLoading: boolean;
  isDemoMode: boolean;
}

export interface AuthContextType extends AuthSessionState {
  signIn: (data: LoginFormData) => Promise<{ success: boolean; error?: string }>;
  signUp: (data: RegisterFormData) => Promise<{ success: boolean; error?: string; requiresEmailConfirmation?: boolean }>;
  signOut: () => Promise<void>;
  refreshStudent: () => Promise<void>;
}
