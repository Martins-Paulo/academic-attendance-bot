"use client";

import React, { useState } from "react";
import {
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Modal } from "./Modal";
import type { ModalBaseProps } from "@/types/modals";
import { loginSchema, registerSchema, type LoginFormData, type RegisterFormData } from "@/types/auth";
import { useAuth } from "@/hooks/useAuth";

interface ModalAuthProps extends ModalBaseProps {
  initialMode?: "login" | "register";
}

export function ModalAuth({
  isOpen,
  onClose,
  onSuccess,
  initialMode = "login",
}: ModalAuthProps) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"login" | "register">(initialMode);

  // Campos do formulário
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Visibilidade de senhas
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Estado de submissão e mensagens
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setFullName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setFieldErrors({});
    setGeneralError(null);
    setInfoMessage(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const switchMode = (newMode: "login" | "register") => {
    setMode(newMode);
    setFieldErrors({});
    setGeneralError(null);
    setInfoMessage(null);
  };

  // Verificação em tempo real da complexidade da senha para o estudante
  const passwordChecks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setFieldErrors({});
    setGeneralError(null);
    setInfoMessage(null);

    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      const errors: Record<string, string> = {};
      for (const issue of validation.error.issues) {
        const fieldName = String(issue.path[0]);
        if (!errors[fieldName]) errors[fieldName] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await signIn(validation.data as LoginFormData);
      if (result.success) {
        onSuccess?.("Login realizado com sucesso!");
        resetForm();
        onClose();
      } else {
        setGeneralError(result.error || "E-mail ou senha incorretos.");
      }
    } catch {
      setGeneralError("Falha na comunicação com o servidor de autenticação.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setFieldErrors({});
    setGeneralError(null);
    setInfoMessage(null);

    const validation = registerSchema.safeParse({
      fullName,
      email,
      password,
      confirmPassword,
    });

    if (!validation.success) {
      const errors: Record<string, string> = {};
      for (const issue of validation.error.issues) {
        const fieldName = String(issue.path[0]);
        if (!errors[fieldName]) errors[fieldName] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await signUp(validation.data as RegisterFormData);
      if (result.success) {
        if (result.requiresEmailConfirmation) {
          setInfoMessage(
            "Conta criada! Enviamos um link de confirmação para o seu e-mail. Por favor, confirme para entrar."
          );
        } else {
          onSuccess?.("Conta criada com sucesso! Perfil configurado.");
          resetForm();
          onClose();
        }
      } else {
        setGeneralError(result.error || "Não foi possível criar sua conta.");
      }
    } catch {
      setGeneralError("Falha na comunicação com o servidor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      onClose={() => {
        resetForm();
        onClose();
      }}
      title={mode === "login" ? "Entrar no UniGag" : "Criar sua Conta UniGag"}
    >
      <div className="auth-card" style={{ margin: "0 auto", width: "100%" }}>
        {/* Alternância de Abas (Entrar / Criar Conta) */}
        <div className="auth-tabs" role="tablist" style={{ marginBottom: "16px" }}>
          <button
            aria-selected={mode === "login"}
            className={mode === "login" ? "is-active" : ""}
            onClick={() => switchMode("login")}
            role="tab"
            type="button"
          >
            Entrar
          </button>
          <button
            aria-selected={mode === "register"}
            className={mode === "register" ? "is-active" : ""}
            onClick={() => switchMode("register")}
            role="tab"
            type="button"
          >
            Criar Conta
          </button>
        </div>

        {/* Mensagem geral de erro higienizada */}
        {generalError && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 12px",
              borderRadius: "10px",
              backgroundColor: "rgba(235, 87, 87, 0.12)",
              color: "var(--coral, #eb5757)",
              fontSize: "0.85rem",
              marginBottom: "14px",
              border: "1px solid rgba(235, 87, 87, 0.25)",
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{generalError}</span>
          </div>
        )}

        {/* Mensagem informativa (ex: confirmação por e-mail) */}
        {infoMessage && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 12px",
              borderRadius: "10px",
              backgroundColor: "rgba(46, 204, 113, 0.12)",
              color: "#27ae60",
              fontSize: "0.85rem",
              marginBottom: "14px",
              border: "1px solid rgba(46, 204, 113, 0.25)",
            }}
          >
            <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
            <span>{infoMessage}</span>
          </div>
        )}

        {/* Formulário de Login */}
        {mode === "login" ? (
          <form className="auth-form" onSubmit={handleLogin}>
            <div className="auth-field">
              <label htmlFor="auth-login-email" style={{ cursor: "pointer" }}>
                E-mail acadêmico ou pessoal
              </label>
              <div>
                <Mail size={17} />
                <input
                  autoComplete="email"
                  id="auth-login-email"
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: "" }));
                  }}
                  placeholder="aluno@universidade.edu.br"
                  type="email"
                  value={email}
                />
              </div>
              {fieldErrors.email && (
                <span style={{ color: "var(--coral, #eb5757)", fontSize: "0.78rem" }}>
                  {fieldErrors.email}
                </span>
              )}
            </div>

            <div className="auth-field">
              <label htmlFor="auth-login-password" style={{ cursor: "pointer" }}>
                Senha
              </label>
              <div>
                <Lock size={17} />
                <input
                  autoComplete="current-password"
                  id="auth-login-password"
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: "" }));
                  }}
                  placeholder="Sua senha secreta"
                  type={showPassword ? "text" : "password"}
                  value={password}
                />
                <button
                  aria-label={showPassword ? "Ocultar senha" : "Exibir senha"}
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  type="button"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldErrors.password && (
                <span style={{ color: "var(--coral, #eb5757)", fontSize: "0.78rem" }}>
                  {fieldErrors.password}
                </span>
              )}
            </div>

            <div className="modal__actions" style={{ marginTop: "18px" }}>
              <button
                className="button button--ghost"
                disabled={isSubmitting}
                onClick={() => {
                  resetForm();
                  onClose();
                }}
                type="button"
              >
                Cancelar
              </button>
              <button
                className="button button--primary"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={16} /> Entrando...
                  </>
                ) : (
                  <>
                    Entrar <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* Formulário de Cadastro (Criar Conta) */
          <form className="auth-form" onSubmit={handleRegister}>
            <div className="auth-field">
              <label htmlFor="auth-register-name" style={{ cursor: "pointer" }}>
                Nome Completo
              </label>
              <div>
                <UserIcon size={17} />
                <input
                  autoComplete="name"
                  id="auth-register-name"
                  maxLength={70}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (fieldErrors.fullName) setFieldErrors((prev) => ({ ...prev, fullName: "" }));
                  }}
                  placeholder="Nome do Estudante"
                  type="text"
                  value={fullName}
                />
              </div>
              {fieldErrors.fullName && (
                <span style={{ color: "var(--coral, #eb5757)", fontSize: "0.78rem" }}>
                  {fieldErrors.fullName}
                </span>
              )}
            </div>

            <div className="auth-field">
              <label htmlFor="auth-register-email" style={{ cursor: "pointer" }}>
                E-mail
              </label>
              <div>
                <Mail size={17} />
                <input
                  autoComplete="email"
                  id="auth-register-email"
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: "" }));
                  }}
                  placeholder="aluno@universidade.edu.br"
                  type="email"
                  value={email}
                />
              </div>
              {fieldErrors.email && (
                <span style={{ color: "var(--coral, #eb5757)", fontSize: "0.78rem" }}>
                  {fieldErrors.email}
                </span>
              )}
            </div>

            <div className="auth-field">
              <label htmlFor="auth-register-password" style={{ cursor: "pointer" }}>
                Senha de Acesso
              </label>
              <div>
                <Lock size={17} />
                <input
                  autoComplete="new-password"
                  id="auth-register-password"
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: "" }));
                  }}
                  placeholder="Mínimo 8 caracteres com símbolos"
                  type={showPassword ? "text" : "password"}
                  value={password}
                />
                <button
                  aria-label={showPassword ? "Ocultar senha" : "Exibir senha"}
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  type="button"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldErrors.password && (
                <span style={{ color: "var(--coral, #eb5757)", fontSize: "0.78rem" }}>
                  {fieldErrors.password}
                </span>
              )}

              {/* Checklist visual de robustez da senha */}
              {password.length > 0 && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "4px",
                    marginTop: "6px",
                    fontSize: "0.74rem",
                    color: "var(--text-muted, #71717a)",
                  }}
                >
                  <span style={{ color: passwordChecks.length ? "#27ae60" : "inherit" }}>
                    {passwordChecks.length ? "✓" : "○"} 8+ caracteres
                  </span>
                  <span style={{ color: passwordChecks.upper ? "#27ae60" : "inherit" }}>
                    {passwordChecks.upper ? "✓" : "○"} 1 maiúscula
                  </span>
                  <span style={{ color: passwordChecks.number ? "#27ae60" : "inherit" }}>
                    {passwordChecks.number ? "✓" : "○"} 1 número
                  </span>
                  <span style={{ color: passwordChecks.special ? "#27ae60" : "inherit" }}>
                    {passwordChecks.special ? "✓" : "○"} 1 caractere especial
                  </span>
                </div>
              )}
            </div>

            <div className="auth-field">
              <label htmlFor="auth-register-confirm" style={{ cursor: "pointer" }}>
                Confirmar Senha
              </label>
              <div>
                <Lock size={17} />
                <input
                  autoComplete="new-password"
                  id="auth-register-confirm"
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (fieldErrors.confirmPassword) {
                      setFieldErrors((prev) => ({ ...prev, confirmPassword: "" }));
                    }
                  }}
                  placeholder="Repita sua senha"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                />
                <button
                  aria-label={showConfirmPassword ? "Ocultar senha" : "Exibir senha"}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                  type="button"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <span style={{ color: "var(--coral, #eb5757)", fontSize: "0.78rem" }}>
                  {fieldErrors.confirmPassword}
                </span>
              )}
            </div>

            <div className="modal__actions" style={{ marginTop: "18px" }}>
              <button
                className="button button--ghost"
                disabled={isSubmitting}
                onClick={() => {
                  resetForm();
                  onClose();
                }}
                type="button"
              >
                Cancelar
              </button>
              <button
                className="button button--primary"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={16} /> Criando...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} /> Criar Conta
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
